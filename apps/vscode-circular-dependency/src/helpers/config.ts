import { workspace } from 'vscode'

export type ErrorLevel = 'error' | 'warning' | 'none'

export function getAliasMap() {
  return getConfig().get<Record<string, string>>('alias-map', {})
}

export function getPackageDirectoryName() {
  return getConfig().get<string>('packages-root', '')
}

export function getErrorLevel() {
  return getConfig().get<ErrorLevel>('error-level', 'error')
}

export function isAllowedCircularDependency() {
  return getErrorLevel() === 'none'
}

export function getAutofillSuffixList() {
  return getConfig().get<string[]>('autofill-suffix-list', [])
}

export function getImportStatRegExpList(): RegExp[] {
  return getConfig()
    .get<string[]>('import-statement-regexp', [])
    .map(regText => new RegExp(regText, 'g'))
}

function getConfig() {
  return workspace.getConfiguration('vscode-circular-dependency')
}
