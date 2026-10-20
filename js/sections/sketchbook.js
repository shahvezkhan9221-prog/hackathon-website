/* ═══════════════════════════════════════════════════════════
   js/sections/sketchbook.js — Auto-turning page-flip sketchbook (GSAP)
   Used in the "About FUSION Club & Synapse Club" section.
═══════════════════════════════════════════════════════════ */

const PAGES = [
    { src: 'assets/events/sketchbook/page-1.png', title: 'GLA University, Greater Noida' },
    { src: 'assets/events/sketchbook/page-2.png', title: 'We are a Family and We Build Together' },
    { src: 'assets/events/sketchbook/page-3.png', title: 'Workshop: Build, Learn, Create' },
];

const TURN_DURATION = 1.1;
const AUTO_TURN_DELAY = 3.2;
const RESUME_DELAY = 5;

export function initSketchbook() {
    const book = document.getElementById('sketchbook-book');
    const pageEl = document.getElementById('sketchbook-page');
    const caption = document.getElementById('sketchbook-caption');
    const prevButton = document.getElementById('sketchbook-prev');
    const nextButton = document.getElementById('sketchbook-next');

    if (!book || !pageEl || !caption || !window.gsap) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const images = PAGES.map(({ src }) => {
        const img = new Image();
        img.decoding = 'sync';
        img.draggable = false;
        img.alt = '';
        img.src = src;
        return img;
    });

    const ready = Promise.all(images.map((img) => img.decode().catch(() => {})));

    let currentPage = 0;
    let flipTween = null;
    let autoTimer = null;
    let inView = false;
    let paused = false;

    function halfImage(pageIndex, side) {
        const img = images[pageIndex].cloneNode();
        img.className = side;
        return img;
    }

    function buildHalf(pageIndex, side) {
        const half = document.createElement('div');
        half.className = `sketchbook__half ${side}`;
        half.appendChild(halfImage(pageIndex, side));
        return half;
    }

    function showPage(pageIndex) {
        currentPage = pageIndex;
        pageEl.replaceChildren(buildHalf(pageIndex, 'left'), buildHalf(pageIndex, 'right'));
    }

    function setCaption(title) {
        caption.textContent = title;
        gsap.fromTo(caption, { opacity: 0 }, { opacity: 1, duration: 0.5, overwrite: 'auto' });
    }

    function turn(direction) {
        if (flipTween && flipTween.isActive()) return;

        const goingNext = direction === 'next';
        const targetPage = (currentPage + (goingNext ? 1 : -1) + PAGES.length) % PAGES.length;
        const liftSide = goingNext ? 'right' : 'left';
        const landSide = goingNext ? 'left' : 'right';

        const turnLayer = document.createElement('div');
        turnLayer.className = 'sketchbook__turn';

        const flap = document.createElement('div');
        flap.className = `sketchbook__flap ${goingNext ? 'next' : 'prev'}`;

        const front = document.createElement('div');
        front.className = 'sketchbook__face';
        front.appendChild(halfImage(currentPage, liftSide));

        const back = document.createElement('div');
        back.className = 'sketchbook__face back';
        back.appendChild(halfImage(targetPage, landSide));

        flap.append(front, back);
        turnLayer.append(buildHalf(targetPage, liftSide), flap);
        book.appendChild(turnLayer);

        setCaption(PAGES[targetPage].title);

        gsap.set(flap, {
            transformOrigin: goingNext ? 'left center' : 'right center',
            rotationY: 0,
            force3D: true,
        });

        flipTween = gsap.to(flap, {
            rotationY: goingNext ? -180 : 180,
            duration: reducedMotion ? 0.01 : TURN_DURATION,
            ease: 'power2.inOut',
            onComplete() {
                showPage(targetPage);
                turnLayer.remove();
            },
        });
    }

    function stopAuto() {
        if (autoTimer) autoTimer.kill();
        autoTimer = null;
    }

    function scheduleAuto(delay = AUTO_TURN_DELAY) {
        stopAuto();
        if (reducedMotion || paused || !inView || document.hidden) return;
        autoTimer = gsap.delayedCall(delay, () => {
            turn('next');
            scheduleAuto(AUTO_TURN_DELAY + TURN_DURATION);
        });
    }

    function navigate(direction) {
        turn(direction);
        scheduleAuto(RESUME_DELAY + TURN_DURATION);
    }

    nextButton?.addEventListener('click', () => navigate('next'));
    prevButton?.addEventListener('click', () => navigate('prev'));

    book.addEventListener('click', (event) => {
        const rect = book.getBoundingClientRect();
        navigate(event.clientX - rect.left < rect.width / 2 ? 'prev' : 'next');
    });

    book.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') { event.preventDefault(); navigate('next'); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); navigate('prev'); }
    });

    book.addEventListener('pointerenter', () => { paused = true; stopAuto(); });
    book.addEventListener('pointerleave', () => { paused = false; scheduleAuto(); });
    book.addEventListener('focus', () => { paused = true; stopAuto(); });
    book.addEventListener('blur', () => { paused = false; scheduleAuto(); });

    document.addEventListener('visibilitychange', () => scheduleAuto());

    showPage(0);
    setCaption(PAGES[0].title);

    if (!('IntersectionObserver' in window)) {
        inView = true;
        ready.then(() => scheduleAuto(1.5));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        if (inView) ready.then(() => scheduleAuto(1.2));
        else stopAuto();
    }, { threshold: 0.4 });
    observer.observe(book);
}
