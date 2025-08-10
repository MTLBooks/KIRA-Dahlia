<script setup lang="tsx">
const dialog = useDialog();

type RbacApiPath = GetRbacApiPathResponseDto["result"];

const isShowCreateNewApiPathModal = ref(false);
const isCreatingApiPath = ref(false);
const EMPTY_API_PATH_DATA = {
	apiPath: "",
	apiPathType: "",
	apiPathColor: "",
	apiPathDescription: "",
};
const createNewApiPathModal = ref<CreateRbacApiPathRequestDto>({ ...EMPTY_API_PATH_DATA });

const isShowDeleteApiPathModal = ref(false);
const isDeletingApiPath = ref(false);
const currentDeletingApiPath = ref("");
const userInputDeleteingApiPath = ref("");

const columns: DataTableColumns<NonNullable<RbacApiPath>[number]> = [
	{
		title: "API Path",
		key: "apiPath",
		render: row => {
			const color = row.isAssignedOnce && row.apiPathColor || "#EEEEEEFF";
			return <NTag color={{ color, textColor: getContrastiveColor(color) }}>{row.apiPath}</NTag>;
		},
	},
	{
		title: "Assigned to at least one role",
		key: "isAssignedOnce",
		render: row => <div id={`${row.apiPath}-isAssignedOnce-col`}><Icon name={row.isAssignedOnce ? "check" : "close"} /></div>,
	},
	{
		title: "Type",
		key: "apiPathType",
	},
	{
		title: "Display color",
		key: "apiPathColor",
	},
	{
		title: "Description",
		key: "apiPathDescription",
	},
	{
		title: "Actions",
		key: "actions",
		render: row => <NButton strong secondary size="small" type="error" onClick={() => openDeleteApiPathModal(row.apiPath ?? "")}>{{ icon: <Icon name="delete" /> }}</NButton>,
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
 * Fetch RBAC API paths
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
		console.error("ERROR", "Failed to fetch RBAC API paths.");
}

/**
 * Open the delete modal and set current deleting API path name
 * @param apiPathName current API path name to delete
 */
function openDeleteApiPathModal(apiPahtName: string) {
	currentDeletingApiPath.value = apiPahtName;
	isShowDeleteApiPathModal.value = true;
}

/**
 * Close delete modal and clear current deleting API path name
 */
function closeDeleteApiPathModal() {
	isShowDeleteApiPathModal.value = false;
	currentDeletingApiPath.value = "";
}

/**
 * Delete an RBAC API path
 * @param apiPath API path name
 */
async function deleteApiPath(apiPath: string) {
	const deleteRbacApiPathRequest: DeleteRbacApiPathRequestDto = {
		apiPath,
	};

	const deleteRbacApiPathResult = await deleteRbacApiPathController(deleteRbacApiPathRequest);

	if (!deleteRbacApiPathResult.success || deleteRbacApiPathResult.isAssigned)
		dialog.error({
			title: "Failed to delete RBAC API path",
			content: deleteRbacApiPathResult.message,
			positiveText: "OK",
		});
	else
		closeDeleteApiPathModal();

	await fetchRbacApiPath();
	isDeletingApiPath.value = false;
}

/**
 * Clear form and open create API path modal
 */
function openCreateApiPathModal() {
	createNewApiPathModal.value = { ...EMPTY_API_PATH_DATA };
	isShowCreateNewApiPathModal.value = true;
}

/**
 * Close create modal and clear form
 */
function closeCreateApiPathModal() {
	isShowCreateNewApiPathModal.value = false;
	createNewApiPathModal.value = { ...EMPTY_API_PATH_DATA };
}

/**
 * Submit form to create API path
 */
async function createApiPath() {
	if (!createNewApiPathModal.value.apiPath) {
		console.error("ERROR", "Create API path failed: invalid data");
		return;
	}
	isCreatingApiPath.value = true;
	const createRbacApiPathResult = await createRbacApiPathController(createNewApiPathModal.value);

	await fetchRbacApiPath();
	if (createRbacApiPathResult.success)
		closeCreateApiPathModal();
	else
		dialog.error({
			title: "Failed to create API path",
			content: createRbacApiPathResult.message,
			positiveText: "OK",
		});

	isCreatingApiPath.value = false;
}
onMounted(fetchRbacApiPath);
</script>

<template>
	<div class="container">
		<PageHeading>KIRAKIRA RBAC API Path Management</PageHeading>
		<NCollapse class="mlb-4">
			<NCollapseItem title="Instructions">
				<NP>The minimum unit of KIRAKIRA RBAC permission control is the API path.</NP>
				<NUl>
					<NLi>One user can have multiple roles</NLi>
					<NLi>One role can be assigned to multiple users</NLi>
					<NLi>One role can have access to multiple API paths</NLi>
					<NLi>One API path can belong to multiple roles</NLi>
				</NUl>
				<NP>
					You can add a new API path, provided the backend controller is RBAC-protected; otherwise adding is
					ineffective.<br />
					You can delete an API path if it is not bound to any role.
				</NP>
				<NP>Unassigned API paths are gray; assigned ones use their configured color.</NP>
			</NCollapseItem>
		</NCollapse>
		<NFlex class="mlb-2">
			<NButton @click="openCreateApiPathModal"><template #icon>
					<Icon name="add" />
				</template>Create</NButton>
		</NFlex>
		<NDataTable :columns="columns" :data="rbacApiPath" :pagination="false" :bordered="false"
			:rowKey="row => row.apiPath" />
		<NFlex justify="end" class="mbs-4">
			<NPagination :displayOrder='["quick-jumper", "pages", "size-picker"]' :pageCount="rbacApiPathPageCount"
				:page="pagination.page" :pageSize="pagination.pageSize" :pageSizes="pagination.pageSizes"
				:onUpdate:page="pagination.onChange" :onUpdate:pageSize="pagination.onUpdatePageSize" showQuickJumper
				showSizePicker />
		</NFlex>

		<NModal class="is-[600px]" v-model:show="isShowCreateNewApiPathModal" :maskClosable="false" preset="card"
			title="Create API Path">
			<NForm>
				<NFormItem label="API path name" :rule="{ required: true }">
					<NInput :status="!createNewApiPathModal.apiPath ? 'error' : 'success'"
						v-model:value="createNewApiPathModal.apiPath"
						placeholder="(Required) unique short path, e.g. /02/koa/hello" />
				</NFormItem>
				<NFormItem label="Type">
					<NInput v-model:value="createNewApiPathModal.apiPathType"
						placeholder='Label for the path, e.g. "video"' />
				</NFormItem>
				<NFormItem label="Display color">
					<NFlex vertical :size="0" class="is-full">
						<small class="n-form-item-label text-xs min-bs-0">A color helps distinguish different
							paths</small>
						<NColorPicker v-model:value="createNewApiPathModal.apiPathColor" :modes='["hex"]'
							:showAlpha="true" />
					</NFlex>
				</NFormItem>
				<NFormItem label="Description">
					<NInput v-model:value="createNewApiPathModal.apiPathDescription" type="textarea"
						:autosize="{ minRows: 3 }" placeholder="Details for this API path" />
				</NFormItem>
			</NForm>
			<template #footer>
				<NFlex class="justify-end">
					<NButton @click="closeCreateApiPathModal">Cancel</NButton>
					<NButton :disabled="!createNewApiPathModal.apiPath" :loading="isCreatingApiPath" type="primary"
						:secondary="true" @click="createApiPath">Create</NButton>
				</NFlex>
			</template>
		</NModal>

		<NModal v-model:show="isShowDeleteApiPathModal" :maskClosable="false" preset="dialog"
			:title="`Delete API path ${currentDeletingApiPath}?`">

			<NFormItem label="Type the API path name to confirm">
				<NInput v-model:value="userInputDeleteingApiPath" placeholder="API path name" />
			</NFormItem>

			<template #action>
				<NButton @click="closeDeleteApiPathModal">Cancel</NButton>
				<NButton :disabled="currentDeletingApiPath !== userInputDeleteingApiPath" :loading="isDeletingApiPath"
					type="warning" :secondary="true" @click="deleteApiPath(currentDeletingApiPath)">Confirm delete
				</NButton>
			</template>
		</NModal>
	</div>
</template>
