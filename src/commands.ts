import * as vscode from 'vscode';
import { PackageManager, ProjectInfo } from './packageManager';
import { StatusBarManager } from './statusBar';

export class CommandManager {
  private packageManager: PackageManager;
  private statusBarManager: StatusBarManager;

  constructor(
    packageManager: PackageManager,
    statusBarManager: StatusBarManager,
  ) {
    this.packageManager = packageManager;
    this.statusBarManager = statusBarManager;
  }

  /**
   * Let user select a project if there are multiple, or auto-select if only one.
   * Returns true if a project was selected and currentProjectPath was set.
   */
  private async selectProject(): Promise<boolean> {
    const projects = await this.packageManager.findAllProjects();

    if (projects.length === 0) {
      vscode.window.showWarningMessage(
        'No package.json found in the current workspace or its subdirectories.',
      );
      return false;
    }

    let selectedProject: ProjectInfo;
    if (projects.length === 1) {
      selectedProject = projects[0];
    } else {
      const projectItems = projects.map((p) => ({
        label:
          p.relativePath === ''
            ? `$(root-folder) ${p.name}`
            : `$(folder) ${p.name}`,
        description: p.relativePath || '(workspace root)',
        detail: p.fullPath,
      }));

      const picked = await vscode.window.showQuickPick(projectItems, {
        placeHolder: `Found ${projects.length} projects. Select a project:`,
        matchOnDescription: true,
        matchOnDetail: true,
      });

      if (!picked) return false;
      const matched = projects.find((p) => p.fullPath === picked.detail);
      if (!matched) return false;
      selectedProject = matched;
    }

    // Set the current project path
    this.packageManager.setCurrentProjectPath(selectedProject.fullPath);

    // Update status bar with project info
    this.statusBarManager.updateForProject(
      selectedProject.name,
      selectedProject.relativePath,
      projects.length,
    );

    return true;
  }

  public async openMenu(): Promise<void> {
    // Make sure a project is selected first
    const projectOk = await this.selectProject();
    if (!projectOk) return;

    // Build the menu for this project
    const scripts = await this.packageManager.getScripts();
    const customCommands = await this.packageManager.getCustomCommands();

    const projectPath = this.packageManager.getCurrentProjectPath() || '';
    const projects = await this.packageManager.findAllProjects();
    const currentProject = projects.find((p) => p.fullPath === projectPath);
    const projectName = currentProject?.name || 'Unknown';

    const items: vscode.QuickPickItem[] = [
      {
        label: `$(package) PNPM — ${projectName}`,
        kind: vscode.QuickPickItemKind.Separator,
      },
      {
        label: '$(package) Install Dependencies',
        description: 'pnpm install',
        detail: 'Install all dependencies from package.json',
      },
      {
        label: '$(add) Add Package',
        description: 'pnpm add',
        detail: 'Add a new package to dependencies',
      },
      {
        label: '$(remove) Remove Package',
        description: 'pnpm remove',
        detail: 'Remove a package from dependencies',
      },
    ];

    // Add custom commands from pnpmconfig.json
    if (customCommands.length > 0) {
      items.push({ label: '', kind: vscode.QuickPickItemKind.Separator });

      items.push({
        label: '$(gear) Custom Commands',
        kind: vscode.QuickPickItemKind.Separator,
      });

      for (const customCommand of customCommands) {
        items.push({
          label: `$(tools) ${customCommand.name}`,
          description: `pnpm ${customCommand.command}`,
          detail: customCommand.description || customCommand.command,
        });
      }
    }

    // Add separator if there are scripts
    if (Object.keys(scripts).length > 0) {
      items.push({ label: '', kind: vscode.QuickPickItemKind.Separator });

      items.push({
        label: '$(list-unordered) Package Scripts',
        kind: vscode.QuickPickItemKind.Separator,
      });

      // Add scripts
      for (const [scriptName, scriptCommand] of Object.entries(scripts)) {
        items.push({
          label: `$(play) ${scriptName}`,
          description: `pnpm run ${scriptName}`,
          detail: scriptCommand,
        });
      }
    }

    const picked = await vscode.window.showQuickPick(items, {
      placeHolder: `Select a PNPM action for ${projectName}`,
      matchOnDescription: true,
      matchOnDetail: true,
    });

    if (!picked) {
      return;
    }

    // Handle selection
    if (picked.description === 'pnpm install') {
      await this.installDependencies();
    } else if (picked.description === 'pnpm add') {
      await this.addPackage();
    } else if (picked.description === 'pnpm remove') {
      await this.removePackage();
    } else if (picked.description?.startsWith('pnpm run ')) {
      const scriptName = picked.description.replace('pnpm run ', '');
      await this.runScript(scriptName);
    } else if (
      picked.description?.startsWith('pnpm ') &&
      !picked.description.startsWith('pnpm run ')
    ) {
      // Handle custom commands
      const command = picked.description.replace('pnpm ', '');
      await this.runCustomCommand(command);
    }
  }

