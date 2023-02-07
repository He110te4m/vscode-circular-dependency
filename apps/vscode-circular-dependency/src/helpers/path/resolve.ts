import { resolvePath } from '@circular-dependency/utils/dist/file'
import { getAliasMap, getPackageDirectory } from '../config'
import { getWorkspaceFolder } from './env'

export function resolve(path: string) {
  return resolvePath(path, {
    baseDir: getWorkspaceFolder(),
    packageDirectory: getPackageDirectory(),
    aliasMap: getAliasMap(),
  })
}
