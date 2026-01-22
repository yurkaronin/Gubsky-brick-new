const fs = require('fs-extra');
const path = require('path');
const nunjucks = require('nunjucks');
const { minify } = require('html-minifier-terser');

async function build() {
  const startTime = Date.now();
  const htmlDir = path.join(__dirname, '../html');
  const pagesDir = path.join(htmlDir, 'pages');
  const outputDir = path.join(__dirname, '..');

  // Определяем режим сборки
  const isProduction = process.env.NODE_ENV === 'production';

  // Показываем правильное сообщение о запуске
  console.log(isProduction
    ? '🚀 Запуск PRODUCTION сборки...\n'
    : '🚀 Запуск DEVELOPMENT сборки...\n');

  try {
    // Проверяем существование папки с страницами
    if (!await fs.pathExists(pagesDir)) {
      console.log('❌ Папка html/pages/ не найдена');
      console.log('💡 Создайте папку html/pages/ и добавьте HTML файлы');
      return false;
    }

    // Очищаем старые HTML файлы (кроме папки html/)
    console.log('🧹 Очистка старых HTML файлов...');
    const files = await fs.readdir(outputDir);
    let cleanedCount = 0;

    for (const file of files) {
      const filePath = path.join(outputDir, file);

      try {
        const stat = await fs.stat(filePath);

        // Удаляем только HTML файлы в корне (не папки и не файлы в html/)
        if (stat.isFile() && file.endsWith('.html') && file !== '.gitignore') {
          await fs.remove(filePath);
          console.log(`   Удалён: ${file}`);
          cleanedCount++;
        }

        // Также удаляем пустые папки, созданные для вложенных страниц
        if (stat.isDirectory() && file !== 'html' && file !== 'assets' &&
            file !== 'tasks' && file !== 'node_modules' && !file.startsWith('.')) {

          try {
            const dirFiles = await fs.readdir(filePath);
            const htmlFiles = dirFiles.filter(f => f.endsWith('.html'));

            if (htmlFiles.length > 0) {
              // Удаляем HTML файлы в папке
              for (const htmlFile of htmlFiles) {
                await fs.remove(path.join(filePath, htmlFile));
              }
              console.log(`   Удалено ${htmlFiles.length} файлов из папки ${file}/`);
              cleanedCount += htmlFiles.length;

              // Проверяем, стала ли папка пустой
              const remainingFiles = await fs.readdir(filePath);
              if (remainingFiles.length === 0) {
                await fs.remove(filePath);
                console.log(`   Удалена пустая папка: ${file}/`);
              }
            }
          } catch (dirError) {
            // Игнорируем ошибки чтения папок
          }
        }
      } catch (error) {
        // Игнорируем ошибки доступа к некоторым файлам
        if (process.env.DEBUG) {
          console.log(`   Пропущен: ${file} (${error.message})`);
        }
      }
    }

    if (cleanedCount === 0) {
      console.log('   Нет файлов для очистки');
    }

    // Настраиваем Nunjucks с пользовательскими фильтрами для правильных путей
    const env = nunjucks.configure(htmlDir, {
      autoescape: false,
      trimBlocks: true,
      lstripBlocks: true,
      noCache: !isProduction,
      watch: false
    });

    // Глобальные переменные для шаблонов
    env.addGlobal('assets', '/assets'); // Абсолютный путь лучше
    env.addGlobal('isProduction', isProduction);
    env.addGlobal('timestamp', Date.now());

    // Фильтр для нормализации путей (исправляет двойные слеши)
    env.addFilter('cleanpath', function(path) {
      if (!path) return path;
      // Убираем двойные слеши, но сохраняем протокол http:// или https://
      return path.replace(/([^:])\/\//g, '$1/');
    });

    // Фильтр для добавления хэша к ресурсам в production
    env.addFilter('cachebuster', function(url) {
      if (!isProduction || !url) return url;
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}v=${Date.now()}`;
    });

    // Фильтр для вычисления относительного пути к assets
    env.addFilter('relassets', function() {
      // В шаблонах используйте: {{ ''|relassets }}
      // Вернет относительный путь к assets в зависимости от вложенности
      const depth = this.ctx._parent && this.ctx._parent._depth || 0;
      return '../'.repeat(depth) + 'assets';
    });

    const pages = [];

    // Рекурсивный поиск HTML файлов
    async function findHTMLFiles(dir) {
      const items = await fs.readdir(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
          await findHTMLFiles(fullPath);
        } else if (item.isFile() && item.name.endsWith('.html')) {
          pages.push(fullPath);
        }
      }
    }

    await findHTMLFiles(pagesDir);

    if (pages.length === 0) {
      console.log('⚠️  HTML страниц не найдено');
      console.log('💡 Добавьте HTML файлы в папку html/pages/');
      return false;
    }

    console.log(`📄 Найдено ${pages.length} страниц для сборки`);
    console.log(isProduction ? '📦 Режим: Production (минификация включена)' : '🔧 Режим: Development');
    console.log('');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Обрабатываем каждую страницу
    for (const pageFile of pages) {
      const pageName = path.basename(pageFile, '.html');

      // Сохраняем структуру подпапок
      const relativeToPages = path.relative(pagesDir, pageFile);
      const subDir = path.dirname(relativeToPages);

      // Создаем путь для сохранения
      const outputPath = subDir !== '.'
        ? path.join(outputDir, subDir, pageName === 'index' ? 'index.html' : `${pageName}.html`)
        : path.join(outputDir, pageName === 'index' ? 'index.html' : `${pageName}.html`);

      try {
        // Получаем относительный путь для Nunjucks
        const relativePath = path.relative(htmlDir, pageFile).replace(/\\/g, '/');

        // Создаем контекст с информацией о глубине вложенности
        const context = {
          _depth: subDir === '.' ? 0 : subDir.split('/').length
        };

        // Рендерим шаблон с контекстом
        const html = env.render(relativePath, context);

        // Минифицируем в production режиме
        let finalHtml = html;
        if (isProduction) {
          try {
            finalHtml = await minify(html, {
              collapseWhitespace: true,
              collapseBooleanAttributes: true,
              collapseInlineTagWhitespace: true,
              removeComments: true,
              removeEmptyAttributes: true,
              removeEmptyElements: false,
              removeRedundantAttributes: true,
              removeScriptTypeAttributes: true,
              removeStyleLinkTypeAttributes: true,
              removeTagWhitespace: true,
              useShortDoctype: true,
              minifyCSS: {
                level: 2
              },
              minifyJS: {
                compress: {
                  drop_console: true
                },
                mangle: true
              },
              conservativeCollapse: false,
              preserveLineBreaks: false,
              caseSensitive: false,
              continueOnParseError: true,
              decodeEntities: true,
              html5: true,
              keepClosingSlash: false,
              preventAttributesEscaping: false,
              processConditionalComments: true,
              processScripts: ["text/html"],
              quoteCharacter: '"',
              removeAttributeQuotes: true,
              removeOptionalTags: true,
              sortAttributes: true,
              sortClassName: true,
              trimCustomFragments: true
            });
          } catch (minifyError) {
            console.log(`   ⚠️  Ошибка минификации ${relativePath}: ${minifyError.message}`);
            // Пробуем более простую минификацию
            try {
              finalHtml = await minify(html, {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true,
                minifyCSS: true,
                minifyJS: true
              });
            } catch (simpleMinifyError) {
              console.log(`   ⚠️  Простая минификация тоже не удалась, продолжаю без минификации`);
              finalHtml = html;
            }
          }
        }

        // Исправляем возможные двойные слеши в путях (после минификации)
        finalHtml = finalHtml.replace(/([^:])\/\//g, '$1/');

        // Создаем папки если их нет
        await fs.ensureDir(path.dirname(outputPath));

        // Сохраняем файл
        await fs.writeFile(outputPath, finalHtml);

        // Показываем путь сохранения
        const relativeOutput = path.relative(outputDir, outputPath);
        const originalSize = Buffer.byteLength(html, 'utf8');
        const minifiedSize = Buffer.byteLength(finalHtml, 'utf8');
        const savings = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize * 100).toFixed(1) : 0;

        console.log(`   ✅ ${relativePath} → ${relativeOutput}`);
        if (isProduction && originalSize > 0 && minifiedSize > 0) {
          console.log(`      Размер: ${(minifiedSize / 1024).toFixed(2)} KB (экономия: ${savings}%)`);
        } else {
          console.log(`      Размер: ${(minifiedSize / 1024).toFixed(2)} KB`);
        }

        successCount++;

      } catch (error) {
        errorCount++;
        const relativePath = path.relative(pagesDir, pageFile);
        errors.push({
          file: pageName,
          path: relativePath,
          error: error.message
        });

        console.log(`   ❌ Ошибка в ${relativePath}:`);
        console.log(`      ${error.message}`);

        // Показываем больше деталей для отладки
        if (error.stack && error.message.includes('Template render error')) {
          const lines = error.stack.split('\n');
          if (lines[1]) {
            console.log(`      ${lines[1].trim()}`);
          }
        }
      }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Выводим итоговый результат
    console.log('\n' + '='.repeat(50));
    if (errorCount === 0 && successCount > 0) {
      console.log(`✅ Успешно собрано ${successCount} страниц (${duration}с)`);
      if (isProduction) {
        console.log('📦 Все файлы минифицированы');
      }
      return true;
    } else if (successCount > 0) {
      console.log(`⚠️  Собрано ${successCount} страниц, ошибок: ${errorCount} (${duration}с)`);
      if (errors.length > 0) {
        console.log('\nДетали ошибок:');
        errors.forEach((err, index) => {
          console.log(`  ${index + 1}. ${err.path}: ${err.error}`);
        });
      }
      return false;
    } else {
      console.log('❌ Не удалось собрать ни одной страницы');
      if (errors.length > 0) {
        console.log('\nОшибки:');
        errors.forEach((err, index) => {
          console.log(`  ${index + 1}. ${err.path}: ${err.error}`);
        });
      }
      return false;
    }

  } catch (error) {
    console.error('\n💥 Критическая ошибка сборки:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nСтек вызовов:');
      const stackLines = error.stack.split('\n').slice(0, 5);
      stackLines.forEach(line => console.error(line));
    }
    return false;
  }
}

// Запуск при прямом вызове
if (require.main === module) {
  // Парсим аргументы командной строки
  const args = process.argv.slice(2);
  const isProdArg = args.includes('--prod') || args.includes('production');

  if (isProdArg) {
    process.env.NODE_ENV = 'production';
  }

  // Запускаем сборку
  build().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 Непредвиденная ошибка:', error);
    process.exit(1);
  });
}

module.exports = build;
