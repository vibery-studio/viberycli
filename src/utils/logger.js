const chalk = require("chalk");

const logger = {
  info: (msg) => console.log(chalk.blue("ℹ"), msg),
  success: (msg) => console.log(chalk.green("✓"), msg),
  error: (msg) => console.log(chalk.red("✗"), msg),
  warn: (msg) => console.log(chalk.yellow("⚠"), msg),

  // Styled output
  title: (msg) => console.log(chalk.bold.cyan(`\n${msg}\n`)),
  subtitle: (msg) => console.log(chalk.gray(msg)),

  // Template display
  template: (name, type, description) => {
    const typeColors = {
      agent: chalk.red,
      command: chalk.cyan,
      mcp: chalk.blue,
      setting: chalk.magenta,
      hook: chalk.yellow,
      skill: chalk.green,
    };
    const colorFn = typeColors[type] || chalk.white;
    const icon = getIcon(type);
    console.log(
      `  ${icon} ${colorFn(name)} ${chalk.gray(`- ${description || "No description"}`)}`,
    );
  },

  // Command display
  command: (cmd) => console.log(chalk.gray("  $"), chalk.white(cmd)),

  // Box display
  box: (title, content) => {
    const width = 50;
    const line = "─".repeat(width);
    console.log(chalk.gray(`┌${line}┐`));
    console.log(
      chalk.gray("│"),
      chalk.bold.white(title.padEnd(width - 1)),
      chalk.gray("│"),
    );
    console.log(chalk.gray(`├${line}┤`));
    content.split("\n").forEach((l) => {
      console.log(chalk.gray("│"), l.padEnd(width - 1), chalk.gray("│"));
    });
    console.log(chalk.gray(`└${line}┘`));
  },
};

function getIcon(type) {
  const icons = {
    agent: "🤖",
    command: "⚡",
    mcp: "🔌",
    setting: "⚙️",
    hook: "🪝",
    skill: "🎨",
  };
  return icons[type] || "📦";
}

module.exports = logger;
