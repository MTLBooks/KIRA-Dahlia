<script setup lang="tsx">
const dialog = useDialog();

type RbacRole = GetRbacRoleResponseDto["result"];

const isShowDeleteRoleModal = ref(false);
const unableToEditRole = ref(true);
const currentDeletingRole = ref("");
const userInputDeleteingRole = ref("");
const isDeletingRole = ref(false);

const isShowCreateNewRoleModal = ref(false);
const isCreatingRole = ref(false);
const EMPTY_ROLE_CREATE_DATA = {
	roleName: "",
	roleType: "",
	roleColor: "",
	roleDescription: "",
};
const createRoleFormModal = ref<CreateRbacRoleRequestDto>({ ...EMPTY_ROLE_CREATE_DATA });

type RbacApiPath = GetRbacApiPathResponseDto["result"];
const rbacApiPath = ref<RbacApiPath>([]);
const isShowEditRoleModal = ref(false);
const isEditingRole = ref(false);
const EMPTY_ROLE_UPDATE_DATA = {
	roleName: "",
	apiPathPermissions: [],
};
const updateApiPathPermissionsForRoleFormModal = ref<UpdateApiPathPermissionsForRoleRequestDto>(EMPTY_ROLE_UPDATE_DATA);

const apiPathEls = reactive<(Element | ComponentPublicInstance)[]>([]);
function fixEllipsis() {
	for (let element of apiPathEls) {
		if ("$el" in element) element = element.$el as Element;
		if (!element?.parentElement || !(element instanceof HTMLElement)) continue;
		const right = element.offsetLeft + element.offsetWidth;
		const visibleWidth = element.parentElement.offsetWidth;
		element.classList.toggle("invisible", right - visibleWidth > -22.5);
	}
}
watch(apiPathEls, () => fixEllipsis());
useEventListener(window, "resize", () => fixEllipsis());

