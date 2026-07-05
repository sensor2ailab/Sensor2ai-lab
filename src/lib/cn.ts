export type ClassValue = string | number | false | null | undefined;

// Tiny class-name joiner, keeps components dependency-free.
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
