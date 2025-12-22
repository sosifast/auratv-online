/**
 * Generate URL-friendly slug from text
 * @param text - Input text to convert to slug
 * @returns URL-friendly slug
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        // Replace spaces and special chars with hyphen
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-+|-+$/g, '');
}

/**
 * Generate unique slug by appending number if exists
 * @param baseSlug - Base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
 */
export function makeUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
    if (!existingSlugs.includes(baseSlug)) {
        return baseSlug;
    }

    let counter = 1;
    let uniqueSlug = `${baseSlug}-${counter}`;

    while (existingSlugs.includes(uniqueSlug)) {
        counter++;
        uniqueSlug = `${baseSlug}-${counter}`;
    }

    return uniqueSlug;
}
