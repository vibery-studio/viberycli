const fs = require("fs-extra");
const path = require("path");
const logger = require("../utils/logger");
const remoteRegistry = require("./remote-registry");

class Installer {
  constructor() {
    // Path to templates folder (bundled with CLI package - offline fallback)
    this.templatesDir = path.join(__dirname, "../../templates");
    this.offlineMode = false;
    this._manifestCache = null;
  }

  /**
   * Get templates manifest (cached)
   * Manifest lists all templates - no GitHub API needed
   */
  async getTemplatesManifest() {
    if (this._manifestCache) {
      return this._manifestCache;
    }

    const manifestUrl = `${remoteRegistry.templatesBaseUrl}/templates-manifest.json`;
    try {
      const content = await remoteRegistry.fetchFile(manifestUrl);
      this._manifestCache = JSON.parse(content);
      return this._manifestCache;
    } catch (error) {
      throw new Error("Templates manifest not available");
    }
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
          // Silent fallback to bundled - no warning needed
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
   * Strategy: 1) Try manifest (no rate limit) 2) Fall back to API
   */
  async fetchSkillFromRemote(skillName, targetPath, onProgress = null) {
    // Try manifest-based fetch first (no rate limits)
    try {
      const result = await this.fetchSkillFromManifest(skillName, targetPath);
      if (result.success) {
        return result;
      }
    } catch (error) {
      // Manifest not available or failed, try API
    }

    // Fall back to GitHub API (rate limited but works without manifest)
    const apiUrl = `https://api.github.com/repos/${remoteRegistry.repoOwner}/${remoteRegistry.repoName}/contents/skills/${skillName}?ref=${remoteRegistry.branch}`;

    try {
      const files = await this.fetchGitHubDirectory(apiUrl);
      await fs.ensureDir(targetPath);
      await this.downloadSkillFilesFromAPI(files, targetPath, onProgress);

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
   * Fetch skill using unified manifest (no GitHub API, no rate limits)
   */
  async fetchSkillFromManifest(skillName, targetPath) {
    // Fetch unified templates manifest
    const manifest = await this.getTemplatesManifest();

    // Check if skill exists in manifest
    const files = manifest.skills?.[skillName];
    if (!files || files.length === 0) {
      throw new Error("Skill not in manifest");
    }

    // Create target directory
    await fs.ensureDir(targetPath);

    // Download all files from manifest
    const baseUrl = `${remoteRegistry.templatesBaseUrl}/skills/${skillName}`;
    for (const filePath of files) {
      const fileUrl = `${baseUrl}/${filePath}`;
      const localPath = path.join(targetPath, filePath);

      // Ensure subdirectory exists
      await fs.ensureDir(path.dirname(localPath));

      // Fetch and write file
      try {
        const content = await remoteRegistry.fetchFile(fileUrl);
        await fs.writeFile(localPath, content);
      } catch (error) {
        // Try binary fetch for non-text files
        try {
          const buffer = await remoteRegistry.fetchBinary(fileUrl);
          await fs.writeFile(localPath, buffer);
        } catch (binError) {
          throw new Error(`Failed to fetch ${filePath}`);
        }
      }
    }

    return {
      success: true,
      path: targetPath,
      source: "remote",
    };
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
   * Download skill files recursively from GitHub API response
   */
  async downloadSkillFilesFromAPI(items, targetDir, onProgress = null) {
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
        await this.downloadSkillFilesFromAPI(subItems, targetPath, onProgress);
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
