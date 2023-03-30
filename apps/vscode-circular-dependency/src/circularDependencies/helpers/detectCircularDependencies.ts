import { checkContentEffectiveness } from '@circular-dependency/utils/libs/comment'
import { getCommentChars, getGlobStatRegExpList, getImportStatRegExpList, getPackageDirectoryName } from '../../helpers/config'
import { resolve } from '../../helpers/path/resolve'
import { getFileContent } from '../../helpers/file'
import type { CacheStoreType, DependencyResolvedInfo } from '../types'
import { matchDependenciesByRegExp } from '../matchDependencies/matchDependenciesByRegExp'
import { matchAllRegExp } from '../matchDependencies/utils'
import { matchDependenciesByGlob } from '../matchDependencies/matchDependenciesByGlob'

interface Options {
  path: string
  content: string
  cacheMap: CacheStoreType
  getLineBySubchar: (char: string) => string
}

interface DetectCircularDependenciesOption {
  targetDepPath: string
  cacheMap: CacheStoreType
  checkDeps: (dep: DependencyResolvedInfo) => boolean
}

export function detectCircularDependencies({ targetDepPath, cacheMap, checkDeps }: DetectCircularDependenciesOption) {
  const result: DependencyResolvedInfo[][] = []
  const checkedDeps = new Set()
  searchDeps(targetDepPath, [])

  return result

  function searchDeps(currentDepPath: string, depPathList: DependencyResolvedInfo[]) {
    const content = getFileContent(currentDepPath)

    const deps = getFileDependenciesByCache({
      content,
      cacheMap,
      path: currentDepPath,
      getLineBySubchar: makeGetLineTextBySubchar(content),
    })
      .filter(checkDeps)
    if (!deps.length || checkedDeps.has(currentDepPath)) {
      return
    }

    checkedDeps.add(currentDepPath)

    if (deps.some(({ resolvedPath }) => resolvedPath === targetDepPath)) {
      result.push(depPathList.slice())
    }
    deps.forEach((dep) => {
      depPathList.push(dep)
      dep.resolvedPath && searchDeps(dep.resolvedPath, depPathList)
      depPathList.pop()
    })
  }
}

function getFileDependenciesByCache(opts: Options) {
  const { path, cacheMap } = opts
  const cache = cacheMap.get<DependencyResolvedInfo[]>(path)
  if (cache) {
    return cache
  }

  const dependencies = getFileDependencies(opts)

  cacheMap.update(path, dependencies)

  return dependencies
}

function getFileDependencies(opts: Options): DependencyResolvedInfo[] {
  const { path } = opts
  const pkgDirName = getPackageDirectoryName()

  const dependencies = path.split(/[\\/]/g).includes(pkgDirName)
    ? []
    : resolveFileDependencies(opts)

  return dependencies
}

function resolveFileDependencies(opts: Options): DependencyResolvedInfo[] {
  const { getLineBySubchar, content } = opts

  const commentChars = getCommentChars()

  return resolveDependenciesByRegExp(opts)
    .concat(resolveDependenciesByGlob(opts))
    .filter(({ dep }) => {
      const sourceContent = getLineBySubchar(dep)

      return checkContentEffectiveness({
        sourceContent,
        targetContent: dep,
        allContent: content,
        commentChars,
      })
    })
}

function resolveDependenciesByRegExp({ path, content }: Options): DependencyResolvedInfo[] {
  return matchDependenciesByRegExp({
    content,
    regList: getImportStatRegExpList(),
  })
    .map(dep => ({
      dep,
      resolvedPath: resolve(dep, path),
    }))
}

function resolveDependenciesByGlob({ path, content }: Options): DependencyResolvedInfo[] {
  const globs = matchFileGlobs(content)

  return globs.flatMap((glob) => {
    const files = matchDependenciesByGlob({
      glob,
      baseDirectory: path,
    })

    return files.map(globPath => ({
      dep: glob,
      resolvedPath: resolve(globPath, path),
    }))
  })
}

function matchFileGlobs(content: string): string[] {
  return getGlobStatRegExpList()
    .flatMap(matchAllRegExp(content))
}

function makeGetLineTextBySubchar(content: string): Options['getLineBySubchar'] {
  const lines = content.split(/\r?\n/g)

  return (subchar: string) =>
    lines.find(line => line.includes(subchar)) ?? ''
}
