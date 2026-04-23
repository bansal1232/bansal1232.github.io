(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- external links open in new tab ---
  document.querySelectorAll('a[href^="http"]').forEach(function (a) {
    if (!a.classList.contains('internal-link')) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    }
  });

  // --- theme toggle ---
  var themeToggle = document.getElementById('themeToggle');
  function updateThemeIcon() {
    var icon = themeToggle && themeToggle.querySelector('.theme-toggle__icon');
    if (!icon) return;
    icon.textContent = document.documentElement.classList.contains('dark-mode') ? '☀️' : '🌙';
  }
  updateThemeIcon();
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var isDark = document.documentElement.classList.toggle('dark-mode');
      try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (e) {}
      updateThemeIcon();
    });
  }

  // --- mobile nav burger ---
  var burger = document.getElementById('navBurger');
  var nav = document.getElementById('siteNav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      burger.classList.toggle('is-open');
    });
    nav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
      });
    });
  }

  // --- scroll reveal ---
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // --- counter animation ---
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-target')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400;
    var start = performance.now();
    function tick(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    if (prefersReducedMotion) {
      el.textContent = target + suffix;
    } else {
      requestAnimationFrame(tick);
    }
  }
  var counters = document.querySelectorAll('.counter');
  if ('IntersectionObserver' in window) {
    var counterObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { counterObs.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  // --- tech filter ---
  var filterPills = document.querySelectorAll('#techFilter .tech-pill');
  var experienceCards = document.querySelectorAll('.experience[data-tech]');
  filterPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var selected = pill.getAttribute('data-tech');
      filterPills.forEach(function (p) { p.classList.toggle('is-active', p === pill); });
      experienceCards.forEach(function (card) {
        var techs = (card.getAttribute('data-tech') || '').split(/\s+/);
        var match = selected === 'all' || techs.indexOf(selected) !== -1;
        card.classList.toggle('is-dimmed', !match);
      });
    });
  });

  // --- scrollspy ---
  var navLinks = document.querySelectorAll('.nav-link');
  var sectionIds = Array.from(navLinks).map(function (l) { return l.getAttribute('href'); });
  var sections = sectionIds
    .map(function (id) { return document.querySelector(id); })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (l) {
      l.classList.toggle('is-active', l.getAttribute('href') === id);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActive('#' + entry.target.id);
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  // --- scroll-to-top button ---
  var scrollTop = document.getElementById('scrollTop');
  if (scrollTop) {
    window.addEventListener('scroll', function () {
      scrollTop.classList.toggle('is-visible', window.scrollY > 600);
    }, { passive: true });
    scrollTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  // --- photo gallery + lightbox ---
  var galleryItems = Array.from(document.querySelectorAll('.gallery__item'));
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightboxImg');
  var lbCap = document.getElementById('lightboxCap');
  var lbClose = document.getElementById('lightboxClose');
  var lbPrev = document.getElementById('lightboxPrev');
  var lbNext = document.getElementById('lightboxNext');
  var lbIndex = 0;

  function openLightbox(i) {
    if (!galleryItems.length || !lightbox) return;
    lbIndex = (i + galleryItems.length) % galleryItems.length;
    var fig = galleryItems[lbIndex];
    var img = fig.querySelector('img');
    var cap = fig.querySelector('figcaption');
    lbImg.src = img.src;
    lbImg.alt = img.alt || '';
    lbCap.textContent = cap ? cap.textContent : '';
    lightbox.hidden = false;
    requestAnimationFrame(function () { lightbox.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { lightbox.hidden = true; }, 250);
  }

  galleryItems.forEach(function (fig, i) {
    fig.setAttribute('tabindex', '0');
    fig.addEventListener('click', function () { openLightbox(i); });
    fig.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(i);
      }
    });
  });

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', function () { openLightbox(lbIndex - 1); });
  if (lbNext) lbNext.addEventListener('click', function () { openLightbox(lbIndex + 1); });
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (!lightbox || lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') openLightbox(lbIndex - 1);
    else if (e.key === 'ArrowRight') openLightbox(lbIndex + 1);
  });

  // --- typewriter on the tagline ---
  var twTarget = document.getElementById('typewriter');
  if (twTarget) {
    var phrases = [
      'Building high-throughput distributed systems that scale.',
      'Latency-saving optimisations — one ms at a time.',
      'Node.js · Java · AWS · event-driven backends.',
      'Turning monoliths into microservices.'
    ];
    if (prefersReducedMotion) {
      twTarget.textContent = phrases[0];
      var cursor = document.querySelector('.tw-cursor');
      if (cursor) cursor.style.display = 'none';
    } else {
      var pi = 0, ci = 0, deleting = false;
      function typeStep() {
        var phrase = phrases[pi];
        if (!deleting) {
          ci++;
          twTarget.textContent = phrase.slice(0, ci);
          if (ci === phrase.length) {
            deleting = true;
            return setTimeout(typeStep, 1800);
          }
          setTimeout(typeStep, 45 + Math.random() * 50);
        } else {
          ci--;
          twTarget.textContent = phrase.slice(0, ci);
          if (ci === 0) {
            deleting = false;
            pi = (pi + 1) % phrases.length;
            return setTimeout(typeStep, 350);
          }
          setTimeout(typeStep, 25);
        }
      }
      setTimeout(typeStep, 500);
    }
  }

  // --- scroll progress bar ---
  var progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    var ticking = false;
    function updateProgress() {
      var h = document.documentElement;
      var scrolled = h.scrollTop || document.body.scrollTop;
      var total = h.scrollHeight - h.clientHeight;
      var pct = total > 0 ? (scrolled / total) * 100 : 0;
      progressBar.style.width = pct + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
    updateProgress();
  }

  // --- time-aware greeting ---
  var greetEl = document.getElementById('greeting');
  if (greetEl) {
    var hr = new Date().getHours();
    var msg;
    if (hr < 5) msg = '🌙 Up late — welcome in';
    else if (hr < 12) msg = '☀️ Good morning — welcome';
    else if (hr < 17) msg = '👋 Good afternoon — welcome';
    else if (hr < 21) msg = '🌇 Good evening — welcome';
    else msg = '🌃 Still online — welcome';
    greetEl.textContent = msg;
  }

  // --- toast ---
  var toastStack = document.getElementById('toastStack');
  function showToast(text, variant) {
    if (!toastStack) return;
    var t = document.createElement('div');
    t.className = 'toast' + (variant ? ' toast--' + variant : '');
    t.textContent = text;
    toastStack.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('is-visible'); });
    setTimeout(function () {
      t.classList.remove('is-visible');
      setTimeout(function () { t.remove(); }, 300);
    }, 1800);
  }

  // --- confetti ---
  var confettiColors = ['#4dd0c5', '#008080', '#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#ffa07a'];
  function burstConfetti(x, y, count) {
    if (prefersReducedMotion) return;
    count = count || 42;
    if (typeof x !== 'number') x = window.innerWidth / 2;
    if (typeof y !== 'number') y = 80;
    for (var i = 0; i < count; i++) {
      var p = document.createElement('span');
      p.className = 'confetti-piece';
      var angle = (Math.PI * 2) * (i / count) + (Math.random() - 0.5) * 0.5;
      var speed = 120 + Math.random() * 180;
      var mx = Math.cos(angle) * speed;
      var my = Math.sin(angle) * speed * 0.6;
      var dx = mx + (Math.random() - 0.5) * 80;
      var dy = Math.abs(my) + 400 + Math.random() * 200;
      p.style.setProperty('--sx', x + 'px');
      p.style.setProperty('--sy', y + 'px');
      p.style.setProperty('--mx', mx + 'px');
      p.style.setProperty('--my', my + 'px');
      p.style.setProperty('--dx', dx + 'px');
      p.style.setProperty('--dy', dy + 'px');
      p.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      p.style.background = confettiColors[i % confettiColors.length];
      p.style.animationDelay = (Math.random() * 80) + 'ms';
      document.body.appendChild(p);
      setTimeout((function (el) { return function () { el.remove(); }; })(p), 1600);
    }
  }

  // --- brand logo confetti ---
  var brand = document.getElementById('brandLogo');
  if (brand) {
    brand.addEventListener('click', function (e) {
      var rect = brand.getBoundingClientRect();
      burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 36);
    });
  }

  // --- copy email ---
  var emailLink = document.getElementById('emailLink');
  if (emailLink) {
    emailLink.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      var email = emailLink.getAttribute('data-email');
      if (!email || !navigator.clipboard) return;
      e.preventDefault();
      navigator.clipboard.writeText(email).then(function () {
        emailLink.classList.add('is-copied');
        var label = emailLink.querySelector('.email-copy');
        var prev = label ? label.textContent : '';
        if (label) label.textContent = '✓ copied';
        showToast('Email copied to clipboard', 'success');
        setTimeout(function () {
          emailLink.classList.remove('is-copied');
          if (label) label.textContent = prev || 'click to copy';
        }, 1600);
      }).catch(function () {
        showToast('Could not copy — please copy manually');
      });
    });
  }

  // --- tech badges on each experience + live-link to the filter ---
  var techLabels = {
    node: 'Node.js',
    java: 'Java',
    spring: 'Spring',
    redis: 'Redis',
    mongodb: 'MongoDB',
    postgresql: 'PostgreSQL',
    elasticsearch: 'Elasticsearch',
    aws: 'AWS',
    couchbase: 'Couchbase'
  };
  var allBadges = [];
  document.querySelectorAll('.experience[data-tech]').forEach(function (exp) {
    var techs = (exp.getAttribute('data-tech') || '').split(/\s+/).filter(Boolean);
    if (!techs.length) return;
    var timeEl = exp.querySelector('.experience__time');
    if (!timeEl) return;
    var row = document.createElement('div');
    row.className = 'exp-tech';
    techs.forEach(function (t) {
      var b = document.createElement('span');
      b.className = 'exp-tech-badge';
      b.textContent = techLabels[t] || t.charAt(0).toUpperCase() + t.slice(1);
      b.setAttribute('data-tech', t);
      b.addEventListener('click', function () {
        var pill = document.querySelector('#techFilter .tech-pill[data-tech="' + t + '"]');
        if (pill) pill.click();
        var section = document.getElementById('experience');
        if (section) section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      });
      b.style.cursor = 'pointer';
      row.appendChild(b);
      allBadges.push(b);
    });
    timeEl.insertAdjacentElement('afterend', row);
  });

  // keep badges synced with the filter
  var filterPillsAll = document.querySelectorAll('#techFilter .tech-pill');
  function syncBadges(selected) {
    allBadges.forEach(function (b) {
      b.classList.toggle('is-active', selected !== 'all' && b.getAttribute('data-tech') === selected);
    });
  }
  filterPillsAll.forEach(function (pill) {
    pill.addEventListener('click', function () { syncBadges(pill.getAttribute('data-tech')); });
  });

  // --- command palette ---
  var palette = document.getElementById('cmdPalette');
  var paletteInput = document.getElementById('cmdPaletteInput');
  var paletteList = document.getElementById('cmdPaletteList');
  var paletteTrigger = document.getElementById('cmdPaletteTrigger');

  function jumpTo(hash) {
    var el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', hash);
  }

  function toggleTheme() {
    var isDark = document.documentElement.classList.toggle('dark-mode');
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (e) {}
    updateThemeIcon();
  }

  function copyEmailAction() {
    if (emailLink) emailLink.click();
    else showToast('Email: shubhambansal1232@gmail.com');
  }

  var paletteActions = [
    { icon: '👤', label: 'Jump to About', hint: 'Section', keys: 'about who bio intro', run: function () { jumpTo('#about'); } },
    { icon: '💼', label: 'Jump to Work Experience', hint: 'Section', keys: 'work experience job career timeline', run: function () { jumpTo('#experience'); } },
    { icon: '📝', label: 'Jump to Design & Development Notes', hint: 'Section', keys: 'notes design development writing', run: function () { jumpTo('#notes'); } },
    { icon: '🚀', label: 'Jump to Projects', hint: 'Section', keys: 'projects code portfolio', run: function () { jumpTo('#projects'); } },
    { icon: '🛠️', label: 'Jump to Skills', hint: 'Section', keys: 'skills stack tech tools', run: function () { jumpTo('#skills'); } },
    { icon: '🏆', label: 'Jump to Achievements', hint: 'Section', keys: 'achievements awards prizes', run: function () { jumpTo('#achievements'); } },
    { icon: '🌍', label: 'Jump to Life Beyond Code', hint: 'Section', keys: 'life interests photos gallery', run: function () { jumpTo('#life'); } },
    { icon: '🌙', label: 'Toggle dark / light mode', hint: 'Action', keys: 'dark light theme mode toggle appearance', run: toggleTheme },
    { icon: '✉️', label: 'Copy email', hint: 'Action', keys: 'email mail contact copy', run: copyEmailAction },
    { icon: '🔗', label: 'Open LinkedIn', hint: 'Link', keys: 'linkedin social', run: function () { window.open('https://www.linkedin.com/in/bansal1232/', '_blank'); } },
    { icon: '🐙', label: 'Open GitHub', hint: 'Link', keys: 'github git code', run: function () { window.open('http://github.com/bansal1232', '_blank'); } },
    { icon: '📚', label: 'Open Design & Development page', hint: 'Link', keys: 'design development notes page', run: function () { window.location.href = 'design-development.html'; } },
    { icon: '🎉', label: 'Launch confetti', hint: 'Fun', keys: 'confetti celebrate party fun', run: function () { burstConfetti(window.innerWidth / 2, window.innerHeight / 2, 80); } },
    { icon: '⬆️', label: 'Scroll to top', hint: 'Action', keys: 'top scroll up home', run: function () { window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }); } }
  ];

  var paletteVisible = [];
  var paletteIdx = 0;

  function renderPalette() {
    if (!paletteList) return;
    var q = paletteInput.value.trim().toLowerCase();
    paletteVisible = !q ? paletteActions.slice() : paletteActions.filter(function (a) {
      return (a.label + ' ' + a.keys).toLowerCase().indexOf(q) !== -1;
    });
    paletteList.innerHTML = '';
    if (!paletteVisible.length) {
      var empty = document.createElement('li');
      empty.className = 'cmd-palette__empty';
      empty.textContent = 'No matches. Try "dark", "skills", "email"…';
      paletteList.appendChild(empty);
      return;
    }
    paletteIdx = 0;
    paletteVisible.forEach(function (a, i) {
      var li = document.createElement('li');
      li.className = 'cmd-palette__item' + (i === 0 ? ' is-active' : '');
      li.setAttribute('role', 'option');
      li.innerHTML = '<span class="cmd-palette__item-icon">' + a.icon + '</span>' +
        '<span class="cmd-palette__item-label"></span>' +
        '<span class="cmd-palette__item-hint">' + a.hint + '</span>';
      li.querySelector('.cmd-palette__item-label').textContent = a.label;
      li.addEventListener('mouseenter', function () { setActiveItem(i); });
      li.addEventListener('click', function () { runActive(); });
      paletteList.appendChild(li);
    });
  }

  function setActiveItem(i) {
    var items = paletteList.querySelectorAll('.cmd-palette__item');
    if (!items.length) return;
    paletteIdx = (i + items.length) % items.length;
    items.forEach(function (el, idx) { el.classList.toggle('is-active', idx === paletteIdx); });
    items[paletteIdx].scrollIntoView({ block: 'nearest' });
  }

  function runActive() {
    var a = paletteVisible[paletteIdx];
    if (!a) return;
    closePalette();
    setTimeout(function () { a.run(); }, 120);
  }

  function openPalette() {
    if (!palette) return;
    palette.hidden = false;
    paletteInput.value = '';
    renderPalette();
    requestAnimationFrame(function () {
      palette.classList.add('is-open');
      paletteInput.focus();
    });
  }

  function closePalette() {
    if (!palette) return;
    palette.classList.remove('is-open');
    setTimeout(function () { palette.hidden = true; }, 200);
  }

  if (palette) {
    paletteInput.addEventListener('input', renderPalette);
    paletteInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveItem(paletteIdx + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveItem(paletteIdx - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); runActive(); }
    });
    palette.addEventListener('click', function (e) {
      if (e.target === palette) closePalette();
    });
  }
  if (paletteTrigger) paletteTrigger.addEventListener('click', openPalette);

  document.addEventListener('keydown', function (e) {
    var isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    var mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (palette && !palette.hidden) closePalette();
      else openPalette();
      return;
    }
    if (e.key === 'Escape' && palette && !palette.hidden) {
      closePalette();
    }
  });

  // --- konami code easter egg ---
  var konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var konamiIdx = 0;
  document.addEventListener('keydown', function (e) {
    var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === konami[konamiIdx].toLowerCase()) {
      konamiIdx++;
      if (konamiIdx === konami.length) {
        konamiIdx = 0;
        burstConfetti(window.innerWidth / 2, window.innerHeight / 2, 120);
        showToast("🎮 Konami code unlocked — you're officially a nerd.", 'success');
      }
    } else {
      konamiIdx = key === konami[0].toLowerCase() ? 1 : 0;
    }
  });
})();
