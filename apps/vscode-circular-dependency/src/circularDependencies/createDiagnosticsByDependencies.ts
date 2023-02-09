import { Diagnostic, DiagnosticSeverity, Uri } from 'vscode'
import { getErrorLevel } from '../helpers/config'
import type { DepResolvedInfoType, FormatterCircularDependencies } from './types'

const errorMessage = 'There is a circular dependency in the current dependency package, please check the dependencies'

export function createDiagnosticsByDependencies(circularDependencies: FormatterCircularDependencies[]): Diagnostic[] {
  const result: Diagnostic[] = []

  const severity = getErrorLevel() === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning

  return circularDependencies.reduce((list, { deps, range }) => {
    const [{ dep: originImportPackage }] = deps
    if (!originImportPackage) {
      return list
    }
    const diagnostic = new Diagnostic(range, formatErrorMessage(errorMessage, deps), severity)
    diagnostic.code = {
      value: 'Go to circular dependency',
      target: Uri.file(deps[deps.length - 1].resolvedPath),
    }

    diagnostic.source = 'circular-dependency'

    return list.concat(diagnostic)
  }, result)
}

function formatErrorMessage(errorMessage: string, deps: DepResolvedInfoType[]) {
  return `${errorMessage}

The dependency order is as follows:

${deps.map(({ dep }) => dep).join(' -> ')}
`
}
