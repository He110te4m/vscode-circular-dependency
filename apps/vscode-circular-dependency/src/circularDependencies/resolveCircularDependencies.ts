import { existsSync, readFileSync } from 'node:fs'
import { Position, Range, type TextDocument } from 'vscode'
import type { DependencyResolvedInfo, FormatterCircularDependencies } from './types'

export function resolveCircularDependencies(doc: TextDocument, circularDependencies: DependencyResolvedInfo[][]) {
  const { fsPath: path } = doc.uri

  const fileContent = getFileContent(path)

  return circularDependencies.flatMap((deps): FormatterCircularDependencies[] => {
    const [{ dep: originImportPackage }] = deps
    if (!originImportPackage) {
      return []
    }

    return getAllRangeOfMatchedDependency(doc, fileContent, originImportPackage)
      .map(range => ({
        deps,
        range,
      }))
  })
}

function getFileContent(path: string) {
  return existsSync(path) ? readFileSync(path).toString() : ''
}

function getAllRangeOfMatchedDependency(doc: TextDocument, content: string, dependencyName: string): Range[] {
  const reg = createDependencyRegExp(dependencyName)

  const idxList = Array.from(content.matchAll(reg))
    // Don't need to worry about an index of `0`.
    // in fact, the import must be preceded by other characters, such as `import` and `require`
    .filter(({ index }) => index)
    .map(({ index }) => index) as number[]

  return idxList.map(idx => createRangeByDependencyIndex(doc, idx, dependencyName))
}

function createRangeByDependencyIndex(doc: TextDocument, index: number, text: string) {
  const startPos = doc.positionAt(index)
  const endPos = new Position(startPos.line, startPos.character + text.length + 2)

  return new Range(startPos, endPos)
}

function createDependencyRegExp(depName: string) {
  const regText = convertStringToDependencyRegExp(depName)

  return new RegExp(`(?<quote>['\"])${regText}\\k<quote>`, 'g')
}

function convertStringToDependencyRegExp(str: string) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}
