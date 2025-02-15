<script setup lang="ts">
	import { getRbacApiPath } from "../../api/Rbac/RbacController";
	import { DeleteRbacApiPathRequestDto, GetRbacApiPathRequestDto, GetRbacApiPathResponseDto } from "api/Rbac/RbacControllerDto";
	import { DataTableColumns, NButton, NTag } from "naive-ui";

	type RbacApiPath = GetRbacApiPathResponseDto["result"];

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
						tertiary: true,
						size: "small",
						onClick: () => deleteApiPath(row.apiPath ?? ""),
					},
					{ default: () => "删除" },
				);
			},
		},
	];

	const rbacApiPath = ref<RbacApiPath>([]);

	/**
	 * 获取 RBAC API 路径
	 */
	async function getRbacApi() {
		const getRbacApiPathRequest: GetRbacApiPathRequestDto = {
			search: {},
			pagination: {
				page: 1,
				pageSize: 1000,
			},
		};
		const rbacApiPathResult = await getRbacApiPath(getRbacApiPathRequest);
		if (rbacApiPathResult.success)
			rbacApiPath.value = rbacApiPathResult.result;
		else
			console.error("ERROR", "获取 RBAC API 路径失败。");
	}

	/**
	 * 删除 RBAC API 路径
	 * @param apiPath 要删除的 RBAC API 路径的名字
	 */
	async function deleteApiPath(apiPath: string) {
		const deleteRbacApiPathRequest: DeleteRbacApiPathRequestDto = {
			apiPath,
		};

		const deleteRbacApiPathResult = await deleteRbacApiPath(deleteRbacApiPathRequest);
		if (!deleteRbacApiPathResult.success)
			console.error("ERROR", "删除 RBAC API 路径失败。");

		await getRbacApi();
	}

	onMounted(getRbacApi);
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
			:data="rbacApiPath"
			:pagination="false"
			:bordered="false"
		/>
	</div>
</template>
