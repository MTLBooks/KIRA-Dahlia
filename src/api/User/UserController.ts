import { GET, POST } from "api/tools/fetch";
import { GetSelfUserInfoRequestDto, GetSelfUserInfoResponseDto, CheckUserTokenResponseDto, UserLogoutResponseDto, UserLoginRequestDto, UserLoginResponseDto, GetBlockedUserRequestDto } from "./UserControllerDto";

const USER_API_URI = `${backendUri}user`;

/**
 * User login
 * @param userLoginRequest login request payload
 * @returns login response
 */
export const userLogin = async (userLoginRequest: UserLoginRequestDto): Promise<UserLoginResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await POST(`${USER_API_URI}/login`, userLoginRequest, { credentials: "include" }) as UserLoginResponseDto;
};

/**
 * Get currently logged-in user's info, requires a valid uid and token in cookies; optionally hydrates global store
 * @param getSelfUserInfoRequest request payload
 * @param usePinia whether to inject result into Pinia
 * @returns user info response
 */
export const getSelfUserInfo = async (getSelfUserInfoRequest?: GetSelfUserInfoRequestDto, usePinia: boolean = true): Promise<GetSelfUserInfoResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	const selfUserInfo = await POST(`${USER_API_URI}/self`, getSelfUserInfoRequest, { credentials: "include" }) as GetSelfUserInfoResponseDto;
	const selfUserInfoResult = selfUserInfo.result;
	if (selfUserInfo.success && selfUserInfoResult) {
		if (usePinia) {
			const selfUserInfoStore = useSelfUserInfoStore();
			selfUserInfoStore.isLogined = true;
			selfUserInfoStore.uid = selfUserInfoResult.uid;
			selfUserInfoStore.userCreateDateTime = selfUserInfoResult.userCreateDateTime ?? 0;
			selfUserInfoStore.roles = selfUserInfoResult.roles ?? ["user"];
			selfUserInfoStore.userEmail = selfUserInfoResult.email ?? "";
			selfUserInfoStore.userAvatar = selfUserInfoResult.avatar || "";
			selfUserInfoStore.username = selfUserInfoResult.username || "Anonymous"; // TODO: i18n default username
			selfUserInfoStore.userNickname = selfUserInfoResult.userNickname || ""; // TODO: i18n default nickname
			selfUserInfoStore.gender = selfUserInfoResult.gender || "";
			selfUserInfoStore.signature = selfUserInfoResult.signature || "";
			selfUserInfoStore.tags = selfUserInfoResult.label?.map(label => label.labelName) || [];
		}
	} else
		await userLogout(usePinia);
	return selfUserInfo;
};

/**
 * Validate user token (also checks whether user is logged in)
 * @returns check result
 */
export const checkUserToken = async (): Promise<CheckUserTokenResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await GET(`${USER_API_URI}/check`, { credentials: "include" }) as CheckUserTokenResponseDto;
};

/**
 * User logout
 * @param usePinia whether to clear Pinia store
 * @returns nothing special; will clear the cookies immediately and reset global store
 */
export async function userLogout(usePinia: boolean = true): Promise<UserLogoutResponseDto> {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	const logoutResult = await GET(`${USER_API_URI}/logout`, { credentials: "include" }) as UserLogoutResponseDto;
	if (logoutResult.success) {
		if (usePinia) {
			const selfUserInfoStore = useSelfUserInfoStore();
			selfUserInfoStore.isLogined = false;
			selfUserInfoStore.uid = undefined;
			selfUserInfoStore.userCreateDateTime = 0;
			selfUserInfoStore.roles = ["user"];
			selfUserInfoStore.userEmail = "";
			selfUserInfoStore.userAvatar = "";
			selfUserInfoStore.username = "";
			selfUserInfoStore.userNickname = "";
			selfUserInfoStore.gender = "";
			selfUserInfoStore.signature = "";
			selfUserInfoStore.tags = [];
		}
	} else
		console.error("ERROR", "User logout failed"); // TODO: i18n
	return logoutResult;
}

/**
 * Admin: get user info list
 * @param isOnlyShowUserInfoUpdatedAfterReview whether to show only users updated after last review
 * @param sortBy sort field
 * @param sortOrder sort direction: {ascend, descend}
 * @param page page number (1-based)
 * @param pageSize page size
 * @returns response
 */
export const adminGetUserInfo = async (AdminGetUserInfoRequest: AdminGetUserInfoRequestDto): Promise<AdminGetUserInfoResponseDto> => {
	return await GET(`${USER_API_URI}/adminGetUserInfo?isOnlyShowUserInfoUpdatedAfterReview=${AdminGetUserInfoRequest.isOnlyShowUserInfoUpdatedAfterReview}&page=${AdminGetUserInfoRequest.pagination.page}&pageSize=${AdminGetUserInfoRequest.pagination.pageSize}&sortBy=${AdminGetUserInfoRequest.sortBy}&sortOrder=${AdminGetUserInfoRequest.sortOrder}&uid=${AdminGetUserInfoRequest.uid}`, { credentials: "include" }) as AdminGetUserInfoResponseDto;
};

/**
 * Admin: get blocked users
 */
export const adminGetBlockedUserInfo = async (GetBlockedUserRequest: GetBlockedUserRequestDto): Promise<GetBlockedUserResponseDto> => {
	return await GET(`${USER_API_URI}/blocked/info?uid=${GetBlockedUserRequest.uid}&page=${GetBlockedUserRequest.pagination.page}&pageSize=${GetBlockedUserRequest.pagination.pageSize}`, { credentials: "include" }) as GetBlockedUserResponseDto;
};

/**
 * Admin: clear user info
 * @param AdminClearUserInfoRequest request payload
 * @returns response
 */
export const adminClearUserInfo = async (AdminClearUserInfoRequest: AdminClearUserInfoRequestDto): Promise<AdminClearUserInfoResponseDto> => {
	return await POST(`${USER_API_URI}/adminClearUserInfo`, AdminClearUserInfoRequest, { credentials: "include" }) as AdminClearUserInfoResponseDto;
};

/**
 * Admin: edit user info
 * @param AdminEditUserInfoRequest request payload
 * @returns response
 */
export const adminEditUserInfo = async (AdminEditUserInfoRequest: AdminEditUserInfoRequestDto): Promise<AdminEditUserInfoResponseDto> => {
	return await POST(`${USER_API_URI}/adminEditUserInfo`, AdminEditUserInfoRequest, { credentials: "include" }) as AdminEditUserInfoResponseDto;
};
