# Vibery CLI - Code Standards

**Version:** 1.0.0
**Last Updated:** 2025-12-21

## Architecture Patterns

### Singleton Pattern
Services (Registry, Installer, Logger) are exported as module singletons:

```javascript
// src/services/registry.js
class Registry { ... }
module.exports = new Registry();  // Singleton instance
```

Benefits: Single instance per process, shared state, memory efficient.

### Type-Based Dispatch
Install command uses switch statement for type-specific handling:

```javascript
// src/commands/install.js
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
```

Rationale: Clear separation of concerns; extensible for new types.

### Async/Await
All I/O operations use async/await for readability:

```javascript
const template = await registry.findTemplate(name, type);
const result = await installer.install(template, targetDir);
```

Non-async, non-I/O operations return synchronously.

## Directory Structure

```
src/
├── commands/              # CLI command handlers
│   ├── install.js         # vibery install
│   ├── list.js            # vibery list
│   └── search.js          # vibery search
├── services/              # Business logic (data/file ops)
│   ├── registry.js        # Template catalog queries
│   └── installer.js       # File system operations
└── utils/                 # Utilities
    └── logger.js          # Terminal styling
```

**File Naming:** kebab-case for files, camelCase for classes/functions.

## Coding Standards

### JavaScript Style
- ES6+ syntax (const/let, arrow functions, template literals)
- No semicolons (follow default style)
- 2-space indentation
- Max line length: 100 characters
- Comment complex logic; keep self-explanatory code

### Error Handling
- Use try/catch for async operations
- Return error objects: `{ success: false, error: message }`
- Log errors with context
- Never silently fail

```javascript
// Good
async install(template, targetDir) {
  try {
    const sourcePath = this.getSourcePath(template)
    const sourceExists = await fs.pathExists(sourcePath)
    if (!sourceExists) {
      throw new Error(`Template source not found: ${sourcePath}`)
    }
    // ... install logic
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### Function Signatures
Command handlers follow Commander.js convention:

```javascript
async installCommand(templateName, options) {
  // templateName: positional argument
  // options: object with CLI flags
}
```

### Constants & Configuration
Use objects for type mapping instead of magic strings:

```javascript
// Good
const typeToDir = {
  agent: '.claude/agents',
  command: '.claude/commands',
  mcp: '.claude/mcps',
  setting: '.claude',
  hook: '.claude',
  skill: '.claude/skills'
}

// Avoid
if (type === 'agent') { ... }
else if (type === 'command') { ... }
```

### Testing-Friendly Code
- Avoid hard-coded paths; use configurable defaults
- Inject dependencies where possible
- Keep service methods pure (same inputs = same outputs)

## Service Layer

### Registry Service
**File:** `src/services/registry.js`

```javascript
class Registry {
  async load()                     // Lazy load registry.json
  async getTemplates(type)         // Get all or filtered templates
  async findTemplate(name, type)   // Find by name in type(s)
  async search(query, type)        // Full-text search
  async getCounts()                // Get count per type
}
```

**Behavior:**
- Caches data in `this.data` after first load
- Type parameter normalized (singular/plural)
- Search is case-insensitive, matches name or description
- Returns array of templates with `type` field normalized

### Installer Service
**File:** `src/services/installer.js`

```javascript
class Installer {
  getTargetDir(type, targetDir)       // Map type to .claude path
  getSourcePath(template)              // Build source template path
  async install(template, targetDir)   // Install single file
  async installSkill(template, targetDir)  // Install directory
  async installMCP(template, targetDir)    // Merge to .mcp.json
}
```

**Behavior:**
- Validates source exists before copying
- Creates target directories
- Warns on overwrite
- MCP special: merges into existing .mcp.json

### Logger Utility
**File:** `src/utils/logger.js`

```javascript
logger.info(msg)         // Blue ℹ
logger.success(msg)      // Green ✓
logger.error(msg)        // Red ✗
logger.warn(msg)         // Yellow ⚠
logger.title(msg)        // Bold cyan with newlines
logger.template(...)     // Colored template display
logger.command(cmd)      // Command display with $
logger.box(title, content)  // Box drawing
```

## Command Layer

### Install Command
**File:** `src/commands/install.js`

Flow:
1. Determine template name from positional arg or type options
2. Find template in registry
3. Route to appropriate installer method
4. Display result + usage hint

### List Command
**File:** `src/commands/list.js`

Flow:
1. Get all templates and counts
2. Filter by type if specified
3. Display grouped by type with icons
4. Show installation hint

### Search Command
**File:** `src/commands/search.js`

Flow:
1. Validate query non-empty
2. Search registry
3. Group results by type
4. Display results or "not found" message

## Naming Conventions

### Variables
```javascript
// Template data
template, templates, foundTemplate

