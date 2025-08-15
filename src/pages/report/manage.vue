<script setup lang="tsx">
import { ref, computed, onMounted, reactive } from "vue";
import {
	reportList,
	reportUpdateStatus,
} from "../../api/Report/ReportController";

const message = useMessage();
const items = ref<any[]>([]);
const loading = ref(false);
const statusFilter = ref<string | null>(null);

const pagination = reactive({
	page: 1,
	pageSize: 20,
	showSizePicker: true,
	pageSizes: [10, 20, 50, 100],
	onChange: async (page: number) => {
		pagination.page = page;
		await load();
	},
	onUpdatePageSize: async (pageSize: number) => {
		pagination.pageSize = pageSize;
		pagination.page = 1;
		await load();
	},
});
const totalCount = ref(0);
const pageCount = computed(
	() => Math.ceil(totalCount.value / pagination.pageSize) || 1,
);

const columns = computed<DataTableColumns<any>>(() => [
	{ title: "ID", key: "reportId" },
	{ title: "Type", key: "targetType" },
	{ title: "Target ID", key: "targetId" },
	{ title: "Category", key: "category" },
	{ title: "Status", key: "status" },
	{
		title: "Created",
		key: "createdAt",
		render: (row) => new Date(row.createdAt).toLocaleString(),
	},
	{
		title: "Actions",
		key: "actions",
		render: (row) => (
			<NSpace>
				<NButton
					size="small"
					onClick={() => changeStatus(row.reportId, "reviewing")}
				>
					Review
				</NButton>
				<NButton
					size="small"
					onClick={() => changeStatus(row.reportId, "resolved")}
				>
					Resolve
				</NButton>
				<NButton
					size="small"
					onClick={() => changeStatus(row.reportId, "dismissed")}
				>
					Dismiss
				</NButton>
			</NSpace>
		),
	},
]);

async function load() {
	if (loading.value) return;
	loading.value = true;
	try {
		const res = await reportList({
			page: pagination.page,
			pageSize: pagination.pageSize,
			status: statusFilter.value || undefined,
		});
		if (res.success) {
			items.value = res.result?.items ?? [];
			totalCount.value = res.result?.total ?? 0;
		} else {
			message.error("Failed to load reports");
		}
	} catch (error) {
		console.error("Error loading reports:", error);
		message.error("Failed to load reports");
	} finally {
		loading.value = false;
	}
}

async function changeStatus(
	reportId: number,
	status: "open" | "reviewing" | "resolved" | "dismissed",
) {
	try {
		const res = await reportUpdateStatus({ reportId, status });
		if (res.success) {
			message.success("Status updated");
			await load();
		} else {
			message.error("Failed to update status");
		}
	} catch (error) {
		console.error("Error updating status:", error);
		message.error("Failed to update status");
	}
}

onMounted(load);
</script>

<template>
	<div class="container">
		<PageHeading>Reports</PageHeading>
		<NSpace align="center" justify="space-between" class="mlb-4">
			<NFlex align="center">
				<NSelect
					v-model:value="statusFilter"
					:options="[
						{ label: 'All', value: '' },
						{ label: 'Open', value: 'open' },
						{ label: 'Reviewing', value: 'reviewing' },
						{ label: 'Resolved', value: 'resolved' },
						{ label: 'Dismissed', value: 'dismissed' },
					]"
					style="min-width: 200px"
				/>
				<NButton :loading="loading" @click="load"
					><template #icon><Icon name="refresh" /></template>Load</NButton
				>
			</NFlex>
		</NSpace>

		<NDataTable
			:columns="columns"
			:data="items"
			:pagination="false"
			:bordered="false"
			:rowKey="(row) => row.reportId"
		/>
		<NFlex justify="end" class="mbs-4">
			<NPagination
				:displayOrder="['quick-jumper', 'pages', 'size-picker']"
				:pageCount="pageCount"
				:page="pagination.page"
				:pageSize="pagination.pageSize"
				:pageSizes="pagination.pageSizes"
				:onUpdate:page="pagination.onChange"
				:onUpdate:pageSize="pagination.onUpdatePageSize"
				showQuickJumper
				showSizePicker
			/>
		</NFlex>
	</div>
</template>
