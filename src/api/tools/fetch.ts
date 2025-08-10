type RequestObject = Record<string, string>;
type HeadersObject = Record<string, string>;

/**
 * fetch with timeout
 * @param resource target URL
 * @param options request init
 * @param timeout timeout in milliseconds, default: 30000ms
 * @returns Response
 */
async function fetchWithTimeout(resource: RequestInfo, options: RequestInit = {}, timeout = 30000) {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeout);

	const response = await fetch(resource, {
		...options,
		signal: controller.signal,
	});

	clearTimeout(id);

	if (!response.ok)
		throw new Error(`HTTP error! Status: ${response.status}`);

	return response;
}

/**
 * Send GET request
 * @param url request URL
 * @param requestOptions request options (e.g., credentials)
 * @param headerOptions headers
 * @param timeout timeout in milliseconds, default: 30000ms
 * @returns JSON result
 */
export async function GET(url: string, requestOptions: RequestObject = {}, headerOptions: HeadersObject = {}, timeout?: number): Promise<unknown> {
	try {
		const response = await fetchWithTimeout(url, {
			method: "GET",
			...requestOptions,
			headers: headerOptions,
		}, timeout);
		return response.json();
	} catch (error) {
		console.error("ERROR", `something wrong in 'GET', URL: ${url}`, error); // TODO: Remove Console Output?
		throw error;
	}
}

/**
 * Send POST request
 * @param url request URL
 * @param body request body
 * @param requestOptions request options (e.g., credentials)
 * @param headerOptions headers
 * @param timeout timeout in milliseconds, default: 30000ms
 * @returns JSON result
 */
export async function POST(url: string, body: unknown, requestOptions: RequestObject = {}, headerOptions: HeadersObject = {}, timeout?: number): Promise<unknown> {
	try {
		const response = await fetchWithTimeout(url, {
			method: "POST",
			...requestOptions,
			headers: {
				"Content-Type": "application/json",
				...headerOptions,
			},
			body: JSON.stringify(body),
		}, timeout);
		return response.json();
	} catch (error) {
		console.error("ERROR", `something wrong in 'POST', URL: ${url}`, error); // TODO: Remove Console Output?
		if (import.meta.env.PROD)
			throw error;
	}
}

/**
 * Send DELETE request
 * @param url request URL
 * @param body request body
 * @param requestOptions request options (e.g., credentials)
 * @param headerOptions headers
 * @param timeout timeout in milliseconds, default: 30000ms
 * @returns JSON result
 */
export async function DELETE(url: string, body: unknown, requestOptions: RequestObject = {}, headerOptions: HeadersObject = {}, timeout?: number): Promise<unknown> {
	try {
		const response = await fetchWithTimeout(url, {
			method: "DELETE",
			...requestOptions,
			headers: {
				"Content-Type": "application/json",
				...headerOptions,
			},
			body: JSON.stringify(body),
		}, timeout);
		return response.json();
	} catch (error) {
		console.error("ERROR", `something wrong in 'DELETE', URL: ${url}`, error); // TODO: Remove Console Output?
		throw error;
	}
}
