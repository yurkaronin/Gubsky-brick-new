document.addEventListener('DOMContentLoaded', function () {
  const heroSection = document.querySelector('.product-card-hero');
  const mainSliderEl = document.querySelector('.product-card-main-slider .swiper');
  const asideSliderEl = document.querySelector('.product-card-aside-slider .swiper');
  const DURATION = 500;

  if (!heroSection || !mainSliderEl || !asideSliderEl) {
    return;
  }

  // Centralized colors (keys match data-bg-color)
  const COLORS = {
    default: '#dfe5eb',
    'mod-1': '#f1f0ee',
    'mod-2': '#ffffff',
    'mod-3': '#f5f5f5',
    'video': '#000000'
  };

  heroSection.style.transition = `background-color ${DURATION}ms ease`;

  function getColorByKey(colorKey) {
    return COLORS[colorKey] || COLORS.default;
  }

  function applyBackgroundFromData(element) {
    if (!element) return;
    const colorKey = element.dataset.bgColor || 'default';
    element.style.backgroundColor = getColorByKey(colorKey);
  }

  function updateHeroBackground(slide) {
    if (!slide) return;
    const colorKey = slide.dataset.bgColor || 'default';
    const color = getColorByKey(colorKey);
    heroSection.style.backgroundColor = color;
    heroSection.style.setProperty('--hero-bg', color);
  }

  function applyAsideSlideBackgrounds() {
    const asideCards = asideSliderEl.querySelectorAll('[data-bg-color]');
    asideCards.forEach(applyBackgroundFromData);
  }

  function setAsideActiveByRealIndex(realIndex) {
    const slides = asideSlider.slides;
    if (!slides || Number.isNaN(realIndex)) return;

    slides.forEach((slide) => {
      const button = slide.querySelector('.product-card-aside-slider__card');
      if (!button) return;
      const isActive = Number(slide.dataset.swiperSlideIndex) === realIndex;
      slide.classList.toggle('is-active', isActive);
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  const asideSlider = new Swiper('.product-card-aside-slider .swiper', {
    loop: true,
    spaceBetween: 16,
    slidesPerView: 5,
    watchSlidesProgress: true,
    centeredSlides: false,
    direction: 'vertical',
    breakpoints: {
      0: {
        direction: 'horizontal',
        slidesPerView: 'auto',
        spaceBetween: 10,
      },
      768: {
        spaceBetween: 16,
      },
      1380: {
        direction: 'vertical',
        slidesPerView: 5,
      }
    },
  });

  const mainSlider = new Swiper('.product-card-main-slider .swiper', {
    loop: true,
    effect: 'fade',
    speed: DURATION,

    pagination: {
      el: '.product-card-main-slider .swiper-pagination'
    },

    navigation: {
      nextEl: '.product-card-main-slider .swiper-button-next',
      prevEl: '.product-card-main-slider .swiper-button-prev',
    },

    on: {
      init: function () {
        updateHeroBackground(this.slides[this.activeIndex]);
        applyAsideSlideBackgrounds();
        setAsideActiveByRealIndex(this.realIndex);
      },

      slideChangeTransitionStart: function () {
        updateHeroBackground(this.slides[this.activeIndex]);
        setAsideActiveByRealIndex(this.realIndex);
      },

      slideChangeTransitionEnd: function () {
        updateHeroBackground(this.slides[this.activeIndex]);
      }
    }
  });

  asideSliderEl.addEventListener('click', function (event) {
    const button = event.target.closest('.product-card-aside-slider__card');
    if (!button) return;

    const slideEl = button.closest('.swiper-slide');
    if (!slideEl) return;

    const realIndex = Number(slideEl.dataset.swiperSlideIndex);
    if (!Number.isNaN(realIndex)) {
      setAsideActiveByRealIndex(realIndex);
      mainSlider.slideToLoop(realIndex);
    }
  });

  // Optional debug exports
  window.sliderColors = COLORS;
  window.productSlider = mainSlider;
});
