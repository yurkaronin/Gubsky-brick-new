const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');

// Очистка консоли
console.clear();

// Красивый заголовок
console.log('='.repeat(50));
console.log('🚀 HTML Сборщик - Режим разработки');
console.log('='.repeat(50) + '\n');

// Функция для вывода цветного текста
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// Переменная для отслеживания состояния завершения
let isShuttingDown = false;

// Функция запуска сборки с Promise
function runBuild() {
  return new Promise((resolve, reject) => {
    console.log('\n🏗️  Выполняю первоначальную сборку...');

    const build = spawn('node', [path.join(__dirname, 'build.js')], {
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, FORCE_COLOR: 'true' }
    });

    let output = '';
    let errorOutput = '';

    build.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });

    build.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      process.stderr.write(text);
    });

    build.on('close', (code) => {
      console.log('\n' + '-'.repeat(50));

      if (code === 0) {
        console.log(`${colors.green}✅ Сборка успешно завершена${colors.reset}\n`);
        resolve(true);
      } else {
        console.log(`${colors.red}❌ Сборка завершена с ошибкой (код: ${code})${colors.reset}\n`);

        if (errorOutput.includes('Папка html/pages/ не найдена')) {
          console.log(`${colors.yellow}💡 Решение: создайте папку html/pages/ и добавьте в неё HTML файлы${colors.reset}`);
        }

        resolve(false);
      }
    });

    build.on('error', (error) => {
      console.error(`${colors.red}💥 Ошибка запуска сборки:${colors.reset}`, error.message);
      reject(error);
    });
  });
}

// Основная функция
async function start() {
  try {
    // Запускаем сборку
    const buildSuccess = await runBuild();

    if (!buildSuccess) {
      console.log(`${colors.yellow}⚠️  Первоначальная сборка не удалась${colors.reset}`);
      console.log(`${colors.yellow}   Проверьте ошибки выше и исправьте их${colors.reset}`);
      console.log(`${colors.yellow}   Затем перезапустите сборщик: npm start${colors.reset}\n`);

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('Хотите продолжить несмотря на ошибки? (y/N): ', (answer) => {
        rl.close();
        if (answer.toLowerCase() === 'y') {
          console.log(`${colors.yellow}▶️  Продолжаю с ошибками...${colors.reset}\n`);
          startServices();
        } else {
          console.log(`${colors.blue}👋 Завершение работы${colors.reset}\n`);
          process.exit(1);
        }
      });

      return;
    }

    // Запускаем сервисы если сборка успешна
    startServices();

  } catch (error) {
    console.error(`${colors.red}💥 Критическая ошибка:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Переменные для дочерних процессов
let watcher = null;
let server = null;

// Запуск сервисов (watch и server)
function startServices() {
  console.log(`${colors.blue}🔄 Запуск сервисов...${colors.reset}\n`);

  // 1. Запуск отслеживания изменений
  console.log(`${colors.cyan}👀 Запускаю отслеживание изменений...${colors.reset}`);
  watcher = spawn('node', [path.join(__dirname, 'watch.js')], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, FORCE_COLOR: 'true' }
  });

  // 2. Запуск сервера
  console.log(`${colors.cyan}🌐 Запускаю локальный сервер...${colors.reset}`);
  server = spawn('npx', [
    'live-server',
    '.',
    '--port=3000',
    '--open',
    '--quiet',
    '--wait=100',
    '--no-browser'
  ], {
    stdio: 'inherit',
    shell: true
  });

  // Информация для разработчика
  console.log('\n' + '='.repeat(50));
  console.log(`${colors.green}✅ Сборщик запущен!${colors.reset}`);
  console.log('='.repeat(50));
  console.log(`${colors.cyan}📌 Локальный сервер:${colors.reset} http://localhost:3000`);
  console.log(`${colors.cyan}📌 Редактируйте файлы в папке:${colors.reset} html/`);
  console.log(`${colors.cyan}📌 Автосборка:${colors.reset} включена`);
  console.log(`${colors.cyan}📌 Для остановки:${colors.reset} Ctrl+C`);
  console.log('='.repeat(50) + '\n');

  // Обработка Ctrl+C
  process.on('SIGINT', () => {
    if (isShuttingDown) {
      console.log(`\n${colors.yellow}🛑 Принудительное завершение...${colors.reset}`);
      process.exit(1);
    }

    isShuttingDown = true;
    console.log(`\n${colors.yellow}🛑 Получен сигнал остановки...${colors.reset}`);
    gracefulShutdown();
  });

  // Обработка других сигналов завершения
  process.on('SIGTERM', () => {
    if (!isShuttingDown) {
      isShuttingDown = true;
      console.log(`\n${colors.yellow}🛑 Получен сигнал завершения...${colors.reset}`);
      gracefulShutdown();
    }
  });

  // Обработка ошибок в дочерних процессах
  watcher.on('error', (error) => {
    console.error(`${colors.red}❌ Ошибка в процессе отслеживания:${colors.reset}`, error.message);
  });

  server.on('error', (error) => {
    console.error(`${colors.red}❌ Ошибка в сервере:${colors.reset}`, error.message);
    console.log(`${colors.yellow}💡 Проверьте установлен ли live-server: npm install -g live-server${colors.reset}`);
  });

  // Мониторинг завершения процессов
  watcher.on('close', (code) => {
    if (code !== 0 && code !== null && !isShuttingDown) {
      console.log(`${colors.yellow}⚠️  Процесс отслеживания завершился с кодом ${code}${colors.reset}`);
    }
  });

  server.on('close', (code) => {
    if (code !== 0 && code !== null && !isShuttingDown) {
      console.log(`${colors.yellow}⚠️  Сервер завершился с кодом ${code}${colors.reset}`);
    }
  });
}

// Функция завершения процессов
const killProcess = (proc, name) => {
  return new Promise(resolve => {
    if (proc && !proc.killed) {
      console.log(`${colors.blue}   Останавливаю ${name}...${colors.reset}`);

      const timeout = setTimeout(() => {
        if (!proc.killed) {
          console.log(`${colors.yellow}   ⚠️  Принудительное завершение ${name}...${colors.reset}`);
          proc.kill('SIGKILL');
        }
      }, 3000);

      proc.on('close', () => {
        clearTimeout(timeout);
        console.log(`${colors.green}   ✅ ${name} остановлен${colors.reset}`);
        resolve();
      });

      proc.kill('SIGTERM');
    } else {
      resolve();
    }
  });
};

// Корректное завершение
async function gracefulShutdown() {
  try {
    await killProcess(watcher, 'отслеживание изменений');
    await killProcess(server, 'локальный сервер');

    console.log(`\n${colors.green}👋 Все сервисы остановлены. До свидания!${colors.reset}\n`);
    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}❌ Ошибка при завершении:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Глобальная обработка необработанных ошибок
process.on('uncaughtException', (error) => {
  console.error(`\n${colors.red}💥 Необработанная ошибка:${colors.reset}`);
  console.error(error.message);
  if (!isShuttingDown) {
    gracefulShutdown();
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`\n${colors.red}💥 Необработанный rejection:${colors.reset}`);
  console.error(reason);
  if (!isShuttingDown) {
    gracefulShutdown();
  }
});

// Запуск основной функции
start();
