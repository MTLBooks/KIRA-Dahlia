/**
 * Parameters submitted for user registration
 */
export type UserRegistrationRequestDto = {
	/** User email */
	email: string;
	/** Verification code */
	verificationCode: string;
	/** Password that has been hashed once with Bcrypt on the frontend */
	passwordHash: string;
	/** Password hint */
	passwordHint?: string;
	/** Invitation code used during registration */
	invitationCode?: string;
	/** Username */
	username: string;
	/** User nickname */
	userNickname?: string;
};

/**
 * Response parameters for user registration
 */
export type UserRegistrationResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** User UUID */
	UUID?: string;
	/** User ID */
	uid?: number;
	/** Token if registration succeeded; if failed, token is falsy (undefined, null, or "") */
	token?: string;
	/** Extra text message */
	message?: string;
};

/**
 * Parameters submitted for user login
 */
export type UserLoginRequestDto = {
	/** User email */
	email: string;
	/** Password that has been hashed once on the frontend */
	passwordHash: string;
	/** One-time password entered by the user */
	clientOtp?: string;
	/** Email verification code entered by the user */
	verificationCode?: string;
};

/**
 * Response parameters for user login
 */
export type UserLoginResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** User email */
	email?: string;
	/** User UUID */
	UUID?: string;
	/** User ID */
	uid?: number;
	/** Token if login succeeded; if failed, token is falsy (undefined, null, or "") */
	token?: string;
	/** Password hint */
	passwordHint?: string;
	/** Extra text message */
	message?: string;
	/** Whether in cooldown */
	isCoolingDown?: boolean;
	/** Authenticator type */
	authenticatorType?: "email" | "totp" | "none";
};

/**
 * Request parameters for checking if a user exists
 */
export type UserExistsCheckByUIDRequestDto = {
	/** User UID */
	uid: number;
};

/**
 * Response for checking if a user exists
 */
export type UserExistsCheckByUIDResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** True if user exists, false otherwise */
	exists: boolean;
	/** Extra text message */
	message?: string;
};

/**
 * Request parameters to check if an email exists
 */
export type UserEmailExistsCheckRequestDto = {
	/** User email */
	email: string;
};

/**
 * Response parameters for checking if an email already exists
 */
export type UserEmailExistsCheckResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** Returns true if the user exists or the query fails (pessimistic), false if not exists */
	exists: boolean; // WARN: Returns true when user already exists or the query fails (pessimistic), to prevent accidental duplicate registrations.
	/** Extra text message */
	message?: string;
};

/**
 * Parameters for user email update request
 */
export type UpdateUserEmailRequestDto = {
	/** User ID */
	uid: number;
	/** Old email */
	oldEmail: string;
	/** New email */
	newEmail: string;
	/** User password hashed once */
	passwordHash: string;
	/** Verification code */
	verificationCode: string;
};

/**
 * Response parameters for user email update
 */
export type UpdateUserEmailResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** Extra text message */
	message?: string;
};

/**
 * Password and user info before hashing
 */
export type BeforeHashPasswordDataType = {
	/** User email */
	email: string;
	/** Password that has been hashed once on the frontend */
	passwordHash: string;
};

/**
 * User personal label
 */
export type UserLabel = {
	/** Label ID */
	id: number;
	/** Label name */
	labelName: string;
};

/**
 * User linked accounts
 */
export type UserLinkedAccounts = {
	/** Linked platform - e.g., "X" */
	platformId: string;
	/** Linked account unique identifier */
	accountUniqueId: string;
};

/**
 * User linked websites
 */
export type UserWebsite = {
	/** Website name - e.g., "My homepage" */
	websiteName: string;
	/** Website URL */
	websiteUrl: string;
};

/**
 * Request parameters for updating or creating user info
 */
