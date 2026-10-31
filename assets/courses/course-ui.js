(() => {
  const languagePicker = document.querySelector('[data-lab-language]');
  if (languagePicker) {
    const selectLanguage = value => {
      document.documentElement.dataset.selectedRuntime = value;
      languagePicker.querySelectorAll('input').forEach(input => { input.checked = input.value === value; });
    };
    const initialRuntime = new URLSearchParams(location.search).get('runtime');
    selectLanguage(initialRuntime === 'matlab' ? 'matlab' : 'python');
    languagePicker.addEventListener('change', event => {
      if (!event.target.matches('input[name="lab-language"]')) return;
      selectLanguage(event.target.value);
      const url = new URL(location.href);
      url.searchParams.set('runtime', event.target.value);
      history.replaceState(null, '', url.pathname + url.search + url.hash);
      window.dispatchEvent(new Event('course-runtime-change'));
    });
  }
  const embedded = new URLSearchParams(location.search).get('embedded') === '1';
  if (embedded) {
    document.documentElement.classList.add('course-embedded');
    parent.postMessage({type:'course-ready'}, location.origin === 'null' ? '*' : location.origin);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') parent.postMessage({type:'course-close'}, location.origin === 'null' ? '*' : location.origin);
    });
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (a && new URL(a.href).origin !== location.origin) {
        a.target = '_blank'; a.rel = 'noopener noreferrer';
      }
    });
    return;
  }
  const english = document.documentElement.lang.toLowerCase().startsWith('en');
  const text = (ko, en) => english ? en : ko;
  let dialog, frame, trigger, loadingTimer;
  function markReady() {
    if (!dialog?.open || !frame) return;
    clearTimeout(loadingTimer); dialog.dataset.previewState = 'ready';
    dialog.querySelector('.overlay-status').hidden = true;
    dialog.querySelector('.overlay-content').removeAttribute('aria-busy');
  }
  function prepare() {
    dialog = document.createElement('dialog');
    dialog.className = 'course-overlay';
    dialog.setAttribute('aria-labelledby','course-overlay-title');
    dialog.innerHTML = '<header class="overlay-bar"><strong id="course-overlay-title">학습자료</strong><a class="overlay-run" target="_blank" rel="noopener noreferrer" hidden>Colab 실행 ↗</a><button type="button" class="overlay-close" aria-label="자료 닫기">닫기 ×</button></header><p class="overlay-status" role="status" hidden></p><div class="overlay-content"></div>';
    dialog.querySelector('#course-overlay-title').textContent = text('학습자료', 'Study material');
    const close = dialog.querySelector('.overlay-close');
    close.textContent = text('닫기 ×', 'Close ×');
    close.setAttribute('aria-label', text('자료 닫기', 'Close material'));
    document.body.append(dialog);
    dialog.querySelector('button').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => {
      const r = dialog.getBoundingClientRect();
      if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('course-dialog-open');
      dialog.querySelector('.overlay-content').replaceChildren();
      clearTimeout(loadingTimer);
      dialog.querySelector('.overlay-status').hidden = true;
      frame = null;
      trigger?.focus();
    });
    window.addEventListener('message', e => {
      if (!frame || e.source !== frame.contentWindow || e.origin !== location.origin) return;
      if (e.data?.type === 'course-close') dialog.close();
      if (e.data?.type === 'course-ready') markReady();

    });
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-course-overlay]');
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !window.HTMLDialogElement) return;
    const url = new URL(a.href);
    if (url.origin !== location.origin) return;
    e.preventDefault();
    if (!dialog) prepare();
    trigger = a;
    const run = dialog.querySelector('.overlay-run');
    const runUrl = a.dataset.colabUrl || a.dataset.matlabUrl;
    run.hidden = !runUrl;
    run.textContent = a.dataset.matlabUrl ? text('MATLAB 실행 ↗', 'Run in MATLAB ↗') : text('Colab 실행 ↗', 'Run in Colab ↗');
    if (runUrl) run.href = runUrl; else run.removeAttribute('href');
    dialog.querySelector('#course-overlay-title').textContent = a.dataset.courseOverlay || text('학습자료', 'Study material');
    url.searchParams.set('embedded','1');
    if (a.dataset.documentVersion) url.searchParams.set('v',a.dataset.documentVersion);
    frame = document.createElement('iframe');
    const activeFrame = frame;
    const status = dialog.querySelector('.overlay-status');
    const content = dialog.querySelector('.overlay-content');
    status.hidden = false; status.textContent = text('자료를 불러오는 중…', 'Loading material…');
    content.setAttribute('aria-busy','true'); dialog.dataset.previewState = 'loading';
    const recover = (kind = 'error') => {
      if (frame !== activeFrame || !dialog.open) return;
      clearTimeout(loadingTimer); content.removeAttribute('aria-busy');
      status.hidden = false;
      dialog.dataset.previewState = kind === 'slow' ? 'delayed' : 'error';
      status.textContent = kind === 'slow' ? text('자료를 불러오는 데 시간이 걸리고 있습니다.', 'The material is taking longer to load.') : text('미리보기를 불러오지 못했습니다.', 'The preview could not be loaded.');
      const fallback = document.createElement('a');
      fallback.className = 'overlay-recovery'; fallback.href = a.href;
      fallback.target = '_blank'; fallback.rel = 'noopener noreferrer';
      fallback.textContent = text('새 탭에서 열기 ↗', 'Open in a new tab ↗'); status.append(fallback);
    };
    frame.addEventListener('load', () => {
      if (frame !== activeFrame) return;
      try {
        const page = frame.contentDocument;
        if (!page) return; // Opaque file origins may render successfully; await child readiness.
        if (!page.querySelector('main') || /^404\b/.test(page.title)) { recover(); return; }
        markReady();
      } catch (_) { /* Verification is unavailable, not proof of a load failure. */ }
    });
    frame.addEventListener('error',() => recover('error'));
    loadingTimer = setTimeout(() => recover('slow'),10000);
    frame.src = url.href;
    frame.title = a.dataset.courseOverlay || text('학습자료', 'Study material');
    dialog.querySelector('.overlay-content').replaceChildren(frame);
    dialog.showModal();
    document.documentElement.classList.add('course-dialog-open');
    dialog.querySelector('button').focus();
  });
})();
