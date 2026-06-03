# PNPM Manager

[VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=mrnasil.pnpm-manager) ·
[Open VSX](https://open-vsx.org/extension/mrnasil/pnpm-manager)

One-click pnpm package management from VSCode. Reads your `package.json`, provides a quick-pick menu for install, add, remove, and script execution.

## Features

- **Install, Add, Remove** — pnpm dependency management without leaving the editor
- **Script Runner** — executes any `package.json` script with `pnpm run`
- **Access Points** — status bar button, command palette (`Ctrl+Shift+P`), right-click context menu on `package.json`
- **Custom Commands** — define your own pnpm workflows via `pnpmconfig.json`
- **Auto-Start** — run scripts automatically when a workspace opens
- **Multi-Root Workspaces** — asks which project to target when multiple `package.json` files exist
- **Monorepo Support** — detects `pnpm-workspace.yaml` and treats it as a valid project root
- **Directory Traversal** — when triggered from a nested file, walks up to find the nearest config

## Usage

### Status Bar

Click **PNPM** in the status bar to open the command menu.

### Command Palette

`Ctrl+Shift+P` (macOS: `Cmd+Shift+P`), then type:

- `PNPM Manager: Open PNPM Manager`
- `PNPM Manager: Install Dependencies`
- `PNPM Manager: Add Package`
- `PNPM Manager: Remove Package`

### Context Menu

Right-click any `package.json` in Explorer → **Open PNPM Manager**.

## Configuration

Place a `pnpmconfig.json` in your project root (next to `package.json`):

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
      "description": "Run build, tests, and linter"
    },
    {
      "name": "Dev Server",
      "command": "dev",
      "description": "Start dev server",
      "autoStart": true
    }
  ],
  "settings": {
    "showNotifications": true,
    "autoInstallOnOpen": false
  }
}
```

### Fields

| Field | Type | Description |
|---|---|---|
| `autoStart.enabled` | boolean | Enable/disable auto-start |
| `autoStart.scripts` | string[] | Scripts to run on workspace open |
| `customCommands[].name` | string | Label shown in the quick-pick menu |
| `customCommands[].command` | string | pnpm command (supports `&&` chains) |
| `customCommands[].description` | string | Optional detail shown in menu |
| `customCommands[].autoStart` | boolean | Whether this command runs on startup |
| `settings.showNotifications` | boolean | Show info popups (default `true`) |
| `settings.autoInstallOnOpen` | boolean | Run `pnpm install` on open (default `false`) |

When a `pnpmconfig.json` is detected, the status bar shows a gear icon.

### AI Agent Support

Repository includes instructions for AI coding tools to generate valid `pnpmconfig.json` configurations automatically:

| Tool | Mechanism |
|---|---|
| OpenCode | `skill("pnpm-manager")` or `/pnpm-manager` |
| Claude | reads `CLAUDE.md` from repo root |
| Cursor | reads `.cursor/rules/pnpm-manager.mdc` |

Example prompt: *"Generate a pnpmconfig.json that auto-starts dev and test on open."*

## Requirements

- VSCode `>=1.74.0`
- pnpm installed and in `PATH`
- A workspace with `package.json` or `pnpm-workspace.yaml`

## Installation

**Marketplace:** Install from the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=mrnasil.pnpm-manager) or [Open VSX](https://open-vsx.org/extension/mrnasil/pnpm-manager).

**Manual:**
```bash
cd pnpm-manager
pnpm install
pnpm run compile
pnpm run package
pnpm run install:extension
```

## Development

```bash
pnpm install          # dependencies
pnpm run compile      # build
pnpm run watch        # build on change
```

Press `F5` to launch the Extension Development Host. Use the `test-project/` directory to verify functionality.

## License

MIT
