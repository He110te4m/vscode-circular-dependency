export function matchAllRegExp(content: string, reg: RegExp) {
  return Array.from(content.matchAll(reg)).map(matched => matched[matched.length - 1])
}
