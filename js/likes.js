// Anonymous per-page like counter.
//
// Backend: counterapi.dev v1 (https://counterapi.dev) — free, public, no auth.
// Each page gets its own counter keyed off URL pathname; namespaces and counters
// auto-create on first /up call. v1 is marked legacy by counterapi.dev but is
// the only tier that supports client-side counter auto-creation, which is what
// the per-page pattern needs (we'd otherwise need to register every page in a
// dashboard). v2 requires pre-created counters and a private workspaces require
// an API token — neither fits a public static site.
//
// Usage on a page:
//   <link rel="stylesheet" href="../../../css/likes.css"/>
//   <script src="../../../js/likes.js" defer></script>
//   <div id="likes"></div>

(function () {
  var NAMESPACE = 'bansal1232-blog';
  var BASE = 'https://api.counterapi.dev/v1/' + NAMESPACE + '/';

  function keyFor(path) {
    return (path.replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9_-]+/g, '_') || 'home').toLowerCase();
  }

  function readCount(key) {
    return fetch(BASE + key + '/').then(function (r) { return r.json(); });
  }
  function bumpCount(key) {
    return fetch(BASE + key + '/up').then(function (r) { return r.json(); });
  }
  function pluck(json) {
    if (!json) return 0;
    // v1 shape: { id, name, count, ... }
    if (typeof json.count === 'number') return json.count;
    return 0;
  }

  function bootLikes() {
    var mount = document.getElementById('likes');
    if (!mount) return;

    var key = keyFor(location.pathname);
    var localKey = 'liked:' + key;
    var alreadyLiked = localStorage.getItem(localKey) === '1';

    mount.innerHTML =
      '<button class="like-btn' + (alreadyLiked ? ' liked' : '') + '" type="button" aria-label="Like this page">' +
        '<span class="like-heart">' + (alreadyLiked ? '♥' : '♡') + '</span>' +
        '<span class="like-count">' + '…' + '</span>' +
        '<span class="like-label">' + (alreadyLiked ? 'Liked' : 'Like') + '</span>' +
      '</button>';

    var btn   = mount.querySelector('.like-btn');
    var heart = mount.querySelector('.like-heart');
    var count = mount.querySelector('.like-count');
    var label = mount.querySelector('.like-label');

    readCount(key).then(function (j) {
      count.textContent = pluck(j);
    }).catch(function () {
      count.textContent = '—';
    });

    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      if (alreadyLiked) return;
      btn.disabled = true;
      bumpCount(key).then(function (j) {
        count.textContent = pluck(j);
        heart.textContent = '♥';
        label.textContent = 'Liked';
        btn.classList.add('liked');
        localStorage.setItem(localKey, '1');
        alreadyLiked = true;
      }).catch(function () {
        // network failed; let the user retry
      }).then(function () {
        btn.disabled = false;
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootLikes);
  } else {
    bootLikes();
  }
})();
