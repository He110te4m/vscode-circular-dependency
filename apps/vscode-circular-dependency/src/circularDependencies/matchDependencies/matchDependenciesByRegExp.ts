import { matchAllRegExp } from './utils'

export interface MatchDependenciesByRegExpOptions {
  content: string
  regList: RegExp[]
}

export function matchDependenciesByRegExp({ content, regList }: MatchDependenciesByRegExpOptions): string[] {
  return regList.flatMap(
    reg => matchAllRegExp(content, reg),
  )
}
