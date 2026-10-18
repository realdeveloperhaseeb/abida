(() => {
  const WA_NUMBER = '923245536357';
  const EMAIL = 'abidasiddiqui161214@gmail.com';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // Preloader
  window.addEventListener('load', () => {
    setTimeout(() => $('#preloader').classList.add('done'), 500);
  });
  setTimeout(() => $('#preloader').classList.add('done'), 3000); // fallback

  $('#year').textContent = new Date().getFullYear();

  // Header state, scroll progress, active nav link
  const header = $('#header');
  const progress = $('#scrollProgress');
  const sections = $$('main section[id]');
  const navLinks = $$('.nav-link');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    let current = '';
    sections.forEach(s => { if (y >= s.offsetTop - 120) current = s.id; });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const burger = $('#burger');
  const nav = $('#nav');
  const toggleMenu = open => {
    nav.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  };
  burger.addEventListener('click', () => toggleMenu(!nav.classList.contains('open')));
  $$('#nav a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  // Reveal on scroll + skill bars + counters
  const animateCount = el => {
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || '';
    const dur = 1600;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('in');
      $$('.bar i', el).forEach(b => (b.style.width = b.dataset.w + '%'));
      $$('.count', el).forEach(animateCount);
      if (el.classList.contains('count')) animateCount(el);
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  // Typewriter in hero
  const words = ['qualified leads', 'booked calls', 'paying customers', 'real ROI'];
  const tw = $('#typeword');
  let wi = 0, ci = words[0].length, deleting = false;
  const type = () => {
    const word = words[wi];
    ci += deleting ? -1 : 1;
    tw.textContent = word.slice(0, ci);
    let delay = deleting ? 45 : 90;
    if (!deleting && ci === word.length) { delay = 1800; deleting = true; }
    else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 300; }
    setTimeout(type, delay);
  };
  setTimeout(() => { deleting = true; type(); }, 2600);

  // Tabs with sliding indicator
  const tabs = $$('.tab');
  const indicator = $('.tab-indicator');
  const moveIndicator = btn => {
    indicator.style.left = btn.offsetLeft + 'px';
    indicator.style.width = btn.offsetWidth + 'px';
  };
  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    $$('.tab-panel').forEach(p => p.classList.remove('active'));
    $('#tab-' + btn.dataset.tab).classList.add('active');
    moveIndicator(btn);
    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }));
  const syncIndicator = () => moveIndicator($('.tab.active'));
  window.addEventListener('resize', syncIndicator);
  window.addEventListener('load', syncIndicator);
  document.fonts && document.fonts.ready.then(syncIndicator);
  syncIndicator();

  // Lightbox (navigates within the active case study)
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCap');
  let group = [], idx = 0;
  const show = i => {
    idx = (i + group.length) % group.length;
    const fig = group[idx];
    const img = $('img', fig);
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = $('figcaption', fig)?.textContent || '';
  };
  const openLb = fig => {
    group = $$('.g-item', fig.closest('.gallery'));
    show(group.indexOf(fig));
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeLb = () => {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  $$('.g-item').forEach(fig => fig.addEventListener('click', () => openLb(fig)));
  $('.lb-close').addEventListener('click', closeLb);
  $('.lb-prev').addEventListener('click', e => { e.stopPropagation(); show(idx - 1); });
  $('.lb-next').addEventListener('click', e => { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  // Contact form → WhatsApp or email (no backend needed)
  const form = $('#contactForm');
  const note = $('#formNote');
  let via = 'whatsapp';
  $$('button[type="submit"]', form).forEach(b => b.addEventListener('click', () => (via = b.dataset.via)));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const fields = ['cf-name', 'cf-email', 'cf-service', 'cf-msg'].map(id => $('#' + id));
    let ok = true;
    fields.forEach(f => {
      const valid = f.checkValidity();
      f.parentElement.classList.toggle('error', !valid);
      if (!valid) ok = false;
    });
    if (!ok) { note.textContent = 'Please fill in all fields with a valid email.'; return; }
    const [name, email, service, msg] = fields.map(f => f.value.trim());
    const body = `Hi Abida,\n\nName: ${name}\nEmail: ${email}\nService: ${service}\n\n${msg}`;
    if (via === 'email') {
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Project inquiry: ' + service)}&body=${encodeURIComponent(body)}`;
    } else {
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(body)}`, '_blank', 'noopener');
    }
    note.textContent = 'Opening ' + (via === 'email' ? 'your email app' : 'WhatsApp') + '…';
    form.reset();
  });
})();
