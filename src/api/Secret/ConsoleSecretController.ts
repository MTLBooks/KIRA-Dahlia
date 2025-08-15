import { GetStgEnvBackEndSecretResponse } from "./ConsoleSecretControllerDto";

const SECRET_API_URI = `${backendUri}secret`;

/**
 * Get staging backend environment secrets
 * @returns response
 */
export const getStgEnvBackEndSecretController = async (): Promise<GetStgEnvBackEndSecretResponse> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await GET(`${SECRET_API_URI}/getStgEnvBackEndSecret`, { credentials: "include" }) as GetStgEnvBackEndSecretResponse;
};
