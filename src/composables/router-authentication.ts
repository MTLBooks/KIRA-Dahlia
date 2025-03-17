import { GetSelfUserInfoResponseDto } from "api/User/UserControllerDto";

/**
 * 根据 cookie 获取用户信息，并检查一个用户是否属于传入的角色列表中的其中一个。
 * @param roles 用户的角色
 * @returns 检查结果
 */
export async function getUserInfoAndCheckRole(roles: string[]) {
	const userInfo = await getSelfUserInfo(undefined, false); // 仅获取数据，不修改 pinia
	if (userInfo.success && roles.some(role => !!userInfo.result?.roles?.includes(role)))
		return true;
	else
		return false;
}

/**
 * 根据传入的用户信息检查一个用户是否属于某个角色。
 * @param roles 用户的角色
 * @param selfUserInfo 用户信息
 * @returns 检查结果
 */
export function checkUserRole(roles: string[], selfUserInfo: GetSelfUserInfoResponseDto): boolean {
	if (selfUserInfo.success && roles.some(role => !!selfUserInfo.result?.roles?.includes(role)))
		return true;
	else
		return false;
}
