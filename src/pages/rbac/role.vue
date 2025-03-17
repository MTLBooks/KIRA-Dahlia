<script setup lang="ts">
	import { CreateRbacRoleRequestDto, DeleteRbacRoleRequestDto, GetRbacApiPathRequestDto, GetRbacApiPathResponseDto, GetRbacRoleRequestDto, GetRbacRoleResponseDto, UpdateApiPathPermissionsForRoleRequestDto } from "api/Rbac/RbacControllerDto";
	import { DataTableColumns, NButton, NTag, useDialog } from "naive-ui";

	const dialog = useDialog();

	type RbacRole = GetRbacRoleResponseDto["result"];

	const isShowDeleteRoleModal = ref(false);
	const currentDeletingRole = ref("");
	const userInputDeleteingRole = ref("");
	const isDeletingRole = ref(false);

	const isShowCreateNewRoleModal = ref(false);
	const isCreatingRole = ref(false);
	const _EMPTY_ROLE_CREATE_DATA_ = {
		roleName: "",
		roleType: "",
		roleColor: "",
		roleDescription: "",
	};
	const createRoleFormModel = ref<CreateRbacRoleRequestDto>({ ..._EMPTY_ROLE_CREATE_DATA_ });

	type RbacApiPath = GetRbacApiPathResponseDto["result"];
	const rbacApiPath = ref<RbacApiPath>([]);
	const isShowEditRoleModal = ref(false);
	const isEditingRole = ref(false);
	const _EMPTY_ROLE_UPDATE_DATA_ = {
		roleName: "",
		apiPathPermissions: [],
	};
	const updateApiPathPermissionsForRoleFormModel = ref<UpdateApiPathPermissionsForRoleRequestDto>(_EMPTY_ROLE_UPDATE_DATA_);

	const columns: DataTableColumns<NonNullable<RbacRole>[number]> = [
		{
			title: "角色名",
			key: "roleName",
			render(row) {
				return h(
					NTag,
					{
						color: { color: row.roleColor },
					},
					{ default: () => row.roleName },
				);
			},
		},
		{
			title: "可以访问以下 API 路径",
			key: "apiPathPermissions",
			ellipsis: true,
			width: "400px",
			render(row) {
				return row.apiPathPermissions.map(apiPath => h(
					NTag,
					{ class: "mr-[10px]" },
					{ default: () => apiPath },
				));
			},
		},
		{
			type: "expand",
			renderExpand: rowData => {
				return [
					h(
						"div",
						{
							id: `${rowData.roleName}-expand-title`,
							class: "mb-[10px]",
						},
						{ default: () => `角色 ${rowData.roleName} 有以下 API 路径的访问权限` },
					),
					...rowData.apiPathList.map(apiPath => h(
						NTag,
						{
							color: { color: apiPath.apiPathColor },
							class: "mr-[10px] mb-[5px]",
						},
						{ default: () => apiPath.apiPath },
					)),
				];
			},
		},
		{
			title: "类型",
			key: "roleType",
		},
		{
			title: "显示颜色",
			key: "roleColor",
		},
		{
			title: "备注",
			key: "roleDescription",
		},
		{
			title: "操作",
			key: "actions",
			render(row) {
				return [
					h(
						NButton,
						{
							strong: true,
							secondary: true,
							size: "small",
							class: "mr-[10px]",
							onClick: () => openEditRoleModel(row),
						},
						{ default: () => "编辑" },
					),
					h(
						NButton,
						{
							strong: true,
							secondary: true,
							size: "small",
							type: "warning",
							onClick: () => openDeleteRoleModel(row.roleName ?? ""),
						},
						{ default: () => "删除" },
					),
				];
			},
		},
	];

	const rbacRole = ref<RbacRole>([]);
	const rbacRoleCount = ref(0);
	const pagination = reactive({
		page: 1,
		pageSize: 50,
		showSizePicker: true,
		pageSizes: [5, 10, 20, 50, 100, 200],
		onChange: async (page: number) => {
			pagination.page = page;
			await fetchRbacRole();
		},
		onUpdatePageSize: async (pageSize: number) => {
			pagination.pageSize = pageSize;
			pagination.page = 1;
			await fetchRbacRole();
		},
	});
	const rbacRolePageCount = computed(() => getPageCountByDataCount(rbacRoleCount.value, pagination.pageSize));

	/**
	 * 获取 RBAC 角色
	 */
	async function fetchRbacRole() {
		const getRbacRoleRequest: GetRbacRoleRequestDto = {
			search: {},
			pagination: {
				page: pagination.page,
				pageSize: pagination.pageSize,
			},
		};
		const rbacRoleResult = await getRbacRoleController(getRbacRoleRequest);
		if (rbacRoleResult.success) {
			rbacRole.value = rbacRoleResult.result;
			rbacRoleCount.value = rbacRoleResult.count ?? 0;
		} else
			console.error("ERROR", "获取 RBAC 角色失败。");
	}

	/**
	 * 清除数据并打开创建角色的模态框
	 */
	function openCreateRoleModel() {
		createRoleFormModel.value = { ..._EMPTY_ROLE_CREATE_DATA_ };
		isShowCreateNewRoleModal.value = true;
	}

	/**
	 * 关闭创建角色的模态框，并清除数据
	 */
	function closeCreateRoleModel() {
		isShowCreateNewRoleModal.value = false;
		createRoleFormModel.value = { ..._EMPTY_ROLE_CREATE_DATA_ };
	}
	
	/**
	 * 创建 RBAC 角色
	 */
	async function createRole() {
		const createRbacRoleRequest: CreateRbacRoleRequestDto = { ...createRoleFormModel.value };
		if (!createRbacRoleRequest.roleName) {
			console.error("ERROR", "创建角色失败，参数不合法");
			return;
		}
		isCreatingRole.value = true;
		const createRbacRoleResult = await createRbacRoleController(createRbacRoleRequest);
		if (createRbacRoleResult.success) {
			await fetchRbacRole();
			closeCreateRoleModel();
		}

		isCreatingRole.value = false;
	}

	/**
	 * 获取 RBAC API 路径
	 */
	async function fetchRbacApiPath() {
		const getRbacApiPathRequest: GetRbacApiPathRequestDto = {
			search: {},
			pagination: {
				page: 1,
				pageSize: 100000,
			},
		};
		const rbacApiPathResult = await getRbacApiPathController(getRbacApiPathRequest);
		if (rbacApiPathResult.success)
			rbacApiPath.value = rbacApiPathResult.result;
		else
			console.error("ERROR", "获取 RBAC API 路径失败。");
	}

	/**
	 * 删除 RBAC 角色
	 * @param roleName 要删除的 RBAC 角色的名字
	 */
	async function fetchDeleteRbacRole(roleName: string) {
		isDeletingRole.value = true;
		const deleteRbacRoleRequest: DeleteRbacRoleRequestDto = {
			roleName,
		};

		const deleteRbacApiPathResult = await deleteRbacRoleController(deleteRbacRoleRequest);
		if (!deleteRbacApiPathResult.success)
			dialog.error({
				title: "删除 RBAC 角色失败",
				content: deleteRbacApiPathResult.message,
				positiveText: "知道了",
			});

		await fetchRbacRole();
		closeDeleteRoleModel();
		isDeletingRole.value = false;
	}

	/**
	 * 开启删除角色的模态框
	 * @param roleName 要删除的角色的名字
	 */
	function openDeleteRoleModel(roleName: string) {
		currentDeletingRole.value = roleName;
		userInputDeleteingRole.value = "";
		isShowDeleteRoleModal.value = true;
	}

	/**
	 * 关闭删除角色的模态框
	 */
	function closeDeleteRoleModel() {
		currentDeletingRole.value = "";
		userInputDeleteingRole.value = "";
		isShowDeleteRoleModal.value = false;
	}

	/**
	 * 设置数据并打开编辑角色的模态框
	 * @param roleData 正在更新的角色数据
	 */
	function openEditRoleModel(roleData: NonNullable<RbacRole>[number]) {
		updateApiPathPermissionsForRoleFormModel.value = {
			roleName: roleData.roleName,
			apiPathPermissions: roleData.apiPathPermissions.map(apiPath => apiPath),
		};
		isShowEditRoleModal.value = true;
	}

	/**
	 * 关闭编辑角色的模态框并清除数据
	 */
	function closeEditRoleModel() {
		isShowEditRoleModal.value = false;
		updateApiPathPermissionsForRoleFormModel.value = _EMPTY_ROLE_UPDATE_DATA_;
	}

	/**
	 * 更新角色的 API 路径
	 */
	async function updateApiPathPermissionsForRole() {
		isEditingRole.value = true;
		const updateApiPathPermissionsForRoleResult = await updateApiPathPermissionsForRoleController(updateApiPathPermissionsForRoleFormModel.value);
		if (updateApiPathPermissionsForRoleResult.success) {
			await fetchAllDataInRolePage();
			closeEditRoleModel();
		} else
			dialog.error({
				title: "更新角色的 API 路径时出错",
				content: updateApiPathPermissionsForRoleResult.message,
				positiveText: "知道了",
			});
		isEditingRole.value = false;
	}

	/**
	 * 获取 role.vue 页面所有初始化数据
	 */
	async function fetchAllDataInRolePage() {
		await fetchRbacRole();
		await fetchRbacApiPath();
	}

	onMounted(fetchAllDataInRolePage);
