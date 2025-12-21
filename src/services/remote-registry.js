const https = require('https');
const fs = require('fs-extra');
const path = require('path');
const cacheManager = require('./cache-manager');

class RemoteRegistry {
  constructor() {
    // Default to GitHub Releases, can be overridden by env var
    this.baseUrl = process.env.VIBERY_REGISTRY_URL ||
      'https://github.com/vibery-studio/templates/releases/latest/download';
    this.registryUrl = `${this.baseUrl}/registry.json`;
    this.bundledRegistryPath = path.join(__dirname, '../../registry.json');
  }

  /**
   * Fetch registry from remote or cache
   * @param {boolean} offlineMode - Use cache only, no network requests
   * @returns {Object} Registry data
   */
  async getRegistry(offlineMode = false) {
    // Try cache first if offline mode
    if (offlineMode) {
      const cached = await cacheManager.getCachedRegistry();
      if (cached) return cached;

      // Fall back to bundled registry
      return await this.getBundledRegistry();
    }

    // Try cache (if valid)
    const cached = await cacheManager.getCachedRegistry();
    if (cached) {
      return cached;
    }

    // Try fetching from remote
    try {
      const data = await this.fetchRegistryFromRemote();
      // Save to cache
      await cacheManager.saveRegistry(data);
      return data;
    } catch (error) {
      // Fall back to bundled registry
      return await this.getBundledRegistry();
    }
  }

  /**
   * Fetch registry from remote URL
   */
  async fetchRegistryFromRemote() {
    return new Promise((resolve, reject) => {
      https.get(this.registryUrl, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to fetch registry: HTTP ${res.statusCode}`));
          return;
        }

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (error) {
            reject(new Error('Invalid JSON in registry'));
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * Get bundled registry (fallback)
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
   * Get archive URL for a template
   */
  getArchiveUrl(type, name) {
    // Remove file extension from name
    const cleanName = name.replace(/\.(md|json)$/, '');
    return `${this.baseUrl}/${type}--${cleanName}.tar.gz`;
  }
}

module.exports = new RemoteRegistry();
