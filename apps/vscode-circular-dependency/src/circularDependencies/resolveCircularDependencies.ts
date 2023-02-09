import { existsSync, readFileSync } from 'node:fs'
import { type TextDocument } from 'vscode'
import type { DepResolvedInfoType, FormatterCircularDependencies } from './types'

export function resolveCircularDependencies(doc: TextDocument, circularDependencies: DepResolvedInfoType[][]) {
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

function getFileContent(path: string) {
  return existsSync(path) ? readFileSync(path).toString() : ''
}

function getRangeByIndex(document: TextDocument, idx: number) {
  return document.lineAt(document.positionAt(idx)).range
}
