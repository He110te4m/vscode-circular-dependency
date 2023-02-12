import { workspace } from 'vscode'
import type { CommentChars } from '../circularDependencies/types'

//#region Features toggle

export type ErrorLevel = 'error' | 'warning' | 'none'

export function getErrorLevel() {
  return getConfig().get<ErrorLevel>('error-level', 'error')
}

export function isAllowedCircularDependency() {
  return getErrorLevel() === 'none'
}

export function isShowDependencyLoop() {
  return !!getConfig().get<boolean>('vscode-circular-dependency.enable-dependency-loop')
}

export function isEnableGoToDependenciesCodeLens() {
  return !!getConfig().get<boolean>('enable-going-to-the-dependent-file.enable-dependency-loop')
}

//#endregion

//#region Project environment

export function getPackageDirectoryName() {
  return getConfig().get<string>('packages-root', '')
}

export function getAliasMap() {
  return getConfig().get<Record<string, string>>('alias-map', {})
}

//#endregion

//#region Syntax checking

export function getCommentChars() {
  return getConfig().get<CommentChars[]>('comment-chars', [])
}

export function getImportStatRegExpList(): RegExp[] {
  return getConfig()
    .get<string[]>('import-statement-regexp', [])
    .map(regText => new RegExp(regText, 'g'))
}

export function getGlobStatRegExpList(): RegExp[] {
  return getConfig()
    .get<string[]>('glob-import-statement-regexp', [])
    .map(regText => new RegExp(regText, 'g'))
}

//#endregion

//#region Configure the default behavior for resolving address-dependent

export function getAutofillSuffixList() {
  return getConfig().get<string[]>('autofill-suffix-list', [])
}

export function getDefaultIndexs() {
  return getConfig().get<string[]>('default-indexs', [])
}

//#endregion

function getConfig() {
  return workspace.getConfiguration('vscode-circular-dependency')
}
