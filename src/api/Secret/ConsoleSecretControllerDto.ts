/**
 * Response: get staging backend environment secrets
 */
export type GetStgEnvBackEndSecretResponse = {
	/** Whether request succeeded */
	success: boolean;
	/** Extra message */
	message?: string;
	/** Staging backend environment secrets */
	result: {
		envs?: Record<string, string>;
	};
};
