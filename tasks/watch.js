// tasks\watch.js
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs-extra');

console.log('👀 Запуск отслеживания изменений...\n');

const watchPath = path.join(__dirname, '../html/**/*.html');
let isWatchingReady = false;

const watcher = chokidar.watch(watchPath, {
  ignored: /(^|[/\\])\../,
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 200,
    pollInterval: 100
  },
  usePolling: process.platform === 'win32', // Для Windows
  interval: 100
});

// Переменные для управления сборкой
let isBuilding = false;
let needsRebuild = false;
let lastChangedFile = '';
let changeCount = 0;
let errorCount = 0;
const maxErrorsBeforeStop = 10;

// Флаг завершения
let isShuttingDown = false;

async function runBuild() {
  if (isBuilding || isShuttingDown) {
    needsRebuild = true;
    return;
  }

  isBuilding = true;
  changeCount++;

  try {
    // Показываем какой файл изменился
    if (lastChangedFile) {
      const relativePath = path.relative(path.join(__dirname, '../html'), lastChangedFile);
      console.log(`📝 ${relativePath} изменён → сборка #${changeCount}`);
    }

    // Проверяем, существует ли еще build.js
    if (!await fs.pathExists(path.join(__dirname, 'build.js'))) {
      console.log('   ❌ Файл build.js не найден!');
      console.log('   💡 Перезапустите сборщик');
      return;
    }

    const buildModule = require('./build');
    const buildStart = Date.now();

    const success = await buildModule();
    const duration = ((Date.now() - buildStart) / 1000).toFixed(2);

    if (success) {
      console.log(`   ✅ Сборка завершена (${duration}с)\n`);
      errorCount = 0; // Сбрасываем счетчик ошибок при успешной сборке
    } else {
      console.log(`   ⚠️  Сборка завершена с ошибками (${duration}с)\n`);
      errorCount++;

      // Если слишком много ошибок подряд - предлагаем остановить
      if (errorCount >= maxErrorsBeforeStop) {
        console.log(`\n🚨 Слишком много ошибок подряд (${errorCount})!`);
        console.log('   Проверьте шаблоны и перезапустите сборщик.\n');
      }
    }

  } catch (error) {
    errorCount++;
    console.error('   ❌ Непредвиденная ошибка сборки:');
    console.error(`      ${error.message}`);

    if (errorCount >= maxErrorsBeforeStop) {
      console.log(`\n🚨 Критическая ошибка! Остановка отслеживания.`);
      console.log('   Перезапустите сборщик командой: npm start\n');
      gracefulShutdown();
    }
  } finally {
    isBuilding = false;

    // Если в процессе сборки были новые изменения
    if (needsRebuild && !isShuttingDown) {
      needsRebuild = false;
      setTimeout(runBuild, 300); // Даем время системе
    }
  }
}

// Обработчики событий файловой системы
watcher
  .on('ready', () => {
    isWatchingReady = true;
    console.log('✅ Отслеживание файлов запущено');
    console.log('📁 Отслеживается: html/**/*.html\n');
  })
  .on('change', (filePath) => {
    if (!isWatchingReady || isShuttingDown) return;

    lastChangedFile = filePath;
    runBuild();
  })
  .on('add', (filePath) => {
    if (!isWatchingReady || isShuttingDown) return;

    const relativePath = path.relative(path.join(__dirname, '../html'), filePath);
    console.log(`➕ Добавлен: ${relativePath} → сборка`);
    lastChangedFile = filePath;
    runBuild();
  })
  .on('unlink', (filePath) => {
    if (!isWatchingReady || isShuttingDown) return;

    const relativePath = path.relative(path.join(__dirname, '../html'), filePath);
    console.log(`➖ Удалён: ${relativePath} → сборка`);
    runBuild();
  })
  .on('error', (error) => {
    console.error('❌ Ошибка отслеживания файлов:');
    console.error(error.message);

    // Пытаемся перезапустить watching
    if (isWatchingReady && !isShuttingDown) {
      console.log('🔄 Попытка восстановить отслеживание...');
      setTimeout(() => {
        if (!isShuttingDown) {
          watcher.close().catch(() => {});
          watcher.add(watchPath);
        }
      }, 1000);
    }
  });

// Обработка сигналов завершения
process.on('SIGINT', () => {
  if (isShuttingDown) {
    console.log('\n🛑 Принудительное завершение...');
    process.exit(1);
  }
  console.log('\n👋 Получен сигнал остановки...');
  gracefulShutdown();
});

process.on('SIGTERM', () => {
  if (!isShuttingDown) {
    console.log('\n👋 Получен сигнал завершения...');
    gracefulShutdown();
  }
});

// Функция корректного завершения
async function gracefulShutdown() {
  if (isShuttingDown) return;

  isShuttingDown = true;
  console.log('🛑 Остановка отслеживания...');

  try {
    await watcher.close();
    console.log('✅ Отслеживание остановлено');
  } catch (error) {
    console.error('⚠️  Ошибка при остановке отслеживания:', error.message);
  }

  process.exit(0);
}

// Глобальная обработка необработанных ошибок
process.on('uncaughtException', (error) => {
  console.error('\n💥 Необработанная ошибка:');
  console.error(error.message);
  console.error(error.stack);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 Необработанный rejection:');
  console.error(reason);
  gracefulShutdown();
});
