const ora = require('ora');
const logger = require('../utils/logger');
const registry = require('../services/registry');
const installer = require('../services/installer');

async function installCommand(templateName, options) {
  const spinner = ora();

  try {
    // Determine what to install
    let type = null;
    let name = templateName;

    // Check for explicit type options
    if (options.agent) {
      type = 'agent';
      name = options.agent;
    } else if (options.command) {
      type = 'command';
      name = options.command;
    } else if (options.mcp) {
      type = 'mcp';
      name = options.mcp;
    } else if (options.setting) {
      type = 'setting';
      name = options.setting;
    } else if (options.hook) {
      type = 'hook';
      name = options.hook;
    } else if (options.skill) {
      type = 'skill';
      name = options.skill;
    }

    if (!name) {
      logger.error('Please specify a template to install');
      logger.info('Usage: vibe install <template>');
      logger.info('       vibe install --agent <name>');
      process.exit(1);
    }

    // Find the template
    spinner.start(`Looking for template: ${name}`);
    const template = await registry.findTemplate(name, type);

    if (!template) {
      spinner.fail(`Template not found: ${name}`);
      logger.info('Run "vibe list" to see available templates');
      process.exit(1);
    }

    spinner.text = `Installing ${template.type}: ${template.name}`;

    // Install based on type
    let result;
    const targetDir = options.directory || '.';

    switch (template.type) {
      case 'mcp':
        result = await installer.installMCP(template, targetDir);
        break;
      case 'skill':
        result = await installer.installSkill(template, targetDir);
        break;
      default:
        result = await installer.install(template, targetDir);
    }

    if (result.success) {
      spinner.succeed(`Installed ${template.type}: ${template.name}`);
      logger.info(`  → ${result.path}`);

      // Show usage hint
      showUsageHint(template);
    } else {
      spinner.fail(`Failed to install: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    spinner.fail(`Error: ${error.message}`);
    process.exit(1);
  }
}

function showUsageHint(template) {
  console.log('');
  switch (template.type) {
    case 'agent':
      logger.info('Use this agent by mentioning it in Claude Code');
      break;
    case 'command':
      logger.info(`Run with: /${template.name.replace('.md', '')}`);
      break;
    case 'mcp':
      logger.info('Restart Claude Code to activate this MCP');
      break;
    case 'setting':
      logger.info('Settings will be applied on next Claude Code restart');
      break;
    case 'hook':
      logger.info('Hook will trigger on matching tool use');
      break;
    case 'skill':
      logger.info('Skill is ready to use in your project');
      break;
  }
}

module.exports = installCommand;
