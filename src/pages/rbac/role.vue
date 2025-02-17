<script setup lang="ts">
	// import { getRbacApiPath } from "../../api/Rbac/RbacController";
	import { DeleteRbacRoleRequestDto, GetRbacRoleRequestDto, GetRbacRoleResponseDto } from "api/Rbac/RbacControllerDto";
	import { DataTableColumns, NButton, NTag } from "naive-ui";

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
				return h(
					NButton,
					{
						strong: true,
						tertiary: true,
						size: "small",
						onClick: () => fetchDeleteRbacRole(row.roleName ?? ""),
					},
					{ default: () => "删除" },
				);
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
		const rbacRoleResult = await getRbacRole(getRbacRoleRequest);
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
		const deleteRbacRoleRequest: DeleteRbacRoleRequestDto = {
			roleName,
		};

		const deleteRbacApiPathResult = await deleteRbacRole(deleteRbacRoleRequest);
		if (!deleteRbacApiPathResult.success)
			console.error("ERROR", "删除 RBAC 角色失败。");

		await fetchRbacRole();
	}

	onMounted(fetchRbacRole);
</script>

<template>
	<div class="container">
		<n-collapse class="mb-[20px]">
			<n-collapse-item title="使用说明" name="1">
				<p>KIRAKIRA RBAC 权限控制的最小单位是 API 路径。</p>
				<ul>
					<li>一个用户可以拥有多个角色</li>
					<li>一个角色可以对应多位用户</li>
					<li>一个角色可以拥有对多个 API 的访问权限</li>
					<li>一个 API 可以对应多个角色</li>
				</ul>
				<br />
				<p>你可以添加新的 API 路径，前提是后端中该 API 的 Controller 层受 RBAC 管制，否则添加 API 路径无效。</p>
				<p>你也可以删除 API 路径，前提是该 API 路径没有绑定到任何角色。</p>
				<n-divider />
			</n-collapse-item>
		</n-collapse>
		<n-flex class="mb-[10px]">
			<n-button>新增</n-button>
		</n-flex>
		<n-data-table
			:columns="columns"
			:data="rbacRole"
			:pagination="false"
			:bordered="false"
			:resizable="true"
			:rowKey="row => row.roleName"
		/>
	</div>
</template>
