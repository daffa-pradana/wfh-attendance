const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

function toWib(iso: string): Date {
  return new Date(new Date(iso).getTime() + WIB_OFFSET_MS);
}

export function wibDate(iso: string): string {
  return toWib(iso).toISOString().slice(0, 10);
}

export function wibTime(iso: string): string {
  return toWib(iso).toISOString().slice(11, 16);
}

export function wibDateTime(iso: string): string {
  return `${wibDate(iso)} ${wibTime(iso)}`;
}
