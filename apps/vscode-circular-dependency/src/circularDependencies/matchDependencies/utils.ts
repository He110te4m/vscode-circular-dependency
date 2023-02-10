export function matchAllRegExp(content: string): (reg: RegExp) => string[]
export function matchAllRegExp(content: string, reg: RegExp): string[]
export function matchAllRegExp(content: string, reg?: RegExp) {
  const fn = (reg: RegExp) => Array.from(content.matchAll(reg)).map(matched => matched[matched.length - 1])

  return reg ? fn(reg) : fn
}
