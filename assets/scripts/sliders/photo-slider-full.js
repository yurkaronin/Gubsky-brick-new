// \assets\scripts\sliders\photo-slider-full.js
document.addEventListener('DOMContentLoaded', function () {
  const photoSliderFull = new Swiper('.photo-slider-full .swiper', {
    spaceBetween: 1,
    loop: true,
    slidesPerView: 'auto',
    initialSlide: 1, // Слайд №2 (индексация с 0)

     breakpoints: {
      320: {
        centeredSlides: true,
      },
      1023: {
        centeredSlides: true,
      },
      1379: {
        centeredSlides: false,
      }
    },

    // Navigation arrows
    navigation: {
      nextEl: '.photo-slider-full .swiper-button-next',
      prevEl: '.photo-slider-full .swiper-button-prev',
    },
  })
});
