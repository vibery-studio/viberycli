# Changelog

## [1.4.0] - 2025-12-22

### Fixed

- **Kit installer bundling**: Fixed "Kit installer not found" error when using `npx vibery kit install`
  - Bundled Python installer script (`scripts/install.py`) with npm package
  - Bundled `stacks/` directory containing all kit definitions
  - Updated installer path resolution to work with npm-installed package
  - Updated error message to be more helpful

### Changed

- Moved kit installer from `.claude/skills/kit-installer/scripts/install.py` to `cli/scripts/install.py`
- Updated `package.json` to include `scripts/` and `stacks/` directories in npm package
- Kit installer now checks CLI package location first, then falls back to development paths
- Added `.npmignore` to prevent development files from being bundled
- Cleaned up development artifacts (.claude directory, .DS_Store files)

## [1.3.0] - Previous version

- Initial kit management functionality
