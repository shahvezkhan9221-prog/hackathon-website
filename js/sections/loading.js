/*
   js/sections/loading.js - Full-screen Loading Overlay

   Cinematic intro: every frame of the Spider-Verse bridge scene is fetched
   and decoded off the main thread first, then played back once on a canvas
   at a fixed frame rate (time-based, so it never slows down or jumps).
   Heavy site assets are preloaded only after the scene is ready, so they
   never compete with playback. The site opens when the scene has finished.
*/

const TOTAL_FRAMES = 89;
const FPS = 30;
const FRAME_MS = 1000 / FPS;
const SCENE_MS = TOTAL_FRAMES * FRAME_MS;
const FRAME_PATH = 'assets/page_loading/';
const FRAME_CONCURRENCY = 8;
const FRAME_ASPECT = 9 / 16;
const MIN_BITMAP_WIDTH = 480;
const MAX_BITMAP_WIDTH = 960;

const HOLD_BEFORE_PLAY_MS = 250;
const HOLD_AFTER_PLAY_MS = 350;
const FRAME_LOAD_TIMEOUT_MS = 12000;
const SETTLE_TIMEOUT_MS = 4000;
const ASSET_TIMEOUT_MS = 8000;
const FADE_FALLBACK_MS = 900;

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
        .filter((src) => !src.startsWith('http') && !src.startsWith(FRAME_PATH));

    const dynamicInitAssets = [
        'assets/problembg.jpg',
        'assets/sound.mp3',
    ];

    return [...new Set([...fromDOM, ...dynamicInitAssets])];
}

async function decodeImageElement(src) {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    try {
        await img.decode();
    } catch {
        return null;
    }
    return img;
}

async function loadFrame(src, targetWidth) {
    if (typeof createImageBitmap === 'function') {
        try {
            const res = await fetch(src);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();
            return await createImageBitmap(blob, {
                resizeWidth: targetWidth,
                resizeQuality: 'medium',
            });
        } catch {
            // fall through to the <img> decoder
        }
    }
    return decodeImageElement(src);
}

