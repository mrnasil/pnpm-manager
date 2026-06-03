# Change Log

All notable changes to the "PNPM Manager" extension will be documented in this file.

## [1.0.4] - 2026-06-03

### Added
- 🌐 **Multi-Root Workspace Support**: Full support for VSCode multi-root workspaces with intelligent project resolution.
- 📦 **PNPM Workspace Support**: Automatic detection and handling of `pnpm-workspace.yaml` for monorepo environments.
- 🔄 **Smart Directory Traversal**: Commands automatically find the nearest `package.json` or `pnpm-workspace.yaml` when triggered from nested files.
- 🚀 **Automated CI/CD**: One-command GitHub Actions release to VSCode Marketplace, Open VSX, and GitHub Releases.
- 📦 **.vscodeignore**: Optimized extension package size by excluding development-only files.

### Fixed
- 🔄 **Auto-Install Workspace Support**: Ensured auto-install and auto-start features correctly recognize `pnpm-workspace.yaml` roots.
- 🛠️ **TypeScript 6.x Compatibility**: Updated `tsconfig.json` to use `Node16` module resolution and fixed type definitions.
- 🐛 **Context-Aware Commands**: Fixed issue where commands would fail to locate the correct project root in complex workspace setups.
- ⚡ **CI/CD Pipeline**: Fixed pnpm v11 compatibility, build script approvals, and Marketplace publishing validation.

---

## [1.0.3] - 2026-06-03 (Unreleased)

### Fixed
- 🔄 **Auto-Install Workspace Support**: Ensured auto-install and auto-start features correctly recognize `pnpm-workspace.yaml` roots, preventing missed executions in monorepo setups.

---

## [1.0.1] - 2026-06-03

### Added
- 🌐 **Multi-Root Workspace Support**: Full support for VSCode multi-root workspaces with intelligent project resolution.
- 📦 **PNPM Workspace Support**: Automatic detection and handling of `pnpm-workspace.yaml` for monorepo environments.
- 🔄 **Smart Directory Traversal**: Commands now automatically find the nearest `package.json` or `pnpm-workspace.yaml` when triggered from nested files.

### Fixed
- 🛠️ **TypeScript 6.x Compatibility**: Updated `tsconfig.json` to use `Node16` module resolution and fixed type definitions for modern Node.js environments.
- 🐛 **Context-Aware Commands**: Fixed issue where commands would fail to locate the correct project root in complex workspace setups.

---

## [1.0.0] - 2025-06-29

### Added
- 📦 **Basic PNPM Commands**: Install, add, remove packages
- 🚀 **Script Execution**: Run package.json scripts with `pnpm run`
- 🎯 **Multiple Access Points**: Status bar button, command palette, context menu
- ⚙️ **pnpmconfig.json Support**: Custom configuration file support
- 🔄 **Auto-Start Scripts**: Automatically run scripts when VSCode opens
- 🔧 **Custom Commands**: Define custom PNPM commands with complex operations
- 📊 **Smart Status Bar**: Shows configuration status with gear icon
- 🔔 **Notification Control**: Configurable notifications
- 🏗️ **Auto-Install**: Optional automatic dependency installation on project open
- 🎨 **TypeScript**: Fully written in TypeScript with type safety
- 📝 **English Documentation**: Complete English documentation and interface

### Features
- Support for complex commands with `&&` operators
- Production and development dependency selection
- Package removal with existing dependency selection
- Workspace-aware functionality
- PNPM-only support (no npm/yarn)
- Auto-start configuration with enable/disable options
- Custom command descriptions and auto-start flags
- Smart terminal management

### Technical
- VSCode API 1.74.0+ compatibility
- TypeScript 4.9+ support
- PNPM lock file support
- Comprehensive error handling
- Memory-efficient package management
