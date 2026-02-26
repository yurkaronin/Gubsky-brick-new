// logo-manager.js
class LogoManager {
  constructor() {
    this.logoImage = document.querySelector('.js-change-logo img');
    if (!this.logoImage) return;

    this.stickyLogoPath = "./assets/svg/logo.svg";        // обычный (основной)
    this.inverseLogoPath = "./assets/svg/logo-inverse.svg"; // инверсный (на белом фоне)

    this.init();
  }

  init() {
    // Начальное обновление
    this.updateLogo();

    // Следим за изменениями классов на body
    this.observer = new MutationObserver(() => this.updateLogo());
    this.observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Также слушаем scroll для мгновенного обновления при прокрутке
    window.addEventListener('scroll', () => this.updateLogo(), { passive: true });
  }

  updateLogo() {
    if (!this.logoImage) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const isSticky = scrollTop > 60 || document.body.classList.contains('header-sticky');
    const isMobileOpen = document.body.classList.contains('mobile-navigation-menu-open');

    // 🔥 НОВОЕ УСЛОВИЕ: десктопное подменю открыто + промо-малая шапка
    const isPromoSmall = document.body.classList.contains('promo-small');
    const isDesktopSubNavOpen = document.body.classList.contains('desktop-sub-navigation-open');

    // === Приоритеты (по порядку) ===
    // 1. Если открыто мобильное меню → всегда обычный логотип
    if (isMobileOpen) {
      this.logoImage.src = this.stickyLogoPath;
    }
    // 2. Если активна промо-малая шапка И открыто десктопное подменю → тоже обычный
    else if (isPromoSmall && isDesktopSubNavOpen) {
      this.logoImage.src = this.stickyLogoPath;
    }
    // 3. Если шапка прилипла (но меню закрыто) → обычный логотип
    else if (isSticky) {
      this.logoImage.src = this.stickyLogoPath;
    }
    // 4. В остальных случаях — инверсный (например, вверху страницы, без прокрутки)
    else {
      this.logoImage.src = this.inverseLogoPath;
    }
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  window.logoManager = new LogoManager();
});
