#!/usr/bin/env node
/**
 * Generate templates-manifest.json for ALL template types
 *
 * This manifest allows CLI to fetch any template via raw URLs
 * without GitHub API (no rate limits).
 *
 * Usage: node scripts/generate-templates-manifest.js
 * Output: templates/templates-manifest.json
 */

const fs = require("fs-extra");
const path = require("path");

const TEMPLATES_DIR = path.join(__dirname, "../templates");
const OUTPUT_FILE = path.join(TEMPLATES_DIR, "templates-manifest.json");

const TEMPLATE_TYPES = [
  "agents",
  "commands",
  "mcps",
  "hooks",
  "settings",
  "skills",
];

async function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      // Skip hidden directories
      if (entry.name.startsWith(".") || entry.name === "__pycache__") {
        continue;
      }
      const subFiles = await getAllFiles(fullPath, baseDir);
      files.push(...subFiles);
    } else {
      // Skip hidden files
      if (!entry.name.startsWith(".")) {
        files.push(relativePath);
      }
    }
  }

  return files;
}

async function generateManifest() {
  const manifest = {};

  for (const type of TEMPLATE_TYPES) {
    const typeDir = path.join(TEMPLATES_DIR, type);

    if (!(await fs.pathExists(typeDir))) {
      console.log(`Skipping ${type} (not found)`);
      continue;
    }

    const entries = await fs.readdir(typeDir, { withFileTypes: true });

    if (type === "skills") {
      // Skills are directories - list files within each
      manifest.skills = {};
      const skillDirs = entries.filter(
        (e) => e.isDirectory() && !e.name.startsWith("."),
      );

      for (const skillDir of skillDirs) {
        const skillPath = path.join(typeDir, skillDir.name);
        const files = await getAllFiles(skillPath);
        files.sort();
        manifest.skills[skillDir.name] = files;
      }
      console.log(`  skills: ${Object.keys(manifest.skills).length} skills`);
    } else {
      // Others are flat files
      manifest[type] = entries
        .filter((e) => e.isFile() && !e.name.startsWith("."))
        .map((e) => e.name)
        .sort();
      console.log(`  ${type}: ${manifest[type].length} files`);
    }
  }

  // Write manifest
  await fs.writeJson(OUTPUT_FILE, manifest, { spaces: 2 });
  console.log(`\nManifest written to: ${OUTPUT_FILE}`);
}

generateManifest().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
