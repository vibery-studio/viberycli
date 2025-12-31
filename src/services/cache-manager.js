const fs = require("fs-extra");
const path = require("path");
const os = require("os");

class CacheManager {
  constructor() {
    this.cacheDir = path.join(os.homedir(), ".vibery", "cache");
    this.registryCachePath = path.join(this.cacheDir, "registry.json");
    this.archivesDir = path.join(this.cacheDir, "archives");
    this.registryTTL = 60 * 60 * 1000; // 1 hour
  }

  /**
   * Initialize cache directory structure
   */
  async init() {
    await fs.ensureDir(this.cacheDir);
    await fs.ensureDir(this.archivesDir);
  }

  /**
   * Get cached registry if valid
   * @returns {Object|null} Registry data or null if invalid/expired
   */
  async getCachedRegistry() {
    try {
      const exists = await fs.pathExists(this.registryCachePath);
      if (!exists) return null;

      const stats = await fs.stat(this.registryCachePath);
      const age = Date.now() - stats.mtime.getTime();

      if (age > this.registryTTL) {
        return null; // Expired
      }

      const data = await fs.readJson(this.registryCachePath);
      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Save registry to cache
   */
  async saveRegistry(data) {
    await this.init();
    await fs.writeJson(this.registryCachePath, data, { spaces: 2 });
  }

  /**
   * Get cached archive path
   */
  getArchivePath(type, name) {
    const archiveName = `${type}--${name}.tar.gz`;
    return path.join(this.archivesDir, archiveName);
  }

  /**
   * Check if archive exists in cache
   */
  async hasArchive(type, name) {
    const archivePath = this.getArchivePath(type, name);
    return await fs.pathExists(archivePath);
  }

  /**
   * Save archive to cache
   */
  async saveArchive(type, name, buffer) {
    await this.init();
    const archivePath = this.getArchivePath(type, name);
    await fs.writeFile(archivePath, buffer);
    return archivePath;
  }

  /**
   * Clear all cache
   */
  async clearAll() {
    try {
      await fs.remove(this.cacheDir);
      return { success: true, message: "Cache cleared successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Clear only registry cache
   */
  async clearRegistry() {
    try {
      await fs.remove(this.registryCachePath);
      return { success: true, message: "Registry cache cleared" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Clear only archives cache
   */
  async clearArchives() {
    try {
      await fs.remove(this.archivesDir);
      await fs.ensureDir(this.archivesDir);
      return { success: true, message: "Archives cache cleared" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    const stats = {
      cacheDir: this.cacheDir,
      registryCache: {
        exists: false,
        age: null,
        valid: false,
      },
      archives: {
        count: 0,
        totalSize: 0,
        files: [],
      },
    };

    try {
      // Check registry cache
      if (await fs.pathExists(this.registryCachePath)) {
        const registryStats = await fs.stat(this.registryCachePath);
        const age = Date.now() - registryStats.mtime.getTime();
        stats.registryCache = {
          exists: true,
          age: Math.floor(age / 1000 / 60), // minutes
          valid: age < this.registryTTL,
          size: registryStats.size,
        };
      }

      // Check archives
      if (await fs.pathExists(this.archivesDir)) {
        const files = await fs.readdir(this.archivesDir);
        let totalSize = 0;

        for (const file of files) {
          if (file.endsWith(".tar.gz")) {
            const filePath = path.join(this.archivesDir, file);
            const fileStats = await fs.stat(filePath);
            totalSize += fileStats.size;
            stats.archives.files.push({
              name: file,
              size: fileStats.size,
            });
          }
        }

        stats.archives.count = stats.archives.files.length;
        stats.archives.totalSize = totalSize;
      }
    } catch (error) {
      // Return partial stats on error
    }

    return stats;
  }
}

module.exports = new CacheManager();
