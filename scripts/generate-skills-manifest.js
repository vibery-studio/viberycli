#!/usr/bin/env node
/**
 * Generate skills-manifest.json for all skills in templates/skills/
 *
 * This manifest allows the CLI to fetch skill files via raw URLs
 * without needing GitHub API (which has rate limits).
 *
 * Usage: node scripts/generate-skills-manifest.js
 * Output: templates/skills-manifest.json
 */

const fs = require("fs-extra");
const path = require("path");

const SKILLS_DIR = path.join(__dirname, "../templates/skills");
const OUTPUT_FILE = path.join(__dirname, "../templates/skills-manifest.json");

async function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      // Skip hidden directories and common non-essential dirs
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

  // Check if skills directory exists
  if (!(await fs.pathExists(SKILLS_DIR))) {
    console.error(`Skills directory not found: ${SKILLS_DIR}`);
    process.exit(1);
  }

  // Get all skill directories
  const entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
  const skillDirs = entries.filter(
    (e) => e.isDirectory() && !e.name.startsWith("."),
  );

  console.log(`Found ${skillDirs.length} skills`);

  for (const skillDir of skillDirs) {
    const skillPath = path.join(SKILLS_DIR, skillDir.name);
    const files = await getAllFiles(skillPath);

    // Sort files for consistent output
    files.sort();

    manifest[skillDir.name] = files;
    console.log(`  ${skillDir.name}: ${files.length} files`);
  }

  // Write manifest
  await fs.writeJson(OUTPUT_FILE, manifest, { spaces: 2 });
  console.log(`\nManifest written to: ${OUTPUT_FILE}`);
  console.log(`Total skills: ${Object.keys(manifest).length}`);
}

generateManifest().catch((err) => {
  console.error("Error generating manifest:", err);
  process.exit(1);
});
