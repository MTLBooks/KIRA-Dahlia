<script setup lang="tsx">
type UserList = AdminGetUserInfoResponseDto["result"];
const message = useMessage();

const isShowClearUserInfoModal = ref(false);
const isShowEditUserInfoModal = ref(false);
const isShowBanUserModal = ref(false);

const isClearingUserInfo = ref(false);
const isEditingUserInfo = ref(false);
const isBanUser = ref(false);

const currentClearingUserInfo = ref("");
const userInputClearingUserInfo = ref("");
const userInputBanUserInfo = ref("");
const searchUserUid = ref<number | null>(null);
const currentClearingUserInfoByUid = ref(0);
const currentSortKey = ref<string | null>("uid");
const currentSortOrder = ref<"ascend" | "descend" | false>("ascend");
const currentBanUserInfo = ref("");
const defaultEditUserInfoData = {
	uid: -1,
	UUID: "",
	email: "",
	userNickname: "",
	username: "",
	signature: "",
	gender: "",
	userBirthday: -1,
	userCreateDateTime: -1,
	isUpdatedAfterReview: false,
};
const editUserInfoData = reactive({ ...defaultEditUserInfoData });

const options = [
	{
		label: "Edit",
		key: "editProfile",
		icon: () => <Icon name="edit" />,
	},
	{
		label: () => <span class="text-red-500">Block</span>,
		key: "ban",
		icon: () => <Icon name="block" />,
	}];

const handleSelect = (key: string, row: NonNullable<UserList>[number]) => {
	switch (key) {
		case "editProfile":
			refreshEditUserInfo(row);
			break;
		case "ban":
			openBanUserModal(row.UUID ?? "");
			break;

		default:
			break;
	}
};

const columns = computed<DataTableColumns<NonNullable<UserList>[number]>>(() => [
	{
		title: "UID",
		key: "uid",
		sorter: "default",
		sortOrder: currentSortKey.value === "uid" ? currentSortOrder.value : false,
	},
	{
		title: "UUID",
		key: "UUID",
	},
	{
		title: "Nickname",
		key: "userNickname",
		sorter: "default",
		sortOrder: currentSortKey.value === "userNickname" ? currentSortOrder.value : false,
	},
	{
		title: "Username",
		key: "username",
	},
	{
		title: "Email",
		key: "email",
	},
	{
		title: "Roles",
		key: "roles",
		render(row) {
			if (!row.roles?.length) return h(NTag, { style: { marginRight: "6px" }, type: "info", bordered: false }, { default: () => "user" });
			const roles = row.roles.map(roleKey => {
				return h(NTag, { style: { marginRight: "6px" }, type: "info", bordered: false }, { default: () => roleKey });
			});
			return roles;
		},
	},
	{
		title: "Registered At",
		key: "userCreateDateTime",
		sorter: "default",
		sortOrder: currentSortKey.value === "userCreateDateTime" ? currentSortOrder.value : false,
		render(row) {
			if (row.userCreateDateTime === undefined) return h(NText, { depth: 3 }, () => "Not recorded");
			const result = formatDateTime(row.userCreateDateTime);
			if (!result) return h(NText, { depth: 3 }, () => "Not recorded");
			return h("div", { class: "time-wrapper" }, [h("div", result.formatted),
			]);
		}
	},
	{
		title: "Actions",
		key: "actions",
		render: row => (
			<NSpace>
				<NDropdown options={options} trigger="click" placement="bottom-end" onSelect={(key: string) => handleSelect(key, row)}>
					<NButton strong secondary size="small" class="mie-2">{{ icon: <Icon name="moreHoriz" /> }}</NButton>
				</NDropdown>
				<NButton type="error" strong secondary size="small" class="mie-2" onClick={() => openClearUserInfoModal(row.UUID ?? "", row.uid ?? 0)}>{{ icon: <Icon name="delete" /> }}</NButton>
			</NSpace>
		),
	},
]);

