/* ═══════════════════════════════════════════════════════════
   js/main.js — Entry Point
   
   Imports and initializes all core modules and section modules.
   Load order:
   1. GSAP registration (must be first — other modules use ScrollTrigger)
   2. Three.js scene setup (hero needs scene reference)
   3. Lenis smooth scroll (connects to GSAP ticker)
   4. Section initializations in DOM order
   
   To add a new section:
   1. Create js/sections/newSection.js with an init function
   2. Import and call it here in the correct DOM order
   3. Add corresponding CSS file and link in index.html
═══════════════════════════════════════════════════════════ */

// Core
import { registerGSAP } from './core/gsap-init.js';
import { initLenis } from './core/lenis-init.js';

// Loading Screen
import { initLoading } from './sections/loading.js';

// Sections
import { initHero } from './sections/hero.js';
import { initAbout } from './sections/about.js';
import { initTimeline } from './sections/timeline.js';
import { initEvents } from './sections/events.js';
import { initTeam } from './sections/team.js';
import { initFAQ } from './sections/faq.js';
import { initSketchbook } from './sections/sketchbook.js';

/**
 * Boot sequence — runs when DOM is ready.
 * Waits for the loading screen to finish before initializing sections.
 */
async function boot() {
    // 0. Run loading screen (preloads frames, shows progress)
    await initLoading();

    // 1. Register GSAP plugins
    try { registerGSAP(); } catch (e) { console.warn('[boot] GSAP init failed:', e); }

    // 2. Start Lenis smooth scrolling
    try { initLenis(); } catch (e) { console.warn('[boot] Lenis init failed:', e); }

    // 3. Initialize sections in DOM order
    initHero();
    initAbout();
    initTimeline();
    initEvents();
    initTeam();
    initFAQ();
    try { initSketchbook(); } catch (e) { console.warn('[boot] Sketchbook init failed:', e); }

    console.log('[YANTRIX26] All systems online.');
}

// Wait for DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
