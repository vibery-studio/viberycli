# Vibery CLI Documentation Index

**Last Updated:** 2025-12-21

Complete documentation for the Vibery CLI project. All files optimized for quick reference and AI consumption.

## Documentation Structure

### Quick Start
- **[../README.md](../README.md)** (280 lines)
  - User-facing guide
  - Installation and usage examples
  - Command reference
  - Template types and destinations
  - Quick troubleshooting

### For Product Managers & Architects
- **[project-overview-pdr.md](project-overview-pdr.md)** (229 lines)
  - Project vision and goals
  - Functional requirements (F1-F3)
  - Non-functional requirements (NF1-NF4)
  - Architecture overview
  - Success metrics and acceptance criteria
  - Deployment and scaling considerations

### For Developers
- **[code-standards.md](code-standards.md)** (379 lines)
  - Architecture patterns (singleton, dispatch, async)
  - Directory structure and organization
  - Naming conventions
  - Error handling standards
  - Service layer breakdown
  - Command layer design
  - Type system approach (JSDoc)
  - Development practices

### For System Designers
- **[system-architecture.md](system-architecture.md)** (476 lines)
  - ASCII architecture diagram
  - Component details and responsibilities
  - Data flow diagrams (install, registry, search)
  - Dependency tree
  - Scalability analysis
  - Performance bottlenecks
  - Security model
  - Testing strategy

### For Onboarding
- **[codebase-summary.md](codebase-summary.md)** (429 lines)
  - Complete file breakdown (all 12 files)
  - Code statistics and metrics
  - Execution flow walkthrough
  - State management overview
  - Performance profile
  - Testing coverage assessment
  - Next steps for development

## Quick Navigation

### By Role

**I'm a user:**
→ Read [../README.md](../README.md)

**I'm a developer adding features:**
→ Read [code-standards.md](code-standards.md) then [codebase-summary.md](codebase-summary.md)

**I'm reviewing architecture:**
→ Read [system-architecture.md](system-architecture.md)

**I'm new to the project:**
→ Read [codebase-summary.md](codebase-summary.md) then [code-standards.md](code-standards.md)

**I'm evaluating the product:**
→ Read [project-overview-pdr.md](project-overview-pdr.md)

### By Topic

**Installation & Getting Started**
→ [../README.md](../README.md) - Quick Start section

**CLI Commands**
→ [../README.md](../README.md) - Commands section
→ [project-overview-pdr.md](project-overview-pdr.md) - CLI Commands Specification

**Template Types**
→ [../README.md](../README.md) - Template Types table
→ [project-overview-pdr.md](project-overview-pdr.md) - Template Installation Paths

**Architecture & Design**
→ [system-architecture.md](system-architecture.md) - Complete architecture
→ [code-standards.md](code-standards.md) - Design patterns

**Code Standards**
→ [code-standards.md](code-standards.md) - Conventions and patterns
→ [codebase-summary.md](codebase-summary.md) - Actual implementation

**Performance**
→ [system-architecture.md](system-architecture.md) - Performance Bottlenecks
→ [codebase-summary.md](codebase-summary.md) - Performance Profile

**Security**
→ [code-standards.md](code-standards.md) - Security Considerations
→ [system-architecture.md](system-architecture.md) - Security Model

**Testing**
→ [code-standards.md](code-standards.md) - Testing Strategy
→ [system-architecture.md](system-architecture.md) - Testing Architecture
→ [codebase-summary.md](codebase-summary.md) - Testing Coverage

**Development Setup**
→ [../README.md](../README.md) - Development section
→ [codebase-summary.md](codebase-summary.md) - Build & Deployment

## Documentation Statistics

| Document | Lines | Focus | Audience |
|----------|-------|-------|----------|
| project-overview-pdr.md | 229 | Vision, requirements, PDR | Architects, PMs |
| code-standards.md | 379 | Patterns, conventions | Developers |
| system-architecture.md | 476 | Design, diagrams | Designers, leads |
| codebase-summary.md | 429 | File breakdown, execution | Onboarding, reviewers |
| ../README.md | 258 | Usage, examples | End users |
| **TOTAL** | **1,771** | Comprehensive | All audiences |

## Key Concepts

### Template Types
```
Agent (🤖)     → .claude/agents/
Command (⚡)   → .claude/commands/
MCP (🔌)       → .mcp.json (merged)
Setting (⚙️)   → .claude/
Hook (🪝)      → .claude/
Skill (🎨)     → .claude/skills/
```

### Core Services
- **Registry** - Loads and searches 600+ templates (singleton)
- **Installer** - Type-specific file operations (singleton)
- **Logger** - Terminal styling and output (utility)

### Main Commands
- `vibery install [template]` - Install templates
- `vibery list [-t type]` - List templates
- `vibery search <query>` - Search templates

### Key Files
```
src/commands/
├── install.js      Install handler (109 lines)
├── list.js         List handler (74 lines)
└── search.js       Search handler (67 lines)

src/services/
├── registry.js     Template catalog (91 lines)
└── installer.js    File operations (168 lines)

src/utils/
└── logger.js       Terminal styling (57 lines)
```

## Updates & Maintenance

### When to Update Docs

1. **New Template Type:** Update `project-overview-pdr.md` Template Installation Paths
2. **New CLI Command:** Update `README.md` and `system-architecture.md`
3. **Architecture Change:** Update `system-architecture.md` first
4. **Code Pattern Change:** Update `code-standards.md`
5. **File Organization:** Update `codebase-summary.md`

### Documentation Sync Checklist

- [ ] README.md matches actual commands
- [ ] Code standards reflect actual patterns in use
- [ ] Architecture diagrams match source code
- [ ] Codebase summary has current file sizes/line counts
- [ ] All code examples compile/run
- [ ] All paths are absolute and correct
- [ ] All cross-references link correctly

## Common Searches

**Finding [X]:**

- Files in project → `codebase-summary.md` - Directory Structure
- How services work → `system-architecture.md` - Component Details
- Naming conventions → `code-standards.md` - Naming Conventions
- Error handling → `code-standards.md` - Error Handling
- Performance info → `system-architecture.md` - Performance Bottlenecks
- Security notes → `code-standards.md` - Security Considerations
- Installation process → `system-architecture.md` - Install Command Flow

## Related Documentation

**Parent Project:** [/Applications/MAMP/htdocs/vibe-templates/](../../../vibe-templates/)
- Website documentation (Astro + Vue)
- Template standards
- Project-wide CLAUDE.md

**CLI Root:** [/Applications/MAMP/htdocs/vibe-templates/cli/](../)
- README.md - User guide
- package.json - Dependencies
- registry.json - Template catalog
- bin/vibery.js - CLI entry point

## Questions?

**Q: Where do I start?**
A: Read [../README.md](../README.md) first, then [codebase-summary.md](codebase-summary.md)

**Q: How do I add a new feature?**
A: Check [code-standards.md](code-standards.md) for patterns, then [codebase-summary.md](codebase-summary.md) for file locations

**Q: What's the architecture?**
A: See [system-architecture.md](system-architecture.md) for diagrams and data flows

**Q: Why is [X] designed that way?**
A: Check [project-overview-pdr.md](project-overview-pdr.md) Key Design Decisions section

**Q: How do I find [specific topic]?**
A: See "Common Searches" section above

---

**Documentation Status:** Complete
**Last Validation:** 2025-12-21
**Maintainer:** docs-manager agent
