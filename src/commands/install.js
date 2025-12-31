const ora = require("ora");
const logger = require("../utils/logger");
const registry = require("../services/registry");
const installer = require("../services/installer");

async function installCommand(templateNames, options) {
  const spinner = ora();

  try {
    const targetDir = options.directory || ".";

    // Set offline mode if specified
    if (options.offline) {
      registry.setOfflineMode(true);
      installer.setOfflineMode(true);
      logger.info("Running in offline mode");
    }

    // Build list of templates to install
    const toInstall = [];

    // Check for explicit type options first
    if (options.agent) {
      toInstall.push({ name: options.agent, type: "agent" });
    }
    if (options.command) {
      toInstall.push({ name: options.command, type: "command" });
    }
    if (options.mcp) {
      toInstall.push({ name: options.mcp, type: "mcp" });
    }
    if (options.setting) {
      toInstall.push({ name: options.setting, type: "setting" });
    }
    if (options.hook) {
      toInstall.push({ name: options.hook, type: "hook" });
    }
    if (options.skill) {
      toInstall.push({ name: options.skill, type: "skill" });
    }

    // Add positional template names (array from commander)
    if (templateNames && templateNames.length > 0) {
      templateNames.forEach((name) => {
        toInstall.push({ name, type: null });
      });
    }

    if (toInstall.length === 0) {
      logger.error("Please specify template(s) to install");
      logger.info("Usage: vibery install <template> [template2] ...");
      logger.info("       vibery install --agent <name>");
      logger.info("For bundles: vibery kit install <kit-name>");
      process.exit(1);
    }

    // Install each template
    let successCount = 0;
    let failCount = 0;

    for (const item of toInstall) {
      // Find the template
      spinner.start(`Looking for template: ${item.name}`);
      const template = await registry.findTemplate(item.name, item.type);

      if (!template) {
        spinner.fail(`Template not found: ${item.name}`);
        failCount++;
        continue;
      }

      spinner.text = `Installing ${template.type}: ${template.name}`;

      // Progress callback for downloads
      let lastProgress = 0;
      const onProgress = (downloaded, total) => {
        const progress = Math.floor((downloaded / total) * 100);
        if (progress > lastProgress + 10 || progress === 100) {
          spinner.text = `Downloading ${template.name}: ${progress}%`;
          lastProgress = progress;
        }
      };

      // Install based on type
      let result;

      try {
        switch (template.type) {
          case "mcp":
            result = await installer.installMCP(template, targetDir);
            break;
          case "skill":
            result = await installer.installSkill(
              template,
              targetDir,
              onProgress,
            );
            break;
          default:
            result = await installer.install(template, targetDir, onProgress);
        }

        if (result.success) {
          const sourceLabel =
            result.source === "remote" ? "(from remote)" : "(from bundled)";
          spinner.succeed(
            `Installed ${template.type}: ${template.name} ${sourceLabel}`,
          );
          logger.info(`  → ${result.path}`);
          successCount++;
        } else {
          spinner.fail(`Failed to install ${template.name}: ${result.error}`);
          failCount++;
        }
      } catch (err) {
        spinner.fail(`Error installing ${template.name}: ${err.message}`);
        failCount++;
      }
    }

    // Summary for multiple templates
    if (toInstall.length > 1) {
      console.log("");
      if (failCount === 0) {
        logger.success(`All ${successCount} templates installed successfully`);
      } else {
        logger.warn(
          `Installed ${successCount}/${toInstall.length} templates (${failCount} failed)`,
        );
      }
    } else if (successCount === 1) {
      // Show usage hint for single template
      const template = await registry.findTemplate(
        toInstall[0].name,
        toInstall[0].type,
      );
      if (template) showUsageHint(template);
    }

    if (failCount > 0 && successCount === 0) {
      logger.info('Run "vibery list" to see available templates');
      process.exit(1);
    }
  } catch (error) {
    spinner.fail(`Error: ${error.message}`);
    process.exit(1);
  }
}

function showUsageHint(template) {
  console.log("");
  switch (template.type) {
    case "agent":
      logger.info("Use this agent by mentioning it in Claude Code");
      break;
    case "command":
      logger.info(`Run with: /${template.name.replace(".md", "")}`);
      break;
    case "mcp":
      logger.info("Restart Claude Code to activate this MCP");
      break;
    case "setting":
      logger.info("Settings will be applied on next Claude Code restart");
      break;
    case "hook":
      logger.info("Hook will trigger on matching tool use");
      break;
    case "skill":
      logger.info("Skill is ready to use in your project");
      break;
  }
}

module.exports = installCommand;
