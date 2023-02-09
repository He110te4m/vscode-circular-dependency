export function groupBy<TDataItem, TKey extends keyof any>(data: TDataItem[]): (ruleFn: (item: TDataItem) => TKey) => Record<TKey, TDataItem[]> {
  return (ruleFn) => {
    const result = {} as Record<TKey, TDataItem[]>

    for (const item of data) {
      const key = ruleFn(item)
      if (!result[key]) {
        result[key] = []
      }
      result[key].push(item)
    }

    return result
  }
}
