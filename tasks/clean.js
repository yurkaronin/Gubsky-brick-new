// tasks/clean.js
const fs = require('fs-extra');
const path = require('path');

async function clean() {
  const outputDir = path.join(__dirname, '..');
  const distDir = path.join(outputDir, 'dist');
  console.log('🧹 Очистка собранных файлов...\n');

  let cleanedCount = 0;
  let cleanedFolders = 0;

  try {
    const files = await fs.readdir(outputDir);

    // Удаляем dist целиком
    if (await fs.pathExists(distDir)) {
      await fs.remove(distDir);
      console.log('   📦 Удалена папка dist/');
    }

    for (const file of files) {
      const filePath = path.join(outputDir, file);

      try {
        const stat = await fs.stat(filePath);

        // Удаляем только HTML файлы в корне
        if (stat.isFile() && file.endsWith('.html') && file !== '.gitignore') {
          await fs.remove(filePath);
          console.log(`   📄 Удалён файл: ${file}`);
          cleanedCount++;
        }

        // Также очищаем папки, которые могли быть созданы для вложенных страниц
        if (stat.isDirectory() &&
            file !== 'html' &&
            file !== 'assets' &&
            file !== 'tasks' &&
            file !== 'node_modules' &&
            !file.startsWith('.')) {

          try {
            const subFiles = await fs.readdir(filePath);
            const htmlFiles = subFiles.filter(f => f.endsWith('.html'));

            if (htmlFiles.length > 0) {
              // Удаляем HTML файлы в папке
              for (const htmlFile of htmlFiles) {
                const htmlFilePath = path.join(filePath, htmlFile);
                await fs.remove(htmlFilePath);
                console.log(`   📄 Удалён файл: ${file}/${htmlFile}`);
                cleanedCount++;
              }

              // Проверяем, стала ли папка пустой
              const remainingFiles = await fs.readdir(filePath);
              if (remainingFiles.length === 0) {
                await fs.remove(filePath);
                console.log(`   📁 Удалена пустая папка: ${file}/`);
                cleanedFolders++;
              }
            }
          } catch (dirError) {
            // Игнорируем ошибки чтения папок
            if (process.env.DEBUG) {
              console.log(`   ⚠️  Пропущена папка ${file}: ${dirError.message}`);
            }
          }
        }
      } catch (error) {
        // Игнорируем ошибки доступа к некоторым файлам
        if (process.env.DEBUG) {
          console.log(`   ⚠️  Пропущен: ${file} (${error.message})`);
        }
      }
    }

    console.log('\n' + '='.repeat(40));
    if (cleanedCount === 0 && cleanedFolders === 0) {
      console.log('✅ Нет файлов для очистки');
    } else {
      console.log(`✅ Очистка завершена!`);
      if (cleanedCount > 0) {
        console.log(`   Удалено файлов: ${cleanedCount}`);
      }
      if (cleanedFolders > 0) {
        console.log(`   Удалено папок: ${cleanedFolders}`);
      }
    }
    console.log('='.repeat(40));

  } catch (error) {
    console.error('\n❌ Ошибка при очистке:');
    console.error(error.message);
    process.exit(1);
  }
}

// Запуск при прямом вызове
if (require.main === module) {
  clean().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('💥 Непредвиденная ошибка:', error);
    process.exit(1);
  });
}

module.exports = clean;
