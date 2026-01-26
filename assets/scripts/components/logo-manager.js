// logo-manager.js
class LogoManager {
  constructor() {
    this.logoImage = document.querySelector('.js-change-logo img');
    if (!this.logoImage) return;

    this.stickyLogoPath = "./assets/svg/logo.svg";
    this.inverseLogoPath = "./assets/svg/logo-inverse.svg";

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

    // Логика приоритетов:
    // 1. Если открыто мобильное меню - ВСЕГДА обычный логотип
    // 2. Если меню закрыто, но шапка прилипла - обычный логотип
    // 3. Если меню закрыто и шапка не прилипла - инверсный логотип

    if (isMobileOpen) {
      // Приоритет 1: мобильное меню открыто
      this.logoImage.src = this.stickyLogoPath;
    } else if (isSticky) {
      // Приоритет 2: шапка прилипла
      this.logoImage.src = this.stickyLogoPath;
    } else {
      // Приоритет 3: обычное состояние
      this.logoImage.src = this.inverseLogoPath;
    }
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  window.logoManager = new LogoManager();
});
