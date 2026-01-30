document.addEventListener('DOMContentLoaded', function () {
  const swiper = new Swiper('.home-hero-slider .swiper', {
    // Optional parameters
    loop: true,
    slidesPerView: 1,

    // If we need pagination
    pagination: {
      el: '.home-hero .swiper-pagination',
    },

    // Navigation arrows
    navigation: {
      nextEl: '.home-hero .swiper-button-next',
      prevEl: '.home-hero .swiper-button-prev',
    },

  });
});

document.addEventListener('DOMContentLoaded', function () {
  const swiper = new Swiper('.home-hero-sub-slider .swiper', {
    // Optional parameters
    loop: true,
    slidesPerView: 3,
    spaceBetween: 7,
  });
});
