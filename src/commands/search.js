const logger = require("../utils/logger");
const registry = require("../services/registry");

async function searchCommand(query, options) {
  try {
    if (!query || query.trim().length === 0) {
      logger.error("Please provide a search query");
      logger.info("Usage: vibe search <query>");
      process.exit(1);
    }

    const results = await registry.search(query, options.type);

    if (results.length === 0) {
      logger.warn(`No templates found matching: "${query}"`);
      logger.info(
        'Try a different search term or run "vibe list" to see all templates',
      );
      return;
    }

    logger.title(`🔍 Search Results for "${query}" (${results.length})`);

    // Group by type
    const grouped = {};
    results.forEach((tpl) => {
      const type = tpl.type + "s";
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(tpl);
    });

    // Display grouped results
    for (const [type, items] of Object.entries(grouped)) {
      console.log("");
      console.log(`  ${getIcon(type)} ${capitalize(type)}:`);
      items.forEach((tpl) => {
        logger.template(tpl.name, tpl.type, tpl.description);
      });
    }

    // Show usage hint
    console.log("");
    logger.subtitle("Install with: vibe install <template-name>");
  } catch (error) {
    logger.error(`Search failed: ${error.message}`);
    process.exit(1);
  }
}

function getIcon(type) {
  const icons = {
    agents: "🤖",
    commands: "⚡",
    mcps: "🔌",
    settings: "⚙️",
    hooks: "🪝",
    skills: "🎨",
  };
  return icons[type] || "📦";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = searchCommand;
