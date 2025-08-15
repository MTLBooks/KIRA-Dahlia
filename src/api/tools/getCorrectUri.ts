/**
 * Return the correct backend base URL according to current environment
 * @returns Correct backend base URL.
 */
export default function getCorrectUri(): string {
	/**
	 * Read VITE_BACKEND_URI from env as the backend API base URL.
	 * If VITE_BACKEND_URI equals 'none', return an empty string so KIRAKIRA-Lycoris runs without backend.
	 */
	try {
		const backendUriInput = import.meta.env.VITE_BACKEND_URI;

		if (!backendUriInput) {
			console.error("ERROR", "Server startup failed, the value of the environment variable VITE_BACKEND_URI was not specified.");
			return "";
		}

		if (backendUriInput === "none")
			return "";

		const backendUri = new URL(backendUriInput.trim());
		const backendUriHref = backendUri.href;
		if (!backendUriHref) {
			console.error("ERROR", "System startup failed, the parsed result of the environment variable VITE_BACKEND_URI is empty.");
			return "";
		}

		return backendUriHref;
	} catch (error) {
		console.error("ERROR", "System startup failed, environment variable VITE_BACKEND_URI parsing failed: ", error);
		return "";
	}
}

export const backendUri = getCorrectUri(); // Backend API URI
export const noBackend = !backendUri; // Is running without backend