const columns: DataTableColumns<NonNullable<RbacRole>[number]> = [
	{
		title: "Role name",
		key: "roleName",
		render: row => <NTag color={{ color: row.roleColor, textColor: getContrastiveColor(row.roleColor!) }}>{row.roleName}</NTag>,
	},
	{
		title: "Accessible API paths",
		key: "apiPathPermissions",
		ellipsis: true,
		width: "min(400px, 40dvw)",
		render: row => {
			apiPathEls.length = 0;
			return row.apiPathPermissions.map(apiPath => <NTag class="mie-2" ref={el => el && apiPathEls.push(el)}>{apiPath}</NTag>);
		},
		className: "[&>*]:relative",
	},
	{
		type: "expand",
		renderExpand: rowData => [
			<div id={`${rowData.roleName}-expand-title`} class="mbe-2">{`Role ${rowData.roleName} has access to:`}</div>,
			...rowData.apiPathList.map(apiPath => <NTag color={{ color: apiPath.apiPathColor, textColor: getContrastiveColor(apiPath.apiPathColor!) }} class="mie-2 mbe-1">{apiPath.apiPath}</NTag>),
		],
	},
	{ title: "Type", key: "roleType" },
	{ title: "Display color", key: "roleColor" },
	{ title: "Description", key: "roleDescription" },
	{
		title: "Actions",
		key: "actions",
		render: row => (
			<NFlex size="small">
				<NButton strong secondary size="small" onClick={() => openEditRoleModal(row)}>{{ icon: <Icon name="edit" /> }}</NButton>
				<NButton strong secondary size="small" type="error" onClick={() => openDeleteRoleModal(row.roleName ?? "")}>{{ icon: <Icon name="delete" /> }}</NButton>
			</NFlex>
		),
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
 * Fetch RBAC roles
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
		console.error("ERROR", "Failed to fetch RBAC roles.");
}

/** Open create role modal */
function openCreateRoleModal() {
	createRoleFormModal.value = { ...EMPTY_ROLE_CREATE_DATA };
	isShowCreateNewRoleModal.value = true;
}

/** Close create role modal */
function closeCreateRoleModal() {
	isShowCreateNewRoleModal.value = false;
	createRoleFormModal.value = { ...EMPTY_ROLE_CREATE_DATA };
}

/** Create RBAC role */
async function createRole() {
	const createRbacRoleRequest: CreateRbacRoleRequestDto = { ...createRoleFormModal.value };
	if (!createRbacRoleRequest.roleName) {
		console.error("ERROR", "Create role failed: invalid data");
		return;
	}
	isCreatingRole.value = true;
	const createRbacRoleResult = await createRbacRoleController(createRbacRoleRequest);
	if (createRbacRoleResult.success) {
		await fetchRbacRole();
		closeCreateRoleModal();
	}

	isCreatingRole.value = false;
}

/** Fetch RBAC API paths */
async function fetchRbacApiPath() {
	const getRbacApiPathRequest: GetRbacApiPathRequestDto = {
		search: {},
		pagination: { page: 1, pageSize: 100000 },
	};
	const rbacApiPathResult = await getRbacApiPathController(getRbacApiPathRequest);
	if (rbacApiPathResult.success) rbacApiPath.value = rbacApiPathResult.result;
	else console.error("ERROR", "Failed to fetch RBAC API paths.");
}

/** Delete RBAC role */
async function fetchDeleteRbacRole(roleName: string) {
	isDeletingRole.value = true;
	const deleteRbacRoleRequest: DeleteRbacRoleRequestDto = { roleName };
	const deleteRbacApiPathResult = await deleteRbacRoleController(deleteRbacRoleRequest);
	if (!deleteRbacApiPathResult.success)
		dialog.error({ title: "Failed to delete RBAC role", content: deleteRbacApiPathResult.message, positiveText: "OK" });
	await fetchRbacRole();
	closeDeleteRoleModal();
	isDeletingRole.value = false;
}

/** Open delete role modal */
function openDeleteRoleModal(roleName: string) {
	currentDeletingRole.value = roleName;
	userInputDeleteingRole.value = "";
	isShowDeleteRoleModal.value = true;
}

/** Close delete role modal */
function closeDeleteRoleModal() {
	currentDeletingRole.value = "";
	userInputDeleteingRole.value = "";
	isShowDeleteRoleModal.value = false;
}

/** Open edit role modal */
async function openEditRoleModal(roleData: NonNullable<RbacRole>[number]) {
	unableToEditRole.value = true;
	updateApiPathPermissionsForRoleFormModal.value = {
		roleName: roleData.roleName,
		apiPathPermissions: roleData.apiPathPermissions.map(apiPath => apiPath),
	};
	isShowEditRoleModal.value = true;
	await fetchRbacApiPath();
	unableToEditRole.value = false;
}

/** Close edit role modal */
function closeEditRoleModal() {
	unableToEditRole.value = true;
	isShowEditRoleModal.value = false;
	updateApiPathPermissionsForRoleFormModal.value = EMPTY_ROLE_UPDATE_DATA;
}

/** Update role's API paths */
async function updateApiPathPermissionsForRole() {
	isEditingRole.value = true;
	const updateApiPathPermissionsForRoleResult = await updateApiPathPermissionsForRoleController(updateApiPathPermissionsForRoleFormModal.value);
	if (updateApiPathPermissionsForRoleResult.success) {
		await fetchAllDataInRolePage();
		closeEditRoleModal();
	} else
		dialog.error({ title: "Error updating role API paths", content: updateApiPathPermissionsForRoleResult.message, positiveText: "OK" });
	isEditingRole.value = false;
}

/** Fetch all data in role page */
async function fetchAllDataInRolePage() { await fetchRbacRole(); }

onMounted(fetchAllDataInRolePage);
</script>

<template>
	<div class="container">
		<PageHeading>KIRAKIRA RBAC Role Management</PageHeading>
		<NCollapse class="mlb-4">
			<NCollapseItem title="Instructions">
				<NP>The minimum unit of KIRAKIRA RBAC permission control is the API path.</NP>
				<NUl>
					<NLi>One user can have multiple roles</NLi>
					<NLi>One role can be assigned to multiple users</NLi>
					<NLi>One role can have access to multiple API paths</NLi>
					<NLi>One API can belong to multiple roles</NLi>
				</NUl>
				<NP>You can add or delete roles.</NP>
				<NP>Special role names with special effects (be careful when creating/assigning/deleting):</NP>
				<NUl>
					<NLi><b>root</b> - RBAC admin</NLi>
					<NLi><b>administrator</b> - content admin</NLi>
					<NLi><b>developer</b> - access to certain dev resources</NLi>
					<NLi><b>user</b> - regular user</NLi>
					<NLi><b>blocked</b> - banned user</NLi>
				</NUl>
			</NCollapseItem>
		</NCollapse>
		<NFlex class="mlb-2">
			<NButton @click="openCreateRoleModal"><template #icon>
					<Icon name="add" />
				</template>Create</NButton>
		</NFlex>
		<NDataTable :columns="columns" :data="rbacRole" :pagination="false" :bordered="false" :resizable="true"
			:rowKey="row => row.roleName" />
		<NFlex justify="end" class="mbs-4">
			<NPagination :displayOrder='["quick-jumper", "pages", "size-picker"]' :pageCount="rbacRolePageCount"
				:page="pagination.page" :pageSize="pagination.pageSize" :pageSizes="pagination.pageSizes"
				:onUpdate:page="pagination.onChange" :onUpdate:pageSize="pagination.onUpdatePageSize" showQuickJumper
				showSizePicker />
		</NFlex>

		<NModal v-model:show="isShowDeleteRoleModal" :maskClosable="false" preset="dialog"
			:title="`Delete role ${currentDeletingRole}?`">
			<NFormItem label="Type the role name to confirm">
				<NInput v-model:value="userInputDeleteingRole" placeholder="Role name" />
			</NFormItem>
			<template #action>
				<NButton @click="closeDeleteRoleModal">Cancel</NButton>
				<NButton :disabled="currentDeletingRole !== userInputDeleteingRole" :loading="isDeletingRole"
					type="warning" :secondary="true" @click="fetchDeleteRbacRole(currentDeletingRole)">Confirm delete
				</NButton>
			</template>
		</NModal>

		<NModal class="is-[600px]" v-model:show="isShowCreateNewRoleModal" :maskClosable="false" preset="card"
			title="Create role">
			<NForm>
				<NFormItem label="Role name" :rule="{ required: true }">
					<NInput :status="!createRoleFormModal.roleName ? 'error' : 'success'"
						v-model:value="createRoleFormModal.roleName" placeholder="(Required) unique role name" />
				</NFormItem>
				<NFormItem label="Role type">
					<NInput v-model:value="createRoleFormModal.roleType"
						placeholder='Label for the role, e.g. "maintenance"' />
				</NFormItem>
				<NFormItem label="Display color">
					<NFlex vertical :size="0" class="is-full">
						<small class="n-form-item-label text-xs min-bs-0">A color helps distinguish roles</small>
						<NColorPicker v-model:value="createRoleFormModal.roleColor" :modes='["hex"]'
							:showAlpha="true" />
					</NFlex>
				</NFormItem>
				<NFormItem label="Description">
					<NInput v-model:value="createRoleFormModal.roleDescription" type="textarea"
						:autosize="{ minRows: 3 }" placeholder="Role details" />
				</NFormItem>
			</NForm>
			<template #footer>
				<NFlex class="justify-end">
					<NButton @click="closeCreateRoleModal">Cancel</NButton>
					<NButton :disabled="!createRoleFormModal?.roleName" :loading="isCreatingRole" type="primary"
						:secondary="true" @click="createRole">Create</NButton>
				</NFlex>
			</template>
		</NModal>

		<NModal class="is-[600px]" v-model:show="isShowEditRoleModal" :maskClosable="false" preset="card"
			title="Edit role API paths">
			<NForm>
				<NFormItem label="Role name">
					<NInput :disabled="true" v-model:value="updateApiPathPermissionsForRoleFormModal.roleName"
						placeholder="Role name" />
				</NFormItem>
				<NFormItem label="Accessible API paths">
					<NTransfer v-model:value="updateApiPathPermissionsForRoleFormModal.apiPathPermissions"
						:options="rbacApiPath?.map(apiPath => ({ label: apiPath.apiPath, value: apiPath.apiPath }))"
						:disabled="unableToEditRole" sourceFilterable targetFilterable />
				</NFormItem>
			</NForm>
			<template #footer>
				<NFlex class="justify-end">
					<NButton @click="closeEditRoleModal">Cancel</NButton>
					<NButton :disabled="!updateApiPathPermissionsForRoleFormModal.roleName" :loading="isEditingRole"
						type="primary" :secondary="true" @click="updateApiPathPermissionsForRole">Update role</NButton>
				</NFlex>
			</template>
		</NModal>
	</div>
</template>
