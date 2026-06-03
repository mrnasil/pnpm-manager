# PNPM Manager Configuration Guide

This file provides instructions for AI agents to help users configure `pnpmconfig.json` for the PNPM Manager VSCode extension.

## Purpose
PNPM Manager reads `pnpmconfig.json` from the project root to customize behavior: auto-start scripts, custom commands, and notification settings.

## Schema

```json
{
  "autoStart": {
    "enabled": true,
    "scripts": ["dev", "dev && test"]
  },
  "customCommands": [
    {
      "name": "Full Build",
      "command": "build && test && lint",
      "description": "Complete build process with tests and linting",
      "autoStart": true
    }
  ],
  "settings": {
    "showNotifications": true,
    "autoInstallOnOpen": false
  }
}
```

## TypeScript Interface (for reference)

```typescript
interface PnpmConfig {
  autoStart?: {
    enabled: boolean;           // Enable auto-start feature
    scripts: string[];          // Scripts to run automatically on VSCode open
  };
  customCommands?: Array<{
    name: string;               // Display name in menu
    command: string;            // pnpm command to execute (supports &&)
    description?: string;       // Optional description
    autoStart?: boolean;        // Whether to run on startup
  }>;
  settings?: {
    showNotifications?: boolean;   // Show notification popups (default: true)
    autoInstallOnOpen?: boolean;   // Run pnpm install on project open (default: false)
  };
}
```

## Rules for AI Agents

1. **When user asks to set up PNPM Manager**: Generate `pnpmconfig.json` in the project root based on their `package.json` scripts.
2. **Script discovery**: Read `package.json` → `scripts` field to suggest auto-start scripts.
3. **Validation**: Ensure JSON is valid and matches the schema above.
4. **Defaults**: `showNotifications` defaults to `true`, `autoInstallOnOpen` defaults to `false`. Omit from config if default is acceptable.
5. **Complex commands**: `command` and `scripts` support `&&` operators (e.g., `"build && test && lint"`).
6. **File location**: Always create `pnpmconfig.json` at the workspace root (same level as `package.json`).
7. **PNPM only**: This extension only supports pnpm, not npm or yarn. All commands use `pnpm` prefix automatically.
