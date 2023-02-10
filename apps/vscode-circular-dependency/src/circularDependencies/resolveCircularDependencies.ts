import { existsSync, readFileSync } from 'node:fs'
import { type TextDocument } from 'vscode'
import { getDocumentLineByIndex } from '../helpers/document'
import type { DependencyResolvedInfo, FormatterCircularDependencies } from './types'

export function resolveCircularDependencies(doc: TextDocument, circularDependencies: DependencyResolvedInfo[][]) {
  const { fsPath: path } = doc.uri

  const fileContent = getFileContent(path)

  return circularDependencies.flatMap((deps): FormatterCircularDependencies[] => {
    const [{ dep: originImportPackage }] = deps
    if (!originImportPackage) {
      return []
    }

    let startIdx = -1
    const idxList = []
    while (true) {
      startIdx = fileContent.indexOf(originImportPackage, startIdx + 1)
      if (startIdx < 0) {
        break
      }

      idxList.push(startIdx)
    }

    return idxList.map(idx => ({
      deps,
      range: getDocumentLineByIndex(doc, idx).range,
    }))
  })
}

function getFileContent(path: string) {
  return existsSync(path) ? readFileSync(path).toString() : ''
}
