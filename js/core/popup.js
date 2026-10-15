/* ═══════════════════════════════════════════════════════════
   popup.js — "Registration opens soon" welcome popup
   Appears once per session, after the loading screen is gone.
═══════════════════════════════════════════════════════════ */
(function () {
  const popup = document.getElementById('soon-popup');
  const exploreBtn = document.getElementById('soon-popup-explore');
  if (!popup || !exploreBtn) return;

  function open() {
    popup.classList.add('active');
    popup.setAttribute('aria-hidden', 'false');
    exploreBtn.focus({ preventScroll: true });
  }

  function close() {
    popup.classList.remove('active');
    popup.setAttribute('aria-hidden', 'true');
  }

  exploreBtn.addEventListener('click', () => {
    close();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  popup.addEventListener('click', (e) => {
    if (e.target === popup) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('active')) close();
  });

  if (sessionStorage.getItem('soonPopupShown')) return;

  const waitForLoader = setInterval(() => {
    if (document.getElementById('loading-screen')) return;
    clearInterval(waitForLoader);
    setTimeout(() => {
      open();
      sessionStorage.setItem('soonPopupShown', '1');
    }, 900);
  }, 250);
})();
