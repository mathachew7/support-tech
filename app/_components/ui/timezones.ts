export type TimezoneOption = { value: string; label: string; keywords: string };

// Curated common zones with abbreviations so search matches "CST", "CT", "PST"...
export const TIMEZONES: TimezoneOption[] = [
  { value: "UTC", label: "UTC — Coordinated Universal Time", keywords: "UTC GMT zulu" },
  { value: "America/New_York", label: "Eastern Time — New York", keywords: "ET EST EDT eastern new york us" },
  { value: "America/Chicago", label: "Central Time — Chicago", keywords: "CT CST CDT central chicago us" },
  { value: "America/Denver", label: "Mountain Time — Denver", keywords: "MT MST MDT mountain denver us" },
  { value: "America/Phoenix", label: "Mountain (no DST) — Phoenix", keywords: "MST arizona phoenix us" },
  { value: "America/Los_Angeles", label: "Pacific Time — Los Angeles", keywords: "PT PST PDT pacific california los angeles us" },
  { value: "America/Anchorage", label: "Alaska Time — Anchorage", keywords: "AKST AKDT alaska us" },
  { value: "Pacific/Honolulu", label: "Hawaii Time — Honolulu", keywords: "HST hawaii us" },
  { value: "America/Toronto", label: "Eastern Time — Toronto", keywords: "ET EST EDT toronto canada" },
  { value: "America/Sao_Paulo", label: "Brasília Time — São Paulo", keywords: "BRT brazil sao paulo" },
  { value: "Europe/London", label: "UK Time — London", keywords: "GMT BST london uk britain" },
  { value: "Europe/Paris", label: "Central European — Paris", keywords: "CET CEST paris france" },
  { value: "Europe/Berlin", label: "Central European — Berlin", keywords: "CET CEST berlin germany" },
  { value: "Europe/Madrid", label: "Central European — Madrid", keywords: "CET CEST madrid spain" },
  { value: "Europe/Athens", label: "Eastern European — Athens", keywords: "EET EEST athens greece" },
  { value: "Africa/Johannesburg", label: "South Africa — Johannesburg", keywords: "SAST johannesburg south africa" },
  { value: "Asia/Dubai", label: "Gulf Time — Dubai", keywords: "GST dubai uae gulf" },
  { value: "Asia/Kolkata", label: "India Time — Kolkata", keywords: "IST india kolkata mumbai delhi" },
  { value: "Asia/Karachi", label: "Pakistan Time — Karachi", keywords: "PKT karachi pakistan" },
  { value: "Asia/Singapore", label: "Singapore Time — Singapore", keywords: "SGT singapore" },
  { value: "Asia/Hong_Kong", label: "Hong Kong Time — Hong Kong", keywords: "HKT hong kong" },
  { value: "Asia/Shanghai", label: "China Time — Shanghai", keywords: "CST china shanghai beijing" },
  { value: "Asia/Tokyo", label: "Japan Time — Tokyo", keywords: "JST japan tokyo" },
  { value: "Australia/Sydney", label: "Eastern Australia — Sydney", keywords: "AEST AEDT sydney australia" },
  { value: "Pacific/Auckland", label: "New Zealand — Auckland", keywords: "NZST NZDT auckland new zealand" },
];

export function tzLabel(value: string): string {
  return TIMEZONES.find((t) => t.value === value)?.label ?? value.replace(/_/g, " ");
}
