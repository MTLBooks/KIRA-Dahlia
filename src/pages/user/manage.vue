<script setup lang="ts">
	type UserList = AdminGetUserInfoResponseDto["result"];
	//	const isOnlyShowUserInfoUpdatedAfterReview = ref(false);

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
			console.error("ERROR", "获取用户列表失败。");
	}

	onMounted(() => { getUserInfo(); });
</script>

<template>
	<div class="container">
		<PageHeading>KIRAKIRA 用户管理</PageHeading>
		<NSpace justify="space-between">
			<NCollapse class="mlb-4">
				<NCollapseItem title="使用说明">
					<NP>TODO</NP>
					<NUl>
						<NLi>And TODO</NLi>
						<NLi>...</NLi>
					</NUl>
				</NCollapseItem>
			</NCollapse>
			<NFlex justify="right">
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

	</div>
</template>
