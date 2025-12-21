const fs = require('fs-extra');
const path = require('path');

class Registry {
  constructor() {
    this.registryPath = path.join(__dirname, '../../registry.json');
    this.data = null;
  }

  async load() {
    if (this.data) return this.data;

    try {
      this.data = await fs.readJson(this.registryPath);
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
    const typeKey = type.endsWith('s') ? type : `${type}s`;
    return data.templates[typeKey] || [];
  }

  async findTemplate(name, type = null) {
    const templates = await this.getTemplates();

    // Search in specified type or all types
    const typesToSearch = type
      ? [type.endsWith('s') ? type : `${type}s`]
      : Object.keys(templates);

    for (const t of typesToSearch) {
      const found = templates[t]?.find(
        tpl => tpl.name === name || tpl.name === `${name}.md` || tpl.name === `${name}.json`
      );
      if (found) {
        return { ...found, type: t.replace(/s$/, '') };
      }
    }

    return null;
  }

  async search(query, type = null) {
    const templates = await this.getTemplates();
    const results = [];
    const queryLower = query.toLowerCase();

    const typesToSearch = type
      ? [type.endsWith('s') ? type : `${type}s`]
      : Object.keys(templates);

    for (const t of typesToSearch) {
      const typeTemplates = templates[t] || [];
      for (const tpl of typeTemplates) {
        const nameMatch = tpl.name.toLowerCase().includes(queryLower);
        const descMatch = tpl.description?.toLowerCase().includes(queryLower);

        if (nameMatch || descMatch) {
          results.push({ ...tpl, type: t.replace(/s$/, '') });
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
}

module.exports = new Registry();
