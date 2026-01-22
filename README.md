# Новый проект

## 🚀 Быстрый старт

    # Установка зависимостей
    npm install

    # Запуск разработки
    npm start
    # Откроется http://localhost:3000

    # Или используйте алиас
    npm run dev

## 📦 Команды сборки

    # Development сборка (без минификации)
    npm run build

    # Production сборка (с минификацией)
    npm run build:prod

    # Альтернативные способы
    node tasks/build.js           # development
    node tasks/build.js --prod    # production
    node tasks/build.js production # production

## 🧹 Утилиты

    # Очистка собранных файлов
    npm run clean

    # Отслеживание изменений (без сервера)
    npm run watch

    # Тестовые сборки
    npm run test:build    # проверка development
    npm run test:prod     # проверка production

## 📁 Структура проекта

    html/
    ├── pages/          # Страницы
    ├── layouts/        # Макеты (base.html)
    ├── components/     # Компоненты
    └── sections/       # Секции

    assets/            # Статика (стили, скрипты, изображения)

## 💡 Шаблоны Nunjucks

    {% extends "layouts/base.html" %}

    {% block content %}
        <!-- Контент страницы -->
        {% include "components/button.html" with {
            text: "Кнопка",
            className: "btn-primary"
        } %}
    {% endblock %}

## 🔧 Глобальные переменные в шаблонах

    <!-- Путь к ресурсам -->
    <link href="{{ assets }}/styles/main.css" rel="stylesheet">

    <!-- Проверка режима -->
    {% if isProduction %}
        <!-- Production-код -->
    {% endif %}

    <!-- Исправление путей -->
    <script src="{{ assets|cleanpath }}/main.js"></script>

    <!-- Cachebuster в production -->
    <link href="{{ 'style.css'|cachebuster }}" rel="stylesheet">

## 🎯 Особенности

1. Автосборка при изменении файлов в html/
2. Минификация в production режиме
3. Сохраняет структуру папок для вложенных страниц
4. Цветной вывод в консоли
5. Корректное завершение (Ctrl+C)

## 🐛 Отладка

    # Если не работает:
    1. Проверьте: есть ли папка html/pages/
    2. Запустите: npm run clean && npm run build
    3. Проверьте синтаксис шаблонов Nunjucks

## 🎨 Production vs Development

Development: Быстро, читаемо, с отладочной информацией
Production: Минифицировано, оптимизировано, удалены комментарии

Подсказка: Всегда начинайте с npm start для разработки. Для финальной версии используйте npm run build:prod.
