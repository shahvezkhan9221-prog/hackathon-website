(function () {
  var btn = document.getElementById('audio-toggle');
  var audio = document.getElementById('bg-audio');
  if (!btn || !audio) return;

  audio.volume = 0.5;

  var userPaused = false;
  var interactionEvents = ['pointerdown', 'keydown', 'touchstart'];

  function render(isPlaying) {
    btn.classList.toggle('is-playing', isPlaying);
    btn.setAttribute('aria-pressed', String(isPlaying));
    btn.setAttribute('aria-label', isPlaying ? 'Pause music' : 'Play music');
  }

  function play() {
    var attempt = audio.play();
    if (attempt && typeof attempt.then === 'function') {
      return attempt.then(function () { render(true); }, function () { render(false); });
    }
    render(!audio.paused);
    return Promise.resolve();
  }

  function removeUnlockListeners() {
    interactionEvents.forEach(function (name) {
      document.removeEventListener(name, unlock, true);
    });
  }

  // Browsers block sound until the visitor interacts, so retry on the first gesture.
  function unlock(event) {
    if (userPaused || btn.contains(event.target)) return;
    removeUnlockListeners();
    play();
  }

  btn.addEventListener('click', function () {
    removeUnlockListeners();
    if (audio.paused) {
      userPaused = false;
      play();
    } else {
      userPaused = true;
      audio.pause();
      render(false);
    }
  });

  audio.addEventListener('play', function () { render(true); });
  audio.addEventListener('pause', function () { render(false); });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && !audio.paused) {
      audio.pause();
      audio.dataset.autoPaused = '1';
    } else if (!document.hidden && audio.dataset.autoPaused) {
      delete audio.dataset.autoPaused;
      if (!userPaused) play();
    }
  });

  play().then(function () {
    if (audio.paused) {
      interactionEvents.forEach(function (name) {
        document.addEventListener(name, unlock, true);
      });
    }
  });
})();
