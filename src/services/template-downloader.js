const https = require("https");
const fs = require("fs-extra");
const path = require("path");
const { pipeline } = require("stream/promises");
const { Readable } = require("stream");
const cacheManager = require("./cache-manager");
const remoteRegistry = require("./remote-registry");

class TemplateDownloader {
  /**
   * Download template archive from remote
   * @param {Object} template - Template object with type and name
   * @param {Function} onProgress - Progress callback (bytesDownloaded, totalBytes)
   * @returns {string} Path to downloaded archive
   */
  async download(template, onProgress = null) {
    const type = template.type;
    const name = template.name.replace(/\.(md|json)$/, "");

    // Check cache first
    if (await cacheManager.hasArchive(type, name)) {
      return cacheManager.getArchivePath(type, name);
    }

    // Download from remote
    const url = remoteRegistry.getArchiveUrl(type, name);
    const buffer = await this.fetchArchive(url, onProgress);

    // Save to cache
    const archivePath = await cacheManager.saveArchive(type, name, buffer);
    return archivePath;
  }

  /**
   * Fetch archive from URL
   */
  async fetchArchive(url, onProgress = null) {
    return new Promise((resolve, reject) => {
      const handleResponse = (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          // Follow redirect
          return https
            .get(res.headers.location, handleResponse)
            .on("error", reject);
        }

        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download: HTTP ${res.statusCode}`));
          return;
        }

        const totalBytes = parseInt(res.headers["content-length"] || "0", 10);
        let downloadedBytes = 0;
        const chunks = [];

        res.on("data", (chunk) => {
          chunks.push(chunk);
          downloadedBytes += chunk.length;
          if (onProgress && totalBytes > 0) {
            onProgress(downloadedBytes, totalBytes);
          }
        });

        res.on("end", () => {
          resolve(Buffer.concat(chunks));
        });

        res.on("error", reject);
      };

      https.get(url, handleResponse).on("error", reject);
    });
  }

  /**
   * Extract archive to target directory
   * Uses tar package if available, falls back to bundled templates
   */
  async extract(archivePath, targetPath) {
    try {
      // Try to use tar package
      const tar = require("tar");

      await fs.ensureDir(targetPath);

      // Extract tar.gz
      await tar.extract({
        file: archivePath,
        cwd: targetPath,
        strip: 1, // Strip the first directory level
      });

      return { success: true, path: targetPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Download and extract template in one operation
   */
  async downloadAndExtract(template, targetPath, onProgress = null) {
    try {
      // Download (uses cache if available)
      const archivePath = await this.download(template, onProgress);

      // For single-file templates, we need to read the archive and extract the file
      const result = await this.extractSingleFile(
        archivePath,
        targetPath,
        template,
      );

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract single file from archive
   */
  async extractSingleFile(archivePath, targetPath, template) {
    try {
      const tar = require("tar");
      const tempDir = path.join(require("os").tmpdir(), `vibery-${Date.now()}`);

      await fs.ensureDir(tempDir);

      // Extract to temp directory
      await tar.extract({
        file: archivePath,
        cwd: tempDir,
      });

      // Find the extracted file
      const files = await fs.readdir(tempDir);
      if (files.length === 0) {
        throw new Error("No files in archive");
      }

      // Determine the actual file name in the archive
      let sourceFile = null;
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);

        if (stats.isDirectory()) {
          // Check inside the directory
          const subFiles = await fs.readdir(filePath);
          if (subFiles.length > 0) {
            sourceFile = path.join(filePath, subFiles[0]);
            break;
          }
        } else {
          sourceFile = filePath;
          break;
        }
      }

      if (!sourceFile) {
        throw new Error("Could not find file in archive");
      }

      // Ensure target directory exists
      await fs.ensureDir(path.dirname(targetPath));

      // Copy to target
      await fs.copy(sourceFile, targetPath);

      // Clean up temp directory
      await fs.remove(tempDir);

      return { success: true, path: targetPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract directory (for skills)
   */
  async extractDirectory(archivePath, targetPath) {
    try {
      const tar = require("tar");

      await fs.ensureDir(targetPath);

      // Extract entire directory
      await tar.extract({
        file: archivePath,
        cwd: targetPath,
        strip: 1, // Strip the first directory level to get the content directly
      });

      return { success: true, path: targetPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new TemplateDownloader();
