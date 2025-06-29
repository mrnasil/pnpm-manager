# PNPM Manager

A VSCode extension that simplifies PNPM package management by reading your package.json and providing one-click PNPM commands.

## ✨ Features

- 📦 **Install Dependencies**: Run `pnpm install` with a single click
- ➕ **Add Packages**: Add new packages with `pnpm add` (production/dev selection)
- ➖ **Remove Packages**: Remove packages with `pnpm remove` from existing dependencies
- 🚀 **Run Scripts**: Execute package.json scripts with `pnpm run`
- 🎯 **Multiple Access Points**: Status bar button, command palette, and context menu
- ⚙️ **Custom Commands**: Define custom commands via pnpmconfig.json
- 🔄 **Auto-Start**: Automatically run scripts when VSCode opens
- 🔧 **Advanced Configuration**: Notifications, auto-install, and more

## 🚀 Usage

### Status Bar
Click the "PNPM" button in the status bar to open the PNPM Manager menu.

### Command Palette
Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and search for:
- `PNPM Manager: Open PNPM Manager`
- `PNPM Manager: Install Dependencies`
- `PNPM Manager: Add Package`
- `PNPM Manager: Remove Package`

### Context Menu
Right-click on any `package.json` file in Explorer and select "Open PNPM Manager".

## ⚙️ pnpmconfig.json Configuration

Create a `pnpmconfig.json` file in your project root to customize the extension behavior:

```json
{
  "autoStart": {
    "enabled": true,
    "scripts": [
      "dev",
      "dev && test"
    ]
  },
  "customCommands": [
    {
      "name": "Full Build",
      "command": "build && test && lint",
      "description": "Complete build process with tests and linting"
    },
    {
      "name": "Dev Server",
      "command": "dev",
      "description": "Start development server",
      "autoStart": true
    }
  ],
  "settings": {
    "showNotifications": true,
    "autoInstallOnOpen": false
  }
}
```

### Configuration Options

- **autoStart.enabled**: Enable automatic script execution when VSCode opens
- **autoStart.scripts**: List of scripts to run automatically
- **customCommands**: Define custom PNPM commands
  - **name**: Command name (displayed in menu)
  - **command**: PNPM command to execute
  - **description**: Command description
  - **autoStart**: Whether this command should run automatically
- **settings.showNotifications**: Control notification display
- **settings.autoInstallOnOpen**: Automatically run `pnpm install` when project opens

### Status Bar Indicator

When pnpmconfig.json exists, a ⚙️ gear icon appears next to PNPM in the status bar.

## 📋 Requirements

- VSCode 1.74.0 or higher
- PNPM installed on your system
- A workspace with a `package.json` file

## 📦 Installation

### From Marketplace
1. Install the extension from VSCode marketplace
2. Open a project with a `package.json` file
3. The PNPM button will appear in the status bar

### Manual Installation
```bash
# Download the extension and navigate to folder
cd pnpm-manager

# Install dependencies (PNPM only)
pnpm install

# Compile TypeScript code
pnpm run compile

# Package the extension
pnpm run package

# Install to VSCode
pnpm run install:extension
```

## 🛠️ Development

### Development Environment Setup

**Requirements:**
- Node.js (v16 or higher)
- PNPM (npm or yarn not supported)
- VSCode (v1.74.0 or higher)

**Setup:**
```bash
# Install dependencies
pnpm install

# Compile TypeScript code
pnpm run compile

# Watch for changes
pnpm run watch
```

### Testing
1. Press `F5` to open Extension Development Host window
2. Open the `test-project` folder or use your own project
3. Test the extension features

### Packaging and Distribution
```bash
# Package the extension
pnpm run package

# Install locally
pnpm run install:extension
```

## 🎯 PNPM Only

This extension exclusively supports the PNPM package manager. NPM and Yarn are not supported. The extension itself is also developed entirely with PNPM.

## 📄 License

MIT
