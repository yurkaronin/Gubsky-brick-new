# Новый проект

## Быстрый старт

```bash
npm install
npm start
```

Локальный сервер: http://localhost:3000

## Команды (кратко)

```bash
npm start                 # сборка + сервер + watch
npm run dev               # алиас npm start
npm run watch             # только watch (без сервера)

npm run build             # dev-сборка (без сервера)
npm run build:prod        # production-сборка (минификация)
npm run build:prod:base   # production-сборка + подсказка base URL

npm run build:continue    # продолжать сборку при ошибках
npm run build:prod:continue

npm run clean             # удалить сгенерированные HTML

```

## Деплой и base href

При production-сборке сборщик спросит базовый URL для размещения проекта.

Если оставить пустым — пути будут относительными (./assets, ../assets)
Если указать URL (например: https://demo.very-good.ru/demo-sites/Gubsky-brick-new/) — добавится <base href="...">, и все assets будут искаться от этого пути

Без вопроса (CI/автоматизация):

```bash
BASE_HREF=https://demo.very-good.ru/demo-sites/Gubsky-brick-new/ npm run build:prod
```

## Примеры

```bash
# Сборка для локальной проверки
npm run build

# Финальная сборка, затем ввести базовый URL
npm run build:prod

# Финальная сборка с подсказкой примера URL
npm run build:prod:base
```

## Особенности сборщика

- Шаблоны: html/pages/** (Nunjucks)
- Компоненты/секции: html/components, html/sections
- Готовые HTML пишутся в корень проекта
- В production включена минификация HTML/CSS/JS

## Если что-то пошло не так

- Сборка упала на шаблоне — попробуй npm run build:continue
- Не видишь обновлений — запусти npm run clean и пересобери
- Сервер не стартует — проверь, что порт 3000 свободен
