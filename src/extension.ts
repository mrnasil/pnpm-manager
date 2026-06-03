import * as vscode from 'vscode';
import { PackageManager } from './packageManager';
import { CommandManager } from './commands';
import { StatusBarManager } from './statusBar';

let packageManager: PackageManager;
let commandManager: CommandManager;
let statusBarManager: StatusBarManager;

export function activate(context: vscode.ExtensionContext) {
    console.log('PNPM Manager extension is now active!');

    // Initialize managers
    packageManager = new PackageManager();
    commandManager = new CommandManager(packageManager);
    statusBarManager = new StatusBarManager();

    // Register commands
    const disposables = [
        vscode.commands.registerCommand('pnpmManager.openMenu', (uri?: vscode.Uri) => commandManager.openMenu(uri)),
        vscode.commands.registerCommand('pnpmManager.install', (uri?: vscode.Uri) => commandManager.installDependencies(uri)),
        vscode.commands.registerCommand('pnpmManager.addPackage', (uri?: vscode.Uri) => commandManager.addPackage(uri)),
        vscode.commands.registerCommand('pnpmManager.removePackage', (uri?: vscode.Uri) => commandManager.removePackage(uri)),
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
        if (packageManager && commandManager) {
            await commandManager.runAutoStartScripts();
        }
    } catch (error) {
        console.error('Error running auto-start scripts:', error);
    }
}

async function handleAutoInstall() {
    try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return;
        }

        for (const folder of workspaceFolders) {
            const targetRoot = folder.uri.fsPath;
            if (!packageManager.hasPackageJson(targetRoot)) {
                continue;
            }

            const shouldAutoInstall = await packageManager.shouldAutoInstallOnOpen(targetRoot);
            if (shouldAutoInstall) {
                const shouldShowNotifications = await packageManager.shouldShowNotifications(targetRoot);
                if (shouldShowNotifications) {
                    vscode.window.showInformationMessage(`Auto-installing dependencies in ${folder.name}...`);
                }
                await commandManager.installDependencies(folder.uri);
            }
        }
    } catch (error) {
        console.error('Error auto-installing dependencies:', error);
    }
}

export function deactivate() {
    console.log('PNPM Manager extension is now deactivated!');
}
