// assets/js/components/navigation-accordion.js
document.addEventListener('DOMContentLoaded', () => {
  const accordions = document.querySelectorAll('.navigation-accordion');

  const setState = (accordion, open) => {
    const toggle = accordion.querySelector('.navigation-accordion__toggle');
    const panel = accordion.querySelector('.navigation-accordion__panel');
    if (!toggle || !panel) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    accordion.classList.toggle('is-open', open);
    panel.hidden = !open;
  };

  accordions.forEach((accordion) => {
    const toggle = accordion.querySelector('.navigation-accordion__toggle');
    const panel = accordion.querySelector('.navigation-accordion__panel');
    if (!toggle || !panel) return;

    // init
    const isInitiallyOpen =
      toggle.getAttribute('aria-expanded') === 'true' ||
      accordion.classList.contains('is-open');
    setState(accordion, isInitiallyOpen);

    toggle.addEventListener('click', () => {
      const willOpen = toggle.getAttribute('aria-expanded') !== 'true';
      const container = accordion.closest('.mobile-navigation') || document;

      // close siblings in the same mobile navigation
      container.querySelectorAll('.navigation-accordion').forEach((item) => {
        if (item === accordion) return;
        setState(item, false);
      });

      setState(accordion, willOpen);
    });
  });
});
