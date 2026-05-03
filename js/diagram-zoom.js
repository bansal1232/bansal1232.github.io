/* ──────────────────────────────────────────────────────────
   Diagram zoom — shared across all HLD/LLD pages with Mermaid.
   Loaded via:  <script src="/js/diagram-zoom.js" defer></script>
   Pairs with:  /css/diagram-zoom.css

   Behavior
   ────────
   • Hover any .diagram-box → "click to zoom" badge appears
   • Click → opens the SVG fullscreen at 1.6× by default
   • Mouse wheel zooms in/out  (range 0.4× – 6×)
   • Click + drag pans
   • Toolbar:  −  ⟲  +  ✕   (top-right)
   • Keyboard: + / − / 0  zoom · Esc closes
   • Click backdrop closes
   ────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  if (window.__diagramZoomLoaded) return;
  window.__diagramZoomLoaded = true;

  var MIN = 0.4, MAX = 6, INITIAL = 1.6;
  var scale = INITIAL;
  var modal, stage;

  // ── Inject modal markup once ──────────────────────────────
  function injectModal() {
    if (document.getElementById('zoomModal')) {
      modal = document.getElementById('zoomModal');
      stage = document.getElementById('zoomStage');
      return;
    }
    modal = document.createElement('div');
    modal.id = 'zoomModal';
    modal.className = 'zoom-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Diagram zoom view');
    modal.innerHTML =
      '<div class="zoom-hint">Scroll to zoom · drag to pan · ' +
        '<kbd>+</kbd> <kbd>−</kbd> <kbd>0</kbd> · <kbd>Esc</kbd> to close</div>' +
      '<div class="zoom-controls">' +
        '<button class="zoom-btn" data-zoom="out"   aria-label="Zoom out"   title="Zoom out (−)">−</button>' +
        '<button class="zoom-btn" data-zoom="reset" aria-label="Reset zoom" title="Reset (0)">⟲</button>' +
        '<button class="zoom-btn" data-zoom="in"    aria-label="Zoom in"    title="Zoom in (+)">+</button>' +
        '<button class="zoom-btn" data-zoom="close" aria-label="Close"      title="Close (Esc)">✕</button>' +
      '</div>' +
      '<div class="zoom-stage" id="zoomStage"></div>';
    document.body.appendChild(modal);
    stage = modal.querySelector('#zoomStage');
    wireModal();
  }

  function captureBase(svg) {
    if (svg.dataset.baseW) return;
    var vb = svg.getAttribute('viewBox');
    if (vb) {
      var p = vb.trim().split(/\s+/);
      svg.dataset.baseW = p[2];
      svg.dataset.baseH = p[3];
    } else {
      var r = svg.getBoundingClientRect();
      svg.dataset.baseW = r.width || 800;
      svg.dataset.baseH = r.height || 600;
    }
  }

  function applyScale() {
    var svg = stage.querySelector('svg');
    if (!svg) return;
    captureBase(svg);
    svg.style.width  = (parseFloat(svg.dataset.baseW) * scale) + 'px';
    svg.style.height = (parseFloat(svg.dataset.baseH) * scale) + 'px';
  }

  function openModal(svgEl) {
    stage.innerHTML = '';
    var clone = svgEl.cloneNode(true);
    clone.removeAttribute('style');
    stage.appendChild(clone);
    scale = INITIAL;
    requestAnimationFrame(applyScale);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    stage.innerHTML = '';
    document.body.style.overflow = '';
  }

  // ── Wire diagram-box click handlers (idempotent) ──────────
  function wireDiagrams() {
    var boxes = document.querySelectorAll('.diagram-box');
    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i];
      if (box.dataset.zoomWired) continue;
      box.dataset.zoomWired = '1';
      box.addEventListener('click', (function (b) {
        return function () {
          var svg = b.querySelector('svg');
          if (svg) openModal(svg);
        };
      })(box));
    }
  }

  // ── Wire modal interactions (once) ────────────────────────
  function wireModal() {
    // toolbar + backdrop
    modal.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-zoom]');
      if (!btn) {
        if (e.target === modal) closeModal();
        return;
      }
      var a = btn.dataset.zoom;
      if      (a === 'in')    scale = Math.min(scale * 1.25, MAX);
      else if (a === 'out')   scale = Math.max(scale / 1.25, MIN);
      else if (a === 'reset') scale = INITIAL;
      else if (a === 'close') return closeModal();
      applyScale();
    });

    // wheel zoom
    stage.addEventListener('wheel', function (e) {
      if (!modal.classList.contains('open')) return;
      e.preventDefault();
      scale = e.deltaY < 0
        ? Math.min(scale * 1.12, MAX)
        : Math.max(scale / 1.12, MIN);
      applyScale();
    }, { passive: false });

    // drag-to-pan
    var dragging = false, sx = 0, sy = 0, sl = 0, st = 0;
    stage.addEventListener('mousedown', function (e) {
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      sl = stage.scrollLeft; st = stage.scrollTop;
      stage.classList.add('grabbing');
    });
    window.addEventListener('mouseup', function () {
      dragging = false;
      stage.classList.remove('grabbing');
    });
    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      stage.scrollLeft = sl - (e.clientX - sx);
      stage.scrollTop  = st - (e.clientY - sy);
    });

    // keyboard
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape')                     return closeModal();
      if (e.key === '+' || e.key === '=') { scale = Math.min(scale * 1.25, MAX); applyScale(); }
      if (e.key === '-' || e.key === '_') { scale = Math.max(scale / 1.25, MIN); applyScale(); }
      if (e.key === '0')                  { scale = INITIAL;                     applyScale(); }
    });
  }

  // ── Boot ──────────────────────────────────────────────────
  function boot() {
    injectModal();
    wireDiagrams();
    // Mermaid renders async — re-scan a few times.
    [300, 800, 2000].forEach(function (t) { setTimeout(wireDiagrams, t); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
