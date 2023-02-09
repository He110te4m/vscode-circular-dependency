import type { TextDocument, TextLine } from 'vscode'

export type GetLineByIndexFn = (idx: number) => TextLine

export function getDocumentLineByIndex(document: TextDocument): GetLineByIndexFn
export function getDocumentLineByIndex(document: TextDocument, idx: number): TextLine
export function getDocumentLineByIndex(document: TextDocument, idx?: number) {
  const fn = (idx: number) => document.lineAt(document.positionAt(idx))
  return typeof idx === 'undefined' ? fn : fn(idx)
}
