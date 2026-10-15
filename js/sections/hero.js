/* ═══════════════════════════════════════════════════════════
   js/sections/hero.js
   SPIDER-VERSE Hero — opening entrance sequence + CTA
═══════════════════════════════════════════════════════════ */

export function initHero() {
    playOpeningSequence();
    setupCTA();
}

/**
 * Staggered "web-slinging" entrance that plays once the loader is gone.
 */
function playOpeningSequence() {
    const gsap = window.gsap;
    if (!gsap) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.from('.hero__video-bg', { scale: 1.15, opacity: 0, duration: 1.6, ease: 'power2.out' }, 0)
        .from('.comic-frame', { scale: 0.2, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'back.out(2)' }, 0.1)
        .from('.hero__title', { yPercent: -120, scaleY: 1.6, opacity: 0, duration: 0.9, ease: 'elastic.out(1, 0.6)' }, 0.3)
        .from('.hero__title-sub', { scale: 3, opacity: 0, rotation: -12, duration: 0.7, ease: 'back.out(2.2)' }, 0.75)
        .from('.hero__badge', { x: -80, opacity: 0, duration: 0.6 }, 1.0)
        .from('.hero__subtitle', { y: 30, opacity: 0, duration: 0.6 }, 1.15)
        .from('.hero__reveal', { y: 20, opacity: 0, scale: 0.8, duration: 0.5, ease: 'back.out(2)' }, 1.3)
        .from('.hero__buttons .btn', { y: 40, opacity: 0, duration: 0.5, stagger: 0.12, ease: 'back.out(1.8)' }, 1.45);
}

function setupCTA() {
    const btn = document.getElementById('cta-events');
    const flash = document.getElementById('portal-flash');
    if (!btn || !flash) return;

    btn.addEventListener('click', () => {
        flash.classList.add('active');
        setTimeout(() => {
            const target = document.getElementById('events');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => flash.classList.remove('active'), 800);
        }, 400);
    });
}
