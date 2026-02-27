(function() {
    'use strict';

    // Функция для проверки количества строк у элементов .label внутри .calculator-radio
    function checkLabelsMultiline() {
        // Находим все .calculator-radio
        const radioBlocks = document.querySelectorAll('.calculator-radio');

        radioBlocks.forEach(block => {
            // Внутри каждого блока ищем .label
            const label = block.querySelector('.label');

            if (label) {
                // Получаем высоту строки
                const lineHeight = parseInt(window.getComputedStyle(label).lineHeight, 10);
                // Получаем фактическую высоту элемента
                const actualHeight = label.offsetHeight;

                // Вычисляем количество строк
                const linesCount = Math.ceil(actualHeight / lineHeight);

                // Добавляем или удаляем класс -mod на родительском .calculator-radio
                if (linesCount > 1) {
                    block.classList.add('-mod');
                } else {
                    block.classList.remove('-mod');
                }
            }
        });
    }

    // Функция для debounce
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Ждем загрузки DOM
    document.addEventListener('DOMContentLoaded', function() {
        // Первоначальная проверка
        checkLabelsMultiline();

        // Слушаем изменение размера окна
        window.addEventListener('resize', debounce(checkLabelsMultiline, 150));
    });

})();
