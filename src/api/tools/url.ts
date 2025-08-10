/**
 * Build URL query string
 * @param obj query params
 * @returns query string prefixed with '?'
 */
export function getUrlQuery(obj: Record<string, unknown>): string {
	// Build query params
	const params = new URLSearchParams();

	Object.entries(obj).forEach(([key, value]) => {
		if (value !== undefined && value !== null)
			params.append(key, String(value));
	});

	return `?${params.toString()}`;
}
