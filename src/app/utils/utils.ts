export function sanitizeName(name: string): string {
  return name.toLowerCase().split(' ').join('_').trim();
}
