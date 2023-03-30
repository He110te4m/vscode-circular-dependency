import { isAbsolute, relative, resolve } from 'path'
import { existsSync } from 'fs'
import { type TextDocument } from 'vscode'
import type { CacheStoreType, DependencyResolvedInfo } from '../types'
import { getExcludeDirectories, getExcludeModules, getExcludeSuffixList } from '../../helpers/config'
import { getWorkspaceFolder } from '../../helpers/path/env'
import { resolveCircularDependencies } from './resolveCircularDependencies'
import { detectCircularDependencies } from './detectCircularDependencies'

export function getFormatterCircularDependencies(cacheMap: CacheStoreType, doc: TextDocument) {
  return resolveCircularDependencies(
    doc,
    detectCircularDependencies({
      targetDepPath: doc.uri.fsPath,
      cacheMap,
      checkDeps: makeCheckDeps(),
    }),
  )
}

function makeCheckDeps() {
  const excludeSuffixList = getExcludeSuffixList()
  const excludeModules = getExcludeModules()
  const rootDir = getWorkspaceFolder()
  const excludeDirectories = getExcludeDirectories()
    .map(dir => isAbsolute(dir) ? dir : resolve(rootDir, dir))
    .filter(dir => existsSync(dir))

  return ({ dep, resolvedPath }: DependencyResolvedInfo) => {
    return checkSuffix(resolvedPath, excludeSuffixList)
      && checkModule(dep, excludeModules)
      && checkDirectories(resolvedPath, excludeDirectories)
  }
}

function checkSuffix(path: string, excludeSuffixList: string[]) {
  return excludeSuffixList.every(ext => !path.endsWith(ext))
}

function checkModule(dep: string, excludeModules: string[]) {
  return excludeModules.every(item => !dep.startsWith(item))
}

function checkDirectories(path: string, excludeDirectories: string[]) {
  return excludeDirectories.every(dir => relative(dir, path).startsWith('..'))
}
