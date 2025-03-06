<script setup lang="ts">
	// import { getRbacApiPath } from "../../api/Rbac/RbacController";
	import { CreateRbacRoleRequestDto, DeleteRbacRoleRequestDto, GetRbacRoleRequestDto, GetRbacRoleResponseDto } from "api/Rbac/RbacControllerDto";
	import { DataTableColumns, NButton, NTag } from "naive-ui";

	const isShowDeleteRoleModal = ref(false);
	const currentDeletingRole = ref("");
	const userInputDeleteingRole = ref("");
	const isDeletingRole = ref(false);

	const isShowCreateNewRoleModal = ref(false);
	const isCreatingRole = ref(false);
	const createRoleFormModel = ref<CreateRbacRoleRequestDto>({
		roleName: "",
		roleType: "",
		roleColor: "",
		roleDescription: "",
	});

	function openCreateRoleModel() {
		isShowCreateNewRoleModal.value = true;
		createRoleFormModel.value = {
			roleName: "",
			roleType: "",
			roleColor: "",
			roleDescription: "",
		};
	}

	function closeCreateRoleModel() {
		isShowCreateNewRoleModal.value = false;
		createRoleFormModel.value = {
			roleName: "",
			roleType: "",
			roleColor: "",
			roleDescription: "",
		};
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

	type RbacRole = GetRbacRoleResponseDto["result"];

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
							class: "mr-[10px]",
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

	/**
	 * 获取 RBAC 角色
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
			console.error("ERROR", "获取 RBAC 角色失败。");
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
			console.error("ERROR", "删除 RBAC 角色失败。");

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

	onMounted(fetchRbacRole);
</script>

<template>
	<div class="container">
		<n-collapse class="mb-[20px]">
			<n-collapse-item title="使用说明" name="1">
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
				<n-divider />
			</n-collapse-item>
		</n-collapse>
		<n-flex class="mb-[10px]">
			<n-button @click="openCreateRoleModel">新增</n-button>
		</n-flex>
		<n-data-table
			:columns="columns"
			:data="rbacRole"
			:pagination="false"
			:bordered="false"
			:resizable="true"
			:rowKey="row => row.roleName"
		/>

		<n-modal
			v-model:show="isShowDeleteRoleModal"
			:maskClosable="false"
			preset="dialog"
			:title="`确认要删除角色 ${currentDeletingRole} 吗？`"
		>
			<n-h6>再次输入角色的名字来确定删除</n-h6>
			<n-input v-model:value="userInputDeleteingRole" placeholder="角色名字" />
			
			<template #action>
				<n-button @click="closeDeleteRoleModel">算了</n-button>
				<n-button :disabled="currentDeletingRole !== userInputDeleteingRole" :loading="isDeletingRole" type="warning" :secondary="true" @click="fetchDeleteRbacRole(currentDeletingRole)">确认删除</n-button>
			</template>
		</n-modal>

		<n-modal
			style="width: 600px"
			v-model:show="isShowCreateNewRoleModal"
			:maskClosable="false"
			preset="card"
			title="创建新角色"
		>
			<n-h6>角色的名字 *</n-h6>
			<n-input :status="!createRoleFormModel.roleName ? 'error' : 'success'" v-model:value="createRoleFormModel.roleName" placeholder="（必填）唯一且简短的角色名" />
			<n-h6>角色的类型</n-h6>
			<n-input v-model:value="createRoleFormModel.roleType" placeholder="用于标识角色，例如 'maintenance'" />
			<n-h6>角色的显示颜色</n-h6>
			填写颜色可以更方便区分不同角色
			<n-color-picker v-model:value="createRoleFormModel.roleColor" :modes="['hex']" :showAlpha="true" />
			<n-h6>角色的介绍</n-h6>
			<n-input v-model:value="createRoleFormModel.roleDescription" type="textarea" :autosize="{ minRows: 3 }" placeholder="角色的详细说明" />
			<template #footer>
				<n-button @click="closeCreateRoleModel" class="mr-[10px]">算了</n-button>
				<n-button :disabled="!createRoleFormModel.roleName" :loading="isCreatingRole" type="primary" :secondary="true" @click="createRole">确认创建</n-button>
			</template>
		</n-modal>
	</div>
</template>
