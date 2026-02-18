document.addEventListener('DOMContentLoaded', function () {
  const mainSlidesCount = document.querySelectorAll('.home-hero-slider .swiper .swiper-slide').length;

  const homeHeroSubSlider = new Swiper('.home-hero-sub-slider .swiper', {
    slidesPerView: 3,
    spaceBetween: 7,
    watchSlidesProgress: true,
    slideToClickedSlide: true,
    centeredSlides: false,

    breakpoints: {
      320: {
        spaceBetween: 5,
        centeredSlides: true,
      },
      768: {
        spaceBetween: 7,
        centeredSlides: false,
      }
    },
  });

  const homeHeroSlider = new Swiper('.home-hero-slider .swiper', {
    loop: true,
    loopedSlides: mainSlidesCount,
    slidesPerView: 1,
    effect: 'fade',
    pagination: {
      el: '.home-hero .swiper-pagination',
    },
    navigation: {
      nextEl: '.home-hero .swiper-button-next',
      prevEl: '.home-hero .swiper-button-prev',
    },
    thumbs: {
      swiper: homeHeroSubSlider,
    },
  });

  homeHeroSubSlider.on('click', function () {
    if (homeHeroSubSlider.clickedIndex == null) {
      return;
    }

    const clickedSlide = homeHeroSubSlider.slides[homeHeroSubSlider.clickedIndex];
    if (!clickedSlide) {
      return;
    }

    const realIndexAttr = clickedSlide.getAttribute('data-swiper-slide-index');
    const realIndex = Number.parseInt(realIndexAttr, 10);
    if (Number.isNaN(realIndex)) {
      homeHeroSlider.slideToLoop(homeHeroSubSlider.clickedIndex);
      return;
    }

    homeHeroSlider.slideToLoop(realIndex);
  });

  homeHeroSlider.on('slideChange', function () {
    homeHeroSubSlider.slideTo(homeHeroSlider.realIndex);
  });
});