  public async installDependencies(): Promise<void> {
    if (!this.packageManager.hasPackageJson()) {
      // No project selected yet, prompt user to pick one first
      const selected = await this.selectProject();
      if (!selected) return;
      // After selecting a project, hasPackageJson should now be true
      if (!this.packageManager.hasPackageJson()) {
        vscode.window.showWarningMessage(
          'No package.json found in the selected project.',
        );
        return;
      }
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
      const selected = await this.selectProject();
      if (!selected) return;
      if (!this.packageManager.hasPackageJson()) {
        vscode.window.showWarningMessage(
          'No package.json found in the selected project.',
        );
        return;
      }
    }

    const packageName = await vscode.window.showInputBox({
      prompt: 'Enter package name to add',
      placeHolder: 'e.g., lodash, @types/node, react@latest',
      validateInput: (value: string) => {
        if (!value || value.trim().length === 0) {
          return 'Package name cannot be empty';
        }
        return null;
      },
    });

    if (!packageName) {
      return;
    }

    const isDev = await vscode.window.showQuickPick(
      [
        { label: 'Production Dependency', value: false },
        { label: 'Development Dependency', value: true },
      ],
      { placeHolder: 'Select dependency type' },
    );

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
      const selected = await this.selectProject();
      if (!selected) return;
      if (!this.packageManager.hasPackageJson()) {
        vscode.window.showWarningMessage(
          'No package.json found in the selected project.',
        );
        return;
      }
    }

    const dependencies = await this.packageManager.getDependencies();
    if (dependencies.length === 0) {
      vscode.window.showInformationMessage('No dependencies found to remove.');
      return;
    }

    const selected = await vscode.window.showQuickPick(
      dependencies.map((dep) => ({
        label: dep,
        description: 'Remove this package',
      })),
      { placeHolder: 'Select package to remove', matchOnDescription: true },
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

    if (
      autoStartScripts.length === 0 &&
      customCommands.filter((cmd) => cmd.autoStart).length === 0
    ) {
      return;
    }

    const workspaceRoot = this.packageManager.getWorkspaceRoot();
    if (!workspaceRoot) {
      return;
    }

    const shouldShowNotifications =
      await this.packageManager.shouldShowNotifications();

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
          vscode.window.showInformationMessage(
            `Auto-starting: ${customCommand.name}`,
          );
        }
        await this.executeCommand(
          `pnpm ${customCommand.command}`,
          workspaceRoot,
        );
      }
    }
  }

  private async executeCommand(command: string, cwd: string): Promise<void> {
    const terminal = vscode.window.createTerminal({
      name: 'PNPM Manager',
      cwd: cwd,
    });

    terminal.show();
    terminal.sendText(command);

    const shouldShowNotifications =
      await this.packageManager.shouldShowNotifications();
    if (shouldShowNotifications) {
      vscode.window.showInformationMessage(`Executing: ${command}`);
    }
  }
}
