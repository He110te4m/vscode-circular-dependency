import type { Disposable, ExtensionContext } from 'vscode'
import { createCircularDependencyDiagnosticCollection } from './diagnostic/circularDeps'

export function activate({ subscriptions, workspaceState }: ExtensionContext) {
  const disposables: Disposable[] = []

  subscriptions.push(...disposables.concat(createCircularDependencyDiagnosticCollection(workspaceState)))
}

export function deactivate() {}
