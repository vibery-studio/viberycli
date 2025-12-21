const logger = require('../utils/logger');
const registry = require('../services/registry');

async function listCommand(options) {
  try {
    const templates = await registry.getTemplates();
    const counts = await registry.getCounts();

    // Filter by type if specified
    const filterType = options.type;

    if (filterType) {
      const typeKey = filterType.endsWith('s') ? filterType : `${filterType}s`;
      const typeTemplates = templates[typeKey];

      if (!typeTemplates || typeTemplates.length === 0) {
        logger.warn(`No templates found for type: ${filterType}`);
        return;
      }

      logger.title(`${getIcon(typeKey)} ${capitalize(typeKey)} (${typeTemplates.length})`);
      typeTemplates.forEach(tpl => {
        logger.template(tpl.name, typeKey.replace(/s$/, ''), tpl.description);
      });
    } else {
      // Show all types
      logger.title('📦 Available Templates');

      // Show summary
      console.log('');
      Object.entries(counts).forEach(([type, count]) => {
        const icon = getIcon(type);
        console.log(`  ${icon} ${capitalize(type)}: ${count}`);
      });
      console.log('');

      // Show each type
      for (const [type, items] of Object.entries(templates)) {
        if (items && items.length > 0) {
          logger.title(`${getIcon(type)} ${capitalize(type)} (${items.length})`);
          items.forEach(tpl => {
            logger.template(tpl.name, type.replace(/s$/, ''), tpl.description);
          });
        }
      }
    }

    // Show usage hint
    console.log('');
    logger.subtitle('Install with: vibe install <template-name>');
  } catch (error) {
    logger.error(`Failed to list templates: ${error.message}`);
    process.exit(1);
  }
}

function getIcon(type) {
  const icons = {
    agents: '🤖',
    commands: '⚡',
    mcps: '🔌',
    settings: '⚙️',
    hooks: '🪝',
    skills: '🎨'
  };
  return icons[type] || '📦';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = listCommand;
