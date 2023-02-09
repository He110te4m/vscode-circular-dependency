import { groupBy } from './fp/groupBy'

export interface CheckCommentEffectivenessOptions {
  sourceContent: string
  targetContent: string
  commentChars: [string, string?][]
}

export function checkContentEffectiveness(options: CheckCommentEffectivenessOptions) {
  const { commentChars } = options

  const lineCommentChars = groupBy(commentChars)(item => item.length)

  return checkCharInclude(options)
    && checkEffectivenessByLineComment({ ...options, commentChars: lineCommentChars[1] })
}

//#region check effectiveness function

function checkCharInclude({ sourceContent, targetContent }: CheckCommentEffectivenessOptions) {
  return sourceContent.includes(targetContent)
}

function checkEffectivenessByLineComment({ sourceContent, targetContent, commentChars }: CheckCommentEffectivenessOptions) {
  const idx = sourceContent.indexOf(targetContent)

  return commentChars.every(([char]) => !searchLineComment(sourceContent, char, idx))
}

//#endregion

//#region Match comment funtion

function searchLineComment(content: string, commentChar: string, limitIndex: number) {
  const idx = content.indexOf(commentChar)

  return idx >= 0 && limitIndex > idx
}

//#endregion
