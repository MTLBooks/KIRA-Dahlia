<script setup lang="tsx">
	type UserList = AdminGetUserInfoResponseDto["result"];
	const message = useMessage();

	const isOpenUserInfoModal = ref(false);
	const isPassUser = ref(false);
	const isDeleteUser = ref(false);
	const searchUserUid = ref<number | null>(null);
	const currentSortKey = ref<string | null>("uid");
	const currentSortOrder = ref<"ascend" | "descend" | false>("ascend");
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
		male: "男",
		female: "女",
		unknown: "未知",
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
			title: "昵称",
			key: "userNickname",
			sorter: "default",
			sortOrder: currentSortKey.value === "userNickname" ? currentSortOrder.value : false,
		},
		{
			title: "用户名",
			key: "username",
		},
		{
			title: "邮箱",
			key: "email",
		},
		{
			title: "角色",
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
			title: "注册时间",
			key: "userCreateDateTime",
			sorter: "default",
			sortOrder: currentSortKey.value === "userCreateDateTime" ? currentSortOrder.value : false,
			render(row) {
				if (row.userCreateDateTime === undefined) return h(NText, { depth: 3 }, () => "未记录");
				const result = formatDateTime(row.userCreateDateTime);
				if (!result) return h(NText, { depth: 3 }, () => "未记录");
				return h("div", { class: "time-wrapper" }, [h("div", result.formatted), h(NText, { depth: 3, class: "text-xs" }, () => `(${result.relative})`),
				]);
			} },
		{
			title: "操作",
			key: "actions",
			render: row => (
				<NFlex>
					<NButton strong secondary size="small" onClick={() => openUserInfoModal(row)}>{{ icon: () => <Icon name="description" /> }}</NButton>
					<NPopconfirm onPositiveClick={() => clearUserInfo(row.uid)}>
						{{
							trigger: () =>
								<NButton type="error" strong secondary size="small">{{ icon: () => <Icon name="delete" /> }}</NButton>,
							default: () => "确认驳回该用户修改信息审核吗？",
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
	 * 获取用户列表
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
				console.error("ERROR", "获取用户列表失败。");
		} catch (error) {
			console.error("ERROR", "请求用户列表时出错:", error);
		}
	}

	/**
	 * 处理排序变化
	 * @param options 排序选项
	 */
	async function handleSorterChange(options: { columnKey: string | number | null; sorter: string; order: "ascend" | "descend" | false }) {
		currentSortKey.value = options.columnKey as string | null;
		currentSortOrder.value = options.order;
		pagination.page = 1;
		await getUserInfo();
	}

	/**
	 * 清空用户信息
	 */
	async function clearUserInfo(uid: number) {
		isDeleteUser.value = true;
		const clearUserInfoRequest: AdminClearUserInfoRequestDto = {
			uid,
		};
		const clearUserInfoResult = await adminClearUserInfo(clearUserInfoRequest);
		if (clearUserInfoResult.success) {
			message.success("清除用户信息成功");
			isOpenUserInfoModal.value = false;
			await getUserInfo();
		} else
			message.error("清除用户信息失败");
		isDeleteUser.value = false;
	}

	/**
	 * 处理用户信息
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
	 * 通过用户审核
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
			message.success("通过用户信息成功");
			isOpenUserInfoModal.value = false;
			await getUserInfo();
		} else
			message.error("通过用户信息失败");
		isPassUser.value = false;
	}

	/**
	 * 设置数据并打开用户信息的模态框
	 */
	function openUserInfoModal(userData: NonNullable<UserList>[number]) {
		isOpenUserInfoModal.value = true;
		handleUserInfo(userData);
	}

	onMounted(() => { getUserInfo(); });
</script>

<template>
	<div class="container">
		<PageHeading>KIRAKIRA 最近更改用户</PageHeading>
		<NSpace align="center" justify="space-between">
			<NCollapse class="mlb-4">
				<NCollapseItem title="使用说明">
					<NP>TODO</NP>
					<NUl>
						<NLi>And TODO</NLi>
						<NLi>...</NLi>
					</NUl>
				</NCollapseItem>
			</NCollapse>
			<NFlex align="center" justify="right">
				<NInputNumber v-model:value="searchUserUid" placeholder="要查询的用户的 UID" :showButton="false" />
				<NButton @click="getUserInfo()"><template #icon><Icon name="search" /></template>查询</NButton>
			</NFlex>
		</NSpace>

		<NDataTable
			:columns="columns"
			:data="userList"
			:pagination="false"
			:bordered="false"
			:rowKey="row => row.uid"
			:remote="true"
			@update:sorter="handleSorterChange"
		/>
		<NFlex justify="end" class="mbs-4">
			<NPagination
				:displayOrder="['quick-jumper', 'pages', 'size-picker']"
				:pageCount="userListPageCount"
				:page="pagination.page"
				:pageSize="pagination.pageSize"
				:pageSizes="pagination.pageSizes"
				:onUpdate:page="pagination.onChange"
				:onUpdate:pageSize="pagination.onUpdatePageSize"
				showQuickJumper
				showSizePicker
			/>
		</NFlex>

		<NModal
			v-model:show="isOpenUserInfoModal"
			:maskClosable="false"
			preset="dialog"
			title="用户信息"
			:style="{ width: '700px' }"
		>
			<br />
			<NImage
				width="100%"
				height="120"
				:src="userInfoData.userBannerImage || 'https://kirakira.moe/_vercel/image?url=%2Fstatic%2Fimages%2Fbanner-20220717.png&w=1536&q=100'"
				style="object-fit: cover; border-radius: 6px"
			/>

			<div style="display: flex; align-items: center; margin-top: 16px">
				<NAvatar
					round
					:size="50"
					:src="userInfoData.avatar || 'https://kirakira.moe/_nuxt/icons.B7aRh8zS.svg'"
				/>
				<div style="margin-left: 12px; flex: 1">
					<div style="font-weight: bold">
						{{ userInfoData.userNickname }}
						<span style="color: #aaa">@{{ userInfoData.username }}</span>
					</div>
				</div>
				<div style="white-space: nowrap">
					性别：{{ genderMap[userInfoData.gender] || '未知' }}
				</div>
			</div>

			<div style="margin-top: 16px">
				<div style="font-weight: bold; margin-bottom: 6px;">用户简介</div>
				<div style="min-height: 80px; background-color: #f5f5f5; padding: 8px; border-radius: 6px;">
					{{ userInfoData.signature || '暂无简介' }}
				</div>
			</div>

			<div style="margin-top: 16px">
				<div style="font-weight: bold; margin-bottom: 6px;">用户标签</div>
				<div style="display: flex; flex-wrap: wrap; gap: 8px">
					<NTag
						v-for="(tag, index) in (userInfoData.label || [])" 添加空值保护
						:key="index"
						type="default"
						size="small"
					>
						{{ tag }}
					</NTag>
					<span v-if="(userInfoData.label || []).length === 0"><NTag size="small" type="info">暂无标签</NTag></span>
				</div>
			</div>

			<div style="margin-top: 24px; text-align: right">
				<NPopconfirm @positiveClick="clearUserInfo(userInfoData.uid)">
					<template #trigger>
						<NButton type="error" :loading="isDeleteUser" style="margin-right: 8px"><Icon name="delete" /></NButton>
					</template>
					确认驳回该用户修改信息审核吗？
				</NPopconfirm>
				<NButton type="success" :loading="isPassUser" @click="passUserInfo()"><Icon name="check" /></NButton>
			</div>
		</NModal>
	</div>
</template>
