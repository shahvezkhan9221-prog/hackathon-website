/*
   js/sections/loading.js - Full-screen Loading Overlay

   Preloads frame animation and critical init resources, tracks progress,
   and resolves only when initialization is ready to continue.
*/

const TOTAL_FRAMES = 74;
const FRAME_PATH = 'assets/page_loading/';
const MIN_DISPLAY_MS = 2000;
const ASSET_TIMEOUT_MS = 8000;

const QUOTES = [
    '"Anyone can wear the mask." - Miles Morales',
    '"What makes you different is what makes you Spider-Man."',
    '"The only way to really be Spider-Man is to be yourself."',
    '"That person who helps others simply because it should be done."',
    '"I see this spark in you. It\'s amazing."',
    '"With great power comes great responsibility."',
    '"It\'s a leap of faith. That\'s all it is."',
];

function getFrameNames() {
    const names = [];
    for (let i = 0; i < TOTAL_FRAMES; i++) {
        const padded = String(i).padStart(2, '0');
        names.push(`${FRAME_PATH}frame_${padded}_delay-0.033s.webp`);
    }
    return names;
}

function getCriticalAssets() {
    const fromDOM = [
        ...Array.from(document.querySelectorAll('img[src]')).map((el) => el.getAttribute('src')),
        ...Array.from(document.querySelectorAll('source[src]')).map((el) => el.getAttribute('src')),
    ]
        .filter(Boolean)
        .filter((src) => !src.startsWith('http'));

    const dynamicInitAssets = [
        'assets/problembg.jpg',
        'assets/sound.mp3',
    ];

    return [...new Set([...fromDOM, ...dynamicInitAssets])];
}

function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
        img.src = src;
    });
}

function loadAsset(src) {
    return new Promise((resolve) => {
        let settled = false;

        const done = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            resolve();
        };

        const timeoutId = setTimeout(done, ASSET_TIMEOUT_MS);

        if (/\.(mp3|wav|ogg)$/i.test(src)) {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.oncanplaythrough = done;
            audio.onerror = done;
            audio.src = src;
            audio.load();
            return;
        }

        if (/\.(mp4|webm)$/i.test(src)) {
            const video = document.createElement('video');
            video.preload = 'auto';
            video.onloadeddata = done;
            video.onerror = done;
            video.src = src;
            video.load();
            return;
        }

        const img = new Image();
        img.onload = done;
        img.onerror = done;
        img.src = src;
    });
}

export function initLoading() {
    return new Promise((resolve) => {
        const screen = document.getElementById('loading-screen');
        if (!screen) {
            resolve();
            return;
        }

        // Skip loader when navigating back from sub-pages.
        const shouldSkip =
            document.documentElement.dataset.skipLoading === '1' ||
            new URLSearchParams(window.location.search).get('nl') === '1' ||
            sessionStorage.getItem('makeathon_loaded');

        if (shouldSkip) {
            history.replaceState(null, '', window.location.pathname + window.location.hash);
            screen.remove();
            resolve();
            return;
        }

        const frameImg = document.getElementById('loading-frame');
        const barEl = document.getElementById('loading-bar');
        const percentEl = document.getElementById('loading-percent');
        const quoteEl = screen.querySelector('.loading__quote');
        const dotsEl = screen.querySelector('.loading__dots');

        const frameNames = getFrameNames();
        const criticalAssets = getCriticalAssets();
        const loadedImages = new Array(TOTAL_FRAMES);

        let quoteIndex = 0;
        if (quoteEl) quoteEl.textContent = QUOTES[0];

        const quoteInterval = setInterval(() => {
            quoteIndex = (quoteIndex + 1) % QUOTES.length;
            if (!quoteEl) return;
            quoteEl.style.opacity = '0';
            setTimeout(() => {
                quoteEl.textContent = QUOTES[quoteIndex];
                quoteEl.style.opacity = '0.85';
            }, 300);
        }, 3000);

        let dotCount = 0;
        const dotsInterval = setInterval(() => {
            dotCount = (dotCount + 1) % 4;
            if (dotsEl) dotsEl.textContent = '.'.repeat(dotCount);
        }, 400);

        let frameProgress = 0;
        let assetProgress = 0;
        let pageProgress = 0;

        let framesLoaded = 0;
        let assetsLoaded = 0;
        let windowLoaded = false;
        let finished = false;
        const startTime = performance.now();

        function getOverallProgress() {
            return Math.min(100, Math.round(frameProgress * 0.6 + assetProgress * 0.25 + pageProgress * 0.15));
        }

        function updateUI() {
            const pct = getOverallProgress();
            const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor((pct / 100) * (TOTAL_FRAMES - 1)));

            if (loadedImages[frameIndex] && frameImg) {
                frameImg.src = loadedImages[frameIndex].src;
            }

            if (barEl) barEl.style.width = `${pct}%`;
            if (percentEl) percentEl.textContent = `${pct}%`;

            if (pct >= 100 && !finished) {
                const elapsed = performance.now() - startTime;
                const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
                finished = true;
                setTimeout(completeLoading, remaining);
            }
        }

        function completeLoading() {
            clearInterval(quoteInterval);
            clearInterval(dotsInterval);

            let currentFrame = Math.floor((getOverallProgress() / 100) * (TOTAL_FRAMES - 1));

            const playRemaining = () => {
                if (currentFrame < TOTAL_FRAMES - 1) {
                    currentFrame++;
                    if (loadedImages[currentFrame] && frameImg) {
                        frameImg.src = loadedImages[currentFrame].src;
                    }
                    setTimeout(playRemaining, 33);
                    return;
                }

                setTimeout(() => {
                    screen.classList.add('fade-out');
                    setTimeout(() => {
                        screen.remove();
                        resolve();
                    }, 650);
                }, 300);
            };

            playRemaining();
        }

        frameNames.forEach((src, i) => {
            loadImage(src).then((img) => {
                loadedImages[i] = img;
                framesLoaded++;
                frameProgress = (framesLoaded / TOTAL_FRAMES) * 100;
                updateUI();
            });
        });

        if (criticalAssets.length === 0) {
            assetProgress = 100;
            updateUI();
        } else {
            criticalAssets.forEach((src) => {
                loadAsset(src).then(() => {
                    assetsLoaded++;
                    assetProgress = (assetsLoaded / criticalAssets.length) * 100;
                    updateUI();
                });
            });
        }

        if (document.readyState === 'complete') {
            pageProgress = 100;
            windowLoaded = true;
            updateUI();
        } else {
            let fakeTick = 0;
            const tickInterval = setInterval(() => {
                if (!windowLoaded && fakeTick < 80) {
                    fakeTick += Math.random() * 3;
                    pageProgress = Math.min(80, fakeTick);
                    updateUI();
                }
                if (windowLoaded) {
                    clearInterval(tickInterval);
                }
            }, 200);

            window.addEventListener('load', () => {
                windowLoaded = true;
                pageProgress = 100;
                clearInterval(tickInterval);
                updateUI();
            });
        }
    });
}
