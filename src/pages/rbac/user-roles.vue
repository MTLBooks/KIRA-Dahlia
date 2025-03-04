<script setup lang="ts">
	// import { getRbacApiPath } from "../../api/Rbac/RbacController";
	import { AdminGetUserRolesByUidRequestDto, AdminGetUserRolesByUidResponseDto, GetRbacRoleRequestDto, GetRbacRoleResponseDto } from "api/Rbac/RbacControllerDto";
	import { NButton } from "naive-ui";

	const isEnableEditUserRole = ref(false);
	const inputUid = ref<number>();

	type RbacRole = GetRbacRoleResponseDto["result"];
	const rbacRole = ref<RbacRole>([]);
	const rbacRoleOption = computed(() => rbacRole.value?.map(role => {
		return {
			label: role.roleName,
			value: role.roleName,
		};
	}));

	const userRoles = ref<AdminGetUserRolesByUidResponseDto["result"]>();

	const userRolesFormModel = computed(() => {
		return {
			uid: userRoles.value?.uid,
			uuid: userRoles.value?.uuid,
			username: userRoles.value?.username,
			userNickname: userRoles.value?.userNickname,
			userRoles: userRoles.value?.roles.map(role => role.roleName),
		};
	});

	/**
	 * 通过 UID 获取一个用户的角色
	 */
	async function adminFetchUserRole() {
		if (inputUid.value === undefined || inputUid.value === null) return;
		
		const adminGetUserRolesByUidRequest: AdminGetUserRolesByUidRequestDto = {
			uid: inputUid.value ?? 0,
		};
		const userRolesResult = await adminGetUserRoles(adminGetUserRolesByUidRequest);
		if (userRolesResult.success)
			userRoles.value = userRolesResult.result;
	}
	
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
				<p>你可以查询一个用户的角色,或为其绑定或解除绑定角色。</p>
				<p>拥有以下特殊名称的角色具有特殊效果，在绑定或解除绑定时请多加注意：</p>
				<ul>
					<li class="ml-[20px] mt-[5px]">root - 拥有 RBAC 的管理权限</li>
					<li class="ml-[20px]">adminsitrator - 拥有对内容管理权限</li>
					<li class="ml-[20px]">developer - 拥有某些开发资源的访问权限</li>
					<li class="ml-[20px]">user - 普通用户</li>
					<li class="ml-[20px]">blocked - 已封禁的用户</li>
				</ul>
				<br />
				<p>注意: blocked 角色与其他角色互斥</p>
				<n-divider />
			</n-collapse-item>
		</n-collapse>
		<n-space align="center">
			<n-input-number v-model:value="inputUid" :showButton="false" />
			<n-button @click="adminFetchUserRole">查询</n-button>
		</n-space>
		<br />
		<n-divider />
		<br />
		<n-form
			ref="formRef"
			:model="userRolesFormModel"
			labelPlacement="left"
			:labelWidth="160"
			:style="{
				maxWidth: '640px',
			}"
		>
			<n-form-item label="用户 UID" path="uid">
				<n-input-number v-model:value="userRolesFormModel.uid" :showButton="false" :disabled="true" />
			</n-form-item>
			<n-form-item label="用户 UUID" path="uuid">
				<n-input v-model:value="userRolesFormModel.uuid" :disabled="true" />
			</n-form-item>
			<n-form-item label="用户名" path="username">
				<n-input v-model:value="userRolesFormModel.username" :disabled="true" />
			</n-form-item>
			<n-form-item label="用户昵称" path="userNickname">
				<n-input v-model:value="userRolesFormModel.userNickname" :disabled="true" />
			</n-form-item>
			<n-form-item label="编辑用户角色">
				<n-switch v-model:value="isEnableEditUserRole" />
			</n-form-item>
			<n-form-item label="用户的角色" path="userRoles">
				<n-transfer
					:disabled="!isEnableEditUserRole"
					v-model:value="userRolesFormModel.userRoles"
					:options="rbacRoleOption"
					sourceFilterable
					targetFilterable
				/>
			</n-form-item>
		</n-form>
	</div>
</template>