export type UpdateOrCreateUserInfoRequestDto = {
	/** Username */
	username?: string;
	/** User nickname */
	userNickname?: string;
	/** Avatar URL */
	avatar?: string;
	/** Banner image URL */
	userBannerImage?: string;
	/** User signature */
	signature?: string;
	/** User gender: male, female, or custom (string) */
	gender?: string;
	/** Personal labels */
	label?: UserLabel[];
	/** Birthday */
	userBirthday?: number;
	/** Profile Markdown */
	userProfileMarkdown?: string;
	/** Linked accounts */
	userLinkedAccounts?: UserLinkedAccounts[];
	/** Linked website */
	userWebsite?: UserWebsite;
};

/**
 * Response of updating or creating user info
 */
export type UpdateOrCreateUserInfoResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** Extra text message */
	message?: string;
	/** Result */
	result?: {} & UpdateOrCreateUserInfoRequestDto;
};

/**
 * Request parameters for getting the current logged-in user's info
 */
export type GetSelfUserInfoRequestDto = {
	/** User ID */
	uid: number;
	/** User token */
	token: string;
};

/**
 * Request parameters for getting the current logged-in user's info by UUID
 */
export type GetSelfUserInfoByUuidRequestDto = {
	/** UUID */
	uuid: string;
	/** User token */
	token: string;
};

/**
 * Response for getting the current logged-in user's info
 */
export type GetSelfUserInfoResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** Extra text message */
	message?: string;
	/** Result */
	result?: (
		{
			/** User ID */
			uid?: number;
			/** UUID */
			uuid?: string;
			/** Email */
			email?: string;
			/** User creation time */
			userCreateDateTime?: number;
			/** Roles */
			roles?: string[];
			/** 2FA type */
			typeOf2FA?: string;
			/** Invitation code used */
			invitationCode?: string;
		}
		& UpdateOrCreateUserInfoRequestDto
	);
};

/**
 * Response for getting the current logged-in user's info by UUID
 */
export type GetSelfUserInfoByUuidResponseDto = {} & GetSelfUserInfoResponseDto;

/**
 * Request payload to get user info by UID
 */
export type GetUserInfoByUidRequestDto = {
	/** Target user's UID */
	uid: number;
};

/**
 * Block state of a user
 */
type BlockState = { isBlockedByOther: boolean; isBlocked: boolean; isHidden: boolean };

/**
 * Response of getting user info by UID
 */
export type GetUserInfoByUidResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** Extra text message */
	message?: string;
	/** Result */
	result?: {
		/** Username */
		username?: string;
		/** User nickname */
		userNickname?: string;
		/** Avatar URL */
		avatar?: string;
		/** Banner image URL */
		userBannerImage?: string;
		/** Signature */
		signature?: string;
		/** Gender: male, female, or custom (string) */
		gender?: string;
		/** Personal labels */
		label?: UserLabel[];
		/** Account creation time */
		userCreateDateTime?: number;
		/** Roles */
		roles?: string[];
		/** Whether following this user */
		isFollowing: boolean;
		/**
		 * Whether the queried user is the current user.
		 * If true, it usually means the request is incorrect because there is a dedicated API to query own info.
		 */
		isSlef: boolean;
	};
} & BlockState;

/**
 * Response for validating a user with UID and token
 */
export type CheckUserTokenResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** Extra text message */
	message?: string;
	/** User token validation result: true for valid user, false for invalid */
	userTokenOk?: boolean;
};

/**
 * Response for user logout
 */
export type UserLogoutResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** Extra text message */
	message?: string;
};

/**
 * Response to get a pre-signed URL for uploading user avatar, valid for 60 seconds
 */
export type GetUserAvatarUploadSignedUrlResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** Pre-signed URL for uploading user avatar */
	userAvatarUploadSignedUrl?: string;
	/** Filename for user avatar upload */
	userAvatarFilename?: string;
	/** Extra text message */
	message?: string;
};

/**
 * User privacy data visibility settings
 */
type UserPrivaryVisibilitiesSettingDto = {
	/** ID of the privacy data item - required - e.g., 'birthday', 'follow', 'fans' */
	privaryId: string;
	/** Visibility - required - allowed values: {public: public, following: follow-only, private: hidden} */
	visibilitiesType: "public" | "following" | "private";
};

/**
 * Visibility settings for user linked platforms
 */
