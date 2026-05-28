(async () => {
  let data;
  try {
    const res = await fetch('data/content.json');
    data = await res.json();
  } catch (e) {
    console.error('content.json の読み込みに失敗しました:', e);
    return;
  }

  const { site, event, about, teams, timetable, qa } = data;

  document.title = `${site.title} Vol.${event.vol} – ${site.subtitle}`;

  const navList = document.getElementById('nav-list');
  data.nav.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${item.href}">${item.label}</a>`;
    navList.appendChild(li);
  });

  const hamburger = document.getElementById('hamburger');
  const globalNav = document.getElementById('global-nav');
  hamburger.addEventListener('click', () => {
    const isOpen = globalNav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
  });
  navList.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      globalNav.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });

  const sliderEl = document.getElementById('hero-slider');
  const dotsEl = document.getElementById('hero-dots');
  const images = data.hero_images;
  let currentSlide = 0;
  let slideInterval;

  const slides = images.map((src, i) => {
    const div = document.createElement('div');
    div.className = `hero-slide fallback-${i % 5}`;
    const img = new Image();
    img.onload = () => { div.style.backgroundImage = `url('${src}')`; };
    img.src = src;
    sliderEl.appendChild(div);
    return div;
  });

  images.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'hero-dot';
    btn.setAttribute('aria-label', `スライド ${i + 1}`);
    btn.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(btn);
  });

  const dots = dotsEl.querySelectorAll('.hero-dot');

  function goTo(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  function startAutoplay() {
    slideInterval = setInterval(() => goTo(currentSlide + 1), 5000);
  }

  goTo(0);
  startAutoplay();

  let touchStartX = 0;
  sliderEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  sliderEl.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      clearInterval(slideInterval);
      goTo(diff > 0 ? currentSlide + 1 : currentSlide - 1);
      startAutoplay();
    }
  });

  document.getElementById('hero-vol-badge').textContent = `Vol.${event.vol} — ${event.anniversary}`;
  document.getElementById('hero-info').innerHTML = `
    <div class="event-date">${event.date}</div>
    <div class="event-venue">@ ${event.venue} / ${event.open} / ${event.start}</div>
  `;

  document.getElementById('about-lead').textContent = about.lead;
  document.getElementById('about-video-iframe').src = event.youtube_embed;
  document.getElementById('about-body').textContent = about.body;

  const featuresGrid = document.getElementById('features-grid');
  about.features.forEach(f => {
    const card = document.createElement('div');
    card.className = 'feature-card reveal';
    card.innerHTML = `
      <div class="feature-icon">${f.icon}</div>
      <div class="feature-title">${f.title}</div>
      <div class="feature-desc">${f.desc}</div>
    `;
    featuresGrid.appendChild(card);
  });

  document.getElementById('timetable-header').innerHTML = `
    <div class="tt-date">${event.date}</div>
    <div class="tt-venue">${event.venue} / ${event.open} – ${event.start}</div>
  `;

  const ttList = document.getElementById('timetable-list');
  timetable.forEach(row => {
    const isDJ = row.act.includes('DJ') || row.act.includes('OPEN') || row.act.includes('START');
    const div = document.createElement('div');
    div.className = `tt-row reveal${isDJ ? ' dj' : ''}`;
    div.innerHTML = `
      <div class="tt-time">${row.time}</div>
      <div class="tt-act">${row.act}</div>
    `;
    ttList.appendChild(div);
  });

  const teamsGrid = document.getElementById('teams-grid');
  teams.forEach(name => {
    const card = document.createElement('div');
    card.className = 'team-card reveal';
    card.innerHTML = `<span>${name}</span>`;
    teamsGrid.appendChild(card);
  });

  const qaList = document.getElementById('qa-list');
  qa.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'qa-item reveal';
    div.innerHTML = `
      <button class="qa-question" aria-expanded="false" aria-controls="qa-answer-${i}">
        <span class="qa-q-icon">Q</span>
        <span>${item.q}</span>
        <span class="qa-chevron">▼</span>
      </button>
      <div class="qa-answer" id="qa-answer-${i}" role="region">
        <div class="qa-answer-inner">${item.a}</div>
      </div>
    `;
    const btn = div.querySelector('.qa-question');
    btn.addEventListener('click', () => {
      const isOpen = div.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
    });
    qaList.appendChild(div);
  });

  const socialIcons = {
    youtube:   { icon: '▶', label: 'YouTube' },
    twitter:   { icon: '𝕏', label: 'X (Twitter)' },
    instagram: { icon: '📷', label: 'Instagram' },
    facebook:  { icon: 'f', label: 'Facebook' },
  };

  const footerSocial = document.getElementById('footer-social');
  Object.entries(site.social).forEach(([key, url]) => {
    if (!url) return;
    const s = socialIcons[key] || { icon: '🔗', label: key };
    const a = document.createElement('a');
    a.className = 'social-link';
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', s.label);
    a.textContent = s.icon;
    footerSocial.appendChild(a);
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach((el, i) => {
      el.style.transitionDelay = `${(i % 8) * 0.05}s`;
      observer.observe(el);
    });
  }, 100);

  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,0.12)' : 'none';
  }, { passive: true });

})();
