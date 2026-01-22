document.addEventListener("DOMContentLoaded", function () {
  var desktopButtons = document.querySelectorAll('.js-show-desktop-sub-nav');

  desktopButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      document.body.classList.toggle('desktop-sub-navigation-open');
    });
  });

});
