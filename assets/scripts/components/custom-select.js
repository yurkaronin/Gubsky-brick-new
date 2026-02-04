(() => {
  const SELECTOR_ROOT = "[data-custom-select]";
  const SELECTOR_CONTROL = "[data-custom-select-control]";
  const SELECTOR_LABEL = "[data-custom-select-label]";
  const SELECTOR_DROPDOWN = "[data-custom-select-dropdown]";
  const SELECTOR_LIST = "[data-custom-select-list]";
  const SELECTOR_OPTION = "[data-custom-select-option]";
  const SELECTOR_INPUT = "[data-custom-select-input]";

  const GAP = 10;                // должен соответствовать --cs-dropdown-gap
  const VIEWPORT_PADDING = 12;   // отступ от краёв окна

  function closeAll(exceptRoot = null) {
    document.querySelectorAll(SELECTOR_ROOT + ".is-open").forEach((root) => {
      if (exceptRoot && root === exceptRoot) return;
      setOpen(root, false);
    });
  }

  function setOpen(root, open) {
    const control = root.querySelector(SELECTOR_CONTROL);
    const dropdown = root.querySelector(SELECTOR_DROPDOWN);
    const list = root.querySelector(SELECTOR_LIST);

    root.classList.toggle("is-open", open);
    control?.setAttribute("aria-expanded", String(open));

    if (open) {
      // автопозиционирование (вверх/вниз)
      applyAutoPosition(root);

      // каскадная задержка для опций (визуально приятнее)
      applyOptionDelays(root);

      // фокус для клавиатуры
      dropdown?.focus({ preventScroll: true });

      // скроллим до выбранного
      const selected = root.querySelector(`${SELECTOR_OPTION}.is-selected`);
      if (selected && list) selected.scrollIntoView({ block: "nearest" });

      // при ресайзе/скролле пересчитываем позицию
      attachRepositionHandlers(root);
    } else {
      root.classList.remove("is-top");
      detachRepositionHandlers(root);
    }
  }

  function getOptions(root) {
    return Array.from(root.querySelectorAll(SELECTOR_OPTION));
  }

  function setSelected(root, optionEl) {
    const options = getOptions(root);
    options.forEach((el) => el.classList.remove("is-selected"));
    optionEl.classList.add("is-selected");

    const label = root.querySelector(SELECTOR_LABEL);
    const input = root.querySelector(SELECTOR_INPUT);

    const text = optionEl.textContent?.trim() ?? "";
    const value = optionEl.getAttribute("data-value") ?? "";

    if (label) label.textContent = text;
    if (input) input.value = value;

    root.dispatchEvent(new CustomEvent("custom-select:change", {
      bubbles: true,
      detail: { value, label: text }
    }));
  }

  function getSelectedIndex(root) {
    const options = getOptions(root);
    const selected = root.querySelector(`${SELECTOR_OPTION}.is-selected`);
    const idx = selected ? options.indexOf(selected) : 0;
    return Math.max(0, idx);
  }

  function focusOption(root, idx) {
    const options = getOptions(root);
    const list = root.querySelector(SELECTOR_LIST);

    const clamped = Math.min(Math.max(idx, 0), options.length - 1);
    const opt = options[clamped];
    if (!opt) return;

    opt.focus({ preventScroll: true });
    if (list) opt.scrollIntoView({ block: "nearest" });

    // синхронизируем "выбранное" с навигацией стрелками:
    // можно не менять выбранное до Enter, но UX чаще приятнее так:
    // (если не нужно — убери следующую строку)
    // setSelected(root, opt);
  }

  // --- Автопозиционирование (flip) ---
  function applyAutoPosition(root) {
    const control = root.querySelector(SELECTOR_CONTROL);
    const dropdown = root.querySelector(SELECTOR_DROPDOWN);
    if (!control || !dropdown) return;

    // временно убеждаемся, что dropdown измеряется
    // (он уже is-open, но на всякий случай)
    const controlRect = control.getBoundingClientRect();
    const dropdownRect = dropdown.getBoundingClientRect();

    const viewportH = window.innerHeight;

    const spaceBelow = viewportH - controlRect.bottom - VIEWPORT_PADDING;
    const spaceAbove = controlRect.top - VIEWPORT_PADDING;

    const needHeight = dropdownRect.height + GAP;

    const shouldOpenTop = spaceBelow < needHeight && spaceAbove > spaceBelow;
    root.classList.toggle("is-top", shouldOpenTop);
  }

  // --- Плавность: каскадные задержки опций ---
  function applyOptionDelays(root) {
    const options = getOptions(root);
    const max = 14; // не надо задерживать слишком много элементов
    options.forEach((opt, i) => {
      const d = i < max ? i * 10 : 0; // 0..140ms
      opt.style.setProperty("--cs-option-delay", `${d}ms`);
    });
  }

  // --- Reposition handlers ---
  const repositionMap = new WeakMap();

  function attachRepositionHandlers(root) {
    const handler = () => {
      if (!root.classList.contains("is-open")) return;
      applyAutoPosition(root);
    };

    // capture scroll на окне + на документе (лучше ловит скролл контейнеров)
    window.addEventListener("resize", handler, { passive: true });
    window.addEventListener("scroll", handler, { passive: true });
    document.addEventListener("scroll", handler, { passive: true, capture: true });

    repositionMap.set(root, handler);
  }

  function detachRepositionHandlers(root) {
    const handler = repositionMap.get(root);
    if (!handler) return;

    window.removeEventListener("resize", handler);
    window.removeEventListener("scroll", handler);
    document.removeEventListener("scroll", handler, true);

    repositionMap.delete(root);
  }

  // --- Global close ---
  function onDocumentClick(e) {
    const target = e.target;
    if (!(target instanceof Element)) return;

    const root = target.closest(SELECTOR_ROOT);
    if (!root) closeAll(null);
  }

  function initSelect(root) {
    const control = root.querySelector(SELECTOR_CONTROL);
    const dropdown = root.querySelector(SELECTOR_DROPDOWN);
    const list = root.querySelector(SELECTOR_LIST);

    if (!control || !dropdown || !list) return;

    // Инициализация label по выбранному пункту
    const selected = root.querySelector(`${SELECTOR_OPTION}.is-selected`);
    if (selected) setSelected(root, selected);

    // toggle open
    control.addEventListener("click", () => {
      const willOpen = !root.classList.contains("is-open");
      closeAll(root);
      setOpen(root, willOpen);
    });

    // click on option
    root.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;

      const opt = t.closest(SELECTOR_OPTION);
      if (!opt) return;

      setSelected(root, opt);
      setOpen(root, false);
      control.focus({ preventScroll: true });
    });

    // keyboard on control
    control.addEventListener("keydown", (e) => {
      const isOpen = root.classList.contains("is-open");

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        closeAll(root);
        setOpen(root, true);

        const current = getSelectedIndex(root);
        const next = e.key === "ArrowDown" ? current + 1 : current - 1;
        focusOption(root, next);
      }

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const willOpen = !isOpen;
        closeAll(root);
        setOpen(root, willOpen);
      }

      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setOpen(root, false);
      }
    });

    // keyboard in dropdown
    dropdown.addEventListener("keydown", (e) => {
      const options = getOptions(root);
      if (!options.length) return;

      const isOpen = root.classList.contains("is-open");
      if (!isOpen) return;

      const selectedIndex = getSelectedIndex(root);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusOption(root, selectedIndex + 1);
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        focusOption(root, selectedIndex - 1);
      }

      if (e.key === "Home") {
        e.preventDefault();
        focusOption(root, 0);
      }

      if (e.key === "End") {
        e.preventDefault();
        focusOption(root, options.length - 1);
      }

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const active = document.activeElement;
        const opt = (active instanceof Element && active.matches(SELECTOR_OPTION))
          ? active
          : root.querySelector(`${SELECTOR_OPTION}.is-selected`);

        if (opt) setSelected(root, opt);
        setOpen(root, false);
        control.focus({ preventScroll: true });
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(root, false);
        control.focus({ preventScroll: true });
      }
    });
  }

  // init all instances
  document.querySelectorAll(SELECTOR_ROOT).forEach(initSelect);

  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll(null);
  });
})();
