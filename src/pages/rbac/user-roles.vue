<script setup lang="ts">
	import { AdminUpdateUserRoleRequestDto, AdminGetUserRolesByUidRequestDto, GetRbacRoleRequestDto, GetRbacRoleResponseDto } from "api/Rbac/RbacControllerDto";
	import { NButton, useDialog } from "naive-ui";

	const dialog = useDialog();

	const isEnableEditUserRole = ref(false);
	const isShowSubmitUserRolesModal = ref(false);
	const inputUid = ref<number>();
	const isUpdatingUserRole = ref(false);

	type RbacRole = GetRbacRoleResponseDto["result"];
	const rbacRole = ref<RbacRole>([]);
	const rbacRoleOption = computed(() => rbacRole.value?.map(role => {
		return {
			label: role.roleName,
			value: role.roleName,
		};
	}));

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

	/**
	 * 管理员更新用户的角色
	 */
	async function adminUpdateUserRoles() {
		if (!userRolesFormModel.value.uuid || !userRolesFormModel.value.userRoles) return;

		isUpdatingUserRole.value = true;

		const adminUpdateUserRoleRequest: AdminUpdateUserRoleRequestDto = {
			uuid: userRolesFormModel.value.uuid,
			newRoles: userRolesFormModel.value.userRoles,
		};

		const adminUpdateUserRolesResult = await adminUpdateUserRoleController(adminUpdateUserRoleRequest);

		if (adminUpdateUserRolesResult.success) {
			await adminFetchUserRole();
			isEnableEditUserRole.value = false;
			isShowSubmitUserRolesModal.value = false;
		} else
			dialog.error({
				title: "管理员更新用户的角色失败",
				content: adminUpdateUserRolesResult.message,
				positiveText: "知道了",
			});

		isUpdatingUserRole.value = false;
	}

	onMounted(fetchRbacRole);
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
				<NDivider />
			</NCollapseItem>
		</NCollapse>
		<NSpace align="center">
			<NInputNumber v-model:value="inputUid" placeholder="要查询的用户的 UID" :showButton="false" />
			<NButton @click="adminFetchUserRole">查询</NButton>
		</NSpace>
		<br />
		<NDivider />
		<br />
		<NForm
			ref="formRef"
			:model="userRolesFormModel"
			labelPlacement="left"
			:labelWidth="160"
			:style="{
				maxWidth: '640px',
			}"
		>
			<NFormItem label="用户 UID" path="uid">
				<NInputNumber v-model:value="userRolesFormModel.uid" placeholder="查询用户后显示" :showButton="false" :disabled="true" />
			</NFormItem>
			<NFormItem label="用户 UUID" path="uuid">
				<NInput v-model:value="userRolesFormModel.uuid" placeholder="查询用户后显示" :disabled="true" />
			</NFormItem>
			<NFormItem label="用户名" path="username">
				<NInput v-model:value="userRolesFormModel.username" placeholder="查询用户后显示" :disabled="true" />
			</NFormItem>
			<NFormItem label="用户昵称" path="userNickname">
				<NInput v-model:value="userRolesFormModel.userNickname" placeholder="查询用户后显示" :disabled="true" />
			</NFormItem>
			<NFormItem label="启用编辑">
				<NSwitch v-model:value="isEnableEditUserRole" />
			</NFormItem>
			<NFormItem label="用户的角色" path="userRoles">
				<NTransfer
					:disabled="!isEnableEditUserRole || !userRolesFormModel.uuid"
					v-model:value="userRolesFormModel.userRoles"
					:options="rbacRoleOption"
					sourceFilterable
					targetFilterable
				/>
			</NFormItem>
			<!-- TODO: 我想要 label 的占位又不想显示 label 文本，难道只能用 label=" " 这种不优雅的方式吗？ -->
			<NFormItem label=" ">
				<NButton :disabled="!isEnableEditUserRole || !userRolesFormModel.uuid" @click="isShowSubmitUserRolesModal = true">
					更新用户角色
				</NButton>
			</NFormItem>
		</NForm>

		<NModal
			v-model:show="isShowSubmitUserRolesModal"
			:maskClosable="false"
			preset="dialog"
			title="确认要更新用户的角色吗？"
			negativeText="算了"
			@positiveClick="adminUpdateUserRoles"
		>
			<NH6>用户 UID</NH6>
			<NInputNumber v-model:value="userRolesFormModel.uid" :showButton="false" :disabled="true" />
			<NH6>用户 UUID</NH6>
			<NInput v-model:value="userRolesFormModel.uuid" :showButton="false" :disabled="true" />
			<NH6>用户的角色将会更新为下列角色</NH6>
			<NTag v-for="role in userRolesFormModel.userRoles" :key="role" class="mr-[10px]">{{ role }}</NTag>
			
			<template #action>
				<NButton @click="isShowSubmitUserRolesModal = false">算了</NButton>
				<NButton :loading="isUpdatingUserRole" type="warning" :secondary="true" @click="adminUpdateUserRoles">确认更新</NButton>
			</template>
		</NModal>
	</div>
</template>
