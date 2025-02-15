import { DeleteRbacApiPathRequestDto, DeleteRbacApiPathResponseDto, GetRbacApiPathRequestDto, GetRbacApiPathResponseDto } from "./RbacControllerDto";

const BACK_END_URL = getCorrectUri();
const RBAC_API_URL = `${BACK_END_URL}/rbac`;

/**
 * 获取 RBAC API 路径
 * @param getRbacApiPathRequest 获取 RBAC API 路径的请求载荷
 * @returns RBAC API 路径
 */
export const getRbacApiPath = async (getRbacApiPathRequest: GetRbacApiPathRequestDto): Promise<GetRbacApiPathResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await GET(`${RBAC_API_URL}/getRbacApiPath${getUrlQuery({ ...getRbacApiPathRequest.search, ...getRbacApiPathRequest.pagination })}`, { credentials: "include" }) as GetRbacApiPathResponseDto;
};

/**
 * 删除 RBAC API 路径
 * @param deleteRbacApiPathRequest 删除 RBAC API 路径的请求载荷
 * @returns 删除结果
 */
export const deleteRbacApiPath = async (deleteRbacApiPathRequest: DeleteRbacApiPathRequestDto): Promise<DeleteRbacApiPathResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await DELETE(`${RBAC_API_URL}/deleteRbacApiPath`, deleteRbacApiPathRequest, { credentials: "include" }) as DeleteRbacApiPathResponseDto;
};
