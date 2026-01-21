const tips = [
  // Commands
  {
    id: "cmd-init",
    category: "commands",
    title: "Initialize CLAUDE.md",
    content: "Use /init in any project to generate a CLAUDE.md file that helps Claude understand your codebase structure, build commands, and patterns.",
    example: "/init"
  },
  {
    id: "cmd-compact",
    category: "commands",
    title: "Compact conversation context",
    content: "Use /compact when your conversation gets long to summarize the context and free up token space while preserving important information.",
    example: "/compact"
  },
  {
    id: "cmd-clear",
    category: "commands",
    title: "Clear conversation",
    content: "Use /clear to start fresh while staying in the same directory. Useful when switching to unrelated tasks.",
    example: "/clear"
  },
  {
    id: "cmd-review",
    category: "commands",
    title: "Review changes",
    content: "Use /review to have Claude review your recent code changes and provide feedback.",
    example: "/review"
  },
  {
    id: "cmd-pr",
    category: "commands",
    title: "Create pull requests",
    content: "Use /pr to have Claude help create a well-documented pull request with proper description and context.",
    example: "/pr"
  },

  // Workflows
  {
    id: "wf-plan-mode",
    category: "workflows",
    title: "Use plan mode for complex tasks",
    content: "For non-trivial tasks, ask Claude to plan first before implementing. This helps catch issues early and ensures alignment on approach.",
    example: "Plan how to add authentication to this app, then implement it"
  },
  {
    id: "wf-iterate",
    category: "workflows",
    title: "Iterate incrementally",
    content: "Break large tasks into smaller pieces. Ask Claude to implement one feature, test it, then move to the next. This keeps context focused and errors manageable."
  },
  {
    id: "wf-test-first",
    category: "workflows",
    title: "Write tests alongside code",
    content: "Ask Claude to write tests when implementing features. This catches bugs early and serves as documentation.",
    example: "Add input validation to the form and write tests for edge cases"
  },
  {
    id: "wf-headless",
    category: "workflows",
    title: "Run in headless mode",
    content: "Use the --print flag to run Claude non-interactively, useful for CI/CD or scripting.",
    example: "claude --print \"explain this error\" < error.log"
  },

  // Prompting
  {
    id: "pr-specific",
    category: "prompting",
    title: "Be specific about requirements",
    content: "Instead of 'add a button', say 'add a blue submit button below the form that calls the saveUser API endpoint'. Specificity reduces back-and-forth."
  },
  {
    id: "pr-context",
    category: "prompting",
    title: "Provide context upfront",
    content: "Mention relevant files, frameworks, or constraints at the start. Example: 'This is a Next.js 14 app using the App Router. I need to add...'"
  },
  {
    id: "pr-constraints",
    category: "prompting",
    title: "State constraints explicitly",
    content: "Tell Claude what NOT to do: 'Don't modify the database schema' or 'Keep backward compatibility with the v1 API'."
  },
  {
    id: "pr-examples",
    category: "prompting",
    title: "Show examples of desired output",
    content: "If you want code in a specific style, show an example. Claude will match the pattern."
  },

  // Configuration
  {
    id: "cfg-claude-md",
    category: "configuration",
    title: "Customize with CLAUDE.md",
    content: "Create a CLAUDE.md file in your project root with build commands, architecture notes, and coding conventions. Claude reads this automatically."
  },
  {
    id: "cfg-settings",
    category: "configuration",
    title: "Configure settings.json",
    content: "Use ~/.claude/settings.json for global settings and .claude/settings.json in project root for project-specific settings."
  },
  {
    id: "cfg-memory",
    category: "configuration",
    title: "Use /memory for persistence",
    content: "Use /memory to save important context that should persist across sessions, like preferred coding styles or project-specific notes.",
    example: "/memory Always use single quotes in this TypeScript project"
  },

  // MCP
  {
    id: "mcp-intro",
    category: "mcp",
    title: "Extend with MCP servers",
    content: "MCP (Model Context Protocol) servers add capabilities like database access, API integrations, or custom tools. Configure them in settings.json."
  },
  {
    id: "mcp-filesystem",
    category: "mcp",
    title: "Filesystem MCP server",
    content: "The filesystem MCP server gives Claude controlled access to files outside the current directory."
  },
  {
    id: "mcp-custom",
    category: "mcp",
    title: "Build custom MCP servers",
    content: "Create your own MCP servers to give Claude access to your specific tools, APIs, or data sources."
  },

  // Hooks
  {
    id: "hook-intro",
    category: "hooks",
    title: "Automate with hooks",
    content: "Hooks run shell commands in response to Claude events like PreToolUse, PostToolUse, or Notification. Configure in settings.json."
  },
  {
    id: "hook-lint",
    category: "hooks",
    title: "Auto-lint on file changes",
    content: "Set up a PostToolUse hook on Write/Edit tools to automatically run linting after Claude modifies files."
  },
  {
    id: "hook-notify",
    category: "hooks",
    title: "Desktop notifications",
    content: "Use a Notification hook to get desktop alerts when Claude finishes long-running tasks."
  },

  // Shortcuts
  {
    id: "sc-escape",
    category: "shortcuts",
    title: "Cancel with Escape",
    content: "Press Escape twice to cancel Claude's current operation. Once pauses, twice cancels."
  },
  {
    id: "sc-multiline",
    category: "shortcuts",
    title: "Multi-line input",
    content: "Press \\ at the end of a line to continue on the next line, or use Shift+Enter in some terminals."
  },
  {
    id: "sc-history",
    category: "shortcuts",
    title: "Command history",
    content: "Use Up/Down arrows to navigate through your previous prompts."
  }
];

