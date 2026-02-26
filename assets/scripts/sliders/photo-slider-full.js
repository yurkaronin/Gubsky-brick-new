// \assets\scripts\sliders\photo-slider-full.js
document.addEventListener('DOMContentLoaded', function () {
  const PRELOAD_NEXT = 3; // сколько слайдов вперёд подгружать (подберите 2–4)

  function preloadAround(swiper, amount = 2) {
    // Подгружаем картинки в active + next N (и на всякий случай prev N)
    const idxs = [];
    for (let i = -amount; i <= amount; i++) idxs.push(swiper.activeIndex + i);

    idxs.forEach((i) => {
      const slide = swiper.slides[i];
      if (!slide) return;

      // 1) Если у вас нативный lazy: loading="lazy"
      slide.querySelectorAll('img[loading="lazy"]').forEach((img) => {
        img.loading = 'eager';
        // decode не обязателен, но помогает "ускорить" появление после загрузки
        if (img.decode) img.decode().catch(() => {});
      });

      // 2) Если у вас data-src / data-srcset (часто так делают в верстке)
      slide.querySelectorAll('img[data-src]').forEach((img) => {
        if (!img.src) img.src = img.dataset.src;
        img.removeAttribute('data-src');
        if (img.decode) img.decode().catch(() => {});
      });
      slide.querySelectorAll('source[data-srcset]').forEach((source) => {
        source.srcset = source.dataset.srcset;
        source.removeAttribute('data-srcset');
      });
    });
  }

  const photoSliderFull = new Swiper('.photo-slider-full .swiper', {
    spaceBetween: 1,
    loop: true,
    slidesPerView: 'auto',
    initialSlide: 1,

    // В loop-режиме добавляем запас дубликатов,
    // чтобы Swiper не "догонял" и не оставлял визуальных дыр.
    loopAdditionalSlides: 3,

    // Если у вас Swiper Lazy (или хотите его включить)
    // Важно: preloadImages:false + lazy.loadPrevNext(+Amount)
    preloadImages: false,
    lazy: {
      enabled: true,
      loadPrevNext: true,
      loadPrevNextAmount: PRELOAD_NEXT, // грузим next, next+1, next+2...
    },

    autoplay: {
      delay: 6000,
      disableOnInteraction: false,
    },

    breakpoints: {
      320: { centeredSlides: true },
      1023: { centeredSlides: true },
      1379: { centeredSlides: false },
    },

    navigation: {
      nextEl: '.photo-slider-full .swiper-button-next',
      prevEl: '.photo-slider-full .swiper-button-prev',
    },

    on: {
      init(swiper) {
        preloadAround(swiper, PRELOAD_NEXT);
      },
      slideChangeTransitionStart(swiper) {
        preloadAround(swiper, PRELOAD_NEXT);
      },
    },
  });
});
