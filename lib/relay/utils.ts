/**
 * Utility functions
 */

/**
 * Converts a string into a URL-friendly slug.
 * Lowercases the text, replaces non-alphanumeric characters with hyphens,
 * removes leading/trailing hyphens, and limits length to 50 characters.
 */
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 50);
}

/**
 * Generates a unique token with the format: `{prefix}-{timestamp}-{random}`.
 * Used for input/confirm tokens and loading IDs.
 */
export function generateToken(prefix: string): string {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
