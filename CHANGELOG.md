# Change Log

All notable changes to the "PNPM Manager" extension will be documented in this file.

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
