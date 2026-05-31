(async () => {
  let data;
  try {
    const res = await fetch('data/content.json');
    data = await res.json();
  } catch (e) {
    console.error('content.json の読み込みに失敗しました:', e);
    return;
  }

  const { site, event, about, rules, teams, timetable, qa } = data;

  document.title = `${site.title} Vol.${event.vol} – ${site.subtitle}`;

  // NAV
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
  });
  navList.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      globalNav.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });

  // パーティクル
  const particlesEl = document.getElementById('hero-particles');
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 1;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 8 + 6}s;
      animation-delay: ${Math.random() * 6}s;
      opacity: 0;
    `;
    particlesEl.appendChild(p);
  }

  // HERO
  document.getElementById('hero-catchcopy').textContent = event.catchcopy;
  document.getElementById('hero-vol-badge').textContent = `Vol.${event.vol} — ${event.anniversary}`;
  document.getElementById('hero-info').innerHTML = `
    <div class="event-date">${event.date}</div>
    <div class="event-venue">@ ${event.venue} / ${event.open} / ${event.start}</div>
  `;
  const ep = document.getElementById('entry-period');
  if (ep) ep.textContent = event.entry_period;

  // ABOUT
  document.getElementById('about-lead').textContent = about.lead;
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

  // RULES
  const rulesGrid = document.getElementById('rules-grid');
  Object.values(rules).forEach(rule => {
    const card = document.createElement('div');
    card.className = 'rule-card reveal';
    const itemsHTML = rule.items.map(i => `<div class="rule-item">${i}</div>`).join('');
    card.innerHTML = `
      <div class="rule-title">${rule.title}</div>
      <div class="rule-items">${itemsHTML}</div>
    `;
    rulesGrid.appendChild(card);
  });

  // ENTRY INFO BOX
  const entryInfoBox = document.getElementById('entry-info-box');
  const infoRows = [
    { label: '開催日', value: event.date },
    { label: '会場', value: event.venue },
    { label: 'エントリー期間', value: event.entry_period },
    { label: 'チケット（関係者）', value: event.ticket_relation },
    { label: 'チケット（一般）', value: event.ticket_general },
    { label: 'ステージ', value: `開口 ${event.stage_width} / 奥行 ${event.stage_depth}` },
  ];
  infoRows.forEach(row => {
    const div = document.createElement('div');
    div.className = 'entry-info-row';
    div.innerHTML = `<span class="entry-info-label">${row.label}</span><span class="entry-info-value">${row.value}</span>`;
    entryInfoBox.appendChild(div);
  });

  // TIMETABLE
  document.getElementById('timetable-header').innerHTML = `
    <div class="tt-date">${event.date}</div>
    <div class="tt-venue">${event.venue} / ${event.open} – ${event.start}</div>
  `;
  const ttList = document.getElementById('timetable-list');
  timetable.forEach(row => {
    const isSpecial = row.act.includes('OPEN') || row.act.includes('START') || row.act.includes('FINALE') || row.act.includes('表彰');
    const div = document.createElement('div');
    div.className = `tt-row reveal${isSpecial ? ' dj' : ''}`;
    div.innerHTML = `<div class="tt-time">${row.time}</div><div class="tt-act">${row.act}</div>`;
    ttList.appendChild(div);
  });

  // TEAMS
  const teamsGrid = document.getElementById('teams-grid');
  teams.forEach(name => {
    const card = document.createElement('div');
    card.className = 'team-card reveal';
    card.innerHTML = `<span>${name}</span>`;
    teamsGrid.appendChild(card);
  });

  // Q&A
  const qaList = document.getElementById('qa-list');
  qa.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'qa-item reveal';
    div.innerHTML = `
      <button class="qa-question" aria-expanded="false">
        <span class="qa-q-icon">Q</span>
        <span>${item.q}</span>
        <span class="qa-chevron">▼</span>
      </button>
      <div class="qa-answer"><div class="qa-answer-inner">${item.a}</div></div>
    `;
    div.querySelector('.qa-question').addEventListener('click', () => {
      const isOpen = div.classList.toggle('open');
      div.querySelector('.qa-question').setAttribute('aria-expanded', isOpen);
    });
    qaList.appendChild(div);
  });

  // SOCIAL
  const socialIcons = {
    youtube:   { icon: '<i class="fa-brands fa-youtube"></i>', label: 'YouTube' },
    twitter:   { icon: '<i class="fa-brands fa-x-twitter"></i>', label: 'X' },
    instagram: { icon: '<i class="fa-brands fa-instagram"></i>', label: 'Instagram' },
    facebook:  { icon: '<i class="fa-brands fa-facebook-f"></i>', label: 'Facebook' },
  };
  const footerSocial = document.getElementById('footer-social');
  Object.entries(site.social).forEach(([key, url]) => {
    if (!url) return;
    const s = socialIcons[key] || { icon: '<i class="fa-solid fa-link"></i>', label: key };
    const a = document.createElement('a');
    a.className = 'social-link';
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', s.label);
    a.innerHTML = s.icon;
    footerSocial.appendChild(a);
  });

  // SCROLL REVEAL
  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach((el, i) => {
      el.style.transitionDelay = `${(i % 8) * 0.05}s`;
      observer.observe(el);
    });
  }, 100);

  // HEADER SHADOW
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10 ? '0 2px 20px rgba(0,100,255,0.2)' : 'none';
  }, { passive: true });

})();
