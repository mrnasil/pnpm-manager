# PNPM Manager Extension - Installation Guide

## 🛠️ Development Environment Setup

### Requirements
- Node.js (v16 or higher)
- **PNPM** (npm or yarn not supported!)
- VSCode (v1.74.0 or higher)

### Installation Steps

1. **Download the extension source code**
   ```bash
   git clone <repository-url>
   cd pnpm-manager
   ```

2. **Install dependencies (PNPM only)**
   ```bash
   pnpm install
   ```

3. **Compile TypeScript code**
   ```bash
   pnpm run compile
   ```

4. **Test the extension**
   - Open VSCode
   - Press `F5` to open Extension Development Host window
   - Open a project with a `package.json` file (you can use the `test-project` folder)
   - The PNPM button should appear in the status bar

### Testing the Extension

1. **Open the test project**
   - In the Extension Development Host window, open the `test-project` folder
   - You should see the PNPM button in the status bar

2. **Test the features**
   - Click the PNPM button in the status bar
   - Try different options:
     - Install Dependencies
     - Add Package
     - Remove Package
     - Run Scripts (dev, build, test, lint)

3. **Alternative access methods**
   - Command Palette: `Ctrl+Shift+P` → "PNPM Manager"
   - Right-click on `package.json` in Explorer

### Packaging for Distribution

To package the extension for distribution:

1. **Install vsce (Visual Studio Code Extension manager)**
   ```bash
   pnpm add -g vsce
   ```

2. **Package the extension**
   ```bash
   pnpm run package
   ```

3. **Install the packaged extension**
   ```bash
   pnpm run install:extension
   ```

### Publishing to Marketplace

1. **Create a publisher account** at https://marketplace.visualstudio.com/
2. **Update package.json** with your publisher name
3. **Publish the extension**
   ```bash
   vsce publish
   ```

## 🎯 Feature Overview

- 📦 **Install Dependencies**: Run `pnpm install`
- ➕ **Add Packages**: Add new packages with dependency type selection
- ➖ **Remove Packages**: Remove existing packages from dependencies
- 🚀 **Run Scripts**: Execute package.json scripts
- 🎯 **Multiple Access Points**: Status bar, command palette, context menu

## 📋 Requirements

- PNPM must be installed on your system
- A workspace with a `package.json` file
- VSCode 1.74.0 or higher

## ⚠️ Important Note

This extension **exclusively supports PNPM**. It does not use or support NPM or Yarn. The extension itself is also developed entirely with PNPM.
