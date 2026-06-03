import * as vscode from 'vscode';
import { CommandManager } from './commands';
import { PackageManager } from './packageManager';
import { StatusBarManager } from './statusBar';

let packageManager: PackageManager;
let commandManager: CommandManager;
let statusBarManager: StatusBarManager;

export function activate(context: vscode.ExtensionContext) {
  console.log('PNPM Manager extension is now active!');

  // Initialize managers
  packageManager = new PackageManager();
  statusBarManager = new StatusBarManager();
  commandManager = new CommandManager(packageManager, statusBarManager);

  // Register commands
  const disposables = [
    vscode.commands.registerCommand('pnpmManager.openMenu', () =>
      commandManager.openMenu(),
    ),
    vscode.commands.registerCommand('pnpmManager.install', () =>
      commandManager.installDependencies(),
    ),
    vscode.commands.registerCommand('pnpmManager.addPackage', () =>
      commandManager.addPackage(),
    ),
    vscode.commands.registerCommand('pnpmManager.removePackage', () =>
      commandManager.removePackage(),
    ),
  ];

  // Add status bar item
  statusBarManager.show();

  // Add all disposables to context
  context.subscriptions.push(...disposables, statusBarManager);

  // Watch for workspace changes
  const workspaceWatcher = vscode.workspace.onDidChangeWorkspaceFolders(() => {
    statusBarManager.updateVisibility();
    // Run auto-start scripts when workspace changes
    handleAutoStart();
  });

  context.subscriptions.push(workspaceWatcher);

  // Run auto-start scripts on activation
  handleAutoStart();

  // Auto-install on open if configured
  handleAutoInstall();
}

async function handleAutoStart() {
  try {
    if (!packageManager) return;

    // If root has package.json and pnpmconfig, use root
    if (packageManager.hasPackageJson() && packageManager.hasPnpmConfig()) {
      await commandManager.runAutoStartScripts();
      return;
    }

    // Otherwise, scan sub-projects for auto-start configurations
    const projects = await packageManager.findAllProjects();
    for (const project of projects) {
      if (project.relativePath === '') continue; // skip root (already checked)
      if (!project.hasPnpmConfig) continue;

      packageManager.setCurrentProjectPath(project.fullPath);
      await commandManager.runAutoStartScripts();
    }

    // Reset back to root (use getActualWorkspaceRoot instead of getWorkspaceRoot)
    packageManager.setCurrentProjectPath(
      packageManager.getActualWorkspaceRoot(),
    );
  } catch (error) {
    console.error('Error running auto-start scripts:', error);
  }
}

async function handleAutoInstall() {
  try {
    if (!packageManager) return;

    // If root has package.json with autoInstallOnOpen, use root
    if (packageManager.hasPackageJson()) {
      const shouldAutoInstall = await packageManager.shouldAutoInstallOnOpen();
      if (shouldAutoInstall) {
        const shouldShowNotifications =
          await packageManager.shouldShowNotifications();
        if (shouldShowNotifications) {
          vscode.window.showInformationMessage(
            'Auto-installing dependencies...',
          );
        }
        await commandManager.installDependencies();
        return;
      }
    }

    // Otherwise, check sub-projects for autoInstallOnOpen
    const projects = await packageManager.findAllProjects();
    for (const project of projects) {
      if (project.relativePath === '') continue;
      packageManager.setCurrentProjectPath(project.fullPath);

      const shouldAutoInstall = await packageManager.shouldAutoInstallOnOpen();
      if (shouldAutoInstall) {
        const shouldShowNotifications =
          await packageManager.shouldShowNotifications();
        if (shouldShowNotifications) {
          vscode.window.showInformationMessage(
            `Auto-installing dependencies for ${project.name}...`,
          );
        }
        await commandManager.installDependencies();
      }
    }

    // Reset back to root
    packageManager.setCurrentProjectPath(
      packageManager.getActualWorkspaceRoot(),
    );
  } catch (error) {
    console.error('Error auto-installing dependencies:', error);
  }
}

export function deactivate() {
  console.log('PNPM Manager extension is now deactivated!');
}
