import { existsSync, readFileSync } from 'node:fs'

export function getFileContent(path: string) {
  return existsSync(path) ? readFileSync(path).toString() : ''
}
