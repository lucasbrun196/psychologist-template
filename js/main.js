(() => {
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Loader ---------- */
  const markLoaded = () => {
    body.classList.add('is-loaded');
    revealInView();
  };

  // Fallback alongside IntersectionObserver: reveal anything already on screen.
  const revealInView = () => {
    const vh = window.innerHeight;
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      const r = (el.classList.contains('reveal--clip') ? el.parentElement : el).getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add('is-visible');
    });
  };
  if (document.readyState === 'complete') setTimeout(markLoaded, 500);
  else window.addEventListener('load', () => setTimeout(markLoaded, 500));
  setTimeout(markLoaded, 2500); // fallback if some asset hangs

  /* ---------- Year ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header + progress + floating button ---------- */
  const header = document.querySelector('.header');
  const progress = document.querySelector('.scroll-progress');
  const floatBtn = document.querySelector('.whatsapp-float');
  let lastY = window.scrollY;

  /* ---------- Parallax ---------- */
  const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
  const parallaxImgs = [...document.querySelectorAll('[data-parallax-img]')];

  /* ---------- Timeline progress ---------- */
  const timeline = document.querySelector('.timeline');
  const timelineLine = document.querySelector('.timeline__line');

  /* ---------- Statement word reveal ---------- */
  const statement = document.querySelector('[data-split]');
  let words = [];
  if (statement) {
    words = statement.textContent.trim().split(/\s+/).map((w) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = w;
      return span;
    });
    statement.textContent = '';
    words.forEach((w, i) => {
      statement.appendChild(w);
      if (i < words.length - 1) statement.appendChild(document.createTextNode(' '));
    });
  }

  const onScroll = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    revealInView();

    header.classList.toggle('is-scrolled', y > 40);
    const menuOpen = body.classList.contains('menu-open');
    header.classList.toggle('is-hidden', !menuOpen && y > lastY && y > 500);
    lastY = y;

    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    floatBtn.classList.toggle('is-visible', y > vh * 0.6);

    if (!reduceMotion) {
      parallaxEls.forEach((el) => {
        el.style.transform = `translate3d(0, ${y * parseFloat(el.dataset.parallax)}px, 0)`;
      });
      parallaxImgs.forEach((img) => {
        const rect = img.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const center = rect.top + rect.height / 2 - vh / 2;
        img.style.translate = `0 ${-center * parseFloat(img.dataset.parallaxImg) - rect.height * 0.05}px`;
      });
    }

    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height + vh * 0.2)));
      timelineLine.style.setProperty('--progress', p.toFixed(3));
    }

    if (statement && words.length) {
      const r = statement.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.55)));
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('is-on', i < lit));
    }
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    // A fully clipped element (clip-path) never reports as intersecting,
    // so masked images are observed through their parent instead.
    const targets = new Map();
    revealEls.forEach((el) => {
      const watched = el.classList.contains('reveal--clip') ? el.parentElement : el;
      if (!targets.has(watched)) targets.set(watched, []);
      targets.get(watched).push(el);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        targets.get(entry.target).forEach((el) => el.classList.add('is-visible'));
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    targets.forEach((_, watched) => io.observe(watched));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Count-up ---------- */
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const run = () => {
      if (reduceMotion) { el.textContent = target; return; }
      const start = performance.now();
      const dur = 1800;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(run, 900); io.disconnect(); }
    });
    io.observe(el);
  });

  /* ---------- Active nav link ---------- */
  const navLinks = [...document.querySelectorAll('.nav__link')];
  const sections = navLinks.map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => navIO.observe(s));

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('menu-mobile');
  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    body.classList.toggle('is-locked', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.setAttribute('aria-hidden', String(!open));
  };
  toggle.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Pointer effects (desktop only) ---------- */
  if (finePointer && !reduceMotion) {
    // Tilt + spotlight on cards
    document.querySelectorAll('.tilt').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
        card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-6px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    // Magnetic buttons
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });

    // Glow follows the cursor in the contact box
    const box = document.querySelector('.contact__box');
    if (box) {
      box.addEventListener('pointermove', (e) => {
        const r = box.getBoundingClientRect();
        box.style.setProperty('--gx', `${e.clientX - r.left}px`);
        box.style.setProperty('--gy', `${e.clientY - r.top}px`);
      });
    }
  }

  /* ---------- FAQ: keep one open at a time ---------- */
  const items = document.querySelectorAll('.accordion__item');
  items.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) items.forEach((other) => { if (other !== item) other.open = false; });
    });
  });

  /* ---------- Phone mask ---------- */
  const phone = document.getElementById('telefone');
  phone?.addEventListener('input', () => {
    const d = phone.value.replace(/\D/g, '').slice(0, 11);
    let out = d;
    if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    phone.value = out;
  });

  /* ---------- Custom select ---------- */
  document.querySelectorAll('[data-select]').forEach((field) => {
    const input = field.querySelector('input[type="hidden"]');
    const trigger = field.querySelector('.select__trigger');
    const valueEl = field.querySelector('.select__value');
    const list = field.querySelector('.select__menu');
    const options = [...list.querySelectorAll('[role="option"]')];
    let active = -1;

    const setActive = (i) => {
      active = (i + options.length) % options.length;
      options.forEach((o, idx) => o.classList.toggle('is-active', idx === active));
      list.setAttribute('aria-activedescendant', options[active].id);
    };

    const open = () => {
      field.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      const selected = options.findIndex((o) => o.getAttribute('aria-selected') === 'true');
      setActive(selected >= 0 ? selected : 0);
      list.focus({ preventScroll: true });
    };

    const close = (returnFocus = true) => {
      if (!field.classList.contains('is-open')) return;
      field.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      options.forEach((o) => o.classList.remove('is-active'));
      if (returnFocus) trigger.focus({ preventScroll: true });
    };

    const choose = (i) => {
      const option = options[i];
      options.forEach((o) => o.setAttribute('aria-selected', String(o === option)));
      input.value = option.dataset.value;
      valueEl.textContent = option.dataset.value;
      valueEl.classList.remove('is-changed');
      void valueEl.offsetWidth; // restart the value animation
      valueEl.classList.add('is-changed');
      field.classList.add('has-value');
      field.classList.remove('is-invalid');
      close();
    };

    trigger.addEventListener('click', () => (field.classList.contains('is-open') ? close() : open()));
    trigger.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); open(); }
    });

    options.forEach((o, i) => {
      o.addEventListener('click', () => choose(i));
      o.addEventListener('pointermove', () => { if (active !== i) setActive(i); });
    });

    list.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown': e.preventDefault(); setActive(active + 1); break;
        case 'ArrowUp': e.preventDefault(); setActive(active - 1); break;
        case 'Home': e.preventDefault(); setActive(0); break;
        case 'End': e.preventDefault(); setActive(options.length - 1); break;
        case 'Enter':
        case ' ': e.preventDefault(); choose(active); break;
        case 'Escape': e.preventDefault(); e.stopPropagation(); close(); break;
        case 'Tab': close(false); break;
        default: break;
      }
    });

    document.addEventListener('pointerdown', (e) => { if (!field.contains(e.target)) close(false); });
  });

  /* ---------- Contact form → WhatsApp ---------- */
  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach((field) => {
      const ok = field.value.trim() !== '';
      field.closest('.field').classList.toggle('is-invalid', !ok);
      if (!ok) valid = false;
    });
    if (!valid) return;

    const data = new FormData(form);
    const text = [
      `Olá, Helena! Meu nome é ${data.get('nome')}.`,
      `Gostaria de agendar uma conversa (${data.get('modalidade')}).`,
      data.get('mensagem') ? `\n${data.get('mensagem')}` : '',
    ].join(' ').trim();
    window.open(`https://wa.me/5511900000000?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });
})();
