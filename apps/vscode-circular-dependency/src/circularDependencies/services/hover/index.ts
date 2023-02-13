import { type Disposable, Hover, MarkdownString, Uri, languages } from 'vscode'
import type { AllCacheCollections, DependencyResolvedInfo } from '../../types'
import { getFormatterCircularDependencies } from '../../helpers/getFormatterCircularDependencies'
import { isShowDependencyLoop } from '../../../helpers/config'

export function registerHoverService({ dependenciesCacheStore }: AllCacheCollections): Disposable[] {
  return isShowDependencyLoop()
    ? [
        languages.registerHoverProvider('*', {
          provideHover(document, position) {
            const matchedDependency = getFormatterCircularDependencies(dependenciesCacheStore, document)
              ?.find(({ range }) => range.contains(position))
            if (!matchedDependency) {
              return
            }

            const { deps, range } = matchedDependency

            return new Hover(formatCircularDependencies(deps), range)
          },
        }),
      ]
    : []
}

function formatCircularDependencies(deps: DependencyResolvedInfo[]): MarkdownString {
  return new MarkdownString(`
The cyclic dependencies are as follows:

${
  deps.map(({ dep, resolvedPath }, idx) =>
    `${idx + 1}. [\`${dep}\`](${Uri.file(resolvedPath)})`,
  )
    .join('\r\n')
}
`)
}
