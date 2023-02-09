import { type DiagnosticCollection, type Disposable, type Memento, type TextDocument, languages, window, workspace } from 'vscode'
import { debounce } from 'debounce'
import { isAllowedCircularDependency } from '../helpers/config'
import type { CacheStoreType, DepResolvedInfoType } from './types'
import { detectCircularDependencies } from './detectCircularDependencies'
import { resolveCircularDependencies } from './resolveCircularDependencies'
import { createDiagnosticsByDependencies } from './createDiagnosticsByDependencies'

const disposables: Disposable[] = []

export function useCircularDependenciesDetection(cacheMap: Memento): Disposable[] {
  if (isAllowedCircularDependency()) {
    return []
  }

  const collection = createCollection()

  // TODO: clean data
  cacheMap.keys().forEach(key => cacheMap.update(key, undefined))

  return [
    collection,
    { dispose: cleanDisposables },
    registerForActivationEventListener(collection, cacheMap),
    registerFileContentChangeEventListener(collection, cacheMap),
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

  const circularDependencies: DepResolvedInfoType[][] = detectCircularDependencies(uri.fsPath, cacheMap)
  const formatterCircularDependencies = resolveCircularDependencies(doc, circularDependencies)

  // update diagnostic collection
  const diagnosticsList = createDiagnosticsByDependencies(formatterCircularDependencies)
  collection.set(uri, diagnosticsList)
}
