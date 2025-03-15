<script setup lang="ts">
	import { CreateRbacApiPathRequestDto, DeleteRbacApiPathRequestDto, GetRbacApiPathRequestDto, GetRbacApiPathResponseDto } from "api/Rbac/RbacControllerDto";
	import { DataTableColumns, NButton, NTag, useDialog } from "naive-ui";

	const dialog = useDialog();

	type RbacApiPath = GetRbacApiPathResponseDto["result"];

	const isShowCreateNewApiPathModal = ref(false);
	const isCreatingApiPath = ref(false);
	const _EMPTY_API_PATH_DATA_ = {
		apiPath: "",
		apiPathType: "",
		apiPathColor: "",
		apiPathDescription: "",
	};
	const createNewApiPathModal = ref<CreateRbacApiPathRequestDto>({ ..._EMPTY_API_PATH_DATA_ });

	const isShowDeleteApiPathModal = ref(false);
	const isDeletingApiPath = ref(false);
	const currentDeletingApiPath = ref("");
	const userInputDeleteingApiPath = ref("");

	const columns: DataTableColumns<NonNullable<RbacApiPath>[number]> = [
		{
			title: "API 路径",
			key: "apiPath",
			render(row) {
				return h(
					NTag,
					{
						color: { color: row.isAssignedOnce ? row.apiPathColor : "#EEEEEEFF" },
					},
					{ default: () => row.apiPath },
				);
			},
		},
		{
			title: "是否至少绑定到一个角色",
			key: "isAssignedOnce",
			render(row) {
				return h(
					"div",
					{ id: `${row.apiPath}-isAssignedOnce-col` },
					{ default: () => row.isAssignedOnce },
				);
			},
		},
		{
			title: "类型",
			key: "apiPathType",
		},
		{
			title: "显示颜色",
			key: "apiPathColor",
		},
		{
			title: "备注",
			key: "apiPathDescription",
		},
		{
			title: "操作",
			key: "actions",
			render(row) {
				return h(
					NButton,
					{
						strong: true,
						secondary: true,
						size: "small",
						onClick: () => openDeleteApiPathModel(row.apiPath ?? ""),
					},
					{ default: () => "删除" },
				);
			},
		},
	];

	const rbacApiPath = ref<RbacApiPath>([]);
	const rbacApiPathCount = ref(0);
	const pagination = reactive({
		page: 1,
		pageSize: 50,
		showSizePicker: true,
		pageSizes: [5, 10, 20, 50, 100, 200],
		onChange: async (page: number) => {
			pagination.page = page;
			await fetchRbacApiPath();
		},
		onUpdatePageSize: async (pageSize: number) => {
			pagination.pageSize = pageSize;
			pagination.page = 1;
			await fetchRbacApiPath();
		},
	});
	const rbacApiPathPageCount = computed(() => getPageCountByDataCount(rbacApiPathCount.value, pagination.pageSize));

	/**
	 * 获取 RBAC API 路径
	 */
	async function fetchRbacApiPath() {
		const getRbacApiPathRequest: GetRbacApiPathRequestDto = {
			search: {},
			pagination: {
				page: pagination.page,
				pageSize: pagination.pageSize,
			},
		};
		const rbacApiPathResult = await getRbacApiPathController(getRbacApiPathRequest);
		if (rbacApiPathResult.success) {
			rbacApiPath.value = rbacApiPathResult.result;
			rbacApiPathCount.value = rbacApiPathResult.count ?? 0;
		} else
			console.error("ERROR", "获取 RBAC API 路径失败。");
	}

	/**
	 * 更新正在删除的 API 路径名，并打开删除 API 路径的表单
	 * @param apiPahtName 正在删除的 API 路径名
	 */
	function openDeleteApiPathModel(apiPahtName: string) {
		currentDeletingApiPath.value = apiPahtName;
		isShowDeleteApiPathModal.value = true;
	}

	/**
	 * 打开删除 API 路径的表单，并清除正在删除的 API 路径名
	 */
	function closeDeleteApiPathModel() {
		isShowDeleteApiPathModal.value = false;
		currentDeletingApiPath.value = "";
	}

	/**
	 * 删除 RBAC API 路径
	 * @param apiPath 要删除的 RBAC API 路径的名字
	 */
	async function deleteApiPath(apiPath: string) {
		const deleteRbacApiPathRequest: DeleteRbacApiPathRequestDto = {
			apiPath,
		};

		const deleteRbacApiPathResult = await deleteRbacApiPathController(deleteRbacApiPathRequest);

		if (!deleteRbacApiPathResult.success || deleteRbacApiPathResult.isAssigned)
			dialog.error({
				title: "删除 RBAC API 路径失败",
				content: deleteRbacApiPathResult.message,
				positiveText: "知道了",
			});
		else
			closeDeleteApiPathModel();

		await fetchRbacApiPath();
		isDeletingApiPath.value = false;
	}

	/**
	 * 清空表单数据并开启创建 API 路径的模态框
	 */
	function openCreateApiPathModel() {
		createNewApiPathModal.value = { ..._EMPTY_API_PATH_DATA_ };
		isShowCreateNewApiPathModal.value = true;
	}

	/**
	 * 关闭创建 API 路径的模态框并清空表单数据
	 */
	function closeCreateApiPathModel() {
		isShowCreateNewApiPathModal.value = false;
		createNewApiPathModal.value = { ..._EMPTY_API_PATH_DATA_ };
	}

	/**
	 * 提交表单，创建新的 API 路径
	 */
	async function createApiPath() {
		if (!createNewApiPathModal.value.apiPath) {
			console.error("ERROR", "创建 API 路径失败，参数不合法");
			return;
		}
		isCreatingApiPath.value = true;
		const createRbacApiPathResult = await createRbacApiPathController(createNewApiPathModal.value);
		
		await fetchRbacApiPath();
		if (createRbacApiPathResult.success)
			closeCreateApiPathModel();
		else
			dialog.error({
				title: "创建新的 API 路径失败",
				content: createRbacApiPathResult.message,
				positiveText: "知道了",
			});

		isCreatingApiPath.value = false;
	}
	onMounted(fetchRbacApiPath);
