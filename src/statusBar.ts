import * as vscode from 'vscode';
import * as fs from 'node:fs';
import * as path from 'node:path';

export class StatusBarManager implements vscode.Disposable {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );
        
        this.updateStatusBar();
        this.statusBarItem.command = 'pnpmManager.openMenu';
        
        this.updateVisibility();
    }

    private updateStatusBar(): void {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            this.statusBarItem.text = '$(package) PNPM';
            this.statusBarItem.tooltip = 'PNPM Manager - No workspace';
            return;
        }

        const validFolder = workspaceFolders.find(folder => {
            const root = folder.uri.fsPath;
            const hasPkg = fs.existsSync(path.join(root, 'package.json'));
            const hasWorkspace = fs.existsSync(path.join(root, 'pnpm-workspace.yaml'));
            return hasPkg || hasWorkspace;
        });

        if (!validFolder) {
            this.statusBarItem.text = '$(package) PNPM';
            this.statusBarItem.tooltip = 'PNPM Manager - No package.json or pnpm-workspace.yaml found';
            return;
        }

        const pnpmConfigPath = path.join(validFolder.uri.fsPath, 'pnpmconfig.json');
        const hasPnpmConfig = fs.existsSync(pnpmConfigPath);
        const isWorkspace = fs.existsSync(path.join(validFolder.uri.fsPath, 'pnpm-workspace.yaml'));
        const projectType = isWorkspace ? 'Workspace' : 'Project';

        if (hasPnpmConfig) {
            this.statusBarItem.text = '$(package) PNPM $(gear)';
            this.statusBarItem.tooltip = `PNPM Manager - Custom config detected in ${validFolder.name} (${projectType})\nClick to open menu`;
        } else {
            this.statusBarItem.text = '$(package) PNPM';
            this.statusBarItem.tooltip = `PNPM Manager - ${validFolder.name} (${projectType})\nClick to open menu`;
        }
    }

    public show(): void {
        this.statusBarItem.show();
    }

    public hide(): void {
        this.statusBarItem.hide();
    }

    public updateVisibility(): void {
        this.updateStatusBar();
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            this.show();
        } else {
            this.hide();
        }
    }

    public dispose(): void {
        this.statusBarItem.dispose();
    }
}
