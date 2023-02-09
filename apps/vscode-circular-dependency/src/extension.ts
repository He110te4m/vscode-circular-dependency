import type { Disposable, ExtensionContext } from 'vscode'
import { useCircularDependenciesDetection } from './circularDependencies'

export function activate({ subscriptions, workspaceState }: ExtensionContext) {
  const disposables: Disposable[] = []

  subscriptions.push(...disposables.concat(useCircularDependenciesDetection(workspaceState)))
}

export function deactivate() {}
