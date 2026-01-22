class PhoneMask {
  constructor() {
    this.init();
  }

  init() {
    // Находим все поля с type="tel"
    const telInputs = document.querySelectorAll('input[type="tel"]');
    telInputs.forEach(input => {
      this.initPhoneMask(input);
    });
  }

  initPhoneMask(input) {
    IMask(input, {
      mask: '+{7} (000) 000-00-00' // Пример маски для российского номера
    });
  }
}

// Автоматическая инициализация при загрузке скрипта
new PhoneMask();