function loadFramesInOrder(names, targetWidth, onFrame) {
    const frames = new Array(names.length).fill(null);
    let next = 0;

    const worker = async () => {
        while (next < names.length) {
            const index = next++;
            frames[index] = await loadFrame(names[index], targetWidth);
            onFrame(index, frames);
        }
    };

    return Promise.all(Array.from({ length: FRAME_CONCURRENCY }, worker)).then(() => frames);
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

        const posterImg = document.getElementById('loading-frame');
        const canvas = document.getElementById('loading-canvas');
        const barEl = document.getElementById('loading-bar');
        const percentEl = document.getElementById('loading-percent');
        const quoteEl = screen.querySelector('.loading__quote');
        const dotsEl = screen.querySelector('.loading__dots');
        const wrapper = screen.querySelector('.loading__frame-wrapper');

        const ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;
        if (ctx) ctx.imageSmoothingQuality = 'high';

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const wrapperWidth = (wrapper && wrapper.clientWidth) || 700;
        const targetWidth = Math.max(
            MIN_BITMAP_WIDTH,
            Math.min(MAX_BITMAP_WIDTH, Math.round((wrapperWidth * dpr) / 2) * 2)
        );

        if (canvas) {
            canvas.width = targetWidth;
            canvas.height = Math.round(targetWidth * FRAME_ASPECT);
        }

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
        }, 2600);

        let dotCount = 0;
        const dotsInterval = setInterval(() => {
            dotCount = (dotCount + 1) % 4;
            if (dotsEl) dotsEl.textContent = '.'.repeat(dotCount);
        }, 400);

        // ── Progress bookkeeping ──────────────────────────────
        const criticalAssets = getCriticalAssets();
        let framesLoaded = 0;
        let assetsLoaded = 0;
        let assetsStarted = false;
        let pageDone = document.readyState === 'complete';
        let frames = new Array(TOTAL_FRAMES).fill(null);
        let framesReady = false;

        if (!pageDone) {
            window.addEventListener('load', () => { pageDone = true; }, { once: true });
        }

        function loadFraction() {
            const framePart = framesLoaded / TOTAL_FRAMES;
            const assetPart = criticalAssets.length ? assetsLoaded / criticalAssets.length : 1;
            return framePart * 0.6 + assetPart * 0.3 + (pageDone ? 0.1 : 0);
        }

        function allLoaded() {
            return framesReady && assetsLoaded >= criticalAssets.length && pageDone;
        }

        function startAssets() {
            if (assetsStarted) return;
            assetsStarted = true;
            criticalAssets.forEach((src) => {
                loadAsset(src).then(() => { assetsLoaded++; });
            });
        }

        // ── Drawing ───────────────────────────────────────────
        let lastDrawn = -1;

        function drawFrame(index) {
            if (!ctx || index === lastDrawn) return;
            let source = frames[index];
            let probe = index;
            while (!source && probe > 0) source = frames[--probe];
            if (!source) return;
            ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
            lastDrawn = index;
        }

        // ── Single animation loop ─────────────────────────────
        const startTime = performance.now();
        let phase = 'loading';
        let phaseStart = startTime;
        let playStart = 0;
        let playFraction = 0;
        let displayed = 0;
        let lastTs = startTime;
        let lastPercent = -1;
        let rafId = 0;

        function setPhase(next, ts) {
            phase = next;
            phaseStart = ts;
        }

        function render() {
            const pct = Math.round(displayed * 100);
            if (barEl) barEl.style.transform = `scaleX(${displayed.toFixed(4)})`;
            if (percentEl && pct !== lastPercent) {
                percentEl.textContent = `${pct}%`;
                lastPercent = pct;
            }
        }

        function tick(ts) {
            const dt = Math.min(0.1, (ts - lastTs) / 1000);
            lastTs = ts;

            if (phase === 'loading') {
                if (framesReady) {
                    const hasAnyFrame = frames.some(Boolean);
                    setPhase(hasAnyFrame ? 'holding' : 'settling', ts);
                    if (!hasAnyFrame) playFraction = 1;
                } else if (ts - startTime > FRAME_LOAD_TIMEOUT_MS) {
                    // Too slow to play the scene smoothly: skip it rather than stutter.
                    startAssets();
                    playFraction = 1;
                    setPhase('settling', ts);
                }
            }

            if (phase === 'holding' && ts - phaseStart >= HOLD_BEFORE_PLAY_MS) {
                playStart = ts;
                setPhase('playing', ts);
            }

            if (phase === 'playing') {
                const elapsed = ts - playStart;
                drawFrame(Math.min(TOTAL_FRAMES - 1, Math.floor(elapsed / FRAME_MS)));
                playFraction = Math.min(1, elapsed / SCENE_MS);
                if (elapsed >= SCENE_MS) {
                    drawFrame(TOTAL_FRAMES - 1);
                    playFraction = 1;
                    setPhase('settling', ts);
                }
            }

            const target = Math.min(1, loadFraction() * 0.5 + playFraction * 0.5);
            displayed += (target - displayed) * (1 - Math.exp(-dt * 9));
            if (target - displayed < 0.001) displayed = target;
            render();

            if (phase === 'settling') {
                const waited = ts - phaseStart;
                const ready = allLoaded() || waited >= SETTLE_TIMEOUT_MS;
                if (ready && waited >= HOLD_AFTER_PLAY_MS && displayed >= 0.995) {
                    leave();
                    return;
                }
            }

            rafId = requestAnimationFrame(tick);
        }

        function cleanup() {
            clearInterval(quoteInterval);
            clearInterval(dotsInterval);
            frames.forEach((frame) => {
                if (frame && typeof frame.close === 'function') frame.close();
            });
            frames = [];
        }

        function leave() {
            phase = 'leaving';
            displayed = 1;
            render();
            clearInterval(quoteInterval);
            clearInterval(dotsInterval);

            let finished = false;
            const finish = () => {
                if (finished) return;
                finished = true;
                cleanup();
                screen.remove();
                resolve();
            };

            screen.addEventListener('transitionend', (e) => {
                if (e.target === screen && e.propertyName === 'opacity') finish();
            });
            setTimeout(finish, FADE_FALLBACK_MS);
            screen.classList.add('fade-out');
        }

        // ── Kick everything off ───────────────────────────────
        loadFramesInOrder(getFrameNames(), targetWidth, (index, loaded) => {
            framesLoaded++;
            frames = loaded;
            if (index === 0) drawFrame(0);
        }).then((loaded) => {
            frames = loaded;
            framesReady = true;
            startAssets();
        });

        rafId = requestAnimationFrame(tick);
        void rafId;
    });
}
