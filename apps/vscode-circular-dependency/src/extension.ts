import { type Disposable, type ExtensionContext } from 'vscode'
import { useCircularDependenciesDetection } from './circularDependencies'

export function activate({ subscriptions, workspaceState }: ExtensionContext) {
  let disposables: Disposable[] = []
  disposables = useCircularDependenciesDetection(workspaceState)

  subscriptions.push(...disposables)
}

export function deactivate() {}
