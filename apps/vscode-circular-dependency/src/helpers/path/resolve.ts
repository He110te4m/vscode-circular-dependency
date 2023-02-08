import { statSync } from 'fs'
import { dirname } from 'path'
import { type ResolvePathOption, resolvePath } from '@circular-dependency/utils/libs/file'
import { getAliasMap, getAutofillSuffixList, getPackageDirectoryName } from '../config'
import { getWorkspaceFolder } from './env'

export function resolve(path: string, basePath: string) {
  const packageDirectory = resolvePath(getPackageDirectoryName(), { baseDir: getWorkspaceFolder() })

  const opts: ResolvePathOption = {
    baseDir: getDirectory(basePath),
    packageDirectory,
    aliasMap: getAliasMap(),
  }

  const suffixList = getAutofillSuffixList().slice()
  let result = ''
  suffixList.unshift('')

  for (const suffix of suffixList) {
    const currentPath = resolvePath(formatPath(path, suffix), opts)
    if (currentPath) {
      result = currentPath
      break
    }
  }

  return result
}

function formatPath(path: string, suffix: string) {
  if (!suffix) {
    return path
  }

  const formattedSuffix = suffix.startsWith('.') ? suffix : `.${suffix}`
  return path + formattedSuffix
}

function getDirectory(path: string) {
  const stat = statSync(path)
  if (stat.isDirectory()) {
    return path
  }
  return stat.isFile() ? dirname(path) : ''
}
