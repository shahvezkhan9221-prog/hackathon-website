/* ═══════════════════════════════════════════════════════════
   hamburger.js — Mobile nav drawer toggle
   Works on any page that uses the shared nav markup.
═══════════════════════════════════════════════════════════ */

(function () {
  const btn     = document.getElementById('nav-hamburger');
  const drawer  = document.getElementById('nav-drawer');
  const overlay = document.getElementById('nav-overlay');

  if (!btn || !drawer || !overlay) return;

  function openMenu() {
    btn.classList.add('is-open');
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // prevent scroll behind drawer
  }

  function closeMenu() {
    btn.classList.remove('is-open');
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    btn.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  // Close on overlay click
  overlay.addEventListener('click', closeMenu);

  // Close when any drawer link is tapped
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
})();

/* ═══════════════════════════════════════════════════════════
   Register Modal — "Choose Your Event"
═══════════════════════════════════════════════════════════ */
(function() {
  function initRegisterModal() {
    if (document.getElementById('reg-modal-overlay')) return;

    // Inject styles for the modal
    const style = document.createElement("style");
    style.textContent = `
      .reg-modal-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
        z-index: 9999; display: flex; align-items: center; justify-content: center;
        opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
      }
      .reg-modal-overlay.is-active { opacity: 1; pointer-events: auto; }
      
      .reg-modal {
        background: var(--c-bg, #090914);
        border: 2px solid var(--c-cyan, #00f0ff);
        box-shadow: 12px 12px 0 var(--c-magenta, #ff0040);
        padding: 40px; border-radius: 4px; max-width: 450px; width: 90%;
        text-align: center; position: relative;
        transform: translateY(20px); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .reg-modal-overlay.is-active .reg-modal { transform: translateY(0); }
      
      .reg-modal__close {
        position: absolute; top: -15px; right: -15px; width: 36px; height: 36px;
        background: var(--c-magenta, #ff0040); border: 2px solid #000;
        color: #fff; font-family: 'Anton', sans-serif; font-size: 22px;
        cursor: pointer; border-radius: 50%; box-shadow: 3px 3px 0 #000;
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.2s;
      }
      .reg-modal__close:hover { transform: scale(1.1); }
      
      .reg-modal__title {
        font-family: 'Anton', sans-serif;
        font-size: 2.2rem; color: #fff; text-transform: uppercase;
        letter-spacing: 0.05em; margin-bottom: 25px;
        text-shadow: 2px 2px 0 #000;
      }
      
      .reg-modal__options {
        display: flex; flex-direction: column; gap: 16px;
      }
      
      .reg-modal__btn {
        display: block; width: 100%; padding: 16px;
        font-family: 'Anton', sans-serif; font-size: 1.3rem;
        text-decoration: none; text-transform: uppercase;
        letter-spacing: 0.08em; transition: all 0.2s;
        border: 2px solid #000; border-radius: 2px;
        position: relative; overflow: hidden;
      }
      
      .reg-modal__btn--hw { background: #ff0040; color: #fff; box-shadow: 4px 4px 0 #000; }
      .reg-modal__btn--sw { background: #00f0ff; color: #000; box-shadow: 4px 4px 0 #000; }
      .reg-modal__btn--ind { background: #fcee0a; color: #000; box-shadow: 4px 4px 0 #000; }
      
      .reg-modal__btn:hover { transform: translate(-3px, -3px); box-shadow: 7px 7px 0 #000; filter: brightness(1.1); }
    `;
    document.head.appendChild(style);

    // Inject HTML
    const overlay = document.createElement("div");
    overlay.className = "reg-modal-overlay";
    overlay.id = "reg-modal-overlay";
    overlay.innerHTML = `
      <div class="reg-modal">
        <button class="reg-modal__close" id="reg-modal-close" aria-label="Close">&times;</button>
        <h3 class="reg-modal__title">Choose Your Event</h3>
        <p class="reg-modal__sub">Registration opens soon &middot; GLA University students only</p>
        <div class="reg-modal__options">
          <button type="button" data-event="event-ideathon" class="reg-modal__btn reg-modal__btn--hw">Ideathon<span class="reg-modal__btn-soon">REGISTRATION OPENS SOON</span></button>
          <button type="button" data-event="event-debate" class="reg-modal__btn reg-modal__btn--sw">Tech Debate<span class="reg-modal__btn-soon">REGISTRATION OPENS SOON</span></button>
          <button type="button" data-event="event-exhibition" class="reg-modal__btn reg-modal__btn--ind">Project Exhibition<span class="reg-modal__btn-soon">REGISTRATION OPENS SOON</span></button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const closeModal = () => overlay.classList.remove('is-active');
    document.getElementById("reg-modal-close").addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
      if(e.target === overlay) closeModal();
    });
    
    // Add escape key support specifically for modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-active')) {
        closeModal();
      }
    });

    // Registration links are not live yet: jump to the event's details instead.
    // When a form is ready, add `href` handling here keyed by data-event.
    overlay.querySelectorAll('[data-event]').forEach((btn) => {
      btn.addEventListener('click', () => {
        closeModal();
        const target = document.getElementById(btn.dataset.event);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    const openModal = (e) => {
      e.preventDefault();
      overlay.classList.add('is-active');
    };

    // Attach to all elements containing "REGISTER" in their text
    const registerLinks = document.querySelectorAll('a, button');
    registerLinks.forEach(el => {
      if (el.textContent.trim().toUpperCase() === 'REGISTER') {
        if (el.hasAttribute('onclick')) {
          el.removeAttribute('onclick'); // For cta-launch button
        }
        el.addEventListener('click', openModal);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRegisterModal);
  } else {
    initRegisterModal();
  }
})();
