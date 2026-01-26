// mobile-menu.js (оставляем как есть)
document.addEventListener("DOMContentLoaded", function () {
  var desktopButtons = document.querySelectorAll('.js-show-mobile-navigation-menu');

  desktopButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      document.body.classList.toggle('mobile-navigation-menu-open');
    });
  });
});
