

document.addEventListener('DOMContentLoaded', function () {
  document.addEventListener('click', e => console.log(e.target));
});

document.addEventListener('DOMContentLoaded', function () {
  // Получаем все элементы input с типом "tel"
  var phoneInputs = document.querySelectorAll('input[type="tel"]');

  // Проходим по каждому из найденных элементов
  phoneInputs.forEach(function (input) {
    // Настройки маски
    var maskOptions = {
      mask: '+{7}(000)000-00-00'
    };

    // Инициализация маски
    var mask = IMask(input, maskOptions);

  });
});

