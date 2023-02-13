import { languages } from 'vscode'
import type { AllCacheCollections } from '../../types'

export function registerHoverService({ dependenciesCacheStore }: AllCacheCollections) {
  return languages.registerHoverProvider('*', {
    provideHover(document, position, token) {
      return null
    },
  })
}
