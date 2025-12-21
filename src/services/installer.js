const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

class Installer {
  constructor() {
    // Path to templates folder (bundled with CLI package)
    this.templatesDir = path.join(__dirname, '../../templates');
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
  async install(template, targetDir = '.') {
    const sourcePath = this.getSourcePath(template);
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
      // Check if source exists
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
        source: sourcePath
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
  async installSkill(template, targetDir = '.') {
    const sourcePath = this.getSourcePath(template);
    const targetPath = path.join(targetDir, '.claude/skills', template.name);

    try {
      // Check if source exists and is a directory
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
        source: sourcePath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
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
