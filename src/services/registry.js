const fs = require("fs-extra");
const path = require("path");
const remoteRegistry = require("./remote-registry");

class Registry {
  constructor() {
    this.registryPath = path.join(__dirname, "../../registry.json");
    this.kitsPath = path.join(__dirname, "../../kits.json");
    this.data = null;
    this.kitsData = null;
    this.offlineMode = false;
  }

  setOfflineMode(offline) {
    this.offlineMode = offline;
  }

  async load() {
    if (this.data) return this.data;

    try {
      // Try remote registry first (unless offline mode)
      const rawData = await remoteRegistry.getRegistry(this.offlineMode);

      // Normalize registry format (remote uses flat array, local uses object)
      if (Array.isArray(rawData.templates)) {
        // Convert flat array to object format
        const grouped = {};
        for (const item of rawData.templates) {
          const typeKey = item.type.endsWith("s") ? item.type : `${item.type}s`;
          if (!grouped[typeKey]) grouped[typeKey] = [];
          grouped[typeKey].push(item);
        }
        rawData.templates = grouped;
      }

      this.data = rawData;
      return this.data;
    } catch (error) {
      throw new Error(`Failed to load registry: ${error.message}`);
    }
  }

  async getTemplates(type = null) {
    const data = await this.load();

    if (!type) {
      // Return all templates
      return data.templates;
    }

    // Return specific type
    const typeKey = type.endsWith("s") ? type : `${type}s`;
    return data.templates[typeKey] || [];
  }

  async findTemplate(name, type = null) {
    const templates = await this.getTemplates();

    // Search in specified type or all types
    const typesToSearch = type
      ? [type.endsWith("s") ? type : `${type}s`]
      : Object.keys(templates);

    for (const t of typesToSearch) {
      const found = templates[t]?.find(
        (tpl) =>
          tpl.name === name ||
          tpl.name === `${name}.md` ||
          tpl.name === `${name}.json`,
      );
      if (found) {
        return { ...found, type: t.replace(/s$/, "") };
      }
    }

    return null;
  }

  async search(query, type = null) {
    const templates = await this.getTemplates();
    const results = [];
    const queryLower = query.toLowerCase();

    const typesToSearch = type
      ? [type.endsWith("s") ? type : `${type}s`]
      : Object.keys(templates);

    for (const t of typesToSearch) {
      const typeTemplates = templates[t] || [];
      for (const tpl of typeTemplates) {
        const nameMatch = tpl.name.toLowerCase().includes(queryLower);
        const descMatch = tpl.description?.toLowerCase().includes(queryLower);

        if (nameMatch || descMatch) {
          results.push({ ...tpl, type: t.replace(/s$/, "") });
        }
      }
    }

    return results;
  }

  async getCounts() {
    const templates = await this.getTemplates();
    const counts = {};

    for (const [type, items] of Object.entries(templates)) {
      counts[type] = items.length;
    }

    return counts;
  }

  async loadKits() {
    if (this.kitsData) return this.kitsData;

    try {
      this.kitsData = await fs.readJson(this.kitsPath);
      return this.kitsData;
    } catch (error) {
      throw new Error(`Failed to load kits: ${error.message}`);
    }
  }

  async getKits() {
    const data = await this.loadKits();
    return data.kits || [];
  }

  async findKit(name) {
    const kits = await this.getKits();
    return kits.find(
      (k) => k.id === name || k.name.toLowerCase() === name.toLowerCase(),
    );
  }
}

module.exports = new Registry();
