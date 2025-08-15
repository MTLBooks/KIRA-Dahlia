<script setup lang="tsx">
type UserList = GetBlockedUserResponseDto["result"];
const message = useMessage();

const isShowUnbanUserModal = ref(false);
const isUnbanUser = ref(false);
const currentUnbanUserInfo = ref<string>("");
const userInputUnbanUserInfo = ref<string>("");

const searchUserUid = ref<number | null>(null);
const currentSortKey = ref<string | null>("uid");
const currentSortOrder = ref<"ascend" | "descend" | undefined>("ascend");

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
			<NFlex>
				<NButton strong secondary size="small" type="success" onClick={() => openUnbanUserModal(row.UUID)}>{{ icon: () => <Icon name="check" /> }}</NButton>
			</NFlex>
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
	const GetBlockedUserRequest: GetBlockedUserRequestDto = {
		uid: searchUserUid.value ?? -1,
		sortBy: apiSortBy ?? "uid",
		sortOrder: apiSortOrder ?? "ascend",
		pagination: {
			page: pagination.page,
			pageSize: pagination.pageSize,
		},
	};
	try {
		const getUserInfoResult = await adminGetBlockedUserInfo(GetBlockedUserRequest);
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
async function handleSorterChange(options: { columnKey: string | number | null; sorter: string; order: "ascend" | "descend" | undefined }) {
	currentSortKey.value = options.columnKey as string | null;
	currentSortOrder.value = options.order;
	pagination.page = 1;
	await getUserInfo();
}

/**
 * Unban user
 */
async function unbanUser() {
	if (userInputUnbanUserInfo.value === "") return;
	if (userInputUnbanUserInfo.value !== currentUnbanUserInfo.value) return;
	isUnbanUser.value = true;
	const unbanUserRequest: AdminUpdateUserRoleRequestDto = {
		uuid: currentUnbanUserInfo.value,
		uid: undefined as never,
		newRoles: ["user"],
	};
	const unbanUserResult = await adminUpdateUserRoleController(unbanUserRequest);
	if (unbanUserResult.success) {
		closeUnbanUserModal();
		message.success("Unban user succeeded");
		await getUserInfo();
	} else
		message.error("Unban user failed");
	isUnbanUser.value = false;
}

/**
 * Update current unbanning UUID and open modal
 * @param banUUID unbanning user's UUID
 */
function openUnbanUserModal(banUUID: string) {
	currentUnbanUserInfo.value = banUUID;
	isShowUnbanUserModal.value = true;
}

/**
 * Close modal and clear state
 */
function closeUnbanUserModal() {
	isShowUnbanUserModal.value = false;
	currentUnbanUserInfo.value = "";
}

onMounted(() => { getUserInfo(); });
</script>

<template>
	<div class="container">
		<PageHeading>KIRAKIRA Blocked Users</PageHeading>
		<NSpace align="center" justify="space-between">
			<NCollapse class="mlb-4">
				<NCollapseItem title="Instructions">
					<NP>Sorting options</NP>
					<NUl>
						<NLi>Click UID, Nickname, Registered At to sort</NLi>
						<NLi>Click again to toggle Ascending/Descending</NLi>
						<NLi>Default sorting is UID ascending</NLi>
					</NUl>
					<NP>Click Unban to unban a user. Enter the user's UUID to confirm.</NP>
					<NP>After unbanning, the user returns to regular user.</NP>
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

		<NModal v-model:show="isShowUnbanUserModal" :maskClosable="false" preset="dialog"
			:title="`Confirm unban this user?`">
			<br />
			<NFormItem :label="`Enter user's UUID to confirm unban: ${currentUnbanUserInfo}`">
				<NInput v-model:value="userInputUnbanUserInfo" placeholder="User UUID" />
			</NFormItem>

			<template #action>
				<NButton @click="closeUnbanUserModal">Cancel</NButton>
				<NButton :disabled="currentUnbanUserInfo !== userInputUnbanUserInfo" :loading="isUnbanUser"
					type="warning" :secondary="true" @click="unbanUser()">Confirm Unban</NButton>
			</template>
		</NModal>

	</div>
</template>
