# GitHub and Marketplace Publishing Guide

This guide covers the steps to upload the PNPM Manager extension to GitHub and publish it to the VSCode Marketplace.

## 🔧 Required Tools

### 1. VSCE Installation
```bash
# Install VSCE (Visual Studio Code Extension) tool globally
pnpm add -g vsce
```

### 2. Git Installation
Make sure Git is installed on your system.

## 📁 Creating GitHub Repository

### 1. Create New Repository on GitHub
1. Go to GitHub.com
2. Click "New repository" button
3. Repository name: `pnpm-manager`
4. Description: "VSCode extension for PNPM package management with custom commands and auto-start features"
5. Set as Public
6. Don't add README, .gitignore, or LICENSE (already exists)

### 2. Connect Local Repository to GitHub
```bash
# Initialize git repository
git init

# Add files to staging
git add .

# Make initial commit
git commit -m "Initial commit: PNPM Manager VSCode Extension v1.0.0

Features:
- Basic PNPM commands (install, add, remove)
- Script execution with pnpm run
- pnpmconfig.json support for custom commands
- Auto-start scripts on VSCode open
- Smart status bar with config indicator
- English documentation and interface
- TypeScript implementation"

# Add GitHub remote (replace URL with your repo URL)
git remote add origin https://github.com/YOURUSERNAME/pnpm-manager.git

# Push to main branch
git branch -M main
git push -u origin main
```

## 🏪 VSCode Marketplace Publishing

### 1. Create Publisher Account
1. Go to https://marketplace.visualstudio.com/
2. Click "Publish extensions" link
3. Sign in with your Microsoft account
4. Create new publisher

### 2. Update package.json
```bash
# Update publisher name in package.json
# "publisher": "your-publisher-name" -> "publisher": "your-actual-publisher-name"
```

### 3. Package and Publish Extension
```bash
# Compile the extension
pnpm run compile

# Package the extension (creates .vsix file)
pnpm run package

# Publish to marketplace
pnpm run publish
```

### 4. Personal Access Token (For First-time Publishing)
If publishing for the first time, you need a Personal Access Token:

1. Go to https://dev.azure.com/
2. User settings > Personal access tokens
3. Create "New Token"
4. Scope: "Marketplace (manage)"
5. Copy the token

```bash
# Login with token
vsce login YOUR-PUBLISHER-NAME
```

## 📋 Pre-Publishing Checklist

- [ ] Publisher name updated in package.json
- [ ] README.md file completed
- [ ] CHANGELOG.md updated
- [ ] LICENSE file exists
- [ ] .gitignore file appropriate
- [ ] Extension compiles (`pnpm run compile`)
- [ ] Tested (`F5` with Extension Development Host)
- [ ] Icon file added (resources/icon.png) - optional
- [ ] GitHub repository created
- [ ] Git remote connection established

## 🔄 Publishing Updates

For future updates:

```bash
# Increment version (package.json)
# Update CHANGELOG.md

# Commit to git
git add .
git commit -m "v1.1.0: New features added"
git push

# Publish to marketplace
pnpm run compile
pnpm run publish
```

## 📊 Marketplace Metrics

After publishing:
- Check your extension page
- Track download numbers
- Read user reviews
- Monitor issues on GitHub

## 🆘 Troubleshooting

### Common Errors:
1. **Publisher not found**: Check publisher name
2. **Token expired**: Create new token
3. **Package validation failed**: Check package.json
4. **Icon not found**: Add resources/icon.png file

### Help Resources:
- [VSCode Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [VSCE Documentation](https://github.com/microsoft/vscode-vsce)
