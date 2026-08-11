/**
 * Project-specific interactions.
 * This file contains additions that can be handed off separately from the original scripts.
 */
(function () {
  function initAdvancedSearch(toggle) {
    var sorter = toggle.closest('.category-sorter');
    var grid = sorter ? sorter.querySelector('.category-sorter__grid[data-visible-items]') : null;
    var items = grid ? Array.from(grid.children).filter(function (item) {
      return item.classList.contains('category-sorter__col');
    }) : [];
    var requestedVisibleItems = grid ? parseInt(grid.getAttribute('data-visible-items'), 10) : NaN;
    var visibleItemsCount = Number.isNaN(requestedVisibleItems) ? 3 : requestedVisibleItems;
    var label = toggle.querySelector('[data-advanced-search-label]');

    if (!sorter || !grid || !items.length || !label) return;

    visibleItemsCount = Math.max(0, Math.min(visibleItemsCount, items.length));

    var advancedItems = items.slice(visibleItemsCount);

    items.forEach(function (item, index) {
      var isAdvancedItem = index >= visibleItemsCount;

      item.classList.toggle('category-sorter__col--advanced', isAdvancedItem);

      if (isAdvancedItem) {
        item.setAttribute('data-advanced-search-item', '');
        item.setAttribute('aria-hidden', 'true');
        item.setAttribute('inert', '');
      } else {
        item.removeAttribute('data-advanced-search-item');
        item.removeAttribute('aria-hidden');
        item.removeAttribute('inert');
      }
    });

    grid.setAttribute('data-advanced-search-ready', '');

    if (!advancedItems.length) {
      toggle.hidden = true;
      return;
    }

    var controlledIds = advancedItems.map(function (item) {
      return item.id;
    }).filter(Boolean);

    if (controlledIds.length) {
      toggle.setAttribute('aria-controls', controlledIds.join(' '));
    }

    toggle.addEventListener('click', function () {
      var isOpen = sorter.classList.toggle('category-sorter--advanced-search-open');

      toggle.setAttribute('aria-expanded', String(isOpen));
      label.textContent = isOpen ? 'Свернуть' : 'Расширенный поиск';

      advancedItems.forEach(function (item) {
        item.setAttribute('aria-hidden', String(!isOpen));

        if (isOpen) {
          item.removeAttribute('inert');
        } else {
          item.setAttribute('inert', '');
        }
      });
    });
  }

  document.querySelectorAll('[data-advanced-search-toggle]').forEach(initAdvancedSearch);
})();
