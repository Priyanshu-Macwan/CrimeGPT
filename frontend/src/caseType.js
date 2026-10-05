export function caseTypeLabel(c) {
  return c.type === 'Other' && c.otherCrimeType ? `Other: ${c.otherCrimeType}` : c.type;
}
