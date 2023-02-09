import { isAbsolute } from 'node:path'
import { sync as globSync } from 'glob'
import { getDirectoryByPath } from '../../helpers/path/resolve'

export interface MatchDependenciesByGlobOptions {
  glob: string
  baseDirectory: string
}

export function matchDependenciesByGlob({ glob, baseDirectory }: MatchDependenciesByGlobOptions): string[] {
  if (!isAbsolute(baseDirectory)) {
    return []
  }

  return globSync(glob, { cwd: getDirectoryByPath(baseDirectory) })
}
