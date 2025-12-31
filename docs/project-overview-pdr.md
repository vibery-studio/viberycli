# Vibery CLI - Project Overview & PDR

**Version:** 1.0.0
**Status:** Active Development
**Last Updated:** 2025-12-21

## Project Vision

Vibery CLI is a command-line tool for installing Claude Code templates with a focus on discoverability, speed, and ecosystem integration. It serves as the CLI component of the larger Vibery Kits ecosystem - a curated template platform.

**Core Utility:** One-command template installation for Claude Code projects.

**Phase 1 Status:** COMPLETE - Core CLI fully functional with 294 templates distributed via GitHub Releases.

## Functional Requirements

### F1: Template Installation

- Install templates by name: `vibery install <template-name>`
- Type-specific installation: `vibery install --agent <name>`, `vibery install --command <name>`, etc.
- Support 6 template types with distinct installation paths
- Provide installation feedback with usage hints
- Handle file overwrites with warnings

### F2: Template Discovery

- List all available templates: `vibery list`
- Filter by type: `vibery list -t agents`
- Full-text search: `vibery search <query>`
- Display template counts and descriptions
- Pretty-printed terminal output with colors/icons

### F3: Registry Management

- Load registry from JSON (600+ templates)
- Cache registry in memory (singleton pattern)
- Support multiple template categories (agents, commands, MCPs, skills, settings, hooks)
- Handle type normalization (singular/plural)

## Non-Functional Requirements

### Performance

- Registry load time: <100ms
- Search operation: <50ms for 600+ templates
- Installation copy operations: concurrent-safe

### Reliability

- Graceful error handling (file not found, permission errors)
- Proper exit codes (0 for success, 1 for failure)
- Validation of source/target paths before operations
- Backup warnings for overwrite scenarios

### Usability

- Clear, color-coded terminal output
- Contextual usage hints after installation
- Descriptive error messages
- Help text for all commands

### Maintainability

- Modular service architecture (Registry, Installer, Logger)
- Singleton pattern for shared state
- Async/await for I/O operations
- Minimal external dependencies (4 core deps)

## Architecture Overview

```
vibery (CLI)
├── bin/vibery.js          [Entry point, Commander.js]
├── src/commands/          [Command handlers]
│   ├── install.js         [Installation logic]
│   ├── list.js            [Template listing]
│   └── search.js          [Full-text search]
├── src/services/          [Business logic]
│   ├── registry.js        [Template catalog]
│   └── installer.js       [File operations]
└── src/utils/
    └── logger.js          [Terminal styling]
```

## Template Installation Paths

| Type    | Destination         | Format    | Merge? |
| ------- | ------------------- | --------- | ------ |
| agent   | `.claude/agents/`   | `.md`     | No     |
| command | `.claude/commands/` | `.md`     | No     |
| mcp     | `.mcp.json`         | JSON      | Yes    |
| skill   | `.claude/skills/`   | Directory | No     |
| setting | `.claude/`          | `.json`   | No     |
| hook    | `.claude/`          | `.json`   | No     |

**Special handling:**

- MCP: Merges into `.mcp.json` under `mcpServers` key
- Skill: Recursively copies entire directory
- Others: Copy single file to destination

## CLI Commands Specification

### `vibery install [template]`

```bash
vibery install prompt-engineer              # By name
vibery install --agent accessibility-tester # Type-specific
vibery install --agent auth-flow -d ./my-project  # Custom dir
```

Options:

- `-a, --agent <name>` - Install agent template
- `-c, --command <name>` - Install command template
- `-m, --mcp <name>` - Install MCP configuration
- `-s, --setting <name>` - Install Claude Code setting
- `-h, --hook <name>` - Install automation hook
- `-k, --skill <name>` - Install skill plugin
- `-d, --directory <path>` - Target directory (default: `.`)
- `-y, --yes` - Skip confirmation prompts

### `vibery list`

```bash
vibery list           # All templates with summary
vibery list -t agents # Only agents (60+ templates)
```

Output format: Category headers with icon, count, and paginated list.

### `vibery search <query>`

```bash
vibery search nextjs          # Name and description search
vibery search "auth" -t agent # Type-filtered search
```

Matches against template name and description (case-insensitive).

## Registry Structure

```json
{
  "version": "1.0.0",
  "source": "generated",
  "generated": "ISO8601 timestamp",
  "templates": {
    "agents": [
      {
        "name": "nextjs-architecture-expert",
        "path": "nextjs-architecture-expert.md",
        "description": "Next.js expert..."
      }
    ],
    "commands": [...],
    "mcps": [...],
    "hooks": [...],
    "settings": [...],
    "skills": []
  }
}
```

## Key Design Decisions

1. **Singleton Pattern:** Registry and Installer are module exports (singletons) to minimize memory footprint and ensure consistent state.

2. **Type-Based Dispatch:** Switch statement in `install.js` routes to specific installation handler based on template type.

3. **JSON Registry:** Static registry.json avoids external API calls; can be updated via build process.

4. **Lazy Loading:** Registry data cached after first load.

5. **Chalk for Styling:** Lightweight terminal color library; no heavy UI frameworks.

6. **Commander.js:** Minimal CLI parsing overhead; battle-tested in 1000s of npm packages.

## Dependencies

```json
{
  "chalk": "^4.1.2", // Terminal colors
  "commander": "^11.1.0", // CLI argument parsing
  "fs-extra": "^11.2.0", // Enhanced filesystem ops
  "ora": "^5.4.1" // Loading spinners
}
```

Total bundle size: ~2MB (node_modules).

## Error Handling Strategy

| Scenario            | Handling                   | Exit Code |
| ------------------- | -------------------------- | --------- |
| Template not found  | Log error + suggestion     | 1         |
| Invalid source path | Throw error + path logged  | 1         |
| Permission denied   | fs-extra catches, logged   | 1         |
| Already exists      | Warning logged, overwrites | 0         |
| Registry load fails | Throw error, full message  | 1         |

## Testing Strategy

- Unit tests: Service layer (registry, installer, logger)
- Integration tests: Command handlers with mock registry
- Manual testing: Full workflow per template type
- Regression: All 6 installation types after changes

## Deployment Model

**Distribution:** npm package (`vibery`) + GitHub Releases

- Published to npm registry
- `npm install -g vibery` for global CLI
- `npx vibery` for one-off usage
- Linked locally during development: `npm link`

**Template Distribution:**

- **Repository:** [vibery-studio/templates](https://github.com/vibery-studio/templates)
- **Format:** GitHub Releases with tarball (294 templates)
- **Contents:**
  - 220+ Agents (.md files)
  - 40+ Commands (.md files)
  - 25+ MCPs (JSON configs)
  - 8+ Settings (JSON configs)
  - 19+ Hooks (JSON configs)
  - 1+ Skill (directory structures)
- **Updates:** Semantic versioning (registry updates via npm patches + GitHub releases)

## Success Metrics

- Installation success rate: >99%
- Average install time: <2s
- Search latency: <100ms
- User satisfaction: Clear docs + helpful errors
- Adoption: Tracked via npm downloads

## Future Enhancements

1. **Stack Installation:** `vibery install --stack nextjs-production`
2. **Interactive Wizard:** Guided template selection
3. **Custom Registry:** Support private/custom template sources
4. **Auth:** User accounts for saved/favorite stacks
5. **Plugins:** Allow third-party template sources

## Acceptance Criteria

- All 6 template types install correctly
- Registry loads within 100ms
- Search finds results in <50ms
- No file overwrite without warning
- Error messages guide users to solutions
- Help text available for all commands
- Tested on macOS, Linux, Windows