type UserLinkedAccountsVisibilitiesSettingDto = {
	/** Linked account type - required - e.g., "X" */
	platformId: string;
	/** Visibility - required - allowed values: {public: public, following: follow-only, private: hidden} */
	visibilitiesType: "public" | "following" | "private";
};

/**
 * Basic user settings type
 */
export type BasicUserSettingsDto = {
	/** Whether to enable cookies - boolean */
	enableCookie?: boolean;
	/** Theme appearance (theme type) - allowed values: {light, dark, system} */
	themeType?: "light" | "dark" | "system";
	/** Theme color - string */
	themeColor?: string;
	/** Custom theme color - string, HEX color without the leading # */
	themeColorCustom?: string;
	/** Wallpaper (background image URL) - string */
	wallpaper?: string;
	/** Whether to enable colored sidebar - boolean */
	coloredSideBar?: boolean;
	/** Data saver mode - string, {standard, limit, preview} */
	dataSaverMode?: "standard" | "limit" | "preview";
	/** Disable search recommendations - boolean */
	noSearchRecommendations?: boolean;
	/** Disable related video recommendations - boolean */
	noRelatedVideos?: boolean;
	/** Disable search history - boolean */
	noRecentSearch?: boolean;
	/** Disable video history - boolean */
	noViewHistory?: boolean;
	/** Open video in new window - boolean */
	openInNewWindow?: boolean;
	/** Display language - string */
	currentLocale?: string;
	/** User timezone - string */
	timezone?: string;
	/** User unit system - string, e.g., metric/imperial */
	unitSystemType?: string;
	/** Whether developer mode is enabled - boolean */
	devMode?: boolean;
	/** Privacy setting for user website - allowed values: {public, following, private} */
	userWebsitePrivacySetting?: "public" | "following" | "private";
	/** User privacy data visibility settings */
	userPrivaryVisibilitiesSetting?: UserPrivaryVisibilitiesSettingDto[];
	/** User linked accounts visibility settings */
	userLinkedAccountsVisibilitiesSetting?: UserLinkedAccountsVisibilitiesSettingDto[];
	// /** Experimental: Enable sharp appearance mode - boolean */
	// sharpAppearanceMode?: boolean;
	// /** Experimental: Enable flat appearance mode - boolean */
	// flatAppearanceMode?: boolean;
};

/**
 * Request parameters for getting user settings for page rendering
 */
export type GetUserSettingsRequestDto = {} & GetSelfUserInfoRequestDto;

/**
 * Response parameters for getting user settings for page rendering
 */
export type GetUserSettingsResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** User settings */
	userSettings?: { uid: number; editDateTime: number } & BasicUserSettingsDto;
	/** Extra text message */
	message?: string;
};

/**
 * Request parameters for updating or creating user settings
 */
export type UpdateOrCreateUserSettingsRequestDto = {} & BasicUserSettingsDto;

/**
 * Response parameters for updating or creating user settings
 */
export type UpdateOrCreateUserSettingsResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** User settings */
	userSettings?: { uid: number; editDateTime: number } & BasicUserSettingsDto;
	/** Extra text message */
	message?: string;
};

/**
 * Request payload to send registration email verification code
 */
export type RequestSendVerificationCodeRequestDto = {
	/** User email - required - unique */
	email: string;
	/** Client language */
	clientLanguage: string;
};

/**
 * Response for sending email verification code
 */
export type RequestSendVerificationCodeResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** Whether the timeout has been reached */
	isTimeout: boolean;
	/** Extra text message */
	message?: string;
};

/**
 * Invitation code type
 */
type InvitationCode = {
	/** UID of the user who generated the code - required */
	creatorUid: number;
	/** UUID of the user who generated the code - required */
	creatorUUID: string;
	/** Invitation code - required */
	invitationCode: string;
	/** Invitation generation time - required */
	generationDateTime: number;
	/** Invitation code marked as pending usage - required */
	isPending: boolean;
	/** Invitation code is disabled - required */
	disabled: boolean;
	/** The user who used this invitation code */
	assignee?: number;
	/** Time when invitation code was used */
	usedDateTime?: number;
};

