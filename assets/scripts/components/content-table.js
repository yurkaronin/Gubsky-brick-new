document.addEventListener('DOMContentLoaded', () => {
  // Find tables with no class or an empty class, excluding ones already wrapped
  const tables = document.querySelectorAll(
    'table:not([class]), table[class=""]'
  );

  tables.forEach((table) => {
    // Skip if already inside .content-table
    if (table.closest('.content-table')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'content-table';

    // Insert wrapper and move table inside
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
});
