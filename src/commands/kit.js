const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const ora = require("ora");
const logger = require("../utils/logger");

// Find the kit installer script
function findInstaller() {
  // Check in CLI package (bundled with npm)
  const packagePath = path.join(__dirname, "../../scripts/install.py");
  if (fs.existsSync(packagePath)) {
    return packagePath;
  }

  // Check in current project's .claude/skills (if user has kit-installer skill)
  const localPath = path.join(
    process.cwd(),
    ".claude/skills/kit-installer/scripts/install.py",
  );
  if (fs.existsSync(localPath)) {
    return localPath;
  }

  // Check in global vibe-templates (development)
  const globalPath =
    "/Applications/MAMP/htdocs/vibe-templates/.claude/skills/kit-installer/scripts/install.py";
  if (fs.existsSync(globalPath)) {
    return globalPath;
  }

  return null;
}

// Run Python installer with arguments
function runInstaller(args) {
  return new Promise((resolve, reject) => {
    const installerPath = findInstaller();

    if (!installerPath) {
      reject(
        new Error(
          "Kit installer script not found. Please reinstall vibery: npm install -g vibery",
        ),
      );
      return;
    }

    const proc = spawn("python3", [installerPath, ...args], {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Installer exited with code ${code}`));
      }
    });

    proc.on("error", (err) => {
      reject(err);
    });
  });
}

async function kitCommand(action, kits, options) {
  try {
    const args = [];

    switch (action) {
      case "list":
        args.push("--list");
        break;

      case "installed":
        args.push("--installed");
        break;

      case "install":
        if (!kits || kits.length === 0) {
          logger.error("Please specify kit(s) to install");
          logger.info("Usage: vibery kit install <kit-name> [kit-name2 ...]");
          process.exit(1);
        }
        args.push(...kits);
        if (options.dryRun) {
          args.push("--dry-run");
        }
        break;

      case "uninstall":
        if (!kits || kits.length === 0) {
          logger.error("Please specify kit to uninstall");
          logger.info("Usage: vibery kit uninstall <kit-name>");
          process.exit(1);
        }
        args.push("--uninstall", kits[0]);
        if (options.dryRun) {
          args.push("--dry-run");
        }
        break;

      default:
        logger.error(`Unknown action: ${action}`);
        logger.info("Available actions: list, install, installed, uninstall");
        process.exit(1);
    }

    await runInstaller(args);
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}

module.exports = kitCommand;
