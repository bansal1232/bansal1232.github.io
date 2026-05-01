(() => {
  const editor = document.getElementById('editor');
  const form = document.getElementById('draftForm');
  const status = document.getElementById('status');
  const restoredBanner = document.getElementById('restoredBanner');
  const clearBtn = document.getElementById('clearBtn');
  const STORAGE_KEY = 'draft';
  const DEBOUNCE_MS = 300;

  const setStatus = (text, tone) => {
    status.textContent = text;
    status.dataset.tone = tone;
  };

  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    editor.value = saved;
    restoredBanner.hidden = false;
    setStatus(`Restored ${saved.length} chars from last session`, 'info');
  } else {
    setStatus('Empty draft', 'idle');
  }

  let t;
  editor.addEventListener('input', () => {
    setStatus('Typing…', 'pending');
    clearTimeout(t);
    t = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, editor.value);
      const stamp = new Date().toLocaleTimeString();
      setStatus(`Saved at ${stamp} (${editor.value.length} chars)`, 'ok');
    }, DEBOUNCE_MS);
  });


  form.addEventListener('submit', (e) => {
    e.preventDefault();
    localStorage.removeItem(STORAGE_KEY);
    editor.value = '';
    restoredBanner.hidden = true;
    setStatus('Submitted — draft cleared', 'ok');
  });

  clearBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    editor.value = '';
    restoredBanner.hidden = true;
    console.error();
    setStatus('Draft cleared manually', 'idle');
  });
})();
