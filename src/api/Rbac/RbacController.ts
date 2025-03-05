import { AdminGetUserRolesByUidRequestDto, AdminGetUserRolesByUidResponseDto, AdminUpdateUserRoleRequestDto, AdminUpdateUserRoleResponseDto, DeleteRbacApiPathRequestDto, DeleteRbacApiPathResponseDto, DeleteRbacRoleRequestDto, DeleteRbacRoleResponseDto, GetRbacApiPathRequestDto, GetRbacApiPathResponseDto, GetRbacRoleRequestDto, GetRbacRoleResponseDto } from "./RbacControllerDto";

const BACK_END_URL = getCorrectUri();
const RBAC_API_URL = `${BACK_END_URL}/rbac`;

/**
 * 获取 RBAC API 路径
 * @param getRbacApiPathRequest 获取 RBAC API 路径的请求载荷
 * @returns RBAC API 路径
 */
export const getRbacApiPathController = async (getRbacApiPathRequest: GetRbacApiPathRequestDto): Promise<GetRbacApiPathResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await GET(`${RBAC_API_URL}/getRbacApiPath${getUrlQuery({ ...getRbacApiPathRequest.search, ...getRbacApiPathRequest.pagination })}`, { credentials: "include" }) as GetRbacApiPathResponseDto;
};

/**
 * 删除 RBAC API 路径
 * @param deleteRbacApiPathRequest 删除 RBAC API 路径的请求载荷
 * @returns 删除结果
 */
export const deleteRbacApiPathController = async (deleteRbacApiPathRequest: DeleteRbacApiPathRequestDto): Promise<DeleteRbacApiPathResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await DELETE(`${RBAC_API_URL}/deleteRbacApiPath`, deleteRbacApiPathRequest, { credentials: "include" }) as DeleteRbacApiPathResponseDto;
};

/**
 * 获取 RBAC 角色
 * @param getRbacRoleRequest 获取 RBAC 角色的请求载荷
 * @returns RBAC 角色
 */
export const getRbacRoleController = async (getRbacRoleRequest: GetRbacRoleRequestDto): Promise<GetRbacRoleResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await GET(`${RBAC_API_URL}/getRbacRole${getUrlQuery({ ...getRbacRoleRequest.search, ...getRbacRoleRequest.pagination })}`, { credentials: "include" }) as GetRbacRoleResponseDto;
};

/**
 * 删除 RBAC 角色
 * @param deleteRbacRoleRequest 删除 RBAC 角色的请求载荷
 * @returns 删除结果
 */
export const deleteRbacRoleController = async (deleteRbacRoleRequest: DeleteRbacRoleRequestDto): Promise<DeleteRbacRoleResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await DELETE(`${RBAC_API_URL}/deleteRbacRole`, deleteRbacRoleRequest, { credentials: "include" }) as DeleteRbacRoleResponseDto;
};

/**
 * 通过 UID 获取一个用户的角色
 * @param adminGetUserRolesByUidRequest 通过 UID 获取一个用户的角色的请求载荷
 * @returns 通过 UID 获取一个用户的角色的请求响应
 */
export const adminGetUserRolesController = async (adminGetUserRolesByUidRequest: AdminGetUserRolesByUidRequestDto): Promise<AdminGetUserRolesByUidResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await GET(`${RBAC_API_URL}/adminGetUserRolesByUid?uid=${adminGetUserRolesByUidRequest.uid}`, { credentials: "include" }) as AdminGetUserRolesByUidResponseDto;
};

/**
 * 管理员更新用户角色
 * @param adminUpdateUserRoleRequest 管理员更新用户角色的请求载荷
 * @returns 管理员更新用户角色的请求响应
 */
export const adminUpdateUserRoleController = async (adminUpdateUserRoleRequest: AdminUpdateUserRoleRequestDto): Promise<AdminUpdateUserRoleResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await POST(`${RBAC_API_URL}/adminUpdateUserRole`, adminUpdateUserRoleRequest, { credentials: "include" }) as AdminUpdateUserRoleResponseDto;
};
