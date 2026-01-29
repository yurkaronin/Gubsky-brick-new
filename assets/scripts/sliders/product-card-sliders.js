document.addEventListener('DOMContentLoaded', function () {
  const heroSection = document.querySelector('.product-card-hero');
  const DURATION = 500;

  // Все цвета здесь - ключи совпадают с data-bg-color
  const COLORS = {
    default: '#dfe5eb',     // базовый цвет
    'mod-1': '#f1f0ee',     // первый вариант фона
    'mod-2': '#ffffff',     // второй вариант фона
    'mod-3': '#f5f5f5',     // третий вариант (если понадобится)
    'video': '#000000'      // специальный цвет для видео
  };

  // Настраиваем плавный переход
  heroSection.style.transition = `background-color ${DURATION}ms ease`;

  // Функция для обновления фона
  function updateBackground(slide) {
    // Получаем значение data-атрибута
    const colorKey = slide.dataset.bgColor || 'default';

    // Получаем цвет из конфига или используем дефолтный
    const color = COLORS[colorKey] || COLORS.default;

    // Применяем цвет
    heroSection.style.backgroundColor = color;
  }

  // Инициализация слайдера
  const slider = new Swiper('.product-card-main-slider .swiper', {
    loop: true,
    effect: "fade",
    speed: DURATION,

    pagination: {
      el: '.product-card-main-slider .swiper-pagination'
    },

    navigation: {
      nextEl: '.product-card-main-slider .swiper-button-next',
      prevEl: '.product-card-main-slider .swiper-button-prev',
    },

    on: {
      // При инициализации
      init: function () {
        updateBackground(this.slides[this.activeIndex]);
      },

      // В начале перехода слайда
      slideChangeTransitionStart: function () {
        updateBackground(this.slides[this.activeIndex]);
      },

      // Для надежности - при завершении перехода
      slideChangeTransitionEnd: function () {
        updateBackground(this.slides[this.activeIndex]);
      }
    }
  });

  // Опционально: для отладки можно вывести объект в глобальную область
  window.sliderColors = COLORS;
  window.productSlider = slider;
});


document.addEventListener('DOMContentLoaded', function () {
  const productCardAsideSlider = new Swiper('.product-card-aside-slider .swiper', {
    // Optional parameters
    direction: 'vertical',
    loop: true,
    spaceBetween: 16,
    slidesPerView: 5,

  });
});
