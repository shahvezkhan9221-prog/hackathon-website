/* ═══════════════════════════════════════════════════════════
   js/sections/team.js — Spider-Verse crew carousel
   Placeholder members: replace names, roles and `img` paths
   (e.g. "assets/crew/name.jpg") when the real crew is ready.
═══════════════════════════════════════════════════════════ */
const CAROUSEL_AUTO_INTERVAL_MS = 2200;

const crewMembers = [
  { name: 'Name 1', role: 'Role', img: 'assets/variants/miles_morales.jpg' },
  { name: 'Name 2', role: 'Role', img: 'assets/variants/spider_gwen.jpg' },
  { name: 'Name 3', role: 'Role', img: 'assets/variants/spiderman_2099.jpg' },
  { name: 'Name 4', role: 'Role', img: 'assets/variants/spider_noir.png' },
  { name: 'Name 5', role: 'Role', img: 'assets/variants/spiderman_india.jpg' },
  { name: 'Name 6', role: 'Role', img: 'assets/variants/scarlett_spider.webp' },
];

function cardHTML(member) {
  return `
    <article class="swiper-slide team-card">
      <div class="team-card__avatar">
        <div class="team-card__avatar-inner">
          <img src="${member.img}" alt="" loading="lazy" />
        </div>
      </div>
      <div class="team-card__info">
        <h3 class="team-card__name">${member.name}</h3>
        <p class="team-card__role">${member.role}</p>
      </div>
    </article>`;
}

function revealCards(panel) {
  const cards = panel.querySelectorAll('.team-card');
  cards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 80}ms`;
    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('in-view')));
  });
}

export function initTeam() {
  const panel = document.getElementById('team-panel');
  const grid = document.getElementById('team-grid');
  if (!panel || !grid) return;

  grid.innerHTML = `
    <div class="swiper team-swiper" id="swiper-team">
      <div class="swiper-wrapper">${crewMembers.map(cardHTML).join('')}</div>
    </div>`;

  const containerEl = document.getElementById('swiper-team');
  const swiper = new Swiper('#swiper-team', {
    effect: 'slide',
    grabCursor: true,
    centeredSlides: true,
    loop: true,
    speed: 800,
    spaceBetween: 40,
    autoplay: { delay: CAROUSEL_AUTO_INTERVAL_MS, disableOnInteraction: false },
    slidesPerView: 1.5,
    slideToClickedSlide: true,
    observer: true,
    observeParents: true,
    breakpoints: {
      768: { slidesPerView: 2.5 },
      1100: { slidesPerView: 3 },
    },
  });

  containerEl.addEventListener('mouseover', (e) => {
    if (e.target.closest('.swiper-slide-active')) swiper.autoplay.stop();
    else swiper.autoplay.start();
  });
  containerEl.addEventListener('mouseout', () => swiper.autoplay.start());

  const section = document.getElementById('team');
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((en) => en.isIntersecting)) {
      revealCards(panel);
      observer.disconnect();
    }
  }, { threshold: 0.2 });
  observer.observe(section);
}
