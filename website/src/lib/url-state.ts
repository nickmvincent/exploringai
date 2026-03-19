export function serializeEntries(entries: [string, string][]): string {
  return entries
    .map(([key, value]) => `${encodeURIComponent(key)}:${encodeURIComponent(value)}`)
    .join(',');
}

export function parseEntries(serialized: string | null): Record<string, string> {
  const result: Record<string, string> = {};
  if (!serialized) return result;

  serialized.split(',').forEach((entry) => {
    if (!entry) return;

    const separator = entry.indexOf(':');
    if (separator === -1) return;

    const key = decodeURIComponent(entry.slice(0, separator));
    const value = decodeURIComponent(entry.slice(separator + 1));
    result[key] = value;
  });

  return result;
}
