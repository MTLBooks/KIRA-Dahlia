/**
 * 根据 cookie 检查一个用户是否属于某个角色。
 * @param roles 用户的角色
 * @returns 检查结果
 */
export async function checkUserRole(roles: string[]): Promise<boolean> {
	const userInfo = await getSelfUserInfo(undefined, false); // 仅获取数据，不修改 pinia
	if (userInfo.success && roles.some(role => !!userInfo.result?.roles?.includes(role)))
		return true;
	else
		return false;
}
