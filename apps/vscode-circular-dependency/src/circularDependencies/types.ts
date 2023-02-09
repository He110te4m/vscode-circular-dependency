import type { Memento, Range } from 'vscode'

export type CacheStoreType = Memento

export type DepResolvedInfoType = Record<'dep' | 'resolvedPath', string>

export interface FormatterCircularDependencies {
  deps: DepResolvedInfoType[]
  range: Range
}
