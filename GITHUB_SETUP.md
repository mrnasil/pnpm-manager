# GitHub Repository Setup Commands

This file contains the necessary commands to upload the PNPM Manager extension to GitHub.

## 🚀 Quick Setup

Run the following commands in order:

### 1. Initialize Git Repository
```bash
# Initialize git repository
git init

# Add all files to staging
git add .

# Make initial commit
git commit -m "Initial commit: PNPM Manager VSCode Extension v1.0.0

✨ Features:
- 📦 Basic PNPM commands (install, add, remove)
- 🚀 Script execution with pnpm run
- ⚙️ pnpmconfig.json support for custom commands
- 🔄 Auto-start scripts on VSCode open
- 📊 Smart status bar with config indicator
- 🔔 Configurable notifications
- 🏗️ Auto-install option
- 🎨 TypeScript implementation
- 📝 English documentation

🎯 PNPM-only support (no npm/yarn)
🔧 Complex commands with && operators
🎪 Multiple access points (status bar, command palette, context menu)"
```

### 2. Connect to GitHub Remote
```bash
# Add GitHub remote (replace URL with your repo URL)
git remote add origin https://github.com/YOURUSERNAME/pnpm-manager.git

# Set main branch and push
git branch -M main
git push -u origin main
```

## 📋 GitHub Repository Settings

### Repository Information:
- **Name**: `pnpm-manager`
- **Description**: `VSCode extension for PNPM package management with custom commands and auto-start features`
- **Topics**: `vscode-extension`, `pnpm`, `package-manager`, `typescript`, `automation`
- **License**: MIT

### Repository Features:
- ✅ Issues
- ✅ Wiki
- ✅ Discussions (optional)
- ✅ Projects (optional)

## 🏷️ Create First Release

```bash
# Create tag
git tag -a v1.0.0 -m "Release v1.0.0: Initial PNPM Manager Extension

Features:
- Complete PNPM package management
- Custom commands via pnpmconfig.json
- Auto-start scripts
- Smart status bar
- English documentation"

# Push tag
git push origin v1.0.0
```

## 📁 Project Structure

```
pnpm-manager/
├── 📄 README.md              # Main documentation
├── 📄 CHANGELOG.md           # Change history
├── 📄 LICENSE                # MIT license
├── 📄 PUBLISH.md             # Marketplace publishing guide
├── 📄 INSTALLATION.md        # Installation guide
├── 📄 package.json           # Extension manifest
├── 📄 pnpm-lock.yaml         # PNPM lock file
├── 📄 tsconfig.json          # TypeScript configuration
├── 📄 .gitignore             # Git ignore rules
├── 📁 src/                   # Source code
│   ├── extension.ts          # Main extension file
│   ├── packageManager.ts     # Package.json management
│   ├── commands.ts           # Command manager
│   └── statusBar.ts          # Status bar manager
├── 📁 .vscode/               # VSCode configuration
│   ├── launch.json           # Debug settings
│   └── tasks.json            # Build tasks
├── 📁 test-project/          # Test project example
│   ├── package.json          # Test package.json
│   └── pnpmconfig.json       # Example configuration
└── 📁 out/                   # Compiled JavaScript files
```

## 🔄 Future Updates

```bash
# Commit changes
git add .
git commit -m "feat: new feature description"

# Push
git push

# Create new version tag
git tag -a v1.1.0 -m "Release v1.1.0: Description"
git push origin v1.1.0
```

## 📊 Repository Statistics

Badges that can be added to README.md after publishing:

```markdown
![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/your-publisher.pnpm-manager)
![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/your-publisher.pnpm-manager)
![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/your-publisher.pnpm-manager)
![GitHub](https://img.shields.io/github/license/yourusername/pnpm-manager)
![GitHub issues](https://img.shields.io/github/issues/yourusername/pnpm-manager)
![GitHub stars](https://img.shields.io/github/stars/yourusername/pnpm-manager)
```

## ✅ Checklist

Before publishing:

- [ ] GitHub repository created
- [ ] Local repo connected to GitHub
- [ ] Initial commit made
- [ ] Publisher name updated in package.json
- [ ] README.md GitHub URLs updated
- [ ] Extension tested
- [ ] VSCE installed (`pnpm add -g vsce`)
- [ ] Marketplace publisher account created
