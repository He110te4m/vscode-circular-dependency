import { groupBy } from './fp/groupBy'

export interface CheckCommentEffectivenessOptions {
  sourceContent: string
  targetContent: string
  allContent: string
  commentChars: [string, string?][]
}

export function checkContentEffectiveness(options: CheckCommentEffectivenessOptions) {
  const { commentChars } = options

  const lineCommentChars = groupBy(commentChars)(item => item.length)

  return checkCharInclude(options)
    && checkEffectivenessByLineComment({ ...options, commentChars: lineCommentChars[1] })
    && checkEffectivenessByLlockComment({ ...options, commentChars: lineCommentChars[2] })
}

//#region check effectiveness function

function checkCharInclude({ sourceContent, targetContent }: CheckCommentEffectivenessOptions) {
  return sourceContent.includes(targetContent)
}

function checkEffectivenessByLineComment({ sourceContent, targetContent, commentChars }: CheckCommentEffectivenessOptions) {
  const idx = sourceContent.indexOf(targetContent)

  return commentChars.every(([char]) => !searchLineComment(sourceContent, char, idx))
}

function checkEffectivenessByLlockComment({ allContent, targetContent, commentChars }: CheckCommentEffectivenessOptions) {
  const idx = allContent.indexOf(targetContent)

  return commentChars.every(chars => !searchBlockComment(allContent, chars as [string, string], idx))
}

//#endregion

//#region Match comment funtion

function searchLineComment(content: string, commentChar: string, limitIndex: number) {
  const idx = content.indexOf(commentChar)

  return idx >= 0 && limitIndex > idx
}

function searchBlockComment(content: string, [commentStart, commentEnd]: [string, string], limitIndex: number) {
  const beforeIndex = limitIndex

  // There is no block comment before `targetContent`
  const beforeCommentStart = content.lastIndexOf(commentStart, beforeIndex)
  if (beforeCommentStart < 0) {
    return false
  }

  // Check that the block comments have been closed before
  const beforeCommentEnd = content.lastIndexOf(commentEnd, beforeIndex)

  return beforeCommentStart > beforeCommentEnd
}

//#endregion
