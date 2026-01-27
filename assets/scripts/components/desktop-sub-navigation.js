document.addEventListener("DOMContentLoaded", function () {
  var desktopButtons = document.querySelectorAll('.js-show-desktop-sub-nav');
  var menuContainer = document.querySelector('.header__footer');

  function isMenuOpen() {
    return document.body.classList.contains('desktop-sub-navigation-open');
  }

  function isClickOnToggle(target) {
    return Array.prototype.some.call(desktopButtons, function (button) {
      return button.contains(target);
    });
  }

  desktopButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      document.body.classList.toggle('desktop-sub-navigation-open');
    });
  });

  document.addEventListener('click', function (event) {
    if (!isMenuOpen()) {
      return;
    }

    if (menuContainer && menuContainer.contains(event.target)) {
      return;
    }

    if (isClickOnToggle(event.target)) {
      return;
    }

    document.body.classList.remove('desktop-sub-navigation-open');
  });

});