const categoryNames = {
  commands: "Commands",
  workflows: "Workflows",
  prompting: "Prompting",
  configuration: "Config",
  mcp: "MCP",
  hooks: "Hooks",
  shortcuts: "Shortcuts"
};

let currentCategory = "all";
let searchQuery = "";

function renderTips(tipsToRender, highlightId = null) {
  const container = document.getElementById("tips-container");

  if (tipsToRender.length === 0) {
    container.innerHTML = '<div class="no-results">No tips found</div>';
    return;
  }

  container.innerHTML = tipsToRender.map(tip => `
    <div class="tip-card ${tip.id === highlightId ? 'highlight' : ''}" data-id="${tip.id}">
      <div class="tip-header">
        <span class="tip-title">${tip.title}</span>
        <span class="tip-category">${categoryNames[tip.category]}</span>
      </div>
      <p class="tip-content">${tip.content}</p>
      ${tip.example ? `<div class="tip-example">${escapeHtml(tip.example)}</div>` : ''}
    </div>
  `).join("");

  if (highlightId) {
    const highlightedCard = document.querySelector(`[data-id="${highlightId}"]`);
    if (highlightedCard) {
      highlightedCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function filterTips() {
  let filtered = tips;

  if (currentCategory !== "all") {
    filtered = filtered.filter(tip => tip.category === currentCategory);
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(tip =>
      tip.title.toLowerCase().includes(query) ||
      tip.content.toLowerCase().includes(query) ||
      tip.category.toLowerCase().includes(query)
    );
  }

  renderTips(filtered);
}

function showRandomTip() {
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  // Reset filters to show all
  currentCategory = "all";
  searchQuery = "";
  document.getElementById("search").value = "";
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === "all");
  });

  renderTips(tips, randomTip.id);
}

// Event listeners
document.getElementById("search").addEventListener("input", (e) => {
  searchQuery = e.target.value;
  filterTips();
});

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentCategory = btn.dataset.category;
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filterTips();
  });
});

document.getElementById("random-btn").addEventListener("click", showRandomTip);

// Initial render
renderTips(tips);
