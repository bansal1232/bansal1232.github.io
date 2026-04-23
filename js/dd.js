(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var VISITED_KEY = 'dd:visited';

  // --- scroll progress bar ---
  var progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    var ticking = false;
    function updateProgress() {
      var h = document.documentElement;
      var total = h.scrollHeight - h.clientHeight;
      var pct = total > 0 ? (h.scrollTop / total) * 100 : 0;
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

  // --- reveal cards on scroll ---
  var cards = Array.from(document.querySelectorAll('.dd-card'));
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    cards.forEach(function (c, i) {
      c.style.transitionDelay = Math.min(i * 40, 260) + 'ms';
      revealObs.observe(c);
    });
  } else {
    cards.forEach(function (c) { c.classList.add('is-visible'); });
  }

  // --- visited tracker via localStorage ---
  function getVisited() {
    try {
      return JSON.parse(localStorage.getItem(VISITED_KEY) || '[]');
    } catch (e) { return []; }
  }
  function saveVisited(list) {
    try { localStorage.setItem(VISITED_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function applyVisitedState() {
    var visited = getVisited();
    cards.forEach(function (c) {
      if (visited.indexOf(c.getAttribute('href')) !== -1) {
        c.classList.add('is-visited');
      }
    });
    var visitedCount = document.getElementById('statVisited');
    if (visitedCount) {
      var n = cards.filter(function (c) { return visited.indexOf(c.getAttribute('href')) !== -1; }).length;
      visitedCount.textContent = n;
    }
  }
  applyVisitedState();

  cards.forEach(function (c) {
    c.addEventListener('click', function (e) {
      // Don't mark as visited when clicking the "copy link" button inside the card
      if (e.target.closest('[data-copy]')) return;
      var href = c.getAttribute('href');
      var list = getVisited();
      if (list.indexOf(href) === -1) {
        list.push(href);
        saveVisited(list);
        setTimeout(applyVisitedState, 80);
      }
    });
  });

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

  // --- copy-link on each card ---
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var card = btn.closest('.dd-card');
      if (!card) return;
      var href = card.getAttribute('href');
      var abs = new URL(href, window.location.href).href;
      if (!navigator.clipboard) {
        showToast('Could not copy — please copy manually');
        return;
      }
      navigator.clipboard.writeText(abs).then(function () {
        var prev = btn.textContent;
        btn.textContent = '✓ copied';
        showToast('Link copied to clipboard', 'success');
        setTimeout(function () { btn.textContent = prev; }, 1400);
      }).catch(function () {
        showToast('Could not copy — please copy manually');
      });
    });
  });

  // --- confetti ---
  var confettiColors = ['#4dfeee', '#4dd0c5', '#6ee0d5', '#ffd166', '#ef476f', '#06d6a0', '#118ab2'];
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

  // --- search + category filter ---
  var searchInput = document.getElementById('ddSearch');
  var chips = document.querySelectorAll('#ddChips .dd-chip');
  var grid = document.getElementById('ddGrid');
  var statShown = document.getElementById('statShown');
  var statTotal = document.getElementById('statTotal');
  var statTopics = document.getElementById('statTopics');
  var activeTag = 'all';
  var emptyEl = null;

  if (statTotal) statTotal.textContent = cards.length;
  if (statTopics) {
    var topics = new Set();
    cards.forEach(function (c) {
      (c.getAttribute('data-tags') || '').split(/\s+/).forEach(function (t) { if (t) topics.add(t); });
    });
    statTopics.textContent = topics.size;
  }

  function applyFilter() {
    var q = (searchInput ? searchInput.value.trim().toLowerCase() : '');
    var shown = 0;
    cards.forEach(function (c) {
      var tags = (c.getAttribute('data-tags') || '').toLowerCase();
      var text = c.textContent.toLowerCase();
      var tagMatch = activeTag === 'all' || tags.indexOf(activeTag) !== -1;
      var searchMatch = !q || text.indexOf(q) !== -1 || tags.indexOf(q) !== -1;
      var match = tagMatch && searchMatch;
      c.classList.toggle('is-hidden', !match);
      if (match) shown++;
    });
    if (statShown) statShown.textContent = shown;
    if (!shown) {
      if (!emptyEl) {
        emptyEl = document.createElement('div');
        emptyEl.className = 'dd-empty';
        grid.appendChild(emptyEl);
      }
      emptyEl.innerHTML = 'No articles match <b>“' + (q || activeTag) + '”</b> — try a different search or <button class="dd-chip" id="ddReset" style="margin-left:6px">clear filters</button>';
      var reset = document.getElementById('ddReset');
      if (reset) reset.addEventListener('click', function () {
        searchInput.value = '';
        setActiveChip('all');
        applyFilter();
      });
    } else if (emptyEl) {
      emptyEl.remove();
      emptyEl = null;
    }
  }

  function setActiveChip(tag) {
    activeTag = tag;
    chips.forEach(function (c) { c.classList.toggle('is-active', c.getAttribute('data-tag') === tag); });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      setActiveChip(chip.getAttribute('data-tag'));
      applyFilter();
    });
  });
  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { searchInput.value = ''; applyFilter(); searchInput.blur(); }
    });
  }

  // --- "/" to focus search ---
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== searchInput) {
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      if (searchInput) searchInput.focus();
    }
  });

  // --- scroll-to-top ---
  var scrollTop = document.getElementById('scrollTop');
  if (scrollTop) {
    window.addEventListener('scroll', function () {
      scrollTop.classList.toggle('is-visible', window.scrollY > 600);
    }, { passive: true });
    scrollTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  // --- command palette ---
  var palette = document.getElementById('cmdPalette');
  var paletteInput = document.getElementById('cmdPaletteInput');
  var paletteList = document.getElementById('cmdPaletteList');
  var paletteTrigger = document.getElementById('cmdPaletteTrigger');

  var articleActions = cards.map(function (c) {
    var title = c.querySelector('.dd-card-title');
    var tag = c.querySelector('.dd-tag');
    var tagsAttr = c.getAttribute('data-tags') || '';
    return {
      icon: '📖',
      label: title ? title.textContent.trim() : 'Article',
      hint: tag ? tag.textContent.trim() : 'Article',
      keys: tagsAttr + ' ' + (title ? title.textContent.toLowerCase() : ''),
      run: function () { window.open(c.getAttribute('href'), '_blank'); }
    };
  });

  var paletteActions = articleActions.concat([
    { icon: '🏠', label: 'Back to home', hint: 'Navigate', keys: 'home back resume portfolio', run: function () { window.location.href = 'index.html'; } },
    { icon: '🔍', label: 'Focus search', hint: 'Action', keys: 'search find filter', run: function () { if (searchInput) searchInput.focus(); } },
    { icon: '🏷️', label: 'Filter: Java only', hint: 'Filter', keys: 'java filter', run: function () { setActiveChip('java'); applyFilter(); } },
    { icon: '🏷️', label: 'Filter: Kafka only', hint: 'Filter', keys: 'kafka filter', run: function () { setActiveChip('kafka'); applyFilter(); } },
    { icon: '🏷️', label: 'Filter: LLD only', hint: 'Filter', keys: 'lld low-level-design filter', run: function () { setActiveChip('lld'); applyFilter(); } },
    { icon: '🏷️', label: 'Filter: Docker only', hint: 'Filter', keys: 'docker filter', run: function () { setActiveChip('docker'); applyFilter(); } },
    { icon: '🏷️', label: 'Filter: Networking only', hint: 'Filter', keys: 'networking filter', run: function () { setActiveChip('networking'); applyFilter(); } },
    { icon: '✖️', label: 'Clear filters', hint: 'Action', keys: 'reset clear all filter', run: function () { setActiveChip('all'); if (searchInput) searchInput.value = ''; applyFilter(); } },
    { icon: '🗑️', label: 'Reset "visited" marks', hint: 'Action', keys: 'reset visited clear localstorage', run: function () { saveVisited([]); cards.forEach(function (c) { c.classList.remove('is-visited'); }); var sv = document.getElementById('statVisited'); if (sv) sv.textContent = '0'; showToast('Visited history cleared', 'success'); } },
    { icon: '⬆️', label: 'Scroll to top', hint: 'Action', keys: 'top up scroll home', run: function () { window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }); } },
    { icon: '🎉', label: 'Launch confetti', hint: 'Fun', keys: 'confetti celebrate party fun', run: function () { burstConfetti(window.innerWidth / 2, window.innerHeight / 2, 80); } },
    { icon: '🔗', label: 'Copy page URL', hint: 'Action', keys: 'copy url share link', run: function () { if (!navigator.clipboard) return; navigator.clipboard.writeText(window.location.href).then(function () { showToast('Page URL copied', 'success'); }); } }
  ]);

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
      empty.textContent = 'No matches. Try "java", "kafka", "home"…';
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
        showToast("🎮 Konami code unlocked — enjoy the reading.", 'success');
      }
    } else {
      konamiIdx = key === konami[0].toLowerCase() ? 1 : 0;
    }
  });
})();
