const fs = require("fs-extra");
const path = require("path");
const logger = require("../utils/logger");
const remoteRegistry = require("./remote-registry");

class Installer {
  constructor() {
    // Path to templates folder (bundled with CLI package - offline fallback)
    this.templatesDir = path.join(__dirname, "../../templates");
    this.offlineMode = false;
  }

  /**
   * Set offline mode (use bundled templates only)
   */
  setOfflineMode(offline) {
    this.offlineMode = offline;
  }

  /**
   * Get the target directory for a template type
   */
  getTargetDir(type, targetDir = ".") {
    const typeToDir = {
      agent: ".claude/agents",
      command: ".claude/commands",
      mcp: ".claude/mcps",
      setting: ".claude/settings",
      hook: ".claude/hooks",
      skill: ".claude/skills",
    };

    const subDir = typeToDir[type] || ".claude";
    return path.join(targetDir, subDir);
  }

  /**
   * Get the source path for a bundled template
   */
  getSourcePath(template) {
    const type = template.type;
    const typeDir = type.endsWith("s") ? type : `${type}s`;
    return path.join(
      this.templatesDir,
      typeDir,
      template.path || template.name,
    );
  }

  /**
   * Install a template (agent, command, mcp, setting, hook)
   */
  async install(template, targetDir = ".", onProgress = null) {
    const targetDirPath = this.getTargetDir(template.type, targetDir);

    // Determine target filename
    let targetFileName = template.name;
    if (!targetFileName.endsWith(".md") && !targetFileName.endsWith(".json")) {
      targetFileName =
        template.type === "mcp" ||
        template.type === "setting" ||
        template.type === "hook"
          ? `${template.name}.json`
          : `${template.name}.md`;
    }

    const targetPath = path.join(targetDirPath, targetFileName);

    try {
      // Try remote fetch first (unless offline mode)
      if (!this.offlineMode) {
        try {
          const url = remoteRegistry.getTemplateUrl(
            template.type,
            template.name,
          );
          const content = await remoteRegistry.fetchFile(url);

          // Ensure target directory exists
          await fs.ensureDir(targetDirPath);

          // Write file
          await fs.writeFile(targetPath, content);

          return {
            success: true,
            path: targetPath,
            source: "remote",
          };
        } catch (error) {
          // Fall through to bundled templates
          logger.warn(`Remote fetch failed: ${error.message}`);
        }
      }

      // Fallback to bundled templates
      const sourcePath = this.getSourcePath(template);
      const sourceExists = await fs.pathExists(sourcePath);
      if (!sourceExists) {
        throw new Error(`Template not found: ${template.name}`);
      }

      // Create target directory
      await fs.ensureDir(targetDirPath);

      // Copy file
      await fs.copy(sourcePath, targetPath);

      return {
        success: true,
        path: targetPath,
        source: "bundled",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Install a skill (directory with SKILL.md and subdirectories)
   */
  async installSkill(template, targetDir = ".", onProgress = null) {
    const skillName = template.name.replace(/\.(md|json)$/, "");
    const targetPath = path.join(targetDir, ".claude/skills", skillName);

    try {
      // Try remote fetch first (unless offline mode)
      if (!this.offlineMode) {
        try {
          const result = await this.fetchSkillFromRemote(
            skillName,
            targetPath,
            onProgress,
          );
          if (result.success) {
            return result;
          }
        } catch (error) {
          // Fall through to bundled templates
          logger.warn(`Remote fetch failed: ${error.message}`);
        }
      }

      // Fallback to bundled templates
      const sourcePath = this.getSourcePath(template);
      const stats = await fs.stat(sourcePath).catch(() => null);

      if (!stats || !stats.isDirectory()) {
        throw new Error(`Skill not found: ${skillName}`);
      }

      // Create target directory and copy
      await fs.ensureDir(targetPath);
      await fs.copy(sourcePath, targetPath);

      return {
        success: true,
        path: targetPath,
        source: "bundled",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Fetch skill from remote GitHub repository
   * Uses GitHub API to list directory contents
   */
  async fetchSkillFromRemote(skillName, targetPath, onProgress = null) {
    const https = require("https");

    // Use GitHub API to get directory listing
    const apiUrl = `https://api.github.com/repos/${remoteRegistry.repoOwner}/${remoteRegistry.repoName}/contents/cli/templates/skills/${skillName}?ref=${remoteRegistry.branch}`;

    try {
      // Fetch directory listing from GitHub API
      const files = await this.fetchGitHubDirectory(apiUrl);

      // Create target directory
      await fs.ensureDir(targetPath);

      // Download all files recursively
      await this.downloadSkillFiles(files, targetPath, onProgress);

      return {
        success: true,
        path: targetPath,
        source: "remote",
      };
    } catch (error) {
      throw new Error(`Failed to fetch skill: ${error.message}`);
    }
  }

  /**
   * Fetch directory listing from GitHub API
   */
  async fetchGitHubDirectory(apiUrl) {
    return new Promise((resolve, reject) => {
      const https = require("https");
      const url = new URL(apiUrl);

      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        headers: {
          "User-Agent": "vibery-cli",
          Accept: "application/vnd.github.v3+json",
        },
      };

      const timeoutId = setTimeout(() => {
        reject(new Error("GitHub API timeout"));
      }, 10000);

      https
        .get(options, (res) => {
          if (res.statusCode === 404) {
            clearTimeout(timeoutId);
            reject(new Error("Skill not found in repository"));
            return;
          }

          if (res.statusCode !== 200) {
            clearTimeout(timeoutId);
            reject(new Error(`GitHub API error: HTTP ${res.statusCode}`));
            return;
          }

          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            clearTimeout(timeoutId);
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              reject(new Error("Invalid JSON from GitHub API"));
            }
          });
        })
        .on("error", (err) => {
          clearTimeout(timeoutId);
          reject(err);
        });
    });
  }

  /**
   * Download skill files recursively
   */
  async downloadSkillFiles(items, targetDir, onProgress = null) {
    for (const item of items) {
      const targetPath = path.join(targetDir, item.name);

      if (item.type === "file") {
        // Download file
        const content = await remoteRegistry.fetchFile(item.download_url);
        await fs.writeFile(targetPath, content);
      } else if (item.type === "dir") {
        // Recursively fetch subdirectory
        await fs.ensureDir(targetPath);
        const subItems = await this.fetchGitHubDirectory(item.url);
        await this.downloadSkillFiles(subItems, targetPath, onProgress);
      }
    }
  }

  /**
   * Install an MCP configuration
   */
  async installMCP(template, targetDir = ".") {
    // MCPs need special handling - merge into existing config
    const targetPath = path.join(
      targetDir,
      ".claude/mcps",
      `${template.name}.json`,
    );

    try {
      let content;

      // Try remote first
      if (!this.offlineMode) {
        try {
          const url = remoteRegistry.getTemplateUrl("mcp", template.name);
          content = await remoteRegistry.fetchFile(url);
        } catch (error) {
          logger.warn(`Remote fetch failed: ${error.message}`);
        }
      }

      // Fallback to bundled
      if (!content) {
        const sourcePath = this.getSourcePath(template);
        const exists = await fs.pathExists(sourcePath);
        if (!exists) {
          throw new Error(`MCP template not found: ${template.name}`);
        }
        content = await fs.readFile(sourcePath, "utf-8");
      }

      // Ensure directory exists
      await fs.ensureDir(path.dirname(targetPath));

      // Write the MCP config
      await fs.writeFile(targetPath, content);

      return {
        success: true,
        path: targetPath,
        source: content ? "remote" : "bundled",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Install a stack (bundle of templates)
   */
  async installStack(stack, registry, targetDir = ".") {
    const results = {
      success: true,
      installed: [],
      failed: [],
      stack: stack,
    };

    for (const item of stack.templates) {
      // Find the template in registry
      const template = await registry.findTemplate(item.name, item.type);

      if (!template) {
        results.failed.push({
          ...item,
          error: "Template not found in registry",
        });
        continue;
      }

      // Install based on type
      let result;
      switch (template.type) {
        case "mcp":
          result = await this.installMCP(template, targetDir);
          break;
        case "skill":
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
}

module.exports = new Installer();
