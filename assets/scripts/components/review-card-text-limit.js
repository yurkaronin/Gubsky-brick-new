document.querySelectorAll('.swiper .review-preview-card__text').forEach(el => {
  const maxLength = 270; // длина текста
  const fullText = el.textContent.trim();

  if (fullText.length > maxLength) {
    // обрезаем и убираем пробелы в конце
    const shortText = fullText.slice(0, maxLength).trimEnd();

    // вставляем текст с многоточием
    el.textContent = shortText + '…';

    // добавляем иконку
    const icon = document.createElement('i');
    icon.className = 'review-icon';
    el.appendChild(icon);
  }
});
