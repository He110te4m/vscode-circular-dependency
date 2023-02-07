import { workspace } from 'vscode'
import { EnvError } from '../../errors/env'

/** get workspace root direction */
export function getWorkspaceFolder(): string {
  const rootDir = workspace.workspaceFolders?.[0]
  if (!rootDir) {
    throw new EnvError(
      'An open folder is not currently detected, and obtaining the project directory failed',
      {},
      'Please Open the folder first and use the plug-in in the folder.',
    )
  }

  return rootDir.uri.fsPath
}