// Paths
sourcePath, targetPath, targetDir, targetDirPath

// Template-related
templateName, type, typeKey, typeDir

// Results
result, results, query

// UI/Display
spinner, icon, description, count, counts
```

### Function Names
```javascript
// Queries
getTemplates(), findTemplate(), getCounts()

// Operations
install(), installSkill(), installMCP()

// Utilities
getTargetDir(), getSourcePath()
```

## Type System Approach

No TypeScript yet. Types managed via JSDoc comments for complex signatures:

```javascript
/**
 * Install a template
 * @param {Object} template - Template object
 * @param {string} template.name - Template name
 * @param {string} template.type - Template type
 * @param {string} template.path - Source path
 * @param {string} targetDir - Target directory (default: '.')
 * @returns {Promise<{success: boolean, path: string, error: string}>}
 */
async install(template, targetDir = '.') { ... }
```

## Dependency Management

### Core Dependencies
- **chalk:** Terminal colors (lightweight, no tree-shaking issues)
- **commander:** CLI parsing (industry standard)
- **fs-extra:** Enhanced fs with promises (promisified methods)
- **ora:** Loading spinners (minimal, focused)

### No Dependencies For
- HTTP requests (not needed)
- Database (not needed)
- State management (simple module singletons sufficient)
- Frontend code (CLI only)

## Development Practices

### Debugging
```bash
# Run with verbose output
DEBUG=* vibery list

# Direct execution
node bin/vibery.js install test-name
```

### Local Testing
```bash
# Link locally
npm link

# Test in another project
vibery list
vibery install nextjs-architecture-expert
```

### Registry Updates
Update `registry.json` via external build process or GitHub Releases. Format:
```json
{
  "version": "1.0.0",
  "source": "vibery-studio/templates",
  "generated": "2025-12-21T...",
  "templates": { ... }
}
```

**Template Source:** [vibery-studio/templates](https://github.com/vibery-studio/templates) (294 templates via GitHub Releases)

## Performance Considerations

### Registry Caching
- First load: reads registry.json from disk (~50ms)
- Subsequent calls: return cached data (~0ms)
- No file watching; cache cleared on process exit

### Search Optimization
- Linear search (600 templates, ~30ms)
- Case-insensitive string includes (no regex)
- Early exit on match

### Installation
- Concurrent file copy safe (fs-extra handles)
- Overwrites warn but proceed (no blocking prompts)
- MCP merge: read, update, write (atomic-ish)

## Error Messages

Clear, actionable error messages:

```javascript
// Good: Specific path, suggests next step
logger.error('Template not found: auth-system')
logger.info('Run "vibe list" to see available templates')

// Good: Shows what was expected
logger.warn(`File already exists: ${targetPath}`)

// Avoid: Vague errors
logger.error('Error!')
```

## Security Considerations

### Input Validation
- Template name: alphanumeric + hyphens (registry match)
- Type: must match allowed list (registry keys)
- Directory paths: use path.join (prevent traversal)

### File Operations
- Check source exists before copy
- Warn before overwrite (user awareness)
- No eval or dynamic requires

## Git & Version Control

### Commit Messages
```
install: Add MCP merge logic
registry: Cache templates in memory
commands: Improve search filtering
```

Prefix with module name, brief description.

### Ignore Patterns
```
node_modules/
.env
dist/
coverage/
repomix-output.xml
```

## Future Refactoring Targets

1. **TypeScript Migration:** Safety and docs
2. **Dependency Injection:** Testability
3. **Configuration File:** .viberyrc for custom paths
4. **Plugin System:** Custom template sources
5. **Progress Reporting:** Real-time copy progress for large skills
