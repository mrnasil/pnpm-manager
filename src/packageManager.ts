import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export interface PackageJson {
  name?: string;
  version?: string;
  scripts?: { [key: string]: string };
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
  peerDependencies?: { [key: string]: string };
}

export interface PnpmConfig {
  autoStart?: { enabled: boolean; scripts: string[] };
  customCommands?: Array<{
    name: string;
    command: string;
    description?: string;
    autoStart?: boolean;
  }>;
  settings?: { showNotifications?: boolean; autoInstallOnOpen?: boolean };
}

export interface ProjectInfo {
  name: string;
  relativePath: string;
  fullPath: string;
  hasPnpmConfig: boolean;
}

export class PackageManager {
  private workspaceRoot: string | undefined;
  private currentProjectPath: string | undefined;

  constructor() {
    this.updateWorkspaceRoot();
    this.currentProjectPath = this.workspaceRoot;
  }

  private updateWorkspaceRoot(): void {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    this.workspaceRoot =
      workspaceFolders && workspaceFolders.length > 0
        ? workspaceFolders[0].uri.fsPath
        : undefined;
  }

  public getPackageJsonPath(): string | undefined {
    const targetPath = this.currentProjectPath || this.workspaceRoot;
    if (!targetPath) {
      return undefined;
    }
    return path.join(targetPath, 'package.json');
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
    return this.currentProjectPath || this.workspaceRoot;
  }

  /** Returns the actual workspace root folder, ignoring the current project selection */
  public getActualWorkspaceRoot(): string | undefined {
    return this.workspaceRoot;
  }

  public getPnpmConfigPath(): string | undefined {
    const targetPath = this.currentProjectPath || this.workspaceRoot;
    if (!targetPath) {
      return undefined;
    }
    return path.join(targetPath, 'pnpmconfig.json');
  }

  public setCurrentProjectPath(projectPath: string | undefined): void {
    this.currentProjectPath = projectPath;
  }

  public getCurrentProjectPath(): string | undefined {
    return this.currentProjectPath;
  }

  public async findAllProjects(): Promise<ProjectInfo[]> {
    const projects: ProjectInfo[] = [];

    if (!this.workspaceRoot) {
      return projects;
    }

    // Root project
    const rootPkgPath = path.join(this.workspaceRoot, 'package.json');
    if (fs.existsSync(rootPkgPath)) {
      try {
        const content = fs.readFileSync(rootPkgPath, 'utf8');
        const pkg = JSON.parse(content) as PackageJson;
        projects.push({
          name: pkg.name || path.basename(this.workspaceRoot),
          relativePath: '',
          fullPath: this.workspaceRoot,
          hasPnpmConfig: fs.existsSync(
            path.join(this.workspaceRoot, 'pnpmconfig.json'),
          ),
        });
      } catch {
        /* ignore invalid package.json */
      }
    }

    // Scan subdirectories for additional projects
    this.scanForProjects(this.workspaceRoot, projects, '', 0, 3);

    return projects;
  }

  private scanForProjects(
    dirPath: string,
    projects: ProjectInfo[],
    relativePath: string,
    depth: number,
    maxDepth: number,
  ): void {
    if (depth >= maxDepth) return;

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (
          entry.name === 'node_modules' ||
          entry.name === '.git' ||
          entry.name.startsWith('.')
        )
          continue;

        const fullDirPath = path.join(dirPath, entry.name);
        const pkgJsonPath = path.join(fullDirPath, 'package.json');
        const childRelativePath = relativePath
          ? `${relativePath}/${entry.name}`
          : entry.name;

        if (fs.existsSync(pkgJsonPath)) {
          try {
            const content = fs.readFileSync(pkgJsonPath, 'utf8');
            const pkg = JSON.parse(content) as PackageJson;
            projects.push({
              name: pkg.name || entry.name,
              relativePath: childRelativePath,
              fullPath: fullDirPath,
              hasPnpmConfig: fs.existsSync(
                path.join(fullDirPath, 'pnpmconfig.json'),
              ),
            });
          } catch {
            /* ignore invalid package.json */
          }
        }

        this.scanForProjects(
          fullDirPath,
          projects,
          childRelativePath,
          depth + 1,
          maxDepth,
        );
      }
    } catch {
      /* ignore permission errors */
    }
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

  public async getCustomCommands(): Promise<
    Array<{
      name: string;
      command: string;
      description?: string;
      autoStart?: boolean;
    }>
  > {
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
