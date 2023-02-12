import { type DiagnosticCollection, type Disposable, type Memento, type TextDocument, type Uri, languages, window, workspace } from 'vscode'
import { debounce } from 'debounce'
import { isAllowedCircularDependency } from '../helpers/config'
import type { CacheStoreType } from './types'
import { detectCircularDependencies } from './detectCircularDependencies'
import { resolveCircularDependencies } from './resolveCircularDependencies'
import { createDiagnosticsByDependencies } from './createDiagnosticsByDependencies'

const disposables: Disposable[] = []

interface AllCacheCollections {
  diagnosticCacheStore: DiagnosticCollection
  dependenciesCacheStore: CacheStoreType
}

export function useCircularDependenciesDetection(cacheMap: Memento): Disposable[] {
  if (isAllowedCircularDependency()) {
    return []
  }

  const collection = languages.createDiagnosticCollection()
  const cacheCollectoions: AllCacheCollections = {
    diagnosticCacheStore: collection,
    dependenciesCacheStore: cacheMap,
  }

  // cleanCacheMap(cacheCollectoions)

  return [
    collection,
    cleanDisposables(),
    registerForActivationEventListener(cacheCollectoions),
    registerFileContentChangeEventListener(cacheCollectoions),
  ]
}

function cleanDisposables() {
  return {
    dispose: () => {
      disposables.forEach(({ dispose }) => {
        dispose()
      })
    },
  }
}

function registerForActivationEventListener(opts: AllCacheCollections) {
  const { document: doc } = window.activeTextEditor ?? {}
  if (doc) {
    registerCircularDependencyActions(doc, opts)
  }

  return window.onDidChangeActiveTextEditor((ev) => {
    if (!ev) {
      return
    }

    registerCircularDependencyActions(ev.document, opts)
  })
}

function registerFileContentChangeEventListener(opts: AllCacheCollections) {
  const updateFn = debounce((doc: TextDocument) => registerCircularDependencyActions(doc, opts), 100)

  return workspace.onDidChangeTextDocument((ev) => {
    // TODO: Use full update temporarily, then optimize performance later to do throttling
    updateFn(ev.document)
  })
}

function registerCircularDependencyActions(doc: TextDocument, opts: AllCacheCollections) {
  const { uri } = doc
  const { diagnosticCacheStore, dependenciesCacheStore } = opts

  // clear cache ang error
  deleteCacheByUri(uri, opts)

  // update diagnostic collection
  const diagnosticsList = createDiagnosticsByDependencies(
    getFormatterCircularDependencies(dependenciesCacheStore, doc),
  )
  diagnosticCacheStore.set(uri, diagnosticsList)
}

function getFormatterCircularDependencies(cacheMap: CacheStoreType, doc: TextDocument) {
  return resolveCircularDependencies(
    doc,
    detectCircularDependencies(doc.uri.fsPath, cacheMap),
  )
}

function deleteCacheByUri(uri: Uri, { diagnosticCacheStore, dependenciesCacheStore }: AllCacheCollections) {
  diagnosticCacheStore.delete(uri)
  dependenciesCacheStore.update(uri.fsPath, undefined)
}

function cleanCacheMap({ diagnosticCacheStore, dependenciesCacheStore }: AllCacheCollections) {
  diagnosticCacheStore.clear()
  dependenciesCacheStore.keys().forEach(key => dependenciesCacheStore.update(key, undefined))
}
