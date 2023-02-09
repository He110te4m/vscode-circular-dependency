import { existsSync, readFileSync } from 'node:fs'
import { type TextDocument } from 'vscode'
import { getDocumentLineByIndex } from '../helpers/document'
import type { DependencyResolvedInfo, FormatterCircularDependencies } from './types'

export function resolveCircularDependencies(doc: TextDocument, circularDependencies: DependencyResolvedInfo[][]) {
  const { fsPath: path } = doc.uri

  const fileContent = getFileContent(path)

  return circularDependencies.map((deps): FormatterCircularDependencies => {
    const [{ dep: originImportPackage }] = deps
    const idx = !originImportPackage ? 0 : Math.max(0, fileContent.indexOf(originImportPackage))
    const { range } = getDocumentLineByIndex(doc, idx)

    return {
      range,
      deps,
    }
  })
}

function getFileContent(path: string) {
  return existsSync(path) ? readFileSync(path).toString() : ''
}
