(() => {
  const item = document.querySelector('#city-accordion-trigger-krasnodar-krai')?.closest('.city-accordion__item');
  if (!item) return;

  const trigger = item.querySelector('.city-accordion__trigger');
  const panel = item.querySelector('.city-accordion__panel');
  if (!trigger || !panel) return;

  // -------- accordion (только для этой группы) --------
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

  // -------- checkbox logic (только для этой группы) --------
  const checkboxes = Array.from(panel.querySelectorAll('.city-accordion__checkbox'));
  const all = checkboxes.find((cb) => cb.value === 'all');
  const cities = checkboxes.filter((cb) => cb !== all);

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
})();
