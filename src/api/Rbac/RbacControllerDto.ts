/**
 * Parameters for checking user permissions via RBAC
 */
export type CheckUserRbacParams =
	| { uuid: string; apiPath: string }
	| { uid: number; apiPath: string };

/**
 * Result of checking user permissions via RBAC
 */
export type CheckUserRbacResult = {
	status: 200 | 403 | 500;
	message: string;
};

/**
 * RBAC API path
 */
type RbacApiPath = {
	/** API path UUID - required - unique */
	apiPathUuid: string;
	/** API path - required - unique */
	apiPath: string;
	/** API path type */
	apiPathType?: string;
	/** API path color - e.g., #66CCFFFF */
	apiPathColor?: string;
	/** API path description */
	apiPathDescription?: string;
	/** Creator UUID - required */
	creatorUuid: string;
	/** Last editor UUID - required */
	lastEditorUuid: string;
	/** System field - created at (ms) - required */
	createDateTime: number;
	/** System field - last edited at (ms) - required */
	editDateTime: number;
};

/**
 * RBAC API path result
 */
type RbacApiPathResult = RbacApiPath & {
	/** Whether this path has been assigned at least once */
	isAssignedOnce: boolean;
};

/**
 * Create RBAC API path - request payload
 */
export type CreateRbacApiPathRequestDto = {
	/** API path */
	apiPath: string;
	/** API path type */
	apiPathType?: string;
	/** API path color - e.g., #66CCFFFF */
	apiPathColor?: string;
	/** API path description */
	apiPathDescription?: string;
};

/**
 * Create RBAC API path - response
 */
export type CreateRbacApiPathResponseDto = {
	/** Whether request succeeded */
	success: boolean;
	/** Extra message */
	message?: string;
	/** Created data if success */
	result?: RbacApiPathResult;
};

/**
 * Delete RBAC API path - request payload
 */
export type DeleteRbacApiPathRequestDto = {
	/** API path */
	apiPath: string;
};

/**
 * Delete RBAC API path - response
 */
export type DeleteRbacApiPathResponseDto = {
	/** Whether request succeeded */
	success: boolean;
	/** Extra message */
	message?: string;
	/** Whether the path is assigned (cannot delete if assigned) */
	isAssigned: boolean;
};

/**
 * Get RBAC API paths - request payload
 */
export type GetRbacApiPathRequestDto = {
	/** Search */
	search: {
		/** API path */
		apiPath?: string;
		/** API path type */
		apiPathType?: string;
		/** API path color - e.g., #66CCFFFF */
		apiPathColor?: string;
		/** API path description */
		apiPathDescription?: string;
	};
	/** Pagination */
	pagination: {
		/** Page number (1-based) */
		page: number;
		/** Page size */
		pageSize: number;
	};
};

/**
 * Get RBAC API paths - response
 */
export type GetRbacApiPathResponseDto = {
	/** Whether request succeeded */
	success: boolean;
	/** Extra message */
	message?: string;
	/** Result data if success */
	result?: RbacApiPathResult[];
	/** Total count if success */
	count?: number;
};

/**
 * RBAC role
 */
type RbacRole = {
	/** Role UUID */
	roleUuid: string;
	/** Role name */
	roleName: string;
	/** Role type */
	roleType?: string;
	/** Role color - e.g., #66CCFFFF */
	roleColor?: string;
	/** Role description */
	roleDescription?: string;
	/** API paths this role can access */
	apiPathPermissions: string[];
	/** Creator UUID - required */
	creatorUuid: string;
	/** Last editor UUID - required */
	lastEditorUuid: string;
	/** System field - created at (ms) - required */
	createDateTime: number;
	/** System field - last edited at (ms) - required */
	editDateTime: number;
};

/**
 * Create RBAC role - request payload
 */
export type CreateRbacRoleRequestDto = {
	/** Role name */
	roleName: string;
	/** Role type */
	roleType?: string;
	/** Role color - e.g., #66CCFFFF */
	roleColor?: string;
	/** Role description */
	roleDescription?: string;
};

/**
 * Create RBAC role - response
 */
export type CreateRbacRoleResponseDto = {
	/** Whether request succeeded */
	success: boolean;
	/** Extra message */
	message?: string;
	/** Created data if success */
	result?: RbacRole;
};

/**
 * Delete RBAC role - request payload
 */
export type DeleteRbacRoleRequestDto = {
	/** Role name */
	roleName: string;
};

/**
 * Delete RBAC role - response
 */
export type DeleteRbacRoleResponseDto = {
	/** Whether request succeeded */
	success: boolean;
	/** Extra message */
	message?: string;
};

/**
 * Get RBAC roles - request payload
 */
export type GetRbacRoleRequestDto = {
	/** Search */
	search: {
		/** Role name */
		roleName?: string;
		/** Role type */
		roleType?: string;
		/** Role color - e.g., #66CCFFFF */
		roleColor?: string;
		/** Role description */
		roleDescription?: string;
	};
	/** Pagination */
	pagination: {
		/** Page number (1-based) */
		page: number;
		/** Page size */
		pageSize: number;
	};
};

/**
 * Get RBAC roles - response
 */
export type GetRbacRoleResponseDto = {
	/** Whether request succeeded */
	success: boolean;
	/** Extra message */
	message?: string;
	/** Result data if success */
	result?: (
		& RbacRole
		& { apiPathList: RbacApiPathResult[] }
	)[];
	/** Total count if success */
	count?: number;
};

/**
 * Update API path permissions for a role - request payload
 */
export type UpdateApiPathPermissionsForRoleRequestDto = {
	/** Role name */
	roleName: string;
	/** API paths */
	apiPathPermissions: string[];
};

/**
 * Update API path permissions for a role - response
 */
export type UpdateApiPathPermissionsForRoleResponseDto = {
	/** Whether request succeeded */
	success: boolean;
	/** Extra message */
	message?: string;
	/** Result data if success */
	result?: RbacRole;
};

/**
 * Get a user's roles by UID - request payload (admin)
 */
export type AdminGetUserRolesByUidRequestDto = {
	/** UID */
	uid: number;
};

/**
 * Get a user's roles by UID - response (admin)
 */
export type AdminGetUserRolesByUidResponseDto = {
	/** Whether request succeeded */
	success: boolean;
	/** Extra message */
	message?: string;
	/** Result data if success */
	result?: {
		/** UID */
		uid: number;
		/** UUID */
		uuid: string;
		/** Username */
		username: string;
		/** Nickname */
		userNickname: string;
		/** Avatar */
		avatar: string;
		/** Roles */
		roles: RbacRole[];
	};
};

/**
 * 管理员使用 UUID 更新用户身份
 */
export type AdminUpdateUserRoleByUUID = {
	/** 要被更新身份的用户的 UUID，不带有 UID */
	uuid: string;
	uid: never;
	/** 新的身份 */
	newRoles: string[];
};

/**
 * Update a user's roles - request payload (admin)
 */
export type AdminUpdateUserRoleRequestDto = {
	/** UID - if provided, will be used first */
	uid?: number;
	/** UUID */
	uuid?: string;
	/** roles to set */
	newRoles: string[];
};

/**
 * Update a user's roles - response (admin)
 */
export type AdminUpdateUserRoleResponseDto = {
	/** Whether request succeeded */
	success: boolean;
	/** Extra message */
	message?: string;
	/** Roles after update */
	roles?: string[];
};