</script>

<template>
	<div class="container">
		<NH2>KIRAKIRA RBAC 角色管理</NH2>
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
				<p>你可以添加或删除角色。</p>
				<p>拥有以下特殊名称的角色具有特殊效果，在创建、分配（绑定/解除绑定）和删除时请多加注意：</p>
				<ul>
					<li class="ml-[20px] mt-[5px]">root - 拥有 RBAC 的管理权限</li>
					<li class="ml-[20px]">adminsitrator - 拥有对内容管理权限</li>
					<li class="ml-[20px]">developer - 拥有某些开发资源的访问权限</li>
					<li class="ml-[20px]">user - 普通用户</li>
					<li class="ml-[20px]">blocked - 已封禁的用户</li>
				</ul>
				<NDivider />
			</NCollapseItem>
		</NCollapse>
		<NFlex class="mb-[10px]">
			<NButton @click="openCreateRoleModel">新增</NButton>
		</NFlex>
		<NDataTable
			:columns="columns"
			:data="rbacRole"
			:pagination="false"
			:bordered="false"
			:resizable="true"
			:rowKey="row => row.roleName"
		/>
		<NFlex justify="end" class="mt-[20px]">
			<NPagination
				:displayOrder="['quick-jumper', 'pages', 'size-picker']"
				:pageCount="rbacRolePageCount"
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
		v-model:show="isShowDeleteRoleModal"
		:maskClosable="false"
		preset="dialog"
		:title="`确认要删除角色 ${currentDeletingRole} 吗？`"
	>
		<NH6>再次输入角色的名字来确定删除</NH6>
		<NInput v-model:value="userInputDeleteingRole" placeholder="角色名字" />
			
		<template #action>
			<NButton @click="closeDeleteRoleModel">算了</NButton>
			<NButton :disabled="currentDeletingRole !== userInputDeleteingRole" :loading="isDeletingRole" type="warning" :secondary="true" @click="fetchDeleteRbacRole(currentDeletingRole)">确认删除</NButton>
		</template>
	</NModal>

	<NModal
		style="width: 600px"
		v-model:show="isShowCreateNewRoleModal"
		:maskClosable="false"
		preset="card"
		title="创建新角色"
	>
		<NH6>角色的名字 *</NH6>
		<NInput :status="!createRoleFormModel.roleName ? 'error' : 'success'" v-model:value="createRoleFormModel.roleName" placeholder="（必填）唯一且简短的角色名" />
		<NH6>角色的类型</NH6>
		<NInput v-model:value="createRoleFormModel.roleType" placeholder="用于标识角色，例如 'maintenance'" />
		<NH6>角色的显示颜色</NH6>
		填写颜色可以更方便区分不同角色
		<NColorPicker v-model:value="createRoleFormModel.roleColor" :modes="['hex']" :showAlpha="true" />
		<NH6>角色的介绍</NH6>
		<NInput v-model:value="createRoleFormModel.roleDescription" type="textarea" :autosize="{ minRows: 3 }" placeholder="角色的详细说明" />
		<template #footer>
			<NButton @click="closeCreateRoleModel" class="mr-[10px]">算了</NButton>
			<NButton :disabled="!createRoleFormModel.roleName" :loading="isCreatingRole" type="primary" :secondary="true" @click="createRole">确认创建</NButton>
		</template>
	</NModal>

	<NModal
		style="width: 600px"
		v-model:show="isShowEditRoleModal"
		:maskClosable="false"
		preset="card"
		title="编辑角色可以访问的 API 路径"
	>
		<NH6>角色的名字</NH6>
		<NInput :disabled="true" v-model:value="updateApiPathPermissionsForRoleFormModel.roleName" placeholder="角色名" />
		<NH6>角色可以访问的 API 路径</NH6>
		<NTransfer
			v-model:value="updateApiPathPermissionsForRoleFormModel.apiPathPermissions"
			:options="
				rbacApiPath?.map(apiPath => {
					return {
						label: apiPath.apiPath,
						value: apiPath.apiPath,
					};
				})
			"
			sourceFilterable
			targetFilterable
		/>
		<template #footer>
			<NButton @click="closeEditRoleModel" class="mr-[10px]">算了</NButton>
			<NButton :disabled="!updateApiPathPermissionsForRoleFormModel.roleName" :loading="isEditingRole" type="primary" :secondary="true" @click="updateApiPathPermissionsForRole">确认更新角色</NButton>
		</template>
	</NModal>
</template>
