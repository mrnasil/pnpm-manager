import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

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
    private workspaceRoot: string | undefined;

    constructor() {
        this.updateWorkspaceRoot();
    }

    private updateWorkspaceRoot(): void {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        this.workspaceRoot = workspaceFolders && workspaceFolders.length > 0 
            ? workspaceFolders[0].uri.fsPath 
            : undefined;
    }

    public getPackageJsonPath(): string | undefined {
        if (!this.workspaceRoot) {
            return undefined;
        }
        return path.join(this.workspaceRoot, 'package.json');
    }

    public async readPackageJson(): Promise<PackageJson | undefined> {
        const packageJsonPath = this.getPackageJsonPath();
        if (!packageJsonPath || !fs.existsSync(packageJsonPath)) {
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

    public async getScripts(): Promise<{ [key: string]: string }> {
        const packageJson = await this.readPackageJson();
        return packageJson?.scripts || {};
    }

    public async getDependencies(): Promise<string[]> {
        const packageJson = await this.readPackageJson();
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

    public hasPackageJson(): boolean {
        const packageJsonPath = this.getPackageJsonPath();
        return packageJsonPath ? fs.existsSync(packageJsonPath) : false;
    }

    public getWorkspaceRoot(): string | undefined {
        return this.workspaceRoot;
    }

    public getPnpmConfigPath(): string | undefined {
        if (!this.workspaceRoot) {
            return undefined;
        }
        return path.join(this.workspaceRoot, 'pnpmconfig.json');
    }

    public async readPnpmConfig(): Promise<PnpmConfig | undefined> {
        const pnpmConfigPath = this.getPnpmConfigPath();
        if (!pnpmConfigPath || !fs.existsSync(pnpmConfigPath)) {
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

    public hasPnpmConfig(): boolean {
        const pnpmConfigPath = this.getPnpmConfigPath();
        return pnpmConfigPath ? fs.existsSync(pnpmConfigPath) : false;
    }

    public async getCustomCommands(): Promise<Array<{name: string, command: string, description?: string, autoStart?: boolean}>> {
        const pnpmConfig = await this.readPnpmConfig();
        return pnpmConfig?.customCommands || [];
    }

    public async getAutoStartScripts(): Promise<string[]> {
        const pnpmConfig = await this.readPnpmConfig();
        if (pnpmConfig?.autoStart?.enabled) {
            return pnpmConfig.autoStart.scripts || [];
        }
        return [];
    }

    public async shouldShowNotifications(): Promise<boolean> {
        const pnpmConfig = await this.readPnpmConfig();
        return pnpmConfig?.settings?.showNotifications ?? true;
    }

    public async shouldAutoInstallOnOpen(): Promise<boolean> {
        const pnpmConfig = await this.readPnpmConfig();
        return pnpmConfig?.settings?.autoInstallOnOpen ?? false;
    }
}
