const ora = require('ora');
const logger = require('../utils/logger');
const registry = require('../services/registry');
const installer = require('../services/installer');

async function installCommand(templateName, options) {
  const spinner = ora();

  try {
    const targetDir = options.directory || '.';

    // Set offline mode if specified
    if (options.offline) {
      registry.setOfflineMode(true);
      installer.setOfflineMode(true);
      logger.info('Running in offline mode');
    }

    // Handle stack installation
    if (options.stack) {
      await installStack(options.stack, targetDir, spinner);
      return;
    }

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
      logger.info('Usage: vibery install <template>');
      logger.info('       vibery install --agent <name>');
      logger.info('       vibery install --stack <name>');
      process.exit(1);
    }

    // Find the template
    spinner.start(`Looking for template: ${name}`);
    const template = await registry.findTemplate(name, type);

    if (!template) {
      spinner.fail(`Template not found: ${name}`);
      logger.info('Run "vibery list" to see available templates');
      process.exit(1);
    }

    spinner.text = `Installing ${template.type}: ${template.name}`;

    // Progress callback for downloads
    let lastProgress = 0;
    const onProgress = (downloaded, total) => {
      const progress = Math.floor((downloaded / total) * 100);
      if (progress > lastProgress + 10 || progress === 100) {
        spinner.text = `Downloading ${template.name}: ${progress}%`;
        lastProgress = progress;
      }
    };

    // Install based on type
    let result;

    switch (template.type) {
      case 'mcp':
        result = await installer.installMCP(template, targetDir);
        break;
      case 'skill':
        result = await installer.installSkill(template, targetDir, onProgress);
        break;
      default:
        result = await installer.install(template, targetDir, onProgress);
    }

    if (result.success) {
      const sourceLabel = result.source === 'remote' ? '(from remote)' : '(from bundled)';
      spinner.succeed(`Installed ${template.type}: ${template.name} ${sourceLabel}`);
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

async function installStack(stackName, targetDir, spinner) {
  spinner.start(`Looking for stack: ${stackName}`);

  const stack = await registry.findStack(stackName);

  if (!stack) {
    spinner.fail(`Stack not found: ${stackName}`);
    const stacks = await registry.getStacks();
    logger.info('\nAvailable stacks:');
    stacks.forEach(s => logger.info(`  • ${s.id} - ${s.name}`));
    process.exit(1);
  }

  spinner.succeed(`Found stack: ${stack.name}`);
  logger.info(`  ${stack.description}`);
  logger.info(`  Templates: ${stack.templates.length}`);
  console.log('');

  spinner.start(`Installing ${stack.templates.length} templates...`);

  const result = await installer.installStack(stack, registry, targetDir);

  if (result.installed.length > 0) {
    spinner.succeed(`Installed ${result.installed.length} templates:`);
    result.installed.forEach(t => {
      logger.info(`  ✓ ${t.type}: ${t.name}`);
    });
  }

  if (result.failed.length > 0) {
    console.log('');
    logger.warn(`Failed to install ${result.failed.length} templates:`);
    result.failed.forEach(t => {
      logger.error(`  ✗ ${t.type}: ${t.name} - ${t.error}`);
    });
  }

  console.log('');
  if (stack.credits) {
    logger.info(`Credits: ${stack.credits}`);
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
