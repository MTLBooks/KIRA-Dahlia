<script setup lang="tsx">
	type UserList = AdminGetUserInfoResponseDto["result"];
	const message = useMessage();

	const isShowClearUserInfoModal = ref(false);
	const isShowEditUserInfoModal = ref(false);

	const isClearingUserInfo = ref(false);
	const isEditingUserInfo = ref(false);
	const currentClearingUserInfo = ref("");
	const userInputClearingUserInfo = ref("");
	const currentClearingUserInfoByUid = ref(0);
	const currentSortKey = ref<string | null>("uid");
	const currentSortOrder = ref<"ascend" | "descend" | false>("ascend");
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
			label: "编辑",
			key: "editProfile",
			icon: () => <Icon name="edit" />,
		},
		{
			label: "封禁",
			key: "ban",
			icon: () => <Icon name="block" />,
		}];

	const handleSelect = (key: string, row: NonNullable<UserList>[number]) => {
		switch (key) {
			case "editProfile":
				refreshEditUserInfo(row);
				break;
			case "ban":
				message.info("封禁用户");
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
				<NSpace>
					<NDropdown options={options} trigger="click" placement="bottom-end" onSelect={(key: string) => handleSelect(key, row)}>
						<NButton strong secondary size="small" class="mie-2">更多</NButton>
					</NDropdown>
					<NButton type="error" strong secondary size="small" class="mie-2" onClick={() => openClearUserInfoModal(row.UUID ?? "", row.uid ?? 0)}>清空</NButton>
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
			isOnlyShowUserInfoUpdatedAfterReview: false,
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
	 * 编辑用户信息
	 */
	async function editUserInfo() {
		if (editUserInfoData.userNickname === "" || editUserInfoData.username === "") {
			message.error("昵称和用户名不能为空");
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
			message.success("修改用户信息成功。");
			closeEditUserInfoModal();
			await getUserInfo();
		} else {
			message.error("修改用户信息失败。");
			isEditingUserInfo.value = false;
		}
	}

	/**
	 * 刷新编辑用户信息
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
		});
		isShowEditUserInfoModal.value = true;
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
	 * 关闭删除用户信息的表单，并清除正在删除的用户信息
	 */
	function closeClearUserInfoModal() {
		isShowClearUserInfoModal.value = false;
		currentClearingUserInfo.value = "";
	}

	/**
	 * 关闭编辑用户信息的表单，并清除正在编辑的用户信息
	 */
	function closeEditUserInfoModal() {
		isShowEditUserInfoModal.value = false;
		isEditingUserInfo.value = false;
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
			v-model:show="isShowEditUserInfoModal"
			:maskClosable="false"
			preset="dialog"
			title="用户信息"
			:style="{ width: '800px' }"
		>
			<br />
			<NAlert type="warning" title="注意"><div>修改请慎重！</div></NAlert>
			<br />
			<NForm labelPlacement="left" labelWidth="auto">
				<NRow :gutter="24">

					<NCol :span="10">
						<NFormItem label="UID">
							<NInput :value="String(editUserInfoData.uid)" disabled />
						</NFormItem>
						<NFormItem label="邮箱">
							<NInput :value="editUserInfoData.email" disabled />
						</NFormItem>
						<NFormItem label="昵称">
							<NInput v-model:value="editUserInfoData.userNickname" />
						</NFormItem>
						<NFormItem label="出生日期">
							<NDatePicker
								v-model:value="editUserInfoData.userBirthday"
								type="date"
								style="width: 100%"
							/>
						</NFormItem>
						<NFormItem label="未通过审核">
							<NSwitch v-model:value="editUserInfoData.isUpdatedAfterReview" />
						</NFormItem>
					</NCol>

					<NCol :span="14">
						<NFormItem label="UUID">
							<NInput :value="editUserInfoData.UUID" disabled />
						</NFormItem>
						<NFormItem label="用户名">
							<NInput v-model:value="editUserInfoData.username" />
						</NFormItem>
						<NFormItem label="简介">
							<NInput
								v-model:value="editUserInfoData.signature"
								type="textarea"
								:autosize="{ minRows: 3, maxRows: 5 }"
							/>
						</NFormItem>
						<NFormItem label="性别">
							<NRadioGroup v-model:value="editUserInfoData.gender">
								<NSpace>
									<NRadio value="male">男</NRadio>
									<NRadio value="female">女</NRadio>
								</NSpace>
							</NRadioGroup>
						</NFormItem>
					</NCol>
				</NRow>
			</NForm>
			<template #action>
				<NButton @click="closeEditUserInfoModal">放弃更改</NButton>
				<NPopconfirm
					@negativeClick="message.info(`$(editUserInfoData.userBirthday)`)"
					@positiveClick="editUserInfo()"
				>
					<template #trigger>
						<NButton
							:disabled="editUserInfoData.email === '' || editUserInfoData.userNickname === '' || editUserInfoData.username === ''"
							:loading="isEditingUserInfo"
							type="warning"
							:secondary="true"
						>
							保存
						</NButton>
					</template>
					你确定要保存吗？
				</NPopconfirm>
			</template>
		</NModal>

		<NModal
			v-model:show="isShowClearUserInfoModal"
			:maskClosable="false"
			preset="dialog"
			:title="`确认要删除该用户信息吗？`"
		>
			<br />
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
