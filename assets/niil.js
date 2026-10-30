document.documentElement.classList.add('js');
const korean = document.documentElement.lang === 'ko';
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
});
// Explicit URLs keep shared links predictable in either language.
const params = new URLSearchParams(location.search);
function refreshLanguageLinks() {
  document.querySelectorAll('[data-language]').forEach(link => {
    const current = new URL(location.href);
    const url = new URL(window.NiiLRoutes.localized(current.href, link.dataset.language), location.origin);
    url.searchParams.delete('v');
    url.searchParams.delete('lang');
    link.href = url.pathname + url.search + url.hash;
  });
}
function bindFilters(config) {
  const search = document.querySelector(config.search);
  if (!search) return;
  const controls = [[search, 'q'], ...config.controls.map(([selector, key]) => [document.querySelector(selector), key])];
  controls.forEach(([control, key]) => {
    const value = params.get(key);
    if (value !== null && (control.tagName !== 'SELECT' || [...control.options].some(o => o.value === value))) control.value = value;
  });
  const items = [...document.querySelectorAll(config.items)];
  const apply = (persist = false) => {
    const term = search.value.trim().toLocaleLowerCase();
    let count = 0;
    items.forEach(item => {
      const visible = (item.dataset.search || item.textContent).toLocaleLowerCase().includes(term) && config.controls.every(([selector, key, attribute]) => {
        const value = document.querySelector(selector).value;
        return !value || item.dataset[attribute] === value;
      });
      item.hidden = !visible;
      if (visible) count++;
    });
    document.querySelector(config.count).textContent = korean ? `${count}${config.koUnit}` : `${count} ${config.enUnit}${count === 1 ? '' : 's'}`;
    document.querySelector(config.empty).hidden = count !== 0;
    if (persist) {
      controls.forEach(([control, key]) => control.value ? params.set(key, control.value) : params.delete(key));
      const query = params.toString();
      history.replaceState(null, '', location.pathname + (query ? '?' + query : '') + location.hash);
    }
    refreshLanguageLinks();
  };
  controls.forEach(([control]) => control.addEventListener(control === search ? 'input' : 'change', () => apply(true)));
  apply();
}
bindFilters({search:'#project-search',controls:[['#project-topic','topic','topic'],['#project-status','status','status']],items:'[data-project]',count:'#project-count',empty:'#no-projects',koUnit:'개 과제',enUnit:'project'});
bindFilters({search:'#publication-search',controls:[['#publication-year','year','year'],['#publication-type','type','type']],items:'[data-publication]',count:'#publication-count',empty:'#publication-empty',koUnit:'편',enUnit:'publication'});
refreshLanguageLinks();
window.addEventListener('hashchange', refreshLanguageLinks);
window.addEventListener('course-runtime-change', refreshLanguageLinks);
const toc = document.querySelector('.toc');
if (toc) document.querySelectorAll('.prose h2, .prose h3').forEach((heading, index) => {
  if (heading.closest('details')) return;
  if (!heading.id) heading.id = `section-${index + 1}`;
  const anchor = document.createElement('a');
  anchor.href = `#${heading.id}`;
  anchor.textContent = heading.textContent;
  toc.append(anchor);
});
