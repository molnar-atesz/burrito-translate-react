export function copyAndSortItems<IGlossaryItem>(
  items: IGlossaryItem[],
  sortProperty: string,
  isSortedDescending?: boolean
): IGlossaryItem[] {
  const prop = sortProperty as keyof IGlossaryItem;
  return items.slice(0).sort((aItem: IGlossaryItem, bItem: IGlossaryItem) => {
    const aLower = getLoweredPropValue(aItem, prop);
    const bLower = getLoweredPropValue(bItem, prop);
    const compareVal = isSortedDescending ? aLower < bLower : aLower > bLower;
    return compareVal ? 1 : -1;
  });
}

export function getLoweredPropValue(item: any, prop: any): string {
  let value = item[prop];
  let valueLower = "";
  if (typeof value === "string") {
    valueLower = value.toLocaleLowerCase();
  }
  return valueLower;
}