</script>

<template>
	<div class="container">
		<NCollapse class="mb-[20px]">
			<NCollapseItem title="使用说明" name="1">
				<p>KIRAKIRA RBAC 权限控制的最小单位是 API 路径。</p>
				<ul>
					<li class="ml-[20px] mt-[5px]">一个用户可以拥有多个角色</li>
					<li class="ml-[20px]">一个角色可以对应多位用户</li>
					<li class="ml-[20px]">一个角色可以拥有对多个 API 的访问权限</li>
					<li class="ml-[20px]">一个 API 可以对应多个角色</li>
				</ul>
				<br />
				<p>你可以添加新的 API 路径，前提是后端中该 API 的 Controller 层受 RBAC 管制，否则添加 API 路径无效。</p>
				<p>你也可以删除 API 路径，前提是该 API 路径没有绑定到任何角色。</p>
				<br />
				<p>没有绑定到角色的 API 路径会显示为灰色，已经绑定到角色的 API 路径会显示用户设置的颜色。</p>
				<NDivider />
			</NCollapseItem>
		</NCollapse>
		<NFlex class="mb-[10px]">
			<NButton @click="openCreateApiPathModel">新增</NButton>
		</NFlex>
		<NDataTable
			:columns="columns"
			:data="rbacApiPath"
			:pagination="false"
			:bordered="false"
			:rowKey="row => row.apiPath"
		/>
		<NFlex justify="end" class="mt-[20px]">
			<NPagination
				:displayOrder="['quick-jumper', 'pages', 'size-picker']"
				:pageCount="rbacApiPathPageCount"
				:page="pagination.page"
				:pageSize="pagination.pageSize"
				:pageSizes="pagination.pageSizes"
				:onUpdate:page="pagination.onChange"
				:onUpdate:pageSize="pagination.onUpdatePageSize"
				showQuickJumper
				showSizePicker
			>
				<template #goto>
					跳转至
				</template>
			</NPagination>
		</NFlex>
	</div>

	<NModal
		style="width: 600px"
		v-model:show="isShowCreateNewApiPathModal"
		:maskClosable="false"
		preset="card"
		title="创建新 API 路径"
	>
		<NH6>API 路径的名字 *</NH6>
		<NInput :status="!createNewApiPathModal.apiPath ? 'error' : 'success'" v-model:value="createNewApiPathModal.apiPath" placeholder="（必填）唯一且简短的 API 路径名，例：/02/koa/hello" />
		<NH6>API 路径的类型</NH6>
		<NInput v-model:value="createNewApiPathModal.apiPathType" placeholder="用于标识API 路径，例如 'video'" />
		<NH6>API 路径的显示颜色</NH6>
		填写颜色可以更方便区分不同 API 路径
		<NColorPicker v-model:value="createNewApiPathModal.apiPathColor" :modes="['hex']" :showAlpha="true" />
		<NH6>API 路径的介绍</NH6>
		<NInput v-model:value="createNewApiPathModal.apiPathDescription" type="textarea" :autosize="{ minRows: 3 }" placeholder="API 路径的详细说明" />
		<template #footer>
			<NButton @click="closeCreateApiPathModel" class="mr-[10px]">算了</NButton>
			<NButton :disabled="!createNewApiPathModal.apiPath" :loading="isCreatingApiPath" type="primary" :secondary="true" @click="createApiPath">确认创建</NButton>
		</template>
	</NModal>

	<NModal
		v-model:show="isShowDeleteApiPathModal"
		:maskClosable="false"
		preset="dialog"
		:title="`确认要删除角色 ${currentDeletingApiPath} 吗？`"
	>
		<NH6>再次输入角色的名字来确定删除</NH6>
		<NInput v-model:value="userInputDeleteingApiPath" placeholder="角色名字" />
		
		<template #action>
			<NButton @click="closeDeleteApiPathModel">算了</NButton>
			<NButton :disabled="currentDeletingApiPath !== userInputDeleteingApiPath" :loading="isDeletingApiPath" type="warning" :secondary="true" @click="deleteApiPath(currentDeletingApiPath)">确认删除</NButton>
		</template>
	</NModal>
</template>