const userList = ref<UserList>([]);
const userListCount = ref(0);
const pagination = reactive({
	page: 1,
	pageSize: 50,
	showSizePicker: true,
	pageSizes: [5, 10, 20, 50, 100, 200],
	onChange: async (page: number) => {
		pagination.page = page;
		await getUserInfo();
	},
	onUpdatePageSize: async (pageSize: number) => {
		pagination.pageSize = pageSize;
		pagination.page = 1;
		await getUserInfo();
	},
});
const userListPageCount = computed(() => getPageCountByDataCount(userListCount.value, pagination.pageSize));

/**
 * Get user list
 */
async function getUserInfo() {
	let apiSortBy: string | undefined = undefined;
	let apiSortOrder: "ascend" | "descend" | undefined = undefined;
	if (currentSortKey.value && currentSortOrder.value) {
		switch (currentSortKey.value) {
			case "uid":
				apiSortBy = "uid";
				break;
			case "userNickname":
				apiSortBy = "userNickname";
				break;
			case "userCreateDateTime":
				apiSortBy = "createDateTime";
				break;
			default:
				apiSortBy = "uid";
				break;
		}
		apiSortOrder = currentSortOrder.value;
	} else {
		apiSortBy = undefined;
		apiSortOrder = undefined;
	}

	const getUserListRequest: AdminGetUserInfoRequestDto = {
		isOnlyShowUserInfoUpdatedAfterReview: false,
		uid: searchUserUid.value ?? -1,
		sortBy: apiSortBy ?? "uid",
		sortOrder: apiSortOrder ?? "ascend",
		pagination: {
			page: pagination.page,
			pageSize: pagination.pageSize,
		},
	};

	try {
		const getUserInfoResult = await adminGetUserInfo(getUserListRequest);
		if (getUserInfoResult.success) {
			userList.value = getUserInfoResult.result;
			userListCount.value = getUserInfoResult.totalCount ?? 0;
		} else
			console.error("ERROR", "Failed to get user list.");
	} catch (error) {
		console.error("ERROR", "Error while requesting user list:", error);
	}
}

/**
 * Handle sorter change
 * @param options sorter options
 */
async function handleSorterChange(options: { columnKey: string | number | null; sorter: string; order: "ascend" | "descend" | false }) {
	currentSortKey.value = options.columnKey as string | null;
	currentSortOrder.value = options.order;
	pagination.page = 1;
	await getUserInfo();
}

/**
 * Block user
 */
async function banUser() {
	if (userInputBanUserInfo.value === "") return;
	if (userInputBanUserInfo.value !== currentBanUserInfo.value) return;
	isBanUser.value = true;
	const banUserRequest: AdminUpdateUserRoleRequestDto = {
		uuid: currentBanUserInfo.value,
		uid: undefined as never,
		newRoles: ["blocked"],
	};
	const banUserResult = await adminUpdateUserRoleController(banUserRequest);
	if (banUserResult.success) {
		closeBanUserModal();
		message.success("User blocked successfully");
		await getUserInfo();
	} else
		message.error("Failed to block user");
	isBanUser.value = false;
}

/**
 * Clear user info
 */
async function clearUserInfo() {
	if (currentClearingUserInfo.value === "") return;
	if (userInputClearingUserInfo.value !== currentClearingUserInfo.value) return;
	isClearingUserInfo.value = true;
	const clearUserInfoRequest: AdminClearUserInfoRequestDto = {
		uid: currentClearingUserInfoByUid.value,
	};
	const clearUserInfoResult = await adminClearUserInfo(clearUserInfoRequest);
	if (clearUserInfoResult.success) {
		closeClearUserInfoModal();
		message.success("Cleared user info successfully");
		await getUserInfo();
	} else
		message.error("Failed to clear user info");
	isClearingUserInfo.value = false;
}

/**
 * Edit user info
 */
