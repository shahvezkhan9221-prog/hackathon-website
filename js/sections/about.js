/* ═══════════════════════════════════════════════════════════
   js/sections/about.js
   SPIDER-VERSE About — Holographic Edition
   ‣ 62 webp frames scrubbed by ScrollTrigger as the section
     scrolls through the viewport (no pinning/locking)
   ‣ Canvas is position:absolute — section scrolls normally
   ‣ Holographic panel reveals, pillar pop, count-up animations
═══════════════════════════════════════════════════════════ */

const FRAME_COUNT = 62;
const FRAME_PATH  = (n) =>
    `assets/about_cinematic/frame_${String(n).padStart(2, '0')}_delay-0.066s.webp`;

export function initAbout() {
    initCinematic();
    revealPanels();
    animatePillars();
    animateCountUp();
}

/* ─────────────────────────────────────────────────────────
   SCROLL-DRIVEN CINEMATIC CANVAS
   Canvas covers the section absolutely — section scrolls
   normally. ScrollTrigger maps section scroll progress
   (0 → 1) to frame index (0 → 61). No pinning.
───────────────────────────────────────────────────────── */
function initCinematic() {
    const canvas  = document.getElementById('about-cinematic-canvas');
    const section = document.getElementById('about');
    if (!canvas || !section) return;

    const ctx = canvas.getContext('2d');
    let currentFrame = 0;

    // Fit canvas to section's full rendered size
    function resize() {
        canvas.width  = section.offsetWidth;
        canvas.height = section.offsetHeight;
        drawFrame(currentFrame); // redraw after resize
    }

    function drawFrame(idx) {
        const img = frames[idx];
        if (!img?.complete) return;
        const { width: cw, height: ch } = canvas;
        const { naturalWidth: iw, naturalHeight: ih } = img;
        // Cover-fit: fill canvas, centre the crop
        const scale = Math.max(cw / iw, ch / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }

    // Preload all frames
    const frames = [];
    let loaded = 0;
    let triggerCreated = false;

    function createScrollTrigger() {
        if (triggerCreated) return;
        triggerCreated = true;

        resize();
        window.addEventListener('resize', resize, { passive: true });
        drawFrame(0); // show first frame immediately

        ScrollTrigger.create({
            trigger: '#about',
            // Start scrubbing when top of section enters viewport
            start: 'top bottom',
            // Finish scrubbing when bottom of section leaves viewport
            end: 'bottom top',
            scrub: 0.3, // smooth scrub
            onUpdate(self) {
                const idx = Math.min(
                    FRAME_COUNT - 1,
                    Math.floor(self.progress * FRAME_COUNT)
                );
                if (idx !== currentFrame) {
                    currentFrame = idx;
                    drawFrame(idx);
                }
            },
        });
    }

    for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.src = FRAME_PATH(i);
        img.onload = () => {
            loaded++;
            // Set up as soon as first frame is ready
            if (loaded === 1) createScrollTrigger();
        };
        img.onerror = () => { loaded++; };
        frames.push(img);
    }
}

/* ─────────────────────────────────────────────────────────
   PANEL REVEAL
───────────────────────────────────────────────────────── */
function revealPanels() {
    const panels = document.querySelectorAll('.about-panel');
    if (!panels.length) return;

    panels.forEach((panel, i) => {
        gsap.fromTo(panel,
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: 'power3.out',
                delay: i * 0.1,
                scrollTrigger: {
                    trigger: panel,
                    start: 'top 88%',
                    toggleClass: 'in-view',
                },
            }
        );
    });
}

/* ─────────────────────────────────────────────────────────
   PILLAR POP
───────────────────────────────────────────────────────── */
function animatePillars() {
    const pillars = document.querySelectorAll('.about-pillar');
    if (!pillars.length) return;

    gsap.fromTo(pillars,
        { opacity: 0, x: -20 },
        {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.15,
            ease: 'back.out(1.6)',
            scrollTrigger: {
                trigger: '.about-panel--mission',
                start: 'top 78%',
            },
        }
    );
}

/* ─────────────────────────────────────────────────────────
   COUNT-UP
───────────────────────────────────────────────────────── */
function animateCountUp() {
    const metrics = document.querySelectorAll('.about-metric__value[data-count]');
    if (!document.querySelector('.about-metric')) return;

    gsap.fromTo('.about-metric',
        { opacity: 0, y: 20 },
        {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.about-metrics',
                start: 'top 82%',
            },
        }
    );

    metrics.forEach((el) => {
        const target  = parseFloat(el.dataset.count);
        const prefix  = el.dataset.prefix  || '';
        const suffix  = el.dataset.suffix  || '';
        const counter = { val: 0 };

        gsap.to(counter, {
            val: target,
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                once: true,
            },
            onUpdate() {
                el.textContent = `${prefix}${Math.round(counter.val)}${suffix}`;
            },
            onComplete() {
                el.textContent = `${prefix}${target}${suffix}`;
            },
        });
    });
}
