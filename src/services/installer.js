const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');
const templateDownloader = require('./template-downloader');

class Installer {
  constructor() {
    // Path to templates folder (bundled with CLI package)
    this.templatesDir = path.join(__dirname, '../../templates');
    this.offlineMode = false;
  }

  /**
   * Set offline mode (use bundled/cached templates only)
   */
  setOfflineMode(offline) {
    this.offlineMode = offline;
  }

  /**
   * Get the target directory for a template type
   */
  getTargetDir(type, targetDir = '.') {
    const typeToDir = {
      agent: '.claude/agents',
      command: '.claude/commands',
      mcp: '.claude/mcps',
      setting: '.claude',
      hook: '.claude',
      skill: '.claude/skills'
    };

    const subDir = typeToDir[type] || '.claude';
    return path.join(targetDir, subDir);
  }

  /**
   * Get the source path for a template
   */
  getSourcePath(template) {
    const type = template.type;
    const typeDir = type.endsWith('s') ? type : `${type}s`;
    return path.join(this.templatesDir, typeDir, template.path || template.name);
  }

  /**
   * Install a template
   */
  async install(template, targetDir = '.', onProgress = null) {
    const targetDirPath = this.getTargetDir(template.type, targetDir);

    // Determine target filename
    let targetFileName = template.name;
    if (!targetFileName.endsWith('.md') && !targetFileName.endsWith('.json')) {
      targetFileName = template.type === 'mcp' || template.type === 'setting' || template.type === 'hook'
        ? `${template.name}.json`
        : `${template.name}.md`;
    }

    const targetPath = path.join(targetDirPath, targetFileName);

    try {
      // Try remote download first (unless offline mode)
      if (!this.offlineMode) {
        try {
          const result = await templateDownloader.downloadAndExtract(
            template,
            targetPath,
            onProgress
          );

          if (result.success) {
            return {
              success: true,
              path: targetPath,
              source: 'remote'
            };
          }
        } catch (error) {
          // Fall through to bundled templates
          logger.warn(`Remote fetch failed: ${error.message}`);
        }
      }

      // Fallback to bundled templates
      const sourcePath = this.getSourcePath(template);
      const sourceExists = await fs.pathExists(sourcePath);
      if (!sourceExists) {
        throw new Error(`Template source not found: ${sourcePath}`);
      }

      // Create target directory
      await fs.ensureDir(targetDirPath);

      // Check if target already exists
      const targetExists = await fs.pathExists(targetPath);
      if (targetExists) {
        logger.warn(`File already exists: ${targetPath}`);
        // For now, overwrite. Could add prompt later.
      }

      // Copy file
      await fs.copy(sourcePath, targetPath);

      return {
        success: true,
        path: targetPath,
        source: 'bundled'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Install a skill (directory)
   */
  async installSkill(template, targetDir = '.', onProgress = null) {
    const targetPath = path.join(targetDir, '.claude/skills', template.name.replace(/\.(md|json)$/, ''));

    try {
      // Try remote download first (unless offline mode)
      if (!this.offlineMode) {
        try {
          const result = await templateDownloader.extractDirectory(
            await templateDownloader.download(template, onProgress),
            targetPath
          );

          if (result.success) {
            return {
              success: true,
              path: targetPath,
              source: 'remote'
            };
          }
        } catch (error) {
          // Fall through to bundled templates
          logger.warn(`Remote fetch failed: ${error.message}`);
        }
      }

      // Fallback to bundled templates
      const sourcePath = this.getSourcePath(template);
      const stats = await fs.stat(sourcePath);
      if (!stats.isDirectory()) {
        throw new Error(`Skill must be a directory: ${sourcePath}`);
      }

      // Create target directory
      await fs.ensureDir(targetPath);

      // Copy entire directory
      await fs.copy(sourcePath, targetPath);

      return {
        success: true,
        path: targetPath,
        source: 'bundled'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Install a stack (bundle of templates)
   */
  async installStack(stack, registry, targetDir = '.') {
    const results = {
      success: true,
      installed: [],
      failed: [],
      stack: stack
    };

    for (const item of stack.templates) {
      // Find the template in registry
      const template = await registry.findTemplate(item.name, item.type);

      if (!template) {
        results.failed.push({ ...item, error: 'Template not found in registry' });
        continue;
      }

      // Install based on type
      let result;
      switch (template.type) {
        case 'mcp':
          result = await this.installMCP(template, targetDir);
          break;
        case 'skill':
          result = await this.installSkill(template, targetDir);
          break;
        default:
          result = await this.install(template, targetDir);
      }

      if (result.success) {
        results.installed.push({ ...item, path: result.path });
      } else {
        results.failed.push({ ...item, error: result.error });
      }
    }

    results.success = results.failed.length === 0;
    return results;
  }

  /**
   * Install MCP to .mcp.json (merge)
   */
  async installMCP(template, targetDir = '.') {
    const sourcePath = this.getSourcePath(template);
    const mcpJsonPath = path.join(targetDir, '.mcp.json');

    try {
      // Read source MCP config
      const sourceConfig = await fs.readJson(sourcePath);

      // Read or create target .mcp.json
      let targetConfig = { mcpServers: {} };
      if (await fs.pathExists(mcpJsonPath)) {
        targetConfig = await fs.readJson(mcpJsonPath);
        if (!targetConfig.mcpServers) {
          targetConfig.mcpServers = {};
        }
      }

      // Merge MCP config
      const mcpName = template.name.replace('.json', '');
      if (sourceConfig.mcpServers) {
        // Source has mcpServers object
        Object.assign(targetConfig.mcpServers, sourceConfig.mcpServers);
      } else {
        // Source is a single MCP config
        targetConfig.mcpServers[mcpName] = sourceConfig;
      }

      // Write merged config
      await fs.writeJson(mcpJsonPath, targetConfig, { spaces: 2 });

      return {
        success: true,
        path: mcpJsonPath,
        source: sourcePath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new Installer();
