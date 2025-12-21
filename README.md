# Vibery CLI

Fast template installation for Claude Code. Install agents, commands, MCPs, settings, hooks, and skills with one command.

```bash
npm install -g vibery
vibery install nextjs-architecture-expert
```

## Quick Start

### Installation

```bash
# Global install
npm install -g vibery

# Or use npx (no install)
npx vibery list
```

### Usage

```bash
# Install by template name
vibery install prompt-engineer

# Install by type
vibery install --agent nextjs-architect
vibery install --command add-authentication-system
vibery install --mcp github
vibery install --skill my-research-skill

# List all templates
vibery list

# Filter by type
vibery list -t agents

# Search templates
vibery search "database"
```

## Commands

### `vibery install [template]`

Install a Claude Code template to your project.

**Options:**
- `-a, --agent <name>` - Install agent template
- `-c, --command <name>` - Install command template
- `-m, --mcp <name>` - Install MCP integration
- `-s, --setting <name>` - Install Claude Code setting
- `-h, --hook <name>` - Install automation hook
- `-k, --skill <name>` - Install skill plugin
- `-d, --directory <path>` - Target directory (default: current)
- `-y, --yes` - Skip confirmation prompts

**Examples:**
```bash
vibery install nextjs-architecture-expert
vibery install --agent accessibility-tester
vibery install --mcp supabase -d /path/to/project
vibery install --skill research-analyzer
```

**Installation Destinations:**
- Agents → `.claude/agents/`
- Commands → `.claude/commands/`
- MCPs → `.mcp.json` (merged)
- Settings → `.claude/`
- Hooks → `.claude/`
- Skills → `.claude/skills/`

After installation, restart Claude Code to activate new templates.

### `vibery list`

List all available templates with counts and descriptions.

**Options:**
- `-t, --type <type>` - Filter by type (agents, commands, mcps, settings, hooks, skills)

**Examples:**
```bash
vibery list                 # Show all with summary
vibery list -t agents       # Only agents
vibery list --type commands # Only commands
```

### `vibery search <query>`

Search templates by name or description (case-insensitive).

**Options:**
- `-t, --type <type>` - Filter search results by type

**Examples:**
```bash
vibery search nextjs
vibery search "database" -t agents
vibery search "auth" --type commands
```

## Template Types

| Type | Icon | Destination | Use Case |
|------|------|-------------|----------|
| Agent | 🤖 | `.claude/agents/` | Specialized AI roles (e.g., "Next.js Expert") |
| Command | ⚡ | `.claude/commands/` | Automated tasks (e.g., "Setup CI/CD") |
| MCP | 🔌 | `.mcp.json` | Tool integrations (GitHub, Slack, etc.) |
| Skill | 🎨 | `.claude/skills/` | Reusable code packages |
| Setting | ⚙️ | `.claude/` | Configuration and preferences |
| Hook | 🪝 | `.claude/` | Automation rules (notifications, checks) |

## Examples

### Install Production Stack
```bash
# Next.js architecture expert
vibery install nextjs-architecture-expert

# Git workflow manager
vibery install git-workflow-manager

# Security auditor
vibery install security-auditor
```

### Install Development Tools
```bash
# Database optimizer
vibery install database-optimizer

# Performance engineer
vibery install performance-engineer

# Test automation
vibery install test-automator
```

### Install Integrations
```bash
# GitHub MCP
vibery install --mcp github

# Slack notifications hook
vibery install --hook slack-notifications

# PostgreSQL setup
vibery install --setting allow-postgres
```

## Architecture

**Services:**
- **Registry:** Loads and searches 600+ templates
- **Installer:** Handles type-specific file operations
- **Logger:** Terminal styling and output

**Data:**
- Registry stored in `registry.json` (static, 600+ templates)
- Templates sourced from `/templates/` directory
- Installation paths configured per type

**Design:**
- Minimal dependencies (4 packages)
- Singleton services for efficiency
- Type-based dispatch for installation
- Offline-first, no network calls

## Documentation

- **Project Overview:** `docs/project-overview-pdr.md` - Vision, requirements, PDR
- **Code Standards:** `docs/code-standards.md` - Patterns, conventions, best practices
- **Architecture:** `docs/system-architecture.md` - Design diagrams, data flows, scalability
- **Codebase:** `docs/codebase-summary.md` - File breakdown, execution flows

## Development

### Setup

```bash
git clone <repo>
cd cli
npm install
npm link  # Link globally for testing
```

### Testing

```bash
vibery list
vibery install nextjs-architecture-expert
vibery search agent
```

### File Structure

```
src/
├── commands/         # CLI handlers (install, list, search)
├── services/         # Business logic (registry, installer)
└── utils/           # Helpers (logger)
```

## Performance

- **Registry load:** ~50ms (cached)
- **Search:** <50ms for 600+ templates
- **Install:** <1s for agents/commands, 1-5s for skills
- **Memory:** ~1MB (registry in RAM)

## Compatibility

- **Node.js:** 14+
- **OS:** macOS, Linux, Windows
- **Shell:** bash, zsh, PowerShell, cmd

## Dependencies

- `chalk` - Terminal colors
- `commander` - CLI argument parsing
- `fs-extra` - Enhanced filesystem operations
- `ora` - Loading spinners

## Contributing

1. Fork repository
2. Create feature branch
3. Update `registry.json` for new templates
4. Test all template types
5. Submit pull request

## Changelog

### v1.0.0 (2025-12-21)
- Initial release
- Support for 6 template types
- 600+ templates in registry
- Full-text search
- Color-coded terminal output

## License

MIT

## Support

For issues, questions, or template suggestions:
- Check `vibery list` for available templates
- Run `vibery search <query>` to find templates
- See docs/ for detailed documentation

---

**Part of Vibery Kits** - A curated template ecosystem for Claude Code.
