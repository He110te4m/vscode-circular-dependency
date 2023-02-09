import { existsSync, readFileSync } from 'fs'
import { Diagnostic, type DiagnosticCollection, DiagnosticSeverity, type Disposable, type Memento, type Range, type TextDocument, Uri, languages, window, workspace } from 'vscode'
import { checkContentEffectiveness } from '@circular-dependency/utils/libs/comment'
import { debounce } from 'debounce'
import { getCommentChars, getErrorLevel, getImportStatRegExpList, getPackageDirectoryName, isAllowedCircularDependency } from '../helpers/config'
import { resolve } from '../helpers/path/resolve'

type CacheStoreType = Memento

type DepResolvedInfoType = Record<'dep' | 'resolvedPath', string>

interface FormatterCircularDependencies {
  deps: DepResolvedInfoType[]
  range: Range
}

const errorMessage = 'There is a circular dependency in the current dependency package, please check the dependencies'

const disposables: Disposable[] = []

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
    registerFileContentChangeEventListener(collection, cacheMap),
    {
      dispose: cleanDisposables,
    },
  ]
}

function cleanDisposables() {
  disposables.forEach(({ dispose }) => {
    dispose()
  })
}

function createCollection() {
  return languages.createDiagnosticCollection()
}

function registerForActivationEventListener(collection: DiagnosticCollection, cacheMap: CacheStoreType) {
  const { document: doc } = window.activeTextEditor ?? {}
  if (doc) {
    registerCircularDependencyActions(collection, cacheMap, doc)
  }

  return window.onDidChangeActiveTextEditor((ev) => {
    if (!ev) {
      return
    }

    registerCircularDependencyActions(collection, cacheMap, ev.document)
  })
}

function registerFileContentChangeEventListener(collection: DiagnosticCollection, cacheMap: CacheStoreType) {
  const updateFn = debounce((doc: TextDocument) => registerCircularDependencyActions(collection, cacheMap, doc), 100)

  return workspace.onDidChangeTextDocument((ev) => {
    // TODO: Use full update temporarily, then optimize performance later to do throttling
    updateFn(ev.document)
  })
}

function registerCircularDependencyActions(collection: DiagnosticCollection, cacheMap: CacheStoreType, doc: TextDocument) {
  const { uri } = doc

  // clear cache ang error
  cacheMap.update(uri.fsPath, undefined)
  collection.delete(uri)

  const circularDependencies: DepResolvedInfoType[][] = detectCirclularDependency(uri.fsPath, cacheMap)
  const formatterCircularDependencies = formatCircularDependencies(doc, circularDependencies)

  // update diagnostic collection
  const diagnosticsList = createDiagnosticsByDependencies(formatterCircularDependencies)
  collection.set(uri, diagnosticsList)
}

function formatCircularDependencies(doc: TextDocument, circularDependencies: DepResolvedInfoType[][]) {
  const { fsPath: path } = doc.uri

  const fileContent = getFileContent(path)

  return circularDependencies.map((deps): FormatterCircularDependencies => {
    const [{ dep: originImportPackage }] = deps
    const idx = !originImportPackage ? 0 : Math.max(0, fileContent.indexOf(originImportPackage))
    const range = getRangeByIndex(doc, idx)

    return {
      range,
      deps,
    }
  })
}

function createDiagnosticsByDependencies(circularDependencies: FormatterCircularDependencies[]): Diagnostic[] {
  const result: Diagnostic[] = []

  const severity = getErrorLevel() === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning

  return circularDependencies.reduce((list, { deps, range }) => {
    const [{ dep: originImportPackage }] = deps
    if (!originImportPackage) {
      return list
    }
    const diagnostic = new Diagnostic(range, formatErrorMessage(errorMessage), severity)
    diagnostic.code = {
      value: 'Go to circular dependency',
      target: Uri.file(deps[deps.length - 1].resolvedPath),
    }

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

function formatErrorMessage(errorMessage: string) {
  return errorMessage
}
