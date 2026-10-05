export function filterCases(cases, from, to, precinct) {
  if (from && to && from > to) return [];
  return cases.filter(item => (!from || item.date >= from) && (!to || item.date <= to) && (precinct === 'All units' || item.precinct === precinct));
}
