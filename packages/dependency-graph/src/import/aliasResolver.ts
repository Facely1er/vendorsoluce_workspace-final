export interface AliasRecord {
  canonicalKey: string;
  alias: string;
}

export function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

export function buildAliasMap(records: AliasRecord[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const record of records) {
    map.set(normalizeKey(record.alias), normalizeKey(record.canonicalKey));
  }
  return map;
}

export function resolveAlias(value: string, aliasMap: Map<string, string>): string {
  const normalized = normalizeKey(value);
  return aliasMap.get(normalized) ?? normalized;
}
