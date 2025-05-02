<script setup lang="tsx">
	type UserList = AdminGetUserInfoResponseDto["result"];
	const message = useMessage();

	const isShowClearUserInfoModal = ref(false);
	const isClearingUserInfo = ref(false);
	const currentClearingUserInfo = ref("");
	const userInputClearingUserInfo = ref("");
	const currentClearingUserInfoByUid = ref(0);

	const options = [
		{
			label: "编辑",
			key: "editProfile",
			icon: () => <Icon name="edit" />,
		},
		{
			label: "封禁",
			key: "ban",
			icon: () => <Icon name="block" />,
		},
		{
			label: "用户资料",
			key: "profile",
			icon: () => <Icon name="badge" />,
		},
	];
	const handleSelect = (key: string) => {
		switch (key) {
			case "editProfile":
				message.info("编辑用户资料");
				break;
			case "ban":
				message.info("封禁用户");
				break;
			case "profile":
				message.info("查看用户资料");
				break;
			default:
				break;
		}
	};

	const columns: DataTableColumns<NonNullable<UserList>[number]> = [
		{
			title: "UID",
			key: "uid",
		},
		{
			title: "UUID",
			key: "UUID",
		},
		{
			title: "昵称",
			key: "userNickname",
		},
		{
			title: "用户名",
			key: "username",
		},
		{
			title: "角色",
			key: "roles",
			render(row) {
				if (!row.roles?.length) return h(NTag, { style: { marginRight: "6px" }, type: "info", bordered: false }, "user"); // 无角色时显示 user
				const roles = row.roles.map(roleKey => {
					return h(NTag, { style: { marginRight: "6px" }, type: "info", bordered: false }, { default: () => roleKey });
				});
				return roles;
			} },
		{
			title: "注册时间",
			key: "userCreateDateTime",
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
				<NSpace>
					<NDropdown options={options} trigger="click" placement="bottom-end" onSelect={handleSelect}>
						<NButton strong secondary size="small" class="mie-2">更多</NButton>
					</NDropdown>
					<NButton type="error" strong secondary size="small" class="mie-2" onClick={() => openClearUserInfoModal(row.UUID ?? "", row.uid ?? 0)}>清空</NButton>
				</NSpace>
			),
		},
	];

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
		const getUserListRequest: AdminGetUserInfoRequestDto = {
			isOnlyShowUserInfoUpdatedAfterReview: false,
			pagination: {
				page: pagination.page,
				pageSize: pagination.pageSize,
			},
		};
		const getUserInfoResult = await adminGetUserInfo(getUserListRequest);
		if (getUserInfoResult.success) {
			userList.value = getUserInfoResult.result;
			userListCount.value = getUserInfoResult.totalCount ?? 0;
		} else
			message.error("获取用户列表失败。");
	}

	/**
	 * 清空用户信息
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
			message.success("清除用户信息成功。");
			await getUserInfo();
		} else
			message.error("清除用户信息失败。");
		isClearingUserInfo.value = false;
	}

	/**
	 * 更新正在删除的用户 UUID，并打开删除用户信息的表单
	 * @param deleteUUID 正在删除的用户信息
	 */
	function openClearUserInfoModal(clearUUID: string, clearUid: number) {
		currentClearingUserInfo.value = clearUUID;
		currentClearingUserInfoByUid.value = clearUid;
		isShowClearUserInfoModal.value = true;
	}

	/**
	 * 打开删除用户信息的表单，并清除正在删除的用户信息
	 */
	function closeClearUserInfoModal() {
		isShowClearUserInfoModal.value = false;
		currentClearingUserInfo.value = "";
	}

	onMounted(() => { getUserInfo(); });
</script>

<template>
	<div class="container">
		<PageHeading>KIRAKIRA 用户管理</PageHeading>
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
				<NInputNumber placeholder="要查询的用户的 UID" :showButton="false" />
				<NButton><template #icon><Icon name="search" /></template>查询</NButton>
			</NFlex>
		</NSpace>
		<NDataTable
			:columns="columns"
			:data="userList"
			:pagination="false"
			:bordered="false"
			:rowKey="row => row.uid"
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
			v-model:show="isShowClearUserInfoModal"
			:maskClosable="false"
			preset="dialog"
			:title="`确认要删除该用户信息吗？`"
		>
			<NFormItem :label="`请输入用户的UUID来确定删除 ${currentClearingUserInfo}`">
				<NInput v-model:value="userInputClearingUserInfo" placeholder="用户 UUID" />
			</NFormItem>

			<template #action>
				<NButton @click="closeClearUserInfoModal">算了</NButton>
				<NButton :disabled="currentClearingUserInfo !== userInputClearingUserInfo" :loading="isClearingUserInfo" type="warning" :secondary="true" @click="clearUserInfo()">确认删除</NButton>
			</template>
		</NModal>

	</div>
</template>
