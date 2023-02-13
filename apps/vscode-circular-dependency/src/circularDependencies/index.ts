import { type Disposable, type Memento, languages, workspace } from 'vscode'
import { isAllowedCircularDependency, isEnablePersistentCaching } from '../helpers/config'
import type { AllCacheCollections } from './types'
import { registerDiagnosticService } from './services/diagnostic'
import { registerHoverService } from './services/hover'

const disposables: Disposable[] = []

export function useCircularDependenciesDetection(cacheMap: Memento): Disposable[] {
  if (isAllowedCircularDependency()) {
    return []
  }

  const collection = languages.createDiagnosticCollection()
  const cacheCollectoions: AllCacheCollections = {
    diagnosticCacheStore: collection,
    dependenciesCacheStore: cacheMap,
  }

  workspace.onDidChangeConfiguration(() => {
    // clean diagnostics when configuration changed
    collection.clear()
    return null
  })

  if (!isEnablePersistentCaching()) {
    cleanCacheMap(cacheCollectoions)
  }

  return [
    collection,
    cleanDisposables(),
  ].concat(
    registerDiagnosticService(cacheCollectoions),
    registerHoverService(cacheCollectoions),
  )
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

function cleanCacheMap({ diagnosticCacheStore, dependenciesCacheStore }: AllCacheCollections) {
  diagnosticCacheStore.clear()
  dependenciesCacheStore.keys().forEach(key => dependenciesCacheStore.update(key, undefined))
}
