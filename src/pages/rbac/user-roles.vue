<script setup lang="ts">
	// import { getRbacApiPath } from "../../api/Rbac/RbacController";
	import { AdminUpdateUserRoleRequestDto, AdminGetUserRolesByUidRequestDto, AdminGetUserRolesByUidResponseDto, GetRbacRoleRequestDto, GetRbacRoleResponseDto } from "api/Rbac/RbacControllerDto";
	import { NButton } from "naive-ui";

	const isEnableEditUserRole = ref(false);
	const isShowSubmitUserRolesModal = ref(false);
	const inputUid = ref<number>();

	type RbacRole = GetRbacRoleResponseDto["result"];
	const rbacRole = ref<RbacRole>([]);
	const rbacRoleOption = computed(() => rbacRole.value?.map(role => {
		return {
			label: role.roleName,
			value: role.roleName,
		};
	}));

	// const userRoles = ref<AdminGetUserRolesByUidResponseDto["result"]>();

	const userRolesFormModel = ref<
		{
			uid: number | undefined;
			uuid: string | undefined;
			username: string | undefined;
			userNickname: string | undefined;
			userRoles: string[] | undefined;
		}
	>({
		uid: undefined,
		uuid: undefined,
		username: undefined,
		userNickname: undefined,
		userRoles: undefined,
	});

	/**
	 * 通过 UID 获取一个用户的角色
	 */
	async function adminFetchUserRole() {
		if (inputUid.value === undefined || inputUid.value === null) return;
		
		const adminGetUserRolesByUidRequest: AdminGetUserRolesByUidRequestDto = {
			uid: inputUid.value ?? 0,
		};
		const userRolesResult = await adminGetUserRolesController(adminGetUserRolesByUidRequest);
		if (userRolesResult.success)
			userRolesFormModel.value = {
				uid: userRolesResult.result?.uid,
				uuid: userRolesResult.result?.uuid,
				username: userRolesResult.result?.username,
				userNickname: userRolesResult.result?.userNickname,
				userRoles: userRolesResult.result?.roles.map(role => role.roleName),
			};
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
		const rbacRoleResult = await getRbacRoleController(getRbacRoleRequest);
		if (rbacRoleResult.success)
			rbacRole.value = rbacRoleResult.result;
		else
			console.error("ERROR", "获取 RBAC 角色失败。");
	}

	async function adminUpdateUserRoles() {
		if (!userRolesFormModel.value.uuid || !userRolesFormModel.value.userRoles) return;

		const adminUpdateUserRoleRequest: AdminUpdateUserRoleRequestDto = {
			uuid: userRolesFormModel.value.uuid,
			newRoles: userRolesFormModel.value.userRoles,
		};

		const adminUpdateUserRolesResult = await adminUpdateUserRoleController(adminUpdateUserRoleRequest);

		if (adminUpdateUserRolesResult.success) {
			await adminFetchUserRole();
			isEnableEditUserRole.value = false;
			isShowSubmitUserRolesModal.value = false;
		}
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
			<n-input-number v-model:value="inputUid" placeholder="要查询的用户的 UID" :showButton="false" />
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
				<n-input-number v-model:value="userRolesFormModel.uid" placeholder="查询用户后显示" :showButton="false" :disabled="true" />
			</n-form-item>
			<n-form-item label="用户 UUID" path="uuid">
				<n-input v-model:value="userRolesFormModel.uuid" placeholder="查询用户后显示" :disabled="true" />
			</n-form-item>
			<n-form-item label="用户名" path="username">
				<n-input v-model:value="userRolesFormModel.username" placeholder="查询用户后显示" :disabled="true" />
			</n-form-item>
			<n-form-item label="用户昵称" path="userNickname">
				<n-input v-model:value="userRolesFormModel.userNickname" placeholder="查询用户后显示" :disabled="true" />
			</n-form-item>
			<n-form-item label="启用编辑">
				<n-switch v-model:value="isEnableEditUserRole" />
			</n-form-item>
			<n-form-item label="用户的角色" path="userRoles">
				<n-transfer
					:disabled="!isEnableEditUserRole || !userRolesFormModel.uuid"
					v-model:value="userRolesFormModel.userRoles"
					:options="rbacRoleOption"
					sourceFilterable
					targetFilterable
				/>
			</n-form-item>
			<!-- TODO: 我想要 label 的占位又不想显示 label 文本，难道只能用 label=" " 这种不优雅的方式吗？ -->
			<n-form-item label=" ">
				<n-button :disabled="!isEnableEditUserRole || !userRolesFormModel.uuid" @click="isShowSubmitUserRolesModal = true">
					更新用户角色
				</n-button>
			</n-form-item>
		</n-form>

		<n-modal
			v-model:show="isShowSubmitUserRolesModal"
			:maskClosable="false"
			preset="dialog"
			title="确认要更新用户角色吗？"
			positiveText="确认"
			negativeText="算了"
			@positiveClick="adminUpdateUserRoles"
		>
			<n-h6>用户 UID</n-h6>
			<n-input-number v-model:value="userRolesFormModel.uid" :showButton="false" :disabled="true" />
			<n-h6>用户 UUID</n-h6>
			<n-input v-model:value="userRolesFormModel.uuid" :showButton="false" :disabled="true" />
			<n-h6>用户将会更新为以下新角色</n-h6>
			<n-tag v-for="role in userRolesFormModel.userRoles" :key="role" class="mr-[10px]">{{ role }}</n-tag>
		</n-modal>
	</div>
</template>
