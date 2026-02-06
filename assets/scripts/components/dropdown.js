/**
 * Dropdown (BEM) — чистый JS
 * Требования к разметке:
 *  - .dropdown[data-dropdown]
 *  - .dropdown__control
 *  - .dropdown__menu
 *  - .dropdown__list (role="listbox")
 *  - .dropdown__option (data-value)
 *  - [data-dropdown-value] (куда выводим выбранный текст)
 *  - .dropdown__input (hidden, опционально)
 */

(function () {
  const DROPDOWN_SELECTOR = '[data-dropdown]';

  function getEls(root) {
    const control = root.querySelector('.dropdown__control');
    const menu = root.querySelector('.dropdown__menu');
    const list = root.querySelector('.dropdown__list');
    const options = Array.from(root.querySelectorAll('.dropdown__option'));
    const valueEl = root.querySelector('[data-dropdown-value]');
    const input = root.querySelector('.dropdown__input');

    return { control, menu, list, options, valueEl, input };
  }

  function isDisabled(root) {
    return root.classList.contains('dropdown--disabled');
  }

  function isOpen(root) {
    return root.classList.contains('dropdown--open');
  }

  function setAriaExpanded(control, expanded) {
    control.setAttribute('aria-expanded', String(expanded));
  }

  function openDropdown(root) {
    if (isDisabled(root) || isOpen(root)) return;

    const { control, menu, list, options } = getEls(root);

    root.classList.add('dropdown--open');
    menu.hidden = false;
    setAriaExpanded(control, true);

    // Фокус: на выбранный элемент, либо на первый
    const selected = root.querySelector('.dropdown__option--selected');
    const target = selected || options[0];
    if (target) {
      options.forEach((o) => o.setAttribute('tabindex', '-1'));
      target.setAttribute('tabindex', '0');
      target.focus();
    }

    // закрыть остальные (если несколько дропдаунов на странице)
    closeOtherDropdowns(root);
  }

  function closeDropdown(root) {
    if (!isOpen(root)) return;

    const { control, menu } = getEls(root);

    root.classList.remove('dropdown--open');
    menu.hidden = true;
    setAriaExpanded(control, false);
  }

  function toggleDropdown(root) {
    if (isOpen(root)) closeDropdown(root);
    else openDropdown(root);
  }

  function closeOtherDropdowns(current) {
    document.querySelectorAll(DROPDOWN_SELECTOR).forEach((dd) => {
      if (dd !== current) closeDropdown(dd);
    });
  }

  function setSelected(root, optionEl, { close = true, focusControl = true } = {}) {
    const { options, valueEl, input, control } = getEls(root);
    if (!optionEl) return;

    // Снять прошлый selected
    options.forEach((opt) => {
      opt.classList.remove('dropdown__option--selected');
      opt.setAttribute('aria-selected', 'false');
      opt.setAttribute('tabindex', '-1');
    });

    // Поставить новый
    optionEl.classList.add('dropdown__option--selected');
    optionEl.setAttribute('aria-selected', 'true');
    optionEl.setAttribute('tabindex', '0');

    const text = optionEl.textContent.trim();
    const value = optionEl.getAttribute('data-value') ?? text;

    if (valueEl) valueEl.textContent = text;
    if (input) input.value = value;

    // Событие для интеграции
    root.dispatchEvent(
      new CustomEvent('dropdown:change', {
        bubbles: true,
        detail: { value, text, option: optionEl }
      })
    );

    if (close) closeDropdown(root);
    if (focusControl && control) control.focus();
  }

  function moveFocus(root, direction) {
    const { options } = getEls(root);
    if (!options.length) return;

    const currentIndex = options.findIndex((o) => o.getAttribute('tabindex') === '0');
    const start = currentIndex >= 0 ? currentIndex : 0;

    let nextIndex = start + direction;
    if (nextIndex < 0) nextIndex = options.length - 1;
    if (nextIndex >= options.length) nextIndex = 0;

    options.forEach((o) => o.setAttribute('tabindex', '-1'));
    const next = options[nextIndex];
    next.setAttribute('tabindex', '0');
    next.focus();
  }

  function onControlClick(e) {
    const root = e.currentTarget.closest(DROPDOWN_SELECTOR);
    if (!root || isDisabled(root)) return;
    toggleDropdown(root);
  }

  function onOptionClick(e) {
    const option = e.target.closest('.dropdown__option');
    if (!option) return;

    const root = option.closest(DROPDOWN_SELECTOR);
    if (!root || isDisabled(root)) return;

    setSelected(root, option, { close: true, focusControl: true });
  }

  function onDocumentClick(e) {
    const clickedDropdown = e.target.closest(DROPDOWN_SELECTOR);
    if (!clickedDropdown) {
      // клик вне — закрыть все
      document.querySelectorAll(DROPDOWN_SELECTOR).forEach(closeDropdown);
      return;
    }
    // если кликнули внутри — ничего
  }

  function onKeyDown(e) {
    const root = e.target.closest(DROPDOWN_SELECTOR);
    if (!root || isDisabled(root)) return;

    const { control } = getEls(root);

    // если фокус на control и жмём клавиши открытия
    const isOnControl = e.target === control;

    if (e.key === 'Escape') {
      closeDropdown(root);
      if (control) control.focus();
      return;
    }

    if (isOnControl) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        openDropdown(root);
      }
      return;
    }

    // если фокус в списке/опциях
    if (!isOpen(root)) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveFocus(root, +1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveFocus(root, -1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      const { options } = getEls(root);
      if (options.length) {
        options.forEach((o) => o.setAttribute('tabindex', '-1'));
        options[0].setAttribute('tabindex', '0');
        options[0].focus();
      }
    } else if (e.key === 'End') {
      e.preventDefault();
      const { options } = getEls(root);
      if (options.length) {
        options.forEach((o) => o.setAttribute('tabindex', '-1'));
        const last = options[options.length - 1];
        last.setAttribute('tabindex', '0');
        last.focus();
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const focusedOption = root.querySelector('.dropdown__option[tabindex="0"]');
      if (focusedOption) setSelected(root, focusedOption, { close: true, focusControl: true });
    } else if (e.key === 'Tab') {
      // табом уходим — закрываем
      closeDropdown(root);
    }
  }

  function initDropdown(root) {
    const { control, menu, options } = getEls(root);
    if (!control || !menu) return;

    // начальная aria-настройка
    if (!control.hasAttribute('aria-expanded')) setAriaExpanded(control, false);

    // если уже есть выбранный — выставим tabindex корректно
    const selected = root.querySelector('.dropdown__option--selected');
    options.forEach((o) => o.setAttribute('tabindex', '-1'));
    (selected || options[0])?.setAttribute('tabindex', '0');

    control.addEventListener('click', onControlClick);

    // Клики по пунктам — делегируем на root
    root.addEventListener('click', (e) => {
      if (e.target.closest('.dropdown__option')) onOptionClick(e);
    });
  }

  // init all
  document.querySelectorAll(DROPDOWN_SELECTOR).forEach(initDropdown);

  // global listeners
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onKeyDown);
})();
