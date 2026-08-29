const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

function toWib(iso: string): Date {
  return new Date(new Date(iso).getTime() + WIB_OFFSET_MS);
}

export function wibDateTime(iso: string): string {
  const d = toWib(iso);
  return `${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 16)}`;
}
