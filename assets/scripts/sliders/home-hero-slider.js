document.addEventListener('DOMContentLoaded', function () {
  const subSwiper = new Swiper('.home-hero-sub-slider .swiper', {
    loop: true,
    slidesPerView: 3,
    spaceBetween: 7,
    watchSlidesProgress: true,
    slideToClickedSlide: true,
  });

  const mainSwiper = new Swiper('.home-hero-slider .swiper', {
    loop: true,
    slidesPerView: 1,
    pagination: {
      el: '.home-hero .swiper-pagination',
    },
    navigation: {
      nextEl: '.home-hero .swiper-button-next',
      prevEl: '.home-hero .swiper-button-prev',
    },
    thumbs: {
      swiper: subSwiper,
    },
  });
});
