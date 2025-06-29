import * as vscode from 'vscode';
import { PackageManager } from './packageManager';

export class CommandManager {
    private packageManager: PackageManager;

    constructor(packageManager: PackageManager) {
        this.packageManager = packageManager;
    }

    public async openMenu(): Promise<void> {
        if (!this.packageManager.hasPackageJson()) {
            vscode.window.showWarningMessage('No package.json found in the current workspace.');
            return;
        }

        const scripts = await this.packageManager.getScripts();
        const customCommands = await this.packageManager.getCustomCommands();
        const items: vscode.QuickPickItem[] = [
            {
                label: '$(package) Install Dependencies',
                description: 'pnpm install',
                detail: 'Install all dependencies from package.json'
            },
            {
                label: '$(add) Add Package',
                description: 'pnpm add',
                detail: 'Add a new package to dependencies'
            },
            {
                label: '$(remove) Remove Package',
                description: 'pnpm remove',
                detail: 'Remove a package from dependencies'
            }
        ];

        // Add custom commands from pnpmconfig.json
        if (customCommands.length > 0) {
            items.push({
                label: '',
                kind: vscode.QuickPickItemKind.Separator
            });

            items.push({
                label: '$(gear) Custom Commands',
                kind: vscode.QuickPickItemKind.Separator
            });

            for (const customCommand of customCommands) {
                items.push({
                    label: `$(tools) ${customCommand.name}`,
                    description: `pnpm ${customCommand.command}`,
                    detail: customCommand.description || customCommand.command
                });
            }
        }

        // Add separator if there are scripts
        if (Object.keys(scripts).length > 0) {
            items.push({
                label: '',
                kind: vscode.QuickPickItemKind.Separator
            });

            items.push({
                label: '$(list-unordered) Package Scripts',
                kind: vscode.QuickPickItemKind.Separator
            });

            // Add scripts
            for (const [scriptName, scriptCommand] of Object.entries(scripts)) {
                items.push({
                    label: `$(play) ${scriptName}`,
                    description: `pnpm run ${scriptName}`,
                    detail: scriptCommand
                });
            }
        }

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a PNPM action',
            matchOnDescription: true,
            matchOnDetail: true
        });

        if (!selected) {
            return;
        }

        // Handle selection
        if (selected.description === 'pnpm install') {
            await this.installDependencies();
        } else if (selected.description === 'pnpm add') {
            await this.addPackage();
        } else if (selected.description === 'pnpm remove') {
            await this.removePackage();
        } else if (selected.description?.startsWith('pnpm run ')) {
            const scriptName = selected.description.replace('pnpm run ', '');
            await this.runScript(scriptName);
        } else if (selected.description?.startsWith('pnpm ') && !selected.description.startsWith('pnpm run ')) {
            // Handle custom commands
            const command = selected.description.replace('pnpm ', '');
            await this.runCustomCommand(command);
        }
    }

    public async installDependencies(): Promise<void> {
        if (!this.packageManager.hasPackageJson()) {
            vscode.window.showWarningMessage('No package.json found in the current workspace.');
            return;
        }

        const workspaceRoot = this.packageManager.getWorkspaceRoot();
        if (!workspaceRoot) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return;
        }

        await this.executeCommand('pnpm install', workspaceRoot);
    }

    public async addPackage(): Promise<void> {
        if (!this.packageManager.hasPackageJson()) {
            vscode.window.showWarningMessage('No package.json found in the current workspace.');
            return;
        }

        const packageName = await vscode.window.showInputBox({
            prompt: 'Enter package name to add',
            placeHolder: 'e.g., lodash, @types/node, react@latest',
            validateInput: (value: string) => {
                if (!value || value.trim().length === 0) {
                    return 'Package name cannot be empty';
                }
                return null;
            }
        });

        if (!packageName) {
            return;
        }

        const isDev = await vscode.window.showQuickPick([
            { label: 'Production Dependency', value: false },
            { label: 'Development Dependency', value: true }
        ], {
            placeHolder: 'Select dependency type'
        });

        if (isDev === undefined) {
            return;
        }

        const workspaceRoot = this.packageManager.getWorkspaceRoot();
        if (!workspaceRoot) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return;
        }

        const command = isDev.value 
            ? `pnpm add -D ${packageName.trim()}`
            : `pnpm add ${packageName.trim()}`;

        await this.executeCommand(command, workspaceRoot);
    }

    public async removePackage(): Promise<void> {
        if (!this.packageManager.hasPackageJson()) {
            vscode.window.showWarningMessage('No package.json found in the current workspace.');
            return;
        }

        const dependencies = await this.packageManager.getDependencies();
        if (dependencies.length === 0) {
            vscode.window.showInformationMessage('No dependencies found to remove.');
            return;
        }

        const selected = await vscode.window.showQuickPick(
            dependencies.map(dep => ({ label: dep, description: 'Remove this package' })),
            {
                placeHolder: 'Select package to remove',
                matchOnDescription: true
            }
        );

        if (!selected) {
            return;
        }

        const workspaceRoot = this.packageManager.getWorkspaceRoot();
        if (!workspaceRoot) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return;
        }

        await this.executeCommand(`pnpm remove ${selected.label}`, workspaceRoot);
    }

    private async runScript(scriptName: string): Promise<void> {
        const workspaceRoot = this.packageManager.getWorkspaceRoot();
        if (!workspaceRoot) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return;
        }

        await this.executeCommand(`pnpm run ${scriptName}`, workspaceRoot);
    }

    private async runCustomCommand(command: string): Promise<void> {
        const workspaceRoot = this.packageManager.getWorkspaceRoot();
        if (!workspaceRoot) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return;
        }

        // Handle complex commands with && operators
        const fullCommand = `pnpm ${command}`;
        await this.executeCommand(fullCommand, workspaceRoot);
    }

    public async runAutoStartScripts(): Promise<void> {
        const autoStartScripts = await this.packageManager.getAutoStartScripts();
        const customCommands = await this.packageManager.getCustomCommands();
        
        if (autoStartScripts.length === 0 && customCommands.filter(cmd => cmd.autoStart).length === 0) {
            return;
        }

        const workspaceRoot = this.packageManager.getWorkspaceRoot();
        if (!workspaceRoot) {
            return;
        }

        const shouldShowNotifications = await this.packageManager.shouldShowNotifications();

        // Run auto-start scripts from pnpmconfig.json
        for (const script of autoStartScripts) {
            if (shouldShowNotifications) {
                vscode.window.showInformationMessage(`Auto-starting: pnpm ${script}`);
            }
            await this.executeCommand(`pnpm ${script}`, workspaceRoot);
        }

        // Run custom commands marked as autoStart
        for (const customCommand of customCommands) {
            if (customCommand.autoStart) {
                if (shouldShowNotifications) {
                    vscode.window.showInformationMessage(`Auto-starting: ${customCommand.name}`);
                }
                await this.executeCommand(`pnpm ${customCommand.command}`, workspaceRoot);
            }
        }
    }

    private async executeCommand(command: string, cwd: string): Promise<void> {
        const terminal = vscode.window.createTerminal({
            name: 'PNPM Manager',
            cwd: cwd
        });

        terminal.show();
        terminal.sendText(command);
        
        const shouldShowNotifications = await this.packageManager.shouldShowNotifications();
        if (shouldShowNotifications) {
            vscode.window.showInformationMessage(`Executing: ${command}`);
        }
    }
}
