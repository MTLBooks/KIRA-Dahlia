<script setup lang="ts">
const dialog = useDialog();

const isEnableEditUserRole = ref(false);
const isShowSubmitUserRolesModal = ref(false);
const inputUid = ref<number>();
const isUpdatingUserRole = ref(false);

type RbacRole = GetRbacRoleResponseDto["result"];
const rbacRole = ref<RbacRole>([]);
const rbacRoleOption = computed(() => rbacRole.value?.map(role => {
	return {
		label: role.roleName,
		value: role.roleName,
	};
}));

const userRolesFormModel = ref<{
	uid: number | undefined;
	uuid: string | undefined;
	username: string | undefined;
	userNickname: string | undefined;
	userRoles: string[] | undefined;
}>({
	uid: undefined,
	uuid: undefined,
	username: undefined,
	userNickname: undefined,
	userRoles: undefined,
});

/**
 * 通过 UID 获取一个用户的身份
 */
async function adminFetchUserRole() {
	if (inputUid.value === undefined || inputUid.value === null) return;

	const adminGetUserRolesByUidRequest: AdminGetUserRolesByUidRequestDto = {
		uid: inputUid.value ?? 0,
	};
	const userRolesResult = await adminGetUserRolesController(adminGetUserRolesByUidRequest);
	if (userRolesResult.success)
		userRolesFormModel.value = {
			uid: userRolesResult.result?.uid,
			uuid: userRolesResult.result?.uuid,
			username: userRolesResult.result?.username,
			userNickname: userRolesResult.result?.userNickname,
			userRoles: userRolesResult.result?.roles.map(role => role.roleName),
		};
}

/**
 * 获取 RBAC 身份
 */
async function fetchRbacRole() {
	const getRbacRoleRequest: GetRbacRoleRequestDto = {
		search: {},
		pagination: {
			page: 1,
			pageSize: 1000,
		},
	};
	const rbacRoleResult = await getRbacRoleController(getRbacRoleRequest);
	if (rbacRoleResult.success)
		rbacRole.value = rbacRoleResult.result;
	else
		console.error("ERROR", "Failed to fetch RBAC roles.");
}

/**
 * 管理员更新用户的身份
 */
async function adminUpdateUserRoles() {
	if (!userRolesFormModel.value.uuid || !userRolesFormModel.value.userRoles) return;

	isUpdatingUserRole.value = true;

	const adminUpdateUserRoleRequest: AdminUpdateUserRoleRequestDto = {
		uuid: userRolesFormModel.value.uuid,
		uid: undefined as never,
		newRoles: userRolesFormModel.value.userRoles,
	};

	const adminUpdateUserRolesResult = await adminUpdateUserRoleController(adminUpdateUserRoleRequest);

	if (adminUpdateUserRolesResult.success) {
		await adminFetchUserRole();
		isEnableEditUserRole.value = false;
		isShowSubmitUserRolesModal.value = false;
	} else
		dialog.error({
			title: "管理员更新用户的身份失败",
			content: adminUpdateUserRolesResult.message,
			positiveText: "知道了",
		});

	isUpdatingUserRole.value = false;
}

onMounted(fetchRbacRole);
</script>

<template>
	<div class="container">
		<PageHeading>KIRAKIRA RBAC User Roles Management</PageHeading>
		<NCollapse class="mlb-4">
			<NCollapseItem title="Instructions">
				<NP>The minimum unit of KIRAKIRA RBAC permission control is the API path.</NP>
				<NUl>
					<NLi>One user can have multiple roles</NLi>
					<NLi>One role can be assigned to multiple users</NLi>
					<NLi>One role can have access to multiple API paths</NLi>
					<NLi>One API can belong to multiple roles</NLi>
				</NUl>
				<NP>
					You can query a user's roles, or bind/unbind roles for the user.<br />
					The following special role names have special effects; use caution when binding/unbinding:
				</NP>
				<NUl>
					<NLi><b>root</b> - RBAC admin</NLi>
					<NLi><b>administrator</b> - content admin</NLi>
					<NLi><b>developer</b> - access to certain dev resources</NLi>
					<NLi><b>user</b> - regular user</NLi>
					<NLi><b>blocked</b> - banned user</NLi>
				</NUl>
				<NP>Note: the 'blocked' role is mutually exclusive with other roles</NP>
			</NCollapseItem>
		</NCollapse>
		<NFlex justify="center">
			<NInputNumber v-model:value="inputUid" placeholder="UID of user to query" :showButton="false" />
			<NButton @click="adminFetchUserRole"><template #icon>
					<Icon name="search" />
				</template>Search</NButton>
		</NFlex>
		<NDivider />
		<NForm ref="formRef" :model="userRolesFormModel" labelPlacement="left" :labelWidth="160" class="max-is-[640px]">
			<NFormItem label="User UID" path="uid">
				<NInputNumber v-model:value="userRolesFormModel.uid" placeholder="Shown after querying user"
					:showButton="false" :disabled="true" />
			</NFormItem>
			<NFormItem label="User UUID" path="uuid">
				<NInput v-model:value="userRolesFormModel.uuid" placeholder="Shown after querying user"
					:disabled="true" />
			</NFormItem>
			<NFormItem label="Username" path="username">
				<NInput v-model:value="userRolesFormModel.username" placeholder="Shown after querying user"
					:disabled="true" />
			</NFormItem>
			<NFormItem label="Nickname" path="userNickname">
				<NInput v-model:value="userRolesFormModel.userNickname" placeholder="Shown after querying user"
					:disabled="true" />
			</NFormItem>
			<NFormItem label="Enable editing">
				<NSwitch v-model:value="isEnableEditUserRole" />
			</NFormItem>
			<NFormItem label="User roles" path="userRoles">
				<NTransfer :disabled="!isEnableEditUserRole || !userRolesFormModel.uuid"
					v-model:value="userRolesFormModel.userRoles" :options="rbacRoleOption" sourceFilterable
					targetFilterable />
			</NFormItem>
			<!-- TODO: I want a label placeholder without showing label text; using label=" " seems inelegant. -->
			<NFormItem label=" ">
				<NButton :disabled="!isEnableEditUserRole || !userRolesFormModel.uuid"
					@click="isShowSubmitUserRolesModal = true">
					Update user roles
				</NButton>
			</NFormItem>
		</NForm>

		<NModal v-model:show="isShowSubmitUserRolesModal" :maskClosable="false" preset="dialog"
			title="Confirm update user roles?" negativeText="Cancel" @positiveClick="adminUpdateUserRoles">
			<NForm>
				<NFormItem label="User UID">
					<NInputNumber v-model:value="userRolesFormModel.uid" :showButton="false" :disabled="true"
						class="is-full" />
				</NFormItem>
				<NFormItem label="User UUID">
					<NInput v-model:value="userRolesFormModel.uuid" :showButton="false" :disabled="true" />
				</NFormItem>
				<NFormItem label="User roles will be updated to:">
					<NFlex>
						<NTag v-for="role in userRolesFormModel.userRoles" :key="role">{{ role }}</NTag>
					</NFlex>
				</NFormItem>
			</NForm>
			<template #action>
				<NButton @click="isShowSubmitUserRolesModal = false">Cancel</NButton>
				<NButton :loading="isUpdatingUserRole" type="warning" :secondary="true" @click="adminUpdateUserRoles">
					Confirm</NButton>
			</template>
		</NModal>
	</div>
</template>
