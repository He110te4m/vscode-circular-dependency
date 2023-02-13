import { type TextDocument, type Uri, window, workspace } from 'vscode'
import { debounce } from 'debounce'
import type { AllCacheCollections, CacheStoreType } from '../../types'
import { createDiagnosticsByDependencies } from '../../createDiagnosticsByDependencies'
import { resolveCircularDependencies } from '../../resolveCircularDependencies'
import { detectCircularDependencies } from '../../detectCircularDependencies'

export function registerDiagnosticService(opts: AllCacheCollections) {
  return [
    registerForActivationEventListener(opts),
    registerFileContentChangeEventListener(opts),
  ]
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
