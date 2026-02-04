(() => {
  const OPEN_FIRST_IN_FILTER_GROUP = false;

  const accordions = document.querySelectorAll('.city-accordion');
  if (!accordions.length) return;

  accordions.forEach((accordion) => {
    const items = accordion.querySelectorAll('.city-accordion__item');
    if (!items.length) return;

    const itemControllers = [];

    items.forEach((item) => {
      const trigger = item.querySelector('.city-accordion__trigger');
      const panel = item.querySelector('.city-accordion__panel');
      if (!trigger || !panel) return;

      // -------- accordion --------
      const setOpen = (open) => {
        item.classList.toggle('city-accordion__item--open', open);
        trigger.setAttribute('aria-expanded', String(open));

        if (open) panel.removeAttribute('hidden');
        else panel.setAttribute('hidden', '');
      };

      // init from markup
      setOpen(trigger.getAttribute('aria-expanded') === 'true');

      trigger.addEventListener('click', () => {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        setOpen(!isOpen);
      });

      // -------- checkbox logic --------
      const checkboxes = Array.from(panel.querySelectorAll('.city-accordion__checkbox'));
      const all = checkboxes.find((cb) => cb.value === 'all');
      const cities = checkboxes.filter((cb) => cb !== all);

      itemControllers.push({ setOpen, trigger, panel });

      if (!all) return;

      const setCitiesChecked = (checked) => {
        cities.forEach((c) => (c.checked = checked));
      };

      panel.addEventListener('change', (e) => {
        const cb = e.target.closest('.city-accordion__checkbox');
        if (!cb) return;

        // Важно: "Все" меняет города, города "Все" НЕ трогают
        if (cb === all) {
          setCitiesChecked(all.checked);
        }
      });
    });

    if (!itemControllers.length) return;

    const isInFilterGroup = Boolean(accordion.closest('.filter-group'));
    if (isInFilterGroup) {
      if (OPEN_FIRST_IN_FILTER_GROUP) {
        itemControllers.forEach((ctrl, index) => {
          ctrl.setOpen(index === 0);
        });
      } else {
        itemControllers.forEach((ctrl) => ctrl.setOpen(false));
      }
    }
  });
})();
