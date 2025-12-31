const https = require("https");
const fs = require("fs-extra");
const path = require("path");
const cacheManager = require("./cache-manager");

class RemoteRegistry {
  constructor() {
    // GitHub raw content URL - viberycli repo hosts templates
    this.repoOwner = process.env.VIBERY_REPO_OWNER || "vibery-studio";
    this.repoName = process.env.VIBERY_REPO_NAME || "viberycli";
    this.branch = process.env.VIBERY_BRANCH || "main";

    // Base URLs (flat structure: /agents, /skills, etc.)
    this.rawBaseUrl = `https://raw.githubusercontent.com/${this.repoOwner}/${this.repoName}/${this.branch}`;
    this.registryUrl = `${this.rawBaseUrl}/registry.json`;
    this.templatesBaseUrl = this.rawBaseUrl; // No /templates prefix - flat structure

    // Bundled registry as fallback for offline mode
    this.bundledRegistryPath = path.join(__dirname, "../../registry.json");

    // Request timeout (5 seconds)
    this.timeout = 5000;
  }

  /**
   * Fetch registry from remote or cache
   * @param {boolean} offlineMode - Use cache/bundled only, no network requests
   * @returns {Object} Registry data
   */
  async getRegistry(offlineMode = false) {
    // Offline mode: cache → bundled
    if (offlineMode) {
      const cached = await cacheManager.getCachedRegistry();
      if (cached) return cached;
      return await this.getBundledRegistry();
    }

    // Online mode: cache → remote → bundled
    const cached = await cacheManager.getCachedRegistry();
    if (cached) return cached;

    try {
      const data = await this.fetchRegistryFromRemote();
      await cacheManager.saveRegistry(data);
      return data;
    } catch (error) {
      // Fallback to bundled registry
      return await this.getBundledRegistry();
    }
  }

  /**
   * Fetch registry from GitHub raw URL with timeout
   */
  async fetchRegistryFromRemote() {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Registry fetch timeout"));
      }, this.timeout);

      const handleResponse = (res) => {
        // Follow redirects
        if (res.statusCode === 301 || res.statusCode === 302) {
          return https
            .get(res.headers.location, handleResponse)
            .on("error", (err) => {
              clearTimeout(timeoutId);
              reject(err);
            });
        }

        if (res.statusCode !== 200) {
          clearTimeout(timeoutId);
          reject(new Error(`Failed to fetch registry: HTTP ${res.statusCode}`));
          return;
        }

        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          clearTimeout(timeoutId);
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error("Invalid JSON in registry"));
          }
        });
      };

      https.get(this.registryUrl, handleResponse).on("error", (err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
    });
  }

  /**
   * Get bundled registry (offline fallback)
   */
  async getBundledRegistry() {
    try {
      return await fs.readJson(this.bundledRegistryPath);
    } catch (error) {
      throw new Error(`Failed to load bundled registry: ${error.message}`);
    }
  }

  /**
   * Force refresh registry from remote
   */
  async refresh() {
    await cacheManager.clearRegistry();
    return await this.getRegistry(false);
  }

  /**
   * Get raw URL for a template file
   * @param {string} type - Template type (agent, command, skill, etc.)
   * @param {string} name - Template name
   * @returns {string} Raw GitHub URL
   */
  getTemplateUrl(type, name) {
    const cleanName = name.replace(/\.(md|json)$/, "");
    const typeDir = type.endsWith("s") ? type : `${type}s`;

    // Determine file extension based on type
    const ext = ["mcp", "setting", "hook"].includes(type) ? "json" : "md";

    return `${this.templatesBaseUrl}/${typeDir}/${cleanName}.${ext}`;
  }

  /**
   * Get raw URL for a skill directory's SKILL.md
   * @param {string} name - Skill name
   * @returns {string} Raw GitHub URL
   */
  getSkillUrl(name) {
    const cleanName = name.replace(/\.(md|json)$/, "");
    return `${this.templatesBaseUrl}/skills/${cleanName}/SKILL.md`;
  }

  /**
   * Get base URL for skill directory (for fetching subdirectories)
   * @param {string} name - Skill name
   * @returns {string} Base URL for skill
   */
  getSkillBaseUrl(name) {
    const cleanName = name.replace(/\.(md|json)$/, "");
    return `${this.templatesBaseUrl}/skills/${cleanName}`;
  }

  /**
   * Fetch file content from GitHub raw URL
   * @param {string} url - Raw GitHub URL
   * @returns {Promise<string>} File content
   */
  async fetchFile(url) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("File fetch timeout"));
      }, this.timeout);

      const handleResponse = (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return https
            .get(res.headers.location, handleResponse)
            .on("error", (err) => {
              clearTimeout(timeoutId);
              reject(err);
            });
        }

        if (res.statusCode === 404) {
          clearTimeout(timeoutId);
          reject(new Error("Template not found in remote repository"));
          return;
        }

        if (res.statusCode !== 200) {
          clearTimeout(timeoutId);
          reject(new Error(`Failed to fetch: HTTP ${res.statusCode}`));
          return;
        }

        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          clearTimeout(timeoutId);
          resolve(data);
        });
      };

      https.get(url, handleResponse).on("error", (err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
    });
  }

  /**
   * Fetch binary file from GitHub raw URL
   * @param {string} url - Raw GitHub URL
   * @returns {Promise<Buffer>} File buffer
   */
  async fetchBinary(url) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Binary fetch timeout"));
      }, this.timeout * 2); // Longer timeout for binary

      const handleResponse = (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return https
            .get(res.headers.location, handleResponse)
            .on("error", (err) => {
              clearTimeout(timeoutId);
              reject(err);
            });
        }

        if (res.statusCode !== 200) {
          clearTimeout(timeoutId);
          reject(new Error(`Failed to fetch: HTTP ${res.statusCode}`));
          return;
        }

        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          clearTimeout(timeoutId);
          resolve(Buffer.concat(chunks));
        });
      };

      https.get(url, handleResponse).on("error", (err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
    });
  }
}

module.exports = new RemoteRegistry();
