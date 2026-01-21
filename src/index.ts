#!/usr/bin/env node

import {
  tips,
  categories,
  getTipsByCategory,
  getRandomTip,
  searchTips,
  type Category,
} from "./knowledge.js";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const MAGENTA = "\x1b[35m";

function printHeader(): void {
  console.log(`
${CYAN}${BOLD}  Claude Coach${RESET}
${DIM}  Your personal guide to mastering Claude Code${RESET}
`);
}

function printTip(tip: (typeof tips)[0]): void {
  console.log(`${YELLOW}${BOLD}${tip.title}${RESET}`);
  console.log(`${DIM}Category: ${categories[tip.category]}${RESET}`);
  console.log();
  console.log(tip.content);
  if (tip.example) {
    console.log();
    console.log(`${GREEN}Example:${RESET} ${tip.example}`);
  }
  console.log();
}

function printCategories(): void {
  console.log(`${BOLD}Available categories:${RESET}\n`);
  for (const [key, name] of Object.entries(categories)) {
    const count = getTipsByCategory(key as Category).length;
    console.log(`  ${CYAN}${key}${RESET} - ${name} (${count} tips)`);
  }
  console.log();
}

function printUsage(): void {
  printHeader();
  console.log(`${BOLD}Usage:${RESET}

  ${CYAN}claude-coach${RESET}                    Show a random tip
  ${CYAN}claude-coach tip${RESET}                Show a random tip
  ${CYAN}claude-coach list${RESET}               List all categories
  ${CYAN}claude-coach list <category>${RESET}    List tips in a category
  ${CYAN}claude-coach search <query>${RESET}     Search tips
  ${CYAN}claude-coach all${RESET}                Show all tips
  ${CYAN}claude-coach help${RESET}               Show this help

${BOLD}Categories:${RESET}
  commands, workflows, prompting, configuration, mcp, hooks, shortcuts

${BOLD}Examples:${RESET}
  ${DIM}claude-coach list prompting${RESET}
  ${DIM}claude-coach search hooks${RESET}
  ${DIM}claude-coach search "mcp server"${RESET}
`);
}

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();

  if (!command || command === "tip") {
    printHeader();
    const tip = getRandomTip();
    printTip(tip);
    console.log(`${DIM}Run 'claude-coach tip' for another random tip${RESET}`);
    return;
  }

  if (command === "help" || command === "--help" || command === "-h") {
    printUsage();
    return;
  }

  if (command === "list") {
    printHeader();
    const category = args[1]?.toLowerCase() as Category | undefined;

    if (!category) {
      printCategories();
      return;
    }

    if (!Object.keys(categories).includes(category)) {
      console.log(`${YELLOW}Unknown category: ${category}${RESET}\n`);
      printCategories();
      return;
    }

    const categoryTips = getTipsByCategory(category);
    console.log(
      `${BOLD}${categories[category]}${RESET} (${categoryTips.length} tips)\n`
    );
    for (const tip of categoryTips) {
      printTip(tip);
      console.log(`${DIM}${"─".repeat(50)}${RESET}\n`);
    }
    return;
  }

  if (command === "search") {
    printHeader();
    const query = args.slice(1).join(" ");

    if (!query) {
      console.log(`${YELLOW}Please provide a search query${RESET}`);
      console.log(`Example: claude-coach search hooks`);
      return;
    }

    const results = searchTips(query);

    if (results.length === 0) {
      console.log(`${YELLOW}No tips found for "${query}"${RESET}`);
      return;
    }

    console.log(
      `${BOLD}Found ${results.length} tip${results.length > 1 ? "s" : ""} for "${query}"${RESET}\n`
    );
    for (const tip of results) {
      printTip(tip);
      console.log(`${DIM}${"─".repeat(50)}${RESET}\n`);
    }
    return;
  }

  if (command === "all") {
    printHeader();
    console.log(`${BOLD}All Tips (${tips.length} total)${RESET}\n`);

    for (const [categoryKey, categoryName] of Object.entries(categories)) {
      const categoryTips = getTipsByCategory(categoryKey as Category);
      console.log(`\n${MAGENTA}${BOLD}═══ ${categoryName} ═══${RESET}\n`);
      for (const tip of categoryTips) {
        printTip(tip);
        console.log(`${DIM}${"─".repeat(50)}${RESET}\n`);
      }
    }
    return;
  }

  // Unknown command - maybe they meant to search?
  console.log(`${YELLOW}Unknown command: ${command}${RESET}`);
  console.log(`Did you mean: ${CYAN}claude-coach search ${command}${RESET}?\n`);
  printUsage();
}

main();
