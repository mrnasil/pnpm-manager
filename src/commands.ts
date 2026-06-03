import * as vscode from 'vscode';
import { PackageManager } from './packageManager';

export class CommandManager {
    private packageManager: PackageManager;

    constructor(packageManager: PackageManager) {
        this.packageManager = packageManager;
    }

    private async getTargetRoot(uri?: vscode.Uri): Promise<string | undefined> {
        const root = await this.packageManager.getTargetRoot(uri);
        if (!root) {
            vscode.window.showWarningMessage('No package.json found in the current workspace.');
            return undefined;
        }
        return root;
    }

    public async openMenu(uri?: vscode.Uri): Promise<void> {
        const targetRoot = await this.getTargetRoot(uri);
        if (!targetRoot) {
            return;
        }

        const scripts = await this.packageManager.getScripts(targetRoot);
        const customCommands = await this.packageManager.getCustomCommands(targetRoot);
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
            await this.installDependencies(targetRoot);
        } else if (selected.description === 'pnpm add') {
            await this.addPackage(targetRoot);
        } else if (selected.description === 'pnpm remove') {
            await this.removePackage(targetRoot);
        } else if (selected.description?.startsWith('pnpm run ')) {
            const scriptName = selected.description.replace('pnpm run ', '');
            await this.runScript(scriptName, targetRoot);
        } else if (selected.description?.startsWith('pnpm ') && !selected.description.startsWith('pnpm run ')) {
            // Handle custom commands
            const command = selected.description.replace('pnpm ', '');
            await this.runCustomCommand(command, targetRoot);
        }
    }

    public async installDependencies(target?: vscode.Uri | string): Promise<void> {
        const targetRoot = typeof target === 'string' ? target : await this.getTargetRoot(target);
        if (!targetRoot) {
            return;
        }

        await this.executeCommand('pnpm install', targetRoot);
    }

    public async addPackage(target?: vscode.Uri | string): Promise<void> {
        const targetRoot = typeof target === 'string' ? target : await this.getTargetRoot(target);
        if (!targetRoot) {
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

        const command = isDev.value 
            ? `pnpm add -D ${packageName.trim()}`
            : `pnpm add ${packageName.trim()}`;

        await this.executeCommand(command, targetRoot);
    }

    public async removePackage(target?: vscode.Uri | string): Promise<void> {
        const targetRoot = typeof target === 'string' ? target : await this.getTargetRoot(target);
        if (!targetRoot) {
            return;
        }

        const dependencies = await this.packageManager.getDependencies(targetRoot);
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

        await this.executeCommand(`pnpm remove ${selected.label}`, targetRoot);
    }

    private async runScript(scriptName: string, targetRoot: string): Promise<void> {
        await this.executeCommand(`pnpm run ${scriptName}`, targetRoot);
    }

    private async runCustomCommand(command: string, targetRoot: string): Promise<void> {
        // Handle complex commands with && operators
        const fullCommand = `pnpm ${command}`;
        await this.executeCommand(fullCommand, targetRoot);
    }

    public async runAutoStartScripts(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return;
        }

        for (const folder of workspaceFolders) {
            const targetRoot = folder.uri.fsPath;
            if (!this.packageManager.hasPackageJson(targetRoot)) {
                continue;
            }

            const autoStartScripts = await this.packageManager.getAutoStartScripts(targetRoot);
            const customCommands = await this.packageManager.getCustomCommands(targetRoot);
            
            if (autoStartScripts.length === 0 && customCommands.filter(cmd => cmd.autoStart).length === 0) {
                continue;
            }

            const shouldShowNotifications = await this.packageManager.shouldShowNotifications(targetRoot);

            // Run auto-start scripts from pnpmconfig.json
            for (const script of autoStartScripts) {
                if (shouldShowNotifications) {
                    vscode.window.showInformationMessage(`Auto-starting: pnpm ${script} in ${folder.name}`);
                }
                await this.executeCommand(`pnpm ${script}`, targetRoot);
            }

            // Run custom commands marked as autoStart
            for (const customCommand of customCommands) {
                if (customCommand.autoStart) {
                    if (shouldShowNotifications) {
                        vscode.window.showInformationMessage(`Auto-starting: ${customCommand.name} in ${folder.name}`);
                    }
                    await this.executeCommand(`pnpm ${customCommand.command}`, targetRoot);
                }
            }
        }
    }

    private async executeCommand(command: string, cwd: string, showNotification: boolean = true): Promise<void> {
        const terminal = vscode.window.createTerminal({
            name: 'PNPM Manager',
            cwd: cwd
        });

        terminal.show();
        terminal.sendText(command);
        
        if (showNotification) {
            vscode.window.showInformationMessage(`Executing: ${command}`);
        }
    }
}