/**
 * Response for generating an invitation code
 */
export type CreateInvitationCodeResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** Whether the generator is cooling down (must wait before generating again) */
	isCoolingDown: boolean;
	/** Extra text message */
	message?: string;
	/** Generated code */
	invitationCodeResult?: InvitationCode;
};

/**
 * Response for getting own invitation codes
 */
export type GetMyInvitationCodeResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** Extra text message */
	message?: string;
	/** Invitation code list */
	invitationCodeResult: InvitationCode[];
};

/**
 * Response for admin to query user's invitation codes by UID
 */
export type AdminGetUserInvitationCodeResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** Extra text message */
	message?: string;
	/** Invitation code used for registration */
	invitationCodeResult: InvitationCode[];
};

/**
 * Response for admin to query user by invitation code
 */
export type AdminGetUserByInvitationCodeResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** Extra text message */
	message?: string;
	/** Invitation code query result */
	userInfoResult: {
		/** User UID */
		uid?: number;
		/** User UUID */
		uuid?: string;
	};
};

/**
 * Request payload for using an invitation code
 */
export type UseInvitationCodeDto = {
	/** Invitation code to be used */
	invitationCode: string;
	/** Registrant UID */
	registrantUid: number;
	/** Registrant UUID */
	registrantUUID: string;
};

/**
 * Response for using an invitation code
 */
export type UseInvitationCodeResultDto = {
	/** Whether the code was used successfully */
	success: boolean;
	/** Extra text message */
	message?: string;
};

/**
 * Request payload to check if an invitation code is available
 */
export type CheckInvitationCodeRequestDto = {
	/** Invitation code to be checked */
	invitationCode: string;
};

/**
 * Response for checking if an invitation code is available
 */
export type CheckInvitationCodeResponseDto = {
	/** Whether the code check succeeded */
	success: boolean;
	/** Whether it is an available invitation code */
	isAvailableInvitationCode: boolean;
	/** Extra text message */
	message?: string;
};

/**
 * Request payload to send a verification code for changing email
 */
export type RequestSendChangeEmailVerificationCodeRequestDto = {
	/** Client language */
	clientLanguage: string;
	/** New email */
	newEmail: string;
};

/**
 * Response for sending a verification code for changing email
 */
export type RequestSendChangeEmailVerificationCodeResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** Whether cooldown time has been reached */
	isCoolingDown: boolean;
	/** Extra text message */
	message?: string;
};

/**
 * Request payload to send a verification code for changing password
 */
export type RequestSendChangePasswordVerificationCodeRequestDto = {
	/** Client language */
	clientLanguage: string;
};

/**
 * Response for sending a verification code for changing password
 */
export type RequestSendChangePasswordVerificationCodeResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** Whether cooldown time has been reached */
	isCoolingDown: boolean;
	/** Extra text message */
	message?: string;
};

/**
 * Request parameters for user password update
 */
export type UpdateUserPasswordRequestDto = {
	/** Old password hash */
	oldPasswordHash: string;
	/** New password hash */
	newPasswordHash: string;
	/** Verification code */
	verificationCode: string;
};

/**
 * Response parameters for user password update
 */
export type UpdateUserPasswordResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** Extra text message */
	message?: string;
};

/**
 * Request payload to check if a username is available
 */
export type CheckUsernameRequestDto = {
	/** Username */
	username: string;
};

/**
 * Response for checking username availability
 */
export type CheckUsernameResponseDto = {
	/** Execution result: true if succeeded, false if failed */
	success: boolean;
	/** Extra text message */
	message?: string;
	/** Whether the username is available */
	isAvailableUsername: boolean;
};

/**
 * Request payload for admin to get all blocked users
 */
export type GetBlockedUserRequestDto = {
	/** Sort field */
	sortBy: string;
	/** Sort order */
	sortOrder: string;
	/** Query UID */
	uid?: number;
	/** Pagination */
	pagination: {
		/** Current page number */
		page: number;
		/** Page size */
		pageSize: number;
	};
};

/**
 * Response for admin to get all blocked users
 */
