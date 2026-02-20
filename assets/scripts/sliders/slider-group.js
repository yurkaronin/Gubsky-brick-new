document.addEventListener('DOMContentLoaded', function () {
  // Находим Swiper один раз
  function getSwiper() {
    const SwiperRef = window.Swiper || null;

    if (!SwiperRef) {
      console.warn('Swiper не найден. Убедись, что скрипт Swiper подключен до этого файла.');
      return null;
    }

    return SwiperRef;
  }

  // -----------------------------
  // ГРУППА: основной + миниатюры
  // -----------------------------
  function initSliderGroup(groupEl, Swiper) {
    const mainSwiperEl = groupEl.querySelector('.simple-slider-one .swiper');
    const thumbSwiperEl = groupEl.querySelector('.slider-thumbnails__center .swiper');

    if (!mainSwiperEl || !thumbSwiperEl) {
      console.warn('Группа слайдеров: не найдены оба слайдера внутри .slider-group-with-thumbnails');
      return;
    }

    // Инициализируем основной слайдер с автопрокруткой
    let mainSlider;
    try {
      mainSlider = new Swiper(mainSwiperEl, {
        slidesPerView: 1,
        spaceBetween: 32,
        speed: 400,
        watchSlidesProgress: true,
        loop: false,
        autoplay: {
          delay: 6000, // 6000 миллисекунд = 6 секунд
          disableOnInteraction: false, // автослайдер продолжит работу после взаимодействия пользователя
        }
        // Навигацию Swiper НЕ используем — делаем свою, с псевдо-loop
      });
    } catch (e) {
      console.error('Ошибка инициализации основного слайдера в группе:', e);
      return;
    }

    // Инициализируем слайдер миниатюр
    let thumbSlider;
    try {
      thumbSlider = new Swiper(thumbSwiperEl, {
        slidesPerView: 5,
        spaceBetween: 8,
        speed: 400,
        watchSlidesProgress: true,
        loop: false,
        breakpoints: {
          450: {
            slidesPerView: 'auto',
            spaceBetween: 12,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 24,
          },
          1024: {
            slidesPerView: 6,
            spaceBetween: 24,
          },
        }
      });
    } catch (e) {
      console.error('Ошибка инициализации слайдера миниатюр в группе:', e);
      return;
    }

    // Функция обновления активной миниатюры
    function updateActiveThumb() {
      if (!thumbSlider || !thumbSlider.slides || !mainSlider) return;

      try {
        thumbSlider.slides.forEach(function (slide) {
          if (slide && slide.classList) {
            slide.classList.remove('-active');
          }
        });

        const activeIndex = mainSlider.activeIndex;
        if (thumbSlider.slides[activeIndex]) {
          thumbSlider.slides[activeIndex].classList.add('-active');
        }
      } catch (e) {
        console.warn('Ошибка обновления активной миниатюры:', e);
      }
    }

    // --- Связка: основной → миниатюры ---
    mainSlider.on('slideChange', function () {
      const activeIndex = mainSlider.activeIndex;

      if (thumbSlider && thumbSlider.slides && thumbSlider.slides[activeIndex]) {
        thumbSlider.slideTo(activeIndex);
      }

      updateActiveThumb();
    });

    // --- Связка: миниатюры → основной (клик по миниатюре) ---
    thumbSlider.on('click', function (swiper) {
      const clickedIndex = swiper.clickedIndex;

      if (
        clickedIndex !== undefined &&
        clickedIndex !== null &&
        mainSlider &&
        clickedIndex !== mainSlider.activeIndex
      ) {
        mainSlider.slideTo(clickedIndex);
      }
    });

    // --- Связка: миниатюры → основной (перелистывание свайпом) ---
    thumbSlider.on('slideChange', function () {
      const idx = thumbSlider.activeIndex;

      if (mainSlider && idx !== mainSlider.activeIndex) {
        mainSlider.slideTo(idx);
      }

      updateActiveThumb();
    });

    // --- Псевдо-loop на кнопках ---

    // Кнопки в верхнем (основном) слайдере
    const mainNext = groupEl.querySelector('.simple-slider-one .swiper-button-next');
    const mainPrev = groupEl.querySelector('.simple-slider-one .swiper-button-prev');

    // Кнопки в блоке миниатюр
    const thumbNext = groupEl.querySelector('.slider-thumbnails__right .swiper-button-next');
    const thumbPrev = groupEl.querySelector('.slider-thumbnails__left .swiper-button-prev');

    function goToLoopedSlide(direction) {
      if (!mainSlider) return;

      const total = mainSlider.slides.length;
      if (!total) return;

      const current = mainSlider.activeIndex;
      let newIndex = current;

      if (direction === 'next') {
        newIndex = (current + 1) % total; // по кругу вперёд
      } else if (direction === 'prev') {
        newIndex = (current - 1 + total) % total; // по кругу назад
      }

      mainSlider.slideTo(newIndex);
      // thumbSlider подтянется через обработчик mainSlider.on('slideChange')
    }

    function makeButtonHandler(direction) {
      return function (e) {
        e.preventDefault();
        e.stopPropagation();
        goToLoopedSlide(direction);
      };
    }

    const handleNext = makeButtonHandler('next');
    const handlePrev = makeButtonHandler('prev');

    [mainNext, thumbNext].forEach(function (btn) {
      if (btn) btn.addEventListener('click', handleNext);
    });

    [mainPrev, thumbPrev].forEach(function (btn) {
      if (btn) btn.addEventListener('click', handlePrev);
    });

    // Первичное обновление активной миниатюры
    setTimeout(updateActiveThumb, 100);
  }

  // -----------------------------
  // ОДИНОЧНЫЙ основной слайдер
  // -----------------------------
  function initSimpleSliderOne(simpleSliderEl, Swiper) {
    const swiperEl = simpleSliderEl.querySelector('.swiper');
    if (!swiperEl) {
      console.warn('SimpleSliderOne: не найден .swiper внутри .simple-slider-one');
      return;
    }

    let slider;
    try {
      slider = new Swiper(swiperEl, {
        slidesPerView: 1,
        spaceBetween: 32,
        speed: 400,
        loop: false,
        autoplay: {
          delay: 6000, // 6000 миллисекунд = 6 секунд
          disableOnInteraction: false, // автослайдер продолжит работу после взаимодействия пользователя
        }
        // Навигацию Swiper не используем — делаем руками
      });
    } catch (e) {
      console.error('Ошибка инициализации SimpleSliderOne:', e);
      return;
    }

    const nextBtn = simpleSliderEl.querySelector('.swiper-button-next');
    const prevBtn = simpleSliderEl.querySelector('.swiper-button-prev');

    function goToLoopedSlide(direction) {
      if (!slider) return;

      const total = slider.slides.length;
      if (!total) return;

      const current = slider.activeIndex;
      let newIndex = current;

      if (direction === 'next') {
        newIndex = (current + 1) % total;
      } else if (direction === 'prev') {
        newIndex = (current - 1 + total) % total;
      }

      slider.slideTo(newIndex);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        goToLoopedSlide('next');
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        goToLoopedSlide('prev');
      });
    }
  }

  // -----------------------------
  // ОБЩАЯ ИНИЦИАЛИЗАЦИЯ
  // -----------------------------
  function initAllSliders() {
    const Swiper = getSwiper();
    if (!Swiper) {
      console.log('Ожидание загрузки Swiper...');
      setTimeout(initAllSliders, 100);
      return;
    }

    // 1) Группы: основной + миниатюры
    const groups = document.querySelectorAll('.slider-group-with-thumbnails');
    groups.forEach(function (groupEl, index) {
      console.log('Инициализация группы слайдеров #' + (index + 1));
      initSliderGroup(groupEl, Swiper);
    });

    // 2) Одиночные основные слайдеры (только .simple-slider-one, НЕ внутри группы)
    const simpleSliders = document.querySelectorAll('.simple-slider-one');
    simpleSliders.forEach(function (el, index) {
      if (!el.closest('.slider-group-with-thumbnails')) {
        console.log('Инициализация независимого основного слайдера #' + (index + 1));
        initSimpleSliderOne(el, Swiper);
      }
    });

    // Внимание: вспомогательный (thumbnails) сам по себе НЕ инициализируем,
    // как ты и просил.
  }

  // Небольшая задержка, чтобы все скрипты успели подключиться
  setTimeout(initAllSliders, 300);
});
