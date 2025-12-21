const ora = require('ora');
const logger = require('../utils/logger');
const cacheManager = require('../services/cache-manager');

async function cacheCommand(action, options) {
  const spinner = ora();

  try {
    switch (action) {
      case 'clear':
        await clearCache(spinner, options);
        break;

      case 'status':
        await showCacheStatus(spinner);
        break;

      default:
        logger.error(`Unknown cache action: ${action}`);
        logger.info('Usage: vibery cache <clear|status>');
        process.exit(1);
    }
  } catch (error) {
    spinner.fail(`Error: ${error.message}`);
    process.exit(1);
  }
}

async function clearCache(spinner, options) {
  spinner.start('Clearing cache...');

  let result;

  if (options.registry) {
    result = await cacheManager.clearRegistry();
  } else if (options.archives) {
    result = await cacheManager.clearArchives();
  } else {
    result = await cacheManager.clearAll();
  }

  if (result.success) {
    spinner.succeed(result.message);
  } else {
    spinner.fail(result.message);
    process.exit(1);
  }
}

async function showCacheStatus(spinner) {
  spinner.start('Checking cache...');

  const stats = await cacheManager.getStats();

  spinner.stop();

  logger.title('Cache Status');
  logger.info(`Location: ${stats.cacheDir}`);
  console.log('');

  logger.subtitle('Registry Cache:');
  if (stats.registryCache.exists) {
    const validLabel = stats.registryCache.valid ? '✓ Valid' : '✗ Expired';
    logger.info(`  Status: ${validLabel}`);
    logger.info(`  Age: ${stats.registryCache.age} minutes`);
    logger.info(`  Size: ${formatBytes(stats.registryCache.size)}`);
  } else {
    logger.info('  Status: Not cached');
  }
  console.log('');

  logger.subtitle('Template Archives:');
  logger.info(`  Count: ${stats.archives.count} files`);
  logger.info(`  Total Size: ${formatBytes(stats.archives.totalSize)}`);

  if (stats.archives.files.length > 0) {
    console.log('');
    logger.subtitle('Cached Files:');
    stats.archives.files.forEach(file => {
      logger.info(`  • ${file.name} (${formatBytes(file.size)})`);
    });
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

module.exports = cacheCommand;
