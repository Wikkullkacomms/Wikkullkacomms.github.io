(function resetScrollOnLoad() {
  try {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  } catch (e) {}

  const forceTop = () => {
    if (location.hash) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    window.scrollTo(0, 0);
  };

  forceTop();
  document.addEventListener('DOMContentLoaded', forceTop);
  window.addEventListener('load', () => {
    forceTop();
    requestAnimationFrame(forceTop);
  });
})();

function initContentProtection() {
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('selectstart', (e) => e.preventDefault());
  document.addEventListener('copy', (e) => e.preventDefault());
  document.addEventListener('cut', (e) => e.preventDefault());

  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const blocked =
      key === 'f12' ||
      (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
      (e.ctrlKey && ['u', 'c', 'x', 'a'].includes(key));
    if (blocked) e.preventDefault();
  });

  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });
}

const artworks = [
  { src: 'images/SFW.jpg', alt: '', category: 'sfw' },
  { src: 'images/SFW1.jpg', alt: '', category: 'sfw' },
  { src: 'images/SFW2.jpg', alt: '', category: 'sfw' },
  { src: 'images/SFW3.jpg', alt: '', category: 'sfw' },
  { src: 'images/NSFW.jpg', alt: '', category: 'nsfw' },
  { src: 'images/NSFW1.jpg', alt: '', category: 'nsfw' },
];

const artIcon = `<svg class="art-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`;

function renderGallery() {
  const sfwGrid = document.getElementById('sfw-grid');
  const nsfwGrid = document.getElementById('nsfw-grid');
  if (!sfwGrid && !nsfwGrid) return;

  artworks.forEach((art) => {
    const card = document.createElement('div');
    card.className = 'art-card' + (art.category === 'nsfw' ? ' nsfw' : '');

    if (art.src) {
      const img = document.createElement('img');
      img.src = art.src;
      img.alt = art.alt || '';
      card.appendChild(img);
      card.classList.add('clickable');
      card.addEventListener('click', () => openLightbox(art.category, art.src));
    } else {
      card.innerHTML = artIcon + '<span>' + (art.alt || '...') + '</span>';
    }

    const target = art.category === 'nsfw' ? nsfwGrid : sfwGrid;
    if (target) target.appendChild(card);
  });
}

const lightboxState = { list: [], index: 0 };

function openLightbox(category, src) {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (!lightbox || !img) return;

  lightboxState.list = artworks.filter((a) => a.category === category && a.src).map((a) => a.src);
  lightboxState.index = lightboxState.list.indexOf(src);

  img.src = src;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function showLightboxStep(delta) {
  const { list } = lightboxState;
  if (!list.length) return;
  lightboxState.index = (lightboxState.index + delta + list.length) % list.length;
  document.getElementById('lightbox-img').src = list[lightboxState.index];
}

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev').addEventListener('click', () => showLightboxStep(-1));
  document.getElementById('lightbox-next').addEventListener('click', () => showLightboxStep(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showLightboxStep(-1);
    if (e.key === 'ArrowRight') showLightboxStep(1);
  });
}

function initGalleryTabs() {
  const tabs = document.querySelectorAll('.gallery-tab');
  const panels = document.querySelectorAll('.gallery-panel');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.dataset.tab;
      panels.forEach((p) => p.classList.toggle('active', p.dataset.panel === target));
    });
  });
}

function initRulesAccordion() {
  const sections = document.querySelectorAll('.rules-section');
  if (!sections.length) return;

  sections.forEach((section) => {
    const toggle = section.querySelector('.rules-toggle');
    toggle.addEventListener('click', () => {
      const isOpen = section.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  });
}

function initAgeGate() {
  const gate = document.getElementById('age-gate');
  if (!gate) return;

  const enterBtn = document.getElementById('gate-enter');
  const leaveBtn = document.getElementById('gate-leave');

  enterBtn.addEventListener('click', () => {
    try {
      localStorage.setItem('wiktorysy_age_ok', 'yes');
    } catch (e) {}
    document.documentElement.setAttribute('data-gate', 'pass');
  });

  leaveBtn.addEventListener('click', () => {
    window.location.href = 'https://www.google.com';
  });
}

function initTheme() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('wiktorysy_theme', next);
    } catch (e) {}
  });
}

function initDrawer() {
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('nav-drawer');
  const backdrop = document.getElementById('nav-backdrop');
  const closeBtn = document.getElementById('drawer-close');
  if (!burger || !drawer || !backdrop) return;

  const open = () => {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    burger.classList.add('open');
  };

  const close = () => {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    burger.classList.remove('open');
  };

  burger.addEventListener('click', () => {
    drawer.classList.contains('open') ? close() : open();
  });

  if (closeBtn) closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  drawer.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
}

function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((item) => observer.observe(item));
}

function initCreditEasterEgg() {
  const trigger = document.getElementById('credit-trigger');
  if (!trigger) return;

  trigger.addEventListener('click', () => {
    alert('Дикий Никита');
  });
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initContentProtection();
  renderGallery();
  initGalleryTabs();
  initLightbox();
  initRulesAccordion();
  initAgeGate();
  initTheme();
  initDrawer();
  initCreditEasterEgg();
  initReveal();
  initBackToTop();
});
