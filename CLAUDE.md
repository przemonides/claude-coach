# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Coach is a CLI tool that provides tips and best practices for using Claude Code effectively. It serves as a personal coaching assistant for learning Claude Code.

## Commands

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript to dist/
npm run dev          # Watch mode for development
npm run typecheck    # Type check without emitting
npm start            # Run the compiled CLI
```

To test locally after building:
```bash
node dist/index.js           # Random tip
node dist/index.js list      # List categories
node dist/index.js search X  # Search tips
```

## Architecture

- `src/index.ts` - CLI entry point with command parsing and output formatting
- `src/knowledge.ts` - Knowledge base containing all tips, organized by category

The knowledge base uses a simple structure:
- `Tip` interface defines each tip with id, category, title, content, and optional example
- `Category` type enumerates: commands, workflows, prompting, configuration, mcp, hooks, shortcuts
- Helper functions: `getTipsByCategory()`, `getRandomTip()`, `searchTips()`

## Adding New Tips

Add new entries to the `tips` array in `src/knowledge.ts`. Each tip needs:
- Unique `id` (e.g., "cmd-review", "wf-test-first")
- `category` matching one of the defined categories
- `title` - short descriptive title
- `content` - the actual tip text
- `example` (optional) - code or command example
