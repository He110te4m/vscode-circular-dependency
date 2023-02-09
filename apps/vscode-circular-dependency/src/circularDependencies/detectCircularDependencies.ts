import { existsSync, readFileSync } from 'node:fs'
import { checkContentEffectiveness } from '@circular-dependency/utils/libs/comment'
import { getCommentChars, getImportStatRegExpList, getPackageDirectoryName } from '../helpers/config'
import { resolve } from '../helpers/path/resolve'
import type { CacheStoreType, DepResolvedInfoType } from './types'

export function detectCircularDependencies(targetDepPath: string, cacheMap: CacheStoreType) {
  const result: DepResolvedInfoType[][] = []
  const checkedDeps = new Set()
  searchDeps(targetDepPath, [])

  return result

  function searchDeps(currentDepPath: string, depPathList: DepResolvedInfoType[]) {
    const deps = getFileDependenciesByCache(currentDepPath, cacheMap)
    if (!deps.length || checkedDeps.has(currentDepPath)) {
      return
    }

    if (deps.some(({ resolvedPath }) => resolvedPath === targetDepPath)) {
      result.push(depPathList.slice())
    }
    checkedDeps.add(currentDepPath)
    deps.forEach((dep) => {
      depPathList.push(dep)
      searchDeps(dep.resolvedPath, depPathList)
      depPathList.pop()
    })
  }
}

function getFileDependenciesByCache(path: string, cacheMap: CacheStoreType) {
  const cache = cacheMap.get<DepResolvedInfoType[]>(path)
  if (cache) {
    return cache
  }

  const dependencies = getFileDependencies(path)

  cacheMap.update(path, dependencies)

  return dependencies
}

function getFileDependencies(path: string): DepResolvedInfoType[] {
  const pkgDirName = getPackageDirectoryName()

  const dependencies = path.split(/[\\/]/g).includes(pkgDirName)
    ? []
    : resolveFileDependencies(path)

  return dependencies
}

function resolveFileDependencies(path: string): DepResolvedInfoType[] {
  const content = getFileContent(path)
  const packages: DepResolvedInfoType[] = []

  const commentChars = getCommentChars()

  return getImportStatRegExpList()
    .reduce(
      (list, reg) => list.concat(
        getRegAllMatch(content, reg)
          .filter(dep => checkContentEffectiveness({ sourceContent: content, targetContent: dep, commentChars }))
          .map(dep => ({ dep, resolvedPath: resolve(dep, path) })),
      ),
      packages,
    )
}

function getRegAllMatch(content: string, reg: RegExp) {
  return Array.from(content.matchAll(reg)).map(matched => matched[matched.length - 1])
}

function getFileContent(path: string) {
  return existsSync(path) ? readFileSync(path).toString() : ''
}
