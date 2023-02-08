import { isAbsolute, join } from 'node:path'
import { existsSync, statSync } from 'node:fs'
import { isEmpty } from 'fp-ts/Record'

export interface ResolvePathOption {
  baseDir: string
  defaultIndexFiles?: string[]
  packageDirectory?: string
  aliasMap?: Record<string, string>
}

/**
 * Resolves relative paths, supports matching aliases, third-party packages, and so on
 * @param path relative path
 * @param options Resolve Path Option
 * @returns absolute path or `''`
 */
export function resolvePath(path: string, option: ResolvePathOption): string {
  const { baseDir } = option
  return (path && baseDir)
    ? (
        handleOriginPath(path, option)
        || handleAliasPath(path, option)
        || handlePkgPath(path, option)
        || handleRealPath(path, option)
      )
    : ''
}

//#region Handle different types of paths

/** Process scenarios where the initial incoming path meets the criteria */
function handleOriginPath(path: string, option: ResolvePathOption) {
  return foramtPathResult(path, option)
}

/** Handle scenarios that match path aliases */
function handleAliasPath(path: string, option: ResolvePathOption) {
  const { aliasMap = {} } = option
  if (isEmpty(aliasMap)) {
    return ''
  }

  const aliasRelativePath = parserPathByAliasMap(path, aliasMap)
  return foramtPathResult(resolvePath(aliasRelativePath, option), option)
}

/** Handle the matching third-party package address scenario */
function handlePkgPath(path: string, option: ResolvePathOption) {
  const { packageDirectory } = option
  if (!packageDirectory || !isAbsolute(packageDirectory)) {
    return ''
  }

  return foramtPathResult(parserPackagePath(path, packageDirectory), option)
}

/** Handle matching relative path scenarios */
function handleRealPath(path: string, option: ResolvePathOption) {
  const { baseDir } = option
  return foramtPathResult(parseRealPath(path, baseDir), option)
}

//#endregion Handle different types of paths

//#region Resolve different types of paths

/** Resolves a path with an alias */
function parserPathByAliasMap(path: string, aliasMap: Record<string, string>) {
  const alias = Object.keys(aliasMap).find(key => path.startsWith(key))
  if (!alias) {
    return ''
  }

  return path.replace(alias, aliasMap[alias])
}

/** Resolves a path with an alias */
function parserPackagePath(path: string, packageDir: string) {
  return join(packageDir, path)
}

function parseRealPath(path: string, baseDir: string) {
  return join(baseDir, path)
}

//#endregion Resolve different types of paths

//#region Tool functions

/** Format the return result */
function foramtPathResult(path: string, { defaultIndexFiles }: ResolvePathOption) {
  if (!checkPath(path)) {
    return ''
  }
  const stat = statSync(path)
  if (stat.isFile()) {
    return path
  }
  return stat.isDirectory() ? 
    fillPath(path, defaultIndexFiles).find(checkPath) ?? '' :
    ''
}

function fillPath(path: string, defaultIndexFiles: ResolvePathOption['defaultIndexFiles'] = []) {
  return defaultIndexFiles.map(item => join(path, item))
}

/** Check that the path meets the requirements */
function checkPath(path: string) {
  return isAbsolute(path) && existsSync(path)
}

//#endregion Tool functions
