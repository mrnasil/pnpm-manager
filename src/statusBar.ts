import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

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

        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        const pnpmConfigPath = path.join(workspaceRoot, 'pnpmconfig.json');
        const hasPnpmConfig = fs.existsSync(pnpmConfigPath);

        if (hasPnpmConfig) {
            this.statusBarItem.text = '$(package) PNPM $(gear)';
            this.statusBarItem.tooltip = 'PNPM Manager - Custom config detected\nClick to open menu';
        } else {
            this.statusBarItem.text = '$(package) PNPM';
            this.statusBarItem.tooltip = 'PNPM Manager - Click to open menu';
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
