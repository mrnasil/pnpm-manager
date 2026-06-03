# PNPM Manager - OpenCode Agent Instructions

## Purpose
Guide OpenCode AI agents to help users configure `pnpmconfig.json` for the PNPM Manager VSCode extension.

## Trigger
- User mentions "pnpm manager", "pnpmconfig", "auto-start pnpm", "pnpm custom commands"

## Configuration File

Create `pnpmconfig.json` in the project root (same directory as `package.json`).

### Full Schema

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

### TypeScript Interface

```typescript
interface PnpmConfig {
  autoStart?: {
    enabled: boolean;
    scripts: string[];
  };
  customCommands?: Array<{
    name: string;
    command: string;
    description?: string;
    autoStart?: boolean;
  }>;
  settings?: {
    showNotifications?: boolean;
    autoInstallOnOpen?: boolean;
  };
}
```

## Agent Behavior Rules

### When generating `pnpmconfig.json`:

1. **Read `package.json` first**: Extract the `scripts` object to understand available commands.
2. **Auto-start suggestions**: If user wants auto-start, suggest `dev`, `watch`, or the most relevant script.
3. **Custom commands**: Recommend common chains like `build && test && lint` or `dev && test`.
4. **Minimalism**: Only include fields the user explicitly wants. Don't add defaults unnecessarily.
5. **Validation**: JSON must be valid. All keys are camelCase.
6. **File path**: Always `{workspaceRoot}/pnpmconfig.json`.
7. **PNPM constraint**: Commands use `pnpm` prefix automatically. NPM/Yarn not supported.

### Quick Start Examples

**Minimal auto-start config:**
```json
{
  "autoStart": {
    "enabled": true,
    "scripts": ["dev"]
  }
}
```

**Full configuration:**
```json
{
  "autoStart": {
    "enabled": true,
    "scripts": ["dev", "test"]
  },
  "customCommands": [
    {
      "name": "CI Check",
      "command": "build && test && lint",
      "description": "Full CI pipeline check"
    }
  ],
  "settings": {
    "showNotifications": false,
    "autoInstallOnOpen": true
  }
}
```
