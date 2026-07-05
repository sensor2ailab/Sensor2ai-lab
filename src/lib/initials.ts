const skip = new Set(["dr.", "prof.", "mr.", "ms.", "of", "and", "the", "&", "for"]);

// Build monogram initials, ignoring honorifics and connector words.
export function initials(name: string, max = 2): string {
  const words = name.split(/\s+/).filter((word) => word && !skip.has(word.toLowerCase()));
  return words
    .slice(0, max)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
