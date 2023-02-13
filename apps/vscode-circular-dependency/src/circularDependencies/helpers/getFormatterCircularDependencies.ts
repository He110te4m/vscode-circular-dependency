import { type TextDocument } from 'vscode'
import type { CacheStoreType } from '../types'
import { resolveCircularDependencies } from './resolveCircularDependencies'
import { detectCircularDependencies } from './detectCircularDependencies'

export function getFormatterCircularDependencies(cacheMap: CacheStoreType, doc: TextDocument) {
  return resolveCircularDependencies(
    doc,
    detectCircularDependencies(doc.uri.fsPath, cacheMap),
  )
}
