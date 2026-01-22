document.addEventListener('DOMContentLoaded', function () {
  const reviewsSlider = new Swiper('.reviews-slider .swiper', {
    // Optional parameters
    loop: true,
    slidesPerView: 'auto',
    spaceBetween: 32,
    autoHeight: true,

    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 16,
        autoHeight: true,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 24,
        autoHeight: false,

      },
      1025: {
        slidesPerView: 3,
        spaceBetween: 32,
        autoHeight: false,

      },
    },
    // If we need pagination
    pagination: {
      el: '.reviews-slider .swiper-pagination',
      clickable: true, // <-- Вот этот параметр делает буллеты кликабельными
    },

    // If we need pagination
    // pagination: {
    //   el: '.swiper-pagination',
    // },

    // Navigation arrows
    // navigation: {
    //   nextEl: '.swiper-button-next',
    //   prevEl: '.swiper-button-prev',
    // },

  });
});
