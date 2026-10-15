/* ═══════════════════════════════════════════════════════════
   js/sections/events.js — scroll reveals for Register Now,
   Synapse and Mentors sections
═══════════════════════════════════════════════════════════ */

export function initEvents() {
    const gsap = window.gsap;
    if (!gsap || !window.ScrollTrigger) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.from('.event-card', {
        y: 70,
        opacity: 0,
        rotation: (i) => (i % 2 ? 2 : -2),
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.4)',
        scrollTrigger: { trigger: '.events__grid', start: 'top 80%', once: true },
    });

    gsap.from('.workshop-card', {
        x: (i) => (i % 2 ? 60 : -60),
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.workshops__grid', start: 'top 85%', once: true },
    });

    gsap.from('.synapse__card, .synapse__slot', {
        y: 50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.synapse__layout', start: 'top 80%', once: true },
    });
}
