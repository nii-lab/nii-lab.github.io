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
  let dialog, frame, trigger;
  function prepare() {
    dialog = document.createElement('dialog');
    dialog.className = 'course-overlay';
    dialog.setAttribute('aria-labelledby','course-overlay-title');
    dialog.innerHTML = '<header class="overlay-bar"><strong id="course-overlay-title">학습자료</strong><a class="overlay-run" target="_blank" rel="noopener noreferrer" hidden>Colab 실행 ↗</a><button type="button" class="overlay-close" aria-label="자료 닫기">닫기 ×</button></header><div class="overlay-content"></div>';
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
      frame = null;
      trigger?.focus();
    });
    window.addEventListener('message', e => {
      if (!frame || e.source !== frame.contentWindow || e.origin !== location.origin) return;
      if (e.data?.type === 'course-close') dialog.close();

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
    frame.src = url.href;
    frame.title = a.dataset.courseOverlay || text('학습자료', 'Study material');
    dialog.querySelector('.overlay-content').replaceChildren(frame);
    dialog.showModal();
    document.documentElement.classList.add('course-dialog-open');
    dialog.querySelector('button').focus();
  });
})();
