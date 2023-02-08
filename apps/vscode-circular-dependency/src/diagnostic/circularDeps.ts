import { existsSync, readFileSync } from 'fs'
import { Diagnostic, type DiagnosticCollection, DiagnosticSeverity, type Disposable, type Memento, type TextDocument, languages, window } from 'vscode'
import { getErrorLevel, getImportStatRegExpList, getPackageDirectoryName, isAllowedCircularDependency } from '../helpers/config'
import { resolve } from '../helpers/path/resolve'

type CacheStoreType = Memento

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
      const [originImportPackage] = deps
      const idx = Math.max(0, fileContent.indexOf(originImportPackage))
      const range = getRangeByIndex(document, idx)
      const diagnostic = new Diagnostic(range, errorMessage, severity)

      return list.concat(diagnostic)
    }, result)
}

function detectCirclularDependency(targetDepPath: string, cacheMap: CacheStoreType) {
  const result: string[][] = []
  const checkedDeps = new Set()
  searchDeps(targetDepPath, [])

  return result

  function searchDeps(currentDepPath: string, depPathList: string[]) {
    const deps = getFileDependenciesByCache(currentDepPath, cacheMap)
    if (!deps.length || checkedDeps.has(currentDepPath)) {
      return
    }
    depPathList.push(currentDepPath)
    if (deps.includes(targetDepPath)) {
      result.push(depPathList.slice())
    }
    checkedDeps.add(currentDepPath)
    deps.forEach(dep => searchDeps(dep, depPathList))
    depPathList.pop()
  }
}

function getFileDependenciesByCache(path: string, cacheMap: CacheStoreType) {
  const cache = cacheMap.get<string[]>(path)
  if (cache) {
    return cache
  }

  const dependencies = getFileDependencies(path)

  cacheMap.update(path, dependencies)

  return dependencies
}

function getFileDependencies(path: string): string[] {
  const pkgDirName = getPackageDirectoryName()

  const dependencies = path.split(/[\\/]/g).includes(pkgDirName)
    ? []
    : resolveFileDependencies(path)

  return dependencies
}

function resolveFileDependencies(path: string): string[] {
  const content = getFileContent(path)
  const packages: string[] = []

  return getImportStatRegExpList()
    .reduce(
      (list, reg) => list.concat(getRegAllMatch(content, reg).map(pkg => resolve(pkg, path))),
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
