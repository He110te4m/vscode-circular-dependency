import { type Uri } from 'vscode'
import type { AllCacheCollections } from '../types'

export function deleteCacheByUri(uri: Uri, { diagnosticCacheStore, dependenciesCacheStore }: AllCacheCollections) {
  diagnosticCacheStore.delete(uri)
  dependenciesCacheStore.update(uri.fsPath, undefined)
}
