/**
 * 根据 cookie 检查一个用户是否属于某个角色。
 * @param role 用户的角色
 * @returns 检查结果
 */
export async function checkUserRole(role: string): Promise<boolean> {
	const userInfo = await getSelfUserInfo();
	if (userInfo.success && userInfo.result?.roles?.includes(role))
		return true;
	else
		return false;
}
