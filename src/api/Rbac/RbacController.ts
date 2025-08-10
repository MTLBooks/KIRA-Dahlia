import { AdminGetUserRolesByUidRequestDto, AdminGetUserRolesByUidResponseDto, AdminUpdateUserRoleRequestDto, AdminUpdateUserRoleResponseDto, CreateRbacApiPathRequestDto, CreateRbacApiPathResponseDto, CreateRbacRoleRequestDto, CreateRbacRoleResponseDto, DeleteRbacApiPathRequestDto, DeleteRbacApiPathResponseDto, DeleteRbacRoleRequestDto, DeleteRbacRoleResponseDto, GetRbacApiPathRequestDto, GetRbacApiPathResponseDto, GetRbacRoleRequestDto, GetRbacRoleResponseDto, UpdateApiPathPermissionsForRoleRequestDto, UpdateApiPathPermissionsForRoleResponseDto } from "./RbacControllerDto";

const RBAC_API_URI = `${backendUri}rbac`;

/**
 * Get RBAC API paths
 * @param getRbacApiPathRequest request payload
 * @returns RBAC API paths
 */
export const getRbacApiPathController = async (getRbacApiPathRequest: GetRbacApiPathRequestDto): Promise<GetRbacApiPathResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await GET(`${RBAC_API_URI}/getRbacApiPath${getUrlQuery({ ...getRbacApiPathRequest.search, ...getRbacApiPathRequest.pagination })}`, { credentials: "include" }) as GetRbacApiPathResponseDto;
};

/**
 * Delete an RBAC API path
 * @param deleteRbacApiPathRequest request payload
 * @returns delete result
 */
export const deleteRbacApiPathController = async (deleteRbacApiPathRequest: DeleteRbacApiPathRequestDto): Promise<DeleteRbacApiPathResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await DELETE(`${RBAC_API_URI}/deleteRbacApiPath`, deleteRbacApiPathRequest, { credentials: "include" }) as DeleteRbacApiPathResponseDto;
};

/**
 * Create an RBAC API path
 * @param createRbacApiPathRequest request payload
 * @returns created RBAC API path
 */
export const createRbacApiPathController = async (createRbacApiPathRequest: CreateRbacApiPathRequestDto): Promise<CreateRbacApiPathResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await POST(`${RBAC_API_URI}/createRbacApiPath`, createRbacApiPathRequest, { credentials: "include" }) as CreateRbacApiPathResponseDto;
};

/**
 * Get RBAC roles
 * @param getRbacRoleRequest request payload
 * @returns RBAC roles
 */
export const getRbacRoleController = async (getRbacRoleRequest: GetRbacRoleRequestDto): Promise<GetRbacRoleResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await GET(`${RBAC_API_URI}/getRbacRole${getUrlQuery({ ...getRbacRoleRequest.search, ...getRbacRoleRequest.pagination })}`, { credentials: "include" }) as GetRbacRoleResponseDto;
};

/**
 * Delete an RBAC role
 * @param deleteRbacRoleRequest request payload
 * @returns delete result
 */
export const deleteRbacRoleController = async (deleteRbacRoleRequest: DeleteRbacRoleRequestDto): Promise<DeleteRbacRoleResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await DELETE(`${RBAC_API_URI}/deleteRbacRole`, deleteRbacRoleRequest, { credentials: "include" }) as DeleteRbacRoleResponseDto;
};

/**
 * Create an RBAC role
 * @param createRbacRoleRequest request payload
 * @returns created RBAC role
 */
export const createRbacRoleController = async (createRbacRoleRequest: CreateRbacRoleRequestDto): Promise<CreateRbacRoleResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await POST(`${RBAC_API_URI}/createRbacRole`, createRbacRoleRequest, { credentials: "include" }) as CreateRbacRoleResponseDto;
};

/**
 * Update API path permissions for a role
 * @param updateApiPathPermissionsForRoleRequest request payload
 * @returns update result
 */
export const updateApiPathPermissionsForRoleController = async (updateApiPathPermissionsForRoleRequest: UpdateApiPathPermissionsForRoleRequestDto): Promise<UpdateApiPathPermissionsForRoleResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await POST(`${RBAC_API_URI}/updateApiPathPermissionsForRole`, updateApiPathPermissionsForRoleRequest, { credentials: "include" }) as UpdateApiPathPermissionsForRoleResponseDto;
};

/**
 * Get a user's roles by UID (admin)
 * @param adminGetUserRolesByUidRequest request payload
 * @returns roles for the user
 */
export const adminGetUserRolesController = async (adminGetUserRolesByUidRequest: AdminGetUserRolesByUidRequestDto): Promise<AdminGetUserRolesByUidResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await GET(`${RBAC_API_URI}/adminGetUserRolesByUid?uid=${adminGetUserRolesByUidRequest.uid}`, { credentials: "include" }) as AdminGetUserRolesByUidResponseDto;
};

/**
 * Update a user's roles (admin)
 * @param adminUpdateUserRoleRequest request payload
 * @returns update result
 */
export const adminUpdateUserRoleController = async (adminUpdateUserRoleRequest: AdminUpdateUserRoleRequestDto): Promise<AdminUpdateUserRoleResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await POST(`${RBAC_API_URI}/adminUpdateUserRole`, adminUpdateUserRoleRequest, { credentials: "include" }) as AdminUpdateUserRoleResponseDto;
};
