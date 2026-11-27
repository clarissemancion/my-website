// Apply the saved appearance before the stylesheet paints.
(() => {
  const system = matchMedia('(prefers-color-scheme: dark)');
  const names = {light:'Light', dark:'Dark', system:'System'};
  let preference = 'system';
  try { preference = localStorage.getItem('portfolio-theme') || 'system'; } catch {}
  if (!(preference in names)) preference = 'system';

  function apply() {
    const dark = preference === 'dark' || (preference === 'system' && system.matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#202220' : '#f7f4ee');
    const trigger = document.querySelector('#theme-trigger');
    trigger?.setAttribute('title', `${names[preference]} theme`);
    trigger?.setAttribute('aria-label', `Choose colour theme, current: ${names[preference]}`);
    document.querySelectorAll('[data-current-theme]').forEach(icon => {
      icon.toggleAttribute('hidden', icon.dataset.currentTheme !== preference);
    });
    document.querySelectorAll('[data-theme-option]').forEach(button => {
      button.setAttribute('aria-checked', String(button.dataset.themeOption === preference));
    });
  }

  apply();
  system.addEventListener('change', apply);
  document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.querySelector('#theme-trigger');
    const menu = document.querySelector('#theme-menu');
    const options = [...menu.querySelectorAll('[data-theme-option]')];
    function close(returnFocus = false) {
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      if (returnFocus) trigger.focus();
    }
    function open() {
      menu.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      options.find(button => button.dataset.themeOption === preference).focus();
    }
    trigger.addEventListener('click', () => menu.hidden ? open() : close(true));
    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        open();
      }
    });
    options.forEach(button => button.addEventListener('click', () => {
      preference = button.dataset.themeOption;
      try { localStorage.setItem('portfolio-theme', preference); } catch {}
      apply();
      close(true);
    }));
    menu.addEventListener('keydown', event => {
      const index = options.indexOf(document.activeElement);
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close(true);
      } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        options[next].focus();
      }
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.theme-control')) close();
    });
    document.addEventListener('focusin', event => {
      if (!event.target.closest('.theme-control')) close();
    });
    apply();
  });
})();
