import { type ExtensionContext, commands, window } from 'vscode'

export function activate({ subscriptions }: ExtensionContext) {
  const disposable = commands.registerCommand('vscode-circular-dependency.helloWorld', () => {
    window.showInformationMessage('Hello World from vscode-circular-dependency!')
  })

  subscriptions.push(disposable)
}

export function deactivate() {}
