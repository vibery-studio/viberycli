#!/usr/bin/env node

const { program } = require('commander');
const { version } = require('../package.json');

// Import commands
const installCommand = require('../src/commands/install');
const listCommand = require('../src/commands/list');
const searchCommand = require('../src/commands/search');
const cacheCommand = require('../src/commands/cache');
const kitCommand = require('../src/commands/kit');

program
  .name('vibery')
  .description('CLI tool for installing Claude Code templates')
  .version(version);

// Install command (individual templates, supports multiple)
program
  .command('install [templates...]')
  .description('Install one or more templates')
  .option('-a, --agent <name>', 'Install an agent template')
  .option('-c, --command <name>', 'Install a command template')
  .option('-m, --mcp <name>', 'Install an MCP template')
  .option('-s, --setting <name>', 'Install a setting template')
  .option('-h, --hook <name>', 'Install a hook template')
  .option('-k, --skill <name>', 'Install a skill template')
  .option('-g, --global', 'Install to ~/.claude/ (global) instead of ./.claude/ (project)')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('-d, --directory <path>', 'Target directory', '.')
  .option('-f, --force', 'Overwrite existing MCP servers')
  .option('-t, --target <platform>', 'Target platform for skills: claude (default) or antigravity')
  .option('--offline', 'Use cached/bundled templates only (no network)')
  .addHelpText('after', `
Examples:
  vibery install ai-engineer
  vibery install ai-engineer security-auditor
  vibery install --agent prompt-engineer
  vibery install --skill session-sync --global   # Install skill globally
  vibery install --agent ai-engineer --global    # Install agent globally
`)
  .action(installCommand);

// List command
program
  .command('list')
  .description('List all available templates')
  .option('-t, --type <type>', 'Filter by type (agents, commands, mcps, settings, hooks, skills)')
  .action(listCommand);

// Search command
program
  .command('search <query>')
  .description('Search for templates')
  .option('-t, --type <type>', 'Filter by type')
  .action(searchCommand);

// Cache command
program
  .command('cache <action>')
  .description('Manage template cache (clear, status)')
  .option('--registry', 'Only affect registry cache')
  .option('--archives', 'Only affect archives cache')
  .action(cacheCommand);

// Kit command
program
  .command('kit <action> [kits...]')
  .description('Manage Vibery kits (bundles of agents, commands, hooks, MCPs)')
  .option('--dry-run', 'Preview changes without applying')
  .addHelpText('after', `
Actions:
  list        List available kits
  installed   Show installed kits
  install     Install one or more kits
  uninstall   Uninstall a kit

Examples:
  vibery kit list
  vibery kit install astro-production
  vibery kit install astro-production supabase-stack
  vibery kit installed
  vibery kit uninstall astro-production
  vibery kit install astro-production --dry-run
`)
  .action(kitCommand);

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
