<script setup lang="tsx">
type UserList = AdminGetUserInfoResponseDto["result"];
const message = useMessage();

const isOpenUserInfoModal = ref(false);
const isPassUser = ref(false);
const isDeleteUser = ref(false);
const searchUserUid = ref<number | null>(null);
const currentSortKey = ref<string | null>("uid");
const currentSortOrder = ref<"ascend" | "descend" | undefined>("ascend");
const defaultUserInfoData = {
	uid: -1,
	avatar: "",
	userBannerImage: "",
	userNickname: "",
	username: "",
	gender: "",
	signature: "",
	label: [],
};
const userInfoData = reactive({ ...defaultUserInfoData });
const genderMap: Record<string, string> = {
	male: "Male",
	female: "Female",
	unknown: "Unknown",
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
			<NFlex>
				<NButton strong secondary size="small" type="info" onClick={() => openUserInfoModal(row)}>{{ icon: () => <Icon name="description" /> }}</NButton>
				<NPopconfirm onPositiveClick={() => clearUserInfo(row.uid)}>
					{{
						trigger: <NButton type="error" strong secondary size="small">{{ icon: <Icon name="delete" /> }}</NButton>,
						default: "Are you sure to reject this user's changes?",
					}}
				</NPopconfirm>
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
	let apiSortBy: string | undefined;
	let apiSortOrder: "ascend" | "descend" | undefined;
	if (currentSortKey.value && currentSortOrder.value)
		apiSortBy = ["uid", "userNickname"].includes(currentSortKey.value) ? currentSortKey.value :
			currentSortKey.value === "userCreateDateTime" ? "createDateTime" : "uid";
	else
		apiSortBy = apiSortOrder = undefined;

	const getUserListRequest: AdminGetUserInfoRequestDto = {
		isOnlyShowUserInfoUpdatedAfterReview: true,
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
async function handleSorterChange(options: { columnKey: string | number | null; sorter: string; order: "ascend" | "descend" | undefined }) {
	currentSortKey.value = options.columnKey as string | null;
	currentSortOrder.value = options.order;
	pagination.page = 1;
	await getUserInfo();
}

/**
 * Clear user info
 */
async function clearUserInfo(uid: number) {
	isDeleteUser.value = true;
	const clearUserInfoRequest: AdminClearUserInfoRequestDto = {
		uid,
	};
	const clearUserInfoResult = await adminClearUserInfo(clearUserInfoRequest);
	if (clearUserInfoResult.success) {
		message.success("Cleared user info successfully");
		isOpenUserInfoModal.value = false;
		await getUserInfo();
	} else
		message.error("Failed to clear user info");
	isDeleteUser.value = false;
}

/**
 * Hydrate modal data
 */
function handleUserInfo(userData: NonNullable<UserList>[number]) {
	Object.assign(userInfoData, {
		uid: userData.uid,
		avatar: userData.avatar,
		userBannerImage: userData.userBannerImage,
		username: userData.username,
		userNickname: userData.userNickname,
		signature: userData.signature,
		gender: userData.gender,
		label: userData.label,
	});
}

/**
 * Approve user's profile changes
 */
async function passUserInfo() {
	isPassUser.value = true;
	const passUserInfoRequest: AdminEditUserInfoRequestDto = {
		uid: userInfoData.uid,
		userInfo: {
			isUpdatedAfterReview: false,
		},
	};
	const passUserInfoResult = await adminEditUserInfo(passUserInfoRequest);
	if (passUserInfoResult.success) {
		message.success("Approved user info successfully");
		isOpenUserInfoModal.value = false;
		await getUserInfo();
	} else
		message.error("Failed to approve user info");
	isPassUser.value = false;
}

/**
 * Open modal and set data
 */
function openUserInfoModal(userData: NonNullable<UserList>[number]) {
	isOpenUserInfoModal.value = true;
	handleUserInfo(userData);
}

onMounted(() => { getUserInfo(); });
</script>

<template>
	<div class="container">
		<PageHeading>KIRAKIRA Recently Changed Users</PageHeading>
		<NSpace align="center" justify="space-between">
			<NCollapse class="mlb-4">
				<NCollapseItem title="Instructions">
					<NP>Sorting options</NP>
					<NUl>
						<NLi>Click UID, Nickname, Registered At to sort</NLi>
						<NLi>Click again to toggle Ascending/Descending</NLi>
						<NLi>Default sorting is UID ascending</NLi>
					</NUl>
					<NP>Click Approve to accept user info changes (enter user's UUID to confirm).<br />After approval,
						user role returns to regular.</NP>
					<NP>Click Clear to remove user info (enter user's UID to confirm).<br />After clearing, the user
						info will be removed.</NP>
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
		<div class="flex justify-end mt-4">
			<NPagination :displayOrder="['quick-jumper', 'pages', 'size-picker']" :pageCount="userListPageCount"
				:page="pagination.page" :pageSize="pagination.pageSize" :pageSizes="pagination.pageSizes"
				:onUpdate:page="pagination.onChange" :onUpdate:pageSize="pagination.onUpdatePageSize" showQuickJumper
				showSizePicker />
		</div>

		<NModal v-model:show="isOpenUserInfoModal" :maskClosable="false" preset="dialog" title="User Info"
			:style="{ width: '700px' }">
			<br />
			<NImage width="100%" height="120" :src="userInfoData.userBannerImage || '/assets/default-bannar.png'"
				class="object-cover rounded-md" />

			<div class="flex items-center mt-4">
				<NAvatar round :size="50" :src="userInfoData.avatar || '/assets/avatar.svg#person'" />
				<div class="ml-3 flex-1">
					<div class="font-bold">
						{{ userInfoData.userNickname }}
						<span class="text-gray-500">@{{ userInfoData.username }}</span>
					</div>
				</div>
				<div class="whitespace-nowrap">
					Gender: {{ genderMap[userInfoData.gender] || 'Unknown' }}
				</div>
			</div>

			<div class="mt-4">
				<div class="font-bold mb-2">User Bio</div>
				<div class="min-h-[80px] bg-gray-100 p-2 rounded-md">
					{{ userInfoData.signature || 'No bio yet' }}
				</div>
			</div>

			<div class="mt-4">
				<div class="font-bold mb-2">User Tags</div>
				<div class="flex flex-wrap gap-2">
					<NTag v-for="(tag, index) in (userInfoData.label || [])" :key="index" type="default" size="small">
						{{ tag }}
					</NTag>
					<span v-if="(userInfoData.label || []).length === 0">
						<NTag size="small" type="info">No tags</NTag>
					</span>
				</div>
			</div>

			<div style="margin-top: 24px; text-align: right">
				<NPopconfirm @positiveClick="clearUserInfo(userInfoData.uid)">
					<template #trigger>
						<NButton type="error" :loading="isDeleteUser" style="margin-right: 8px">
							<Icon name="delete" />
						</NButton>
					</template>
					Are you sure to reject this user's changes?
				</NPopconfirm>
				<NButton type="success" :loading="isPassUser" @click="passUserInfo()">
					<Icon name="check" />
				</NButton>
			</div>
		</NModal>
	</div>
</template>