export type GetBlockedUserResponseDto = {
	/** Execution result */
	success: boolean;
	/** Extra text message */
	message?: string;
	/** Response result: blocked users */
	result?: (
		GetUserInfoByUidResponseDto["result"] & {
			uid: number;
			UUID: string;
		}
	)[];
	/** Total count */
	totalCount: number;
};

/**
 * Request payload for admin to get user info
 */
export type AdminGetUserInfoRequestDto = {
	/** Whether to show only users who updated info after the last approved review */
	isOnlyShowUserInfoUpdatedAfterReview: boolean;
	/** Sort field */
	sortBy: string;
	/** Sort order */
	sortOrder: string;
	/** Query UID */
	uid?: number;
	/** Pagination */
	pagination: {
		/** Current page number */
		page: number;
		/** Page size */
		pageSize: number;
	};
};

/**
 * Response payload for admin to get user info
 */
export type AdminGetUserInfoResponseDto = {
	/** Execution result */
	success: boolean;
	/** Extra text message */
	message?: string;
	/** Response result */
	result?: (
		GetSelfUserInfoResponseDto["result"] & {
			uid: number;
			UUID: string;
			avatar: string;
			userBannerImage: string;
			editDateTime: number;
			editOperatorUUID: string;
			isUpdatedAfterReview: boolean;
		}
	)[];
	/** Total count */
	totalCount: number;
};

/**
 * Request payload for admin to approve user info
 */
export type ApproveUserInfoRequestDto = {
	/** User UUID */
	UUID: string;
};

/**
 * Response payload for admin approval of user info
 */
export type ApproveUserInfoResponseDto = {
	/** Execution result */
	success: boolean;
	/** Extra text message */
	message?: string;
};

/**
 * Request payload for admin to clear a user's info
 */
export type AdminClearUserInfoRequestDto = {
	/** User UID */
	uid: number;
};

/**
 * Response payload for admin to clear a user's info
 */
export type AdminClearUserInfoResponseDto = {
	/** Execution result */
	success: boolean;
	/** Extra text message */
	message?: string;
};

/**
 * Request payload for admin to edit user info
 */
export type AdminEditUserInfoRequestDto = {
	/** User UID */
	uid: number;
	/** User info to edit */
	userInfo?: {
		/** Username */
		username?: string;
		/** User nickname */
		userNickname?: string;
		/** Avatar URL */
		avatar?: string;
		/** Banner image URL */
		userBannerImage?: string;
		/** User signature */
		signature?: string;
		/** User gender: male, female, or custom (string) */
		gender?: string;
		/** User birthday */
		userBirthday?: number;
		/** Profile Markdown */
		userProfileMarkdown?: string;
		/** Review status */
		isUpdatedAfterReview?: boolean;
	};
};

/**
 * Response payload for admin to edit user info
 */
export type AdminEditUserInfoResponseDto = {
	/** Execution result */
	success: boolean;
	/** Extra text message */
	message?: string;
};

/**
 * Request payload for a logged-in user to delete TOTP authenticator by TOTP verification code
 */
export type DeleteTotpAuthenticatorByTotpVerificationCodeRequestDto = {
	/** Verification code from the user's TOTP authenticator */
	clientOtp: string;
	/** Password hashed once */
	passwordHash: string;
};

/**
 * Response for a logged-in user to delete TOTP authenticator by TOTP verification code
 */
export type DeleteTotpAuthenticatorByTotpVerificationCodeResponseDto = {
	/** Execution result */
	success: boolean;
	/** Extra text message */
	message?: string;
	/** Whether in cooldown */
	isCoolingDown?: boolean;
};

/**
 * Response for creating a TOTP authenticator
 */
export type CreateUserTotpAuthenticatorResponseDto = {
	/** Execution result */
	success: boolean;
	/** Whether an authenticator already exists */
	isExists: boolean;
	/** If exists, the type of the authenticator */
	existsAuthenticatorType?: "email" | "totp";
	/** TOTP authenticator info */
	result?: {
		/** TOTP unique ID, QR code */
		otpAuth?: string;
	};
	/** Extra text message */
	message?: string;
};

