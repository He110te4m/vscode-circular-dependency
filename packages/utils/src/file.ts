import { isAbsolute, join } from 'node:path'
import { existsSync } from 'node:fs'
import { isEmpty } from 'fp-ts/Record'

export interface ResolvePathOption {
  baseDir: string
  packageDirectory?: string
  aliasMap?: Record<string, string>
}

/**
 * Resolves relative paths, supports matching aliases, third-party packages, and so on
 * @param path relative path
 * @param options Resolve Path Option
 * @returns absolute path or `''`
 */
export function resolvePath(path: string, { baseDir, packageDirectory = '', aliasMap }: ResolvePathOption): string {
  return (path && baseDir)
    ? (
        handleOriginPath(path)
        || handleAliasPath(path, baseDir, aliasMap)
        || handlePkgPath(path, packageDirectory)
        || handleRealPath(path, baseDir)
      )
    : ''
}

//#region Handle different types of paths

/** Process scenarios where the initial incoming path meets the criteria */
function handleOriginPath(path: string) {
  return foramtPathResult(path)
}

/** Handle scenarios that match path aliases */
function handleAliasPath(path: string, baseDir: string, aliasMap: ResolvePathOption['aliasMap'] = {}) {
  if (isEmpty(aliasMap)) {
    return ''
  }

  const aliasRelativePath = parserPathByAliasMap(path, aliasMap)
  return foramtPathResult(resolvePath(aliasRelativePath, { baseDir }))
}

/** Handle the matching third-party package address scenario */
function handlePkgPath(path: string, pkgDir?: string) {
  if (!pkgDir || !isAbsolute(pkgDir)) {
    return ''
  }

  return foramtPathResult(parserPackagePath(path, pkgDir))
}

/** Handle matching relative path scenarios */
function handleRealPath(path: string, baseDir: string) {
  return foramtPathResult(parseRealPath(path, baseDir))
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
function foramtPathResult(path: string) {
  return checkPath(path) ? path : ''
}

/** Check that the path meets the requirements */
function checkPath(path: string) {
  return isAbsolute(path) && existsSync(path)
}

//#endregion Tool functions
