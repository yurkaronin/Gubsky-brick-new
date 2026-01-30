document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.catalog-card-preview-slider').forEach(function (sliderEl) {
    const swiperEl = sliderEl.querySelector('.swiper');
    if (!swiperEl) {
      return;
    }

    const swiper = new Swiper(swiperEl, {
      slidesPerView: 1,
      spaceBetween: 0,
      effect: 'fade',
      pagination: {
        el: sliderEl.querySelector('.swiper-pagination'),
        clickable: true,
      },
    });

    let rafId = null;
    let pendingIndex = null;

    function scheduleSlideTo(index) {
      if (rafId !== null) {
        return;
      }

      pendingIndex = index;
      rafId = window.requestAnimationFrame(function () {
        rafId = null;
        if (pendingIndex == null) {
          return;
        }

        if (pendingIndex !== swiper.activeIndex) {
          swiper.slideTo(pendingIndex);
        }
        pendingIndex = null;
      });
    }

    sliderEl.addEventListener('mousemove', function (event) {
      const rect = sliderEl.getBoundingClientRect();
      if (!rect.width) {
        return;
      }

      const ratio = (event.clientX - rect.left) / rect.width;
      const clampedRatio = Math.min(0.9999, Math.max(0, ratio));
      const slidesCount = swiper.slides.length;
      const index = Math.max(0, Math.min(slidesCount - 1, Math.floor(clampedRatio * slidesCount)));

      scheduleSlideTo(index);
    });
  });
});