/**
 * Response for creating an Email authenticator
 */
export type CreateUserEmailAuthenticatorResponseDto = {
	/** Execution result */
	success: boolean;
	/** Whether an authenticator already exists */
	isExists: boolean;
	/** If exists, the type of the authenticator */
	existsAuthenticatorType?: "email" | "totp";
	/** Email authenticator info */
	result?: {
		/** Email */
		email?: string;
		/** Email lower case */
		emailLowerCase?: string;
	};
	/** Extra text message */
	message?: string;
};

/**
 * Request payload for confirming binding of a TOTP device
 */
export type ConfirmUserTotpAuthenticatorRequestDto = {
	/** TOTP code generated by user's device */
	clientOtp: string;
	/** TOTP unique ID */
	otpAuth: string;
};

/**
 * Response for confirming binding of a TOTP device
 */
export type ConfirmUserTotpAuthenticatorResponseDto = {
	/** Execution result */
	success: boolean;
	/** Result */
	result?: {
		/** Authenticator backup codes */
		backupCode?: string[];
		/** Authenticator recovery code */
		recoveryCode?: string;
	};
	/** Extra text message */
	message?: string;
};

/**
 * Request payload to send Email authenticator verification mail
 */
export type SendUserEmailAuthenticatorVerificationCodeRequestDto = {
	/** User email */
	email: string;
	/** Password hashed once on the frontend */
	passwordHash: string;
	/** Client language */
	clientLanguage: string;
};

/**
 * Response for sending Email authenticator verification mail
 */
export type SendUserEmailAuthenticatorVerificationCodeResponseDto = {
	/** Execution result */
	success: boolean;
	/** Whether cooldown time has been reached */
	isCoolingDown: boolean;
	/** Extra text message */
	message?: string;
};

/**
 * Request payload to send Email authenticator deletion verification mail
 */
export type SendDeleteUserEmailAuthenticatorVerificationCodeRequestDto = {
	/** Client language */
	clientLanguage: string;
};

/**
 * Response for sending Email authenticator deletion verification mail
 */
export type SendDeleteUserEmailAuthenticatorVerificationCodeResponseDto = {} & SendUserEmailAuthenticatorVerificationCodeResponseDto;

/**
 * Request payload to verify Email authenticator verification code
 */
export type CheckEmailAuthenticatorVerificationCodeRequestDto = {
	/** User email */
	email: string;
	/** Email verification code */
	verificationCode: string;
};

/**
 * Response for verifying Email authenticator verification code
 */
export type CheckEmailAuthenticatorVerificationCodeResponseDto = {
	/** Execution result */
	success: boolean;
	/** Extra text message */
	message?: string;
};

/**
 * Request payload to delete Email 2FA
 */
export type DeleteUserEmailAuthenticatorRequestDto = {
	/** Password hashed once */
	passwordHash: string;
	/** Email verification code */
	verificationCode: string;
};

/**
 * Response for deleting Email 2FA
 */
export type DeleteUserEmailAuthenticatorResponseDto = {
	/** Execution result */
	success: boolean;
	/** Extra text message */
	message?: string;
};

/**
 * Request payload to check whether 2FA is enabled
 */
export type CheckUserHave2FARequestDto = {
	/** User email */
	email: string;
};

/**
 * Response payload to check whether 2FA is enabled
 */
export type CheckUserHave2FAResponseDto = {
	/** Execution result */
	success: boolean;
	/** Whether 2FA exists */
	have2FA: boolean;
	/** If exists, type of 2FA */
	type?: "email" | "totp";
	/** If exists and type is totp, 2FA creation time */
	totpCreationDateTime?: number;
	/** Extra text message */
	message?: string;
};

/**
 * Request payload to check whether a user exists by UUID
 */
export type CheckUserExistsByUuidRequestDto = {
	/** User UUID */
	uuid: string;
};

/**
 * Response payload to check whether a user exists by UUID
 */
export type CheckUserExistsByUuidResponseDto = {
	/** Execution result */
	success: boolean;
	/** Whether user exists */
	exists: boolean;
	/** Extra text message */
	message?: string;
};
