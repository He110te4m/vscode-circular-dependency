import { existsSync, readFileSync } from 'fs'
import { Diagnostic, type DiagnosticCollection, DiagnosticSeverity, type Disposable, type Memento, type TextDocument, languages, window } from 'vscode'
import { checkContentEffectiveness } from '@circular-dependency/utils/libs/comment'
import { getCommentChars, getErrorLevel, getImportStatRegExpList, getPackageDirectoryName, isAllowedCircularDependency } from '../helpers/config'
import { resolve } from '../helpers/path/resolve'

type CacheStoreType = Memento

type DepResolvedInfoType = Record<'dep' | 'resolvedPath', string>

const errorMessage = 'There is a circular dependency in the current dependency package, please check the dependencies'

export function createCircularDependencyDiagnosticCollection(cacheMap: Memento): Disposable[] {
  if (isAllowedCircularDependency()) {
    return []
  }

  const collection = createCollection()

  // TODO: clean data
  cacheMap.keys().forEach(key => cacheMap.update(key, undefined))

  return [
    collection,
    registerForActivationEventListener(collection, cacheMap),
  ]
}

function createCollection() {
  return languages.createDiagnosticCollection()
}

function registerForActivationEventListener(collection: DiagnosticCollection, cacheMap: CacheStoreType) {
  if (window.activeTextEditor) {
    updateCollection(window.activeTextEditor.document)
  }

  return window.onDidChangeActiveTextEditor((ev) => {
    if (!ev) {
      return
    }

    updateCollection(ev.document)
  })

  function updateCollection(doc: TextDocument) {
    const { uri } = doc

    collection.delete(uri)

    collection.set(uri, createDiagnosticsByDependencies(doc, cacheMap))
  }
}

function createDiagnosticsByDependencies(document: TextDocument, cacheMap: CacheStoreType): Diagnostic[] | undefined {
  const { fsPath: path } = document.uri

  const fileContent = getFileContent(path)
  const result: Diagnostic[] = []

  const severity = getErrorLevel() === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning

  return detectCirclularDependency(path, cacheMap)
    .reduce((list, deps) => {
      const [{ dep: originImportPackage }] = deps
      if (!originImportPackage) {
        return list
      }
      const idx = Math.max(0, fileContent.indexOf(originImportPackage))
      const range = getRangeByIndex(document, idx)
      const diagnostic = new Diagnostic(range, formatErrorMessage(errorMessage, deps), severity)

      diagnostic.source = 'circular-dependency'

      return list.concat(diagnostic)
    }, result)
}

function detectCirclularDependency(targetDepPath: string, cacheMap: CacheStoreType) {
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

function getRangeByIndex(document: TextDocument, idx: number) {
  return document.lineAt(document.positionAt(idx)).range
}

function formatErrorMessage(errorMessage: string, deps: DepResolvedInfoType[]) {
  return `${errorMessage}

The dependency order is as follows:

${deps.map(({ dep }) => dep).join(' -> ')}

The final file address is ${deps[deps.length - 1].resolvedPath}
`
}
