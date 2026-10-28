/**
 * Case-insensitive search over a place-name list: names starting with `term` first, then names
 * containing it, each group in source order, at most `limit` results. A blank term returns the
 * first `limit` names. Single pass that stops once `limit` prefix matches are found, so it stays
 * cheap on the ~20k-name lists.
 */
export function filterCities(cities: readonly string[], term: string, limit = 50): string[] {
  const max = Math.max(0, Math.floor(limit));
  const needle = (term ?? '').trim().toLowerCase();
  if (!needle) {
    return cities.slice(0, max);
  }

  const prefix: string[] = [];
  const contains: string[] = [];
  for (const city of cities) {
    if (prefix.length >= max) {
      break;
    }
    const index = (city ?? '').toLowerCase().indexOf(needle);
    if (index === 0) {
      prefix.push(city);
    } else if (index > 0 && contains.length < max) {
      contains.push(city);
    }
  }
  return prefix.concat(contains).slice(0, max);
}
