(() => {
  const accordions = document.querySelectorAll('.city-accordion');
  if (!accordions.length) return;

  const allItems = [];

  const ensureId = (el, id) => {
    if (!el.id) el.id = id;
    return el.id;
  };

  const initItem = (item, globalIndex) => {
    const trigger = item.querySelector('.city-accordion__trigger');
    const panel = item.querySelector('.city-accordion__panel');
    if (!trigger || !panel) return null;

    // Автогенерация связок aria
    const triggerId = ensureId(trigger, `city-acc-trigger-${globalIndex}`);
    const panelId = ensureId(panel, `city-acc-panel-${globalIndex}`);

    trigger.setAttribute('aria-controls', panelId);
    trigger.setAttribute('aria-expanded', 'false');
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', triggerId);

    // Унифицированное закрытое состояние
    item.classList.remove('city-accordion__item--open');
    panel.setAttribute('hidden', '');

    const setOpen = (open) => {
      item.classList.toggle('city-accordion__item--open', open);
      trigger.setAttribute('aria-expanded', String(open));
      if (open) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden', '');
    };

    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      setOpen(!isOpen);
    });

    // ----- checkbox logic (чуть аккуратнее) -----
    const checkboxes = Array.from(panel.querySelectorAll('input[type="checkbox"]'));
    // "all" ищем только по "-all-" или началу, чтобы меньше ложных совпадений
    const all = checkboxes.find((cb) => /(^all\b|[\-_]all[\-_])/.test(cb.id));
    const cities = all ? checkboxes.filter((cb) => cb !== all) : [];

    if (all) {
      const setCitiesChecked = (checked) => cities.forEach((c) => (c.checked = checked));

      panel.addEventListener('change', (e) => {
        const cb = e.target.closest('input[type="checkbox"]');
        if (!cb) return;
        if (cb === all) setCitiesChecked(all.checked);
      });
    }

    return { setOpen, trigger, panel, item };
  };

  // Собираем ВСЕ items со страницы (глобально), а не “первый в каждом аккордеоне”
  let globalIndex = 0;
  accordions.forEach((accordion) => {
    const items = accordion.querySelectorAll('.city-accordion__item');
    items.forEach((item) => {
      const api = initItem(item, globalIndex++);
      if (api) allItems.push(api);
    });
  });

  // Открываем только самый первый item на странице
  if (allItems.length) allItems[0].setOpen(true);
})();
