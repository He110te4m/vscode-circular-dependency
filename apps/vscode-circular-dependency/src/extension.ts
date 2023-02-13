import { Disposable, type ExtensionContext, workspace } from 'vscode'
import { useCircularDependenciesDetection } from './circularDependencies'

export function activate({ subscriptions, workspaceState }: ExtensionContext) {
  let disposables: Disposable[] = []
  disposables = useCircularDependenciesDetection(workspaceState)

  workspace.onDidChangeConfiguration(() => {
    const disposable = Disposable.from(...disposables)
    disposables = useCircularDependenciesDetection(workspaceState)
    subscriptions.push(...disposables)

    return disposable
  })

  subscriptions.push(...disposables)
}

export function deactivate() {}
