/* ═══════════════════════════════════════════════════════════
   js/sections/sketchbook.js — Page-flip sketchbook (GSAP)
   Used in the "About FUSION Club & Synapse Club" section.
═══════════════════════════════════════════════════════════ */

const PAGES = [
    { src: 'assets/events/sketchbook/page-1.png', title: 'GLA University, Greater Noida' },
    { src: 'assets/events/sketchbook/page-2.png', title: 'We are a Family and We Build Together' },
    { src: 'assets/events/sketchbook/page-3.png', title: 'Workshop: Build, Learn, Create' },
];

export function initSketchbook() {
    const book = document.getElementById('sketchbook-book');
    const pageEl = document.getElementById('sketchbook-page');
    const caption = document.getElementById('sketchbook-caption');
    const prevButton = document.getElementById('sketchbook-prev');
    const nextButton = document.getElementById('sketchbook-next');

    if (!book || !pageEl || !caption || !window.gsap) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasCustomEase = !!window.CustomEase;
    if (hasCustomEase) {
        gsap.registerPlugin(CustomEase);
        CustomEase.create('pageTurn', '.42,.05,.25,1');
    }
    const turnEase = hasCustomEase ? 'pageTurn' : 'power2.inOut';

    PAGES.forEach(({ src }) => { new Image().src = src; });

    let currentPage = 0;
    let flipTween = null;
    let introPlaying = false;

    const halfImage = (pageIndex, side) =>
        `<img src="${PAGES[pageIndex].src}" class="${side}" alt="" draggable="false">`;

    function showPage(pageIndex) {
        currentPage = pageIndex;
        pageEl.innerHTML = `
            <div class="sketchbook__half left">${halfImage(pageIndex, 'left')}</div>
            <div class="sketchbook__half right">${halfImage(pageIndex, 'right')}</div>`;
    }

    function setCaption(title) {
        caption.textContent = title;
        gsap.fromTo(caption, { opacity: 0 }, { opacity: 1, duration: 0.4, overwrite: 'auto' });
    }

    function turn(direction, duration = 0.85, ease = turnEase, onDone) {
        if (flipTween && flipTween.isActive()) flipTween.progress(1);

        const goingNext = direction === 'next';
        const targetPage = (currentPage + (goingNext ? 1 : -1) + PAGES.length) % PAGES.length;
        const liftSide = goingNext ? 'right' : 'left';
        const landSide = goingNext ? 'left' : 'right';

        book.insertAdjacentHTML('beforeend', `
            <div class="sketchbook__turn">
                <div class="sketchbook__half ${liftSide}">${halfImage(targetPage, liftSide)}</div>
                <div class="sketchbook__flap ${goingNext ? 'next' : 'prev'}">
                    <div class="sketchbook__face">${halfImage(currentPage, liftSide)}</div>
                    <div class="sketchbook__face back">${halfImage(targetPage, landSide)}</div>
                </div>
            </div>`);

        setCaption(PAGES[targetPage].title);

        flipTween = gsap.to(book.querySelector('.sketchbook__flap'), {
            rotationY: goingNext ? -180 : 180,
            transformOrigin: goingNext ? 'left center' : 'right center',
            duration: reducedMotion ? 0.01 : duration,
            ease,
            onComplete() {
                showPage(targetPage);
                book.querySelector('.sketchbook__turn')?.remove();
                if (onDone) onDone();
            },
        });
    }

    function riffle(step = 0) {
        if (!introPlaying || step >= PAGES.length) {
            introPlaying = false;
            book.classList.remove('blur-light', 'blur-heavy');
            return;
        }
        const bell = Math.sin(Math.PI * step / (PAGES.length - 1));
        book.classList.toggle('blur-light', bell > 0.25 && bell <= 0.6);
        book.classList.toggle('blur-heavy', bell > 0.6);
        turn('next', 0.2 - 0.15 * bell, 'none', () => riffle(step + 1));
    }

    function navigate(direction) {
        introPlaying = false;
        book.classList.remove('blur-light', 'blur-heavy');
        turn(direction);
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

    showPage(0);
    setCaption(PAGES[0].title);

    if (reducedMotion || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        gsap.delayedCall(0.3, () => {
            introPlaying = true;
            riffle();
        });
    }, { threshold: 0.5 });
    observer.observe(book);
}
