import * as vscode from 'vscode';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface PackageJson {
    name?: string;
    version?: string;
    scripts?: { [key: string]: string };
    dependencies?: { [key: string]: string };
    devDependencies?: { [key: string]: string };
    peerDependencies?: { [key: string]: string };
}

export interface PnpmConfig {
    autoStart?: {
        enabled: boolean;
        scripts: string[];
    };
    customCommands?: Array<{
        name: string;
        command: string;
        description?: string;
        autoStart?: boolean;
    }>;
    settings?: {
        showNotifications?: boolean;
        autoInstallOnOpen?: boolean;
    };
}

export class PackageManager {
    public async getTargetRoot(uri?: vscode.Uri): Promise<string | undefined> {
        if (uri) {
            try {
                const stat = await vscode.workspace.fs.stat(uri);
                let currentDir = stat.type === vscode.FileType.Directory ? uri.fsPath : path.dirname(uri.fsPath);
                
                // Traverse up the directory tree to locate the nearest package.json or pnpm-workspace.yaml
                while (currentDir) {
                    if (this.hasPackageJson(currentDir) || this.hasPnpmWorkspace(currentDir)) {
                        return currentDir;
                    }
                    const parentDir = path.dirname(currentDir);
                    if (parentDir === currentDir) {
                        break; // File system root reached
                    }
                    currentDir = parentDir;
                }
            } catch {
                return undefined;
            }
        }

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return undefined;
        }

        const validFolders = workspaceFolders.filter(folder => {
            const root = folder.uri.fsPath;
            return this.hasPackageJson(root) || this.hasPnpmWorkspace(root);
        });

        if (validFolders.length === 0) {
            return undefined;
        }

        if (validFolders.length === 1) {
            return validFolders[0].uri.fsPath;
        }

        const selected = await vscode.window.showWorkspaceFolderPick({
            placeHolder: 'Select the project to manage'
        });
        
        return selected ? selected.uri.fsPath : undefined;
    }

    public getPackageJsonPath(targetRoot: string): string {
        return path.join(targetRoot, 'package.json');
    }

    public async readPackageJson(targetRoot: string): Promise<PackageJson | undefined> {
        const packageJsonPath = this.getPackageJsonPath(targetRoot);
        if (!fs.existsSync(packageJsonPath)) {
            return undefined;
        }

        try {
            const content = fs.readFileSync(packageJsonPath, 'utf8');
            return JSON.parse(content) as PackageJson;
        } catch (error) {
            vscode.window.showErrorMessage(`Error reading package.json: ${error}`);
            return undefined;
        }
    }

    public async getScripts(targetRoot: string): Promise<{ [key: string]: string }> {
        const packageJson = await this.readPackageJson(targetRoot);
        return packageJson?.scripts || {};
    }

    public async getDependencies(targetRoot: string): Promise<string[]> {
        const packageJson = await this.readPackageJson(targetRoot);
        const deps: string[] = [];
        
        if (packageJson?.dependencies) {
            deps.push(...Object.keys(packageJson.dependencies));
        }
        if (packageJson?.devDependencies) {
            deps.push(...Object.keys(packageJson.devDependencies));
        }
        if (packageJson?.peerDependencies) {
            deps.push(...Object.keys(packageJson.peerDependencies));
        }
        
        return deps.sort();
    }

    public hasPackageJson(targetRoot: string): boolean {
        const packageJsonPath = this.getPackageJsonPath(targetRoot);
        return fs.existsSync(packageJsonPath);
    }

    public hasPnpmWorkspace(targetRoot: string): boolean {
        const workspacePath = path.join(targetRoot, 'pnpm-workspace.yaml');
        return fs.existsSync(workspacePath);
    }

    public hasPnpmProject(targetRoot: string): boolean {
        return this.hasPackageJson(targetRoot) || this.hasPnpmWorkspace(targetRoot);
    }

    public getPnpmConfigPath(targetRoot: string): string {
        return path.join(targetRoot, 'pnpmconfig.json');
    }

    public async readPnpmConfig(targetRoot: string): Promise<PnpmConfig | undefined> {
        const pnpmConfigPath = this.getPnpmConfigPath(targetRoot);
        if (!fs.existsSync(pnpmConfigPath)) {
            return undefined;
        }

        try {
            const content = fs.readFileSync(pnpmConfigPath, 'utf8');
            return JSON.parse(content) as PnpmConfig;
        } catch (error) {
            vscode.window.showErrorMessage(`Error reading pnpmconfig.json: ${error}`);
            return undefined;
        }
    }

    public hasPnpmConfig(targetRoot: string): boolean {
        const pnpmConfigPath = this.getPnpmConfigPath(targetRoot);
        return fs.existsSync(pnpmConfigPath);
    }

    public async getCustomCommands(targetRoot: string): Promise<Array<{name: string, command: string, description?: string, autoStart?: boolean}>> {
        const pnpmConfig = await this.readPnpmConfig(targetRoot);
        return pnpmConfig?.customCommands || [];
    }

    public async getAutoStartScripts(targetRoot: string): Promise<string[]> {
        const pnpmConfig = await this.readPnpmConfig(targetRoot);
        if (pnpmConfig?.autoStart?.enabled) {
            return pnpmConfig.autoStart.scripts || [];
        }
        return [];
    }

    public async shouldShowNotifications(targetRoot: string): Promise<boolean> {
        const pnpmConfig = await this.readPnpmConfig(targetRoot);
        return pnpmConfig?.settings?.showNotifications ?? true;
    }

    public async shouldAutoInstallOnOpen(targetRoot: string): Promise<boolean> {
        const pnpmConfig = await this.readPnpmConfig(targetRoot);
        return pnpmConfig?.settings?.autoInstallOnOpen ?? false;
    }
}