async function editUserInfo() {
	if (editUserInfoData.userNickname === "" || editUserInfoData.username === "") {
		message.error("Nickname and Username cannot be empty");
		isEditingUserInfo.value = false;
	}
	isEditingUserInfo.value = true;
	const editUserInfoRequest: AdminEditUserInfoRequestDto = {
		uid: editUserInfoData.uid,
		userInfo: {
			userNickname: editUserInfoData.userNickname,
			username: editUserInfoData.username,
			signature: editUserInfoData.signature ?? "",
			userBirthday: editUserInfoData.userBirthday ?? -1,
			gender: editUserInfoData.gender,
			isUpdatedAfterReview: editUserInfoData.isUpdatedAfterReview,
		},
	};
	const editUserInfoResult = await adminEditUserInfo(editUserInfoRequest);
	if (editUserInfoResult.success) {
		message.success("Updated user info successfully");
		closeEditUserInfoModal();
		await getUserInfo();
	} else {
		message.error("Failed to update user info");
		isEditingUserInfo.value = false;
	}
}

/**
 * Refresh edit user info modal
 */
function refreshEditUserInfo(row: NonNullable<UserList>[number]) {
	if (!row) return;
	Object.assign(editUserInfoData, {
		uid: row.uid,
		UUID: row.UUID,
		email: row.email,
		userNickname: row.userNickname,
		username: row.username,
		signature: row.signature,
		userBirthday: row.userBirthday,
		gender: row.gender,
		isUpdatedAfterReview: row.isUpdatedAfterReview,
	});
	isShowEditUserInfoModal.value = true;
}

/**
 * Open clear user info modal and set state
 * @param clearUUID UUID to clear
 */
function openClearUserInfoModal(clearUUID: string, clearUid: number) {
	currentClearingUserInfo.value = clearUUID;
	currentClearingUserInfoByUid.value = clearUid;
	isShowClearUserInfoModal.value = true;
}

/**
 * Close clear user info modal and reset state
 */
function closeClearUserInfoModal() {
	isShowClearUserInfoModal.value = false;
	currentClearingUserInfo.value = "";
}

/**
 * Open block user modal and set state
 * @param banUUID UUID to block
 */
function openBanUserModal(banUUID: string) {
	currentBanUserInfo.value = banUUID;
	isShowBanUserModal.value = true;
}

/**
 * Close block user modal and reset state
 */
function closeBanUserModal() {
	isShowBanUserModal.value = false;
	currentBanUserInfo.value = "";
}

/**
 * Close edit user info modal and reset state
 */
function closeEditUserInfoModal() {
	isShowEditUserInfoModal.value = false;
	isEditingUserInfo.value = false;
}

onMounted(() => { getUserInfo(); });
</script>

