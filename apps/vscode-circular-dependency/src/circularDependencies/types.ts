import type { CheckCommentEffectivenessOptions } from '@circular-dependency/utils/libs/comment'
import type { Memento, Range } from 'vscode'

export type CacheStoreType = Memento

export type DependencyResolvedInfo = Record<'dep' | 'resolvedPath', string>

export interface FormatterCircularDependencies {
  deps: DependencyResolvedInfo[]
  range: Range
}

export type CommentChars = CheckCommentEffectivenessOptions['commentChars'][number]
