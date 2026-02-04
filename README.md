# Новый проект

## Быстрый старт

```bash
npm install
npm start
```

Локальный сервер: http://localhost:3000

## Требования

- Node.js >= 14.0.0

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

npm run test:build         # проверить dev-сборку
npm run test:prod          # проверить production-сборку

```

## Куда пишется сборка

- `npm run build` — HTML в корень проекта (с сохранением подкаталогов из `html/pages/**`)
- `npm run build:prod` — HTML в `dist/`, статика копируется в `dist/assets/`

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
- В production `assets/` копируется в `dist/assets/` без `.scss` и `.map`

## Watch (отслеживание)

- Следит только за `html/**/*.html`
- Изменения в `assets/` не триггерят пересборку (файлы просто отдаются сервером)
- Если менялись `tasks/*.js`, перезапусти `npm start`

## Что делает clean

- Удаляет `dist/` целиком
- Удаляет сгенерированные `.html` в корне и в созданных подкаталогах
- Не трогает `html/`, `assets/`, `tasks/`, `node_modules/`

## Если что-то пошло не так

- Сборка упала на шаблоне — попробуй npm run build:continue
- Не видишь обновлений — запусти npm run clean и пересобери
- Сервер не стартует — проверь, что порт 3000 свободен