<template>
	<div class="container">
		<PageHeading>KIRAKIRA User Management</PageHeading>
		<NSpace align="center" justify="space-between">
			<NCollapse class="mlb-4">
				<NCollapseItem title="Instructions">
					<NP>Sorting options</NP>
					<NUl>
						<NLi>Click UID, Nickname, Registered At to sort</NLi>
						<NLi>Click again to toggle Ascending/Descending</NLi>
						<NLi>Default sorting is UID ascending</NLi>
					</NUl>
					<NP>Operations</NP>
					<NUl>
						<NLi>Click Edit to edit user info (enter user's UUID to confirm)</NLi>
						<NLi>Click Block to block a user (enter user's UUID to confirm)</NLi>
						<NLi>Click Delete to delete user info (enter user's UUID to confirm)</NLi>
					</NUl>
					<NP>You can edit user info on the edit page.<br />Consider compliance before modifying.</NP>
				</NCollapseItem>
			</NCollapse>
			<NFlex align="center" justify="right">
				<NInputNumber v-model:value="searchUserUid" placeholder="Target user UID" :showButton="false" />
				<NButton @click="getUserInfo()"><template #icon>
						<Icon name="search" />
					</template>Search</NButton>
			</NFlex>
		</NSpace>

		<NDataTable :columns="columns" :data="userList" :pagination="false" :bordered="false" :rowKey="row => row.uid"
			:remote="true" @update:sorter="handleSorterChange" />
		<NFlex justify="end" class="mbs-4">
			<NPagination :displayOrder="['quick-jumper', 'pages', 'size-picker']" :pageCount="userListPageCount"
				:page="pagination.page" :pageSize="pagination.pageSize" :pageSizes="pagination.pageSizes"
				:onUpdate:page="pagination.onChange" :onUpdate:pageSize="pagination.onUpdatePageSize" showQuickJumper
				showSizePicker />
		</NFlex>

		<NModal v-model:show="isShowEditUserInfoModal" :maskClosable="false" preset="dialog" title="User Info"
			:style="{ width: '800px' }">
			<br />
			<NAlert type="warning" title="Warning">
				<div>Proceed with caution when modifying!</div>
			</NAlert>
			<br />
			<NForm labelPlacement="left" labelWidth="100px">
				<NRow :gutter="24">

					<NCol :span="10">
						<NFormItem label="UID">
							<NInput :value="String(editUserInfoData.uid)" disabled />
						</NFormItem>
						<NFormItem label="Email">
							<NInput :value="editUserInfoData.email" disabled />
						</NFormItem>
						<NFormItem label="Nickname">
							<NInput v-model:value="editUserInfoData.userNickname" />
						</NFormItem>
						<NFormItem label="Birthday">
							<NDatePicker v-model:value="editUserInfoData.userBirthday" type="date"
								style="width: 100%" />
						</NFormItem>

					</NCol>

					<NCol :span="14">
						<NFormItem label="UUID">
							<NInput :value="editUserInfoData.UUID" disabled />
						</NFormItem>
						<NFormItem label="Username">
							<NInput v-model:value="editUserInfoData.username" />
						</NFormItem>
						<NFormItem label="Bio">
							<NInput v-model:value="editUserInfoData.signature" type="textarea"
								:autosize="{ minRows: 3, maxRows: 5 }" />
						</NFormItem>
					</NCol>
				</NRow>

				<NRow :gutter="24">
					<NCol :span="12">
						<NFormItem label="Gender">
							<NRadioGroup v-model:value="editUserInfoData.gender">
								<NSpace>
									<NRadio value="male">Male</NRadio>
									<NRadio value="female">Female</NRadio>
								</NSpace>
							</NRadioGroup>
						</NFormItem>
					</NCol>
					<NCol :span="12">
						<NFormItem label="Pending Review">
							<NSwitch v-model:value="editUserInfoData.isUpdatedAfterReview" />
						</NFormItem>
					</NCol>
				</NRow>
			</NForm>

			<template #action>
				<NButton @click="closeEditUserInfoModal">Discard</NButton>
				<NPopconfirm @negativeClick="message.info(`$(editUserInfoData.userBirthday)`)"
					@positiveClick="editUserInfo()">
					<template #trigger>
						<NButton
							:disabled="editUserInfoData.email === '' || editUserInfoData.userNickname === '' || editUserInfoData.username === ''"
							:loading="isEditingUserInfo" type="warning" :secondary="true">
							Save
						</NButton>
					</template>
					Are you sure to save?
				</NPopconfirm>
			</template>
		</NModal>

		<NModal v-model:show="isShowClearUserInfoModal" :maskClosable="false" preset="dialog"
			:title="`Confirm delete this user's info?`">
			<br />
			<NFormItem :label="`Enter user's UUID to confirm delete: ${currentClearingUserInfo}`">
				<NInput v-model:value="userInputClearingUserInfo" placeholder="User UUID" />
			</NFormItem>

			<template #action>
				<NButton @click="closeClearUserInfoModal">Cancel</NButton>
				<NButton :disabled="currentClearingUserInfo !== userInputClearingUserInfo" :loading="isClearingUserInfo"
					type="warning" :secondary="true" @click="clearUserInfo()">Confirm Delete</NButton>
			</template>
		</NModal>

		<NModal v-model:show="isShowBanUserModal" :maskClosable="false" preset="dialog"
			:title="`Confirm block this user?`">
			<br />
			<NFormItem :label="`Enter user's UUID to confirm block: ${currentBanUserInfo}`">
				<NInput v-model:value="userInputBanUserInfo" placeholder="User UUID" />
			</NFormItem>

			<template #action>
				<NButton @click="closeBanUserModal">Cancel</NButton>
				<NButton :disabled="currentBanUserInfo !== userInputBanUserInfo" :loading="isBanUser" type="warning"
					:secondary="true" @click="banUser()">Confirm Block</NButton>
			</template>
		</NModal>

	</div>
</template>
