import type { TextDocument } from 'vscode'
import { checkContentEffectiveness } from '@circular-dependency/utils/libs/comment'
import { getCommentChars, getGlobStatRegExpList, getImportStatRegExpList, getPackageDirectoryName } from '../helpers/config'
import { resolve } from '../helpers/path/resolve'
import { type GetLineByIndexFn, getDocumentLineByIndex } from '../helpers/document'
import type { CacheStoreType, DependencyResolvedInfo } from './types'
import { matchDependenciesByRegExp } from './matchDependencies/matchDependenciesByRegExp'
import { matchAllRegExp } from './matchDependencies/utils'
import { matchDependenciesByGlob } from './matchDependencies/matchDependenciesByGlob'

interface Options {
  path: string
  content: string
  cacheMap: CacheStoreType
  getLineByIndex: GetLineByIndexFn
}

export function detectCircularDependencies(targetDepPath: string, cacheMap: CacheStoreType, doc: TextDocument) {
  const result: DependencyResolvedInfo[][] = []
  const checkedDeps = new Set()
  searchDeps(targetDepPath, [])

  return result

  function searchDeps(currentDepPath: string, depPathList: DependencyResolvedInfo[]) {
    const deps = getFileDependenciesByCache({
      cacheMap,
      path: currentDepPath,
      content: doc.getText(),
      getLineByIndex: getDocumentLineByIndex (doc),
    })
    if (!deps.length || checkedDeps.has(currentDepPath)) {
      return
    }

    if (deps.some(({ resolvedPath }) => resolvedPath === targetDepPath)) {
      result.push(depPathList.slice())
    }
    checkedDeps.add(currentDepPath)
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
  const { getLineByIndex, content } = opts

  const commentChars = getCommentChars()

  return resolveDependenciesByRegExp(opts)
    .concat(resolveDependenciesByGlob(opts))
    .filter(({ dep }) => {
      const sourceContent = getLineByIndex(content.indexOf(dep)).text

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
