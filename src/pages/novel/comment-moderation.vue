<script setup lang="tsx">
import { ref, computed, onMounted } from 'vue'
import { novelListComments, novelDeleteComment, novelRestoreComment } from '../../api/Novel/NovelController'

const message = useMessage()
const items = ref<any[]>([])
const loading = ref(false)
const novelId = ref<number | null>(null)
const includeDeleted = ref(false)

const pagination = reactive({
	page: 1,
	pageSize: 20,
	showSizePicker: true,
	pageSizes: [10, 20, 50, 100],
	onChange: async (page: number) => { pagination.page = page; await load() },
	onUpdatePageSize: async (pageSize: number) => { pagination.pageSize = pageSize; pagination.page = 1; await load() }
})
const totalCount = ref(0)
const pageCount = computed(() => Math.ceil(totalCount.value / pagination.pageSize) || 1)

const columns = computed<DataTableColumns<any>>(() => [
	{ title: 'ID', key: 'commentId', sorter: 'default' },
	{ title: 'Novel ID', key: 'novelId' },
	{ title: 'User ID', key: 'userId' },
	{ title: 'Content', key: 'content', render: (row) => row.content?.substring(0, 100) + (row.content?.length > 100 ? '...' : '') },
	{ title: 'Likes', key: 'upvoteCount' },
	{ title: 'Dislikes', key: 'downvoteCount' },
	{ title: 'Depth', key: 'depth' },
	{ title: 'Deleted', key: 'isDeleted', render: (row) => row.isDeleted ? 'Yes' : 'No' },
	{ title: 'Created', key: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleString() },
	{ title: 'Actions', key: 'actions', render: (row) => (
		<NSpace>
			{row.isDeleted ? (
				<NButton size="small" onClick={() => restoreComment(row.commentId)}>{{ icon: () => <Icon name="restore" /> }}</NButton>
			) : (
				<NButton size="small" onClick={() => deleteComment(row.commentId)}>{{ icon: () => <Icon name="delete" /> }}</NButton>
			)}
		</NSpace>
	) }
])

async function load() {
	if (loading.value) return
	loading.value = true
	try {
		const res = await novelListComments({
			novelId: novelId.value || undefined,
			page: pagination.page,
			pageSize: pagination.pageSize,
			includeDeleted: includeDeleted.value
		})
		items.value = res?.result?.items ?? []
		totalCount.value = res?.result?.total ?? 0
	} catch (error) {
		message.error('Failed to load comments')
		console.error(error)
	} finally {
		loading.value = false
	}
}

async function deleteComment(commentId: number) {
	try {
		await novelDeleteComment({ commentId })
		message.success('Comment deleted')
		await load()
	} catch (error) {
		message.error('Failed to delete comment')
		console.error(error)
	}
}

async function restoreComment(commentId: number) {
	try {
		await novelRestoreComment({ commentId })
		message.success('Comment restored')
		await load()
	} catch (error) {
		message.error('Failed to restore comment')
		console.error(error)
	}
}

onMounted(load)
</script>

<template>
	<div class="container">
		<PageHeading>Comment Moderation</PageHeading>
		<NSpace align="center" justify="space-between" class="mlb-4">
			<NFlex align="center">
				<NInputNumber v-model:value="novelId" placeholder="Novel ID (optional)" />
				<NCheckbox v-model:checked="includeDeleted">Include deleted</NCheckbox>
				<NButton :loading="loading" @click="load"><template #icon><Icon name="refresh" /></template>Load</NButton>
			</NFlex>
		</NSpace>

		<NDataTable :columns="columns" :data="items" :pagination="false" :bordered="false" :rowKey="row => row.commentId" :loading="loading" />
		<NFlex justify="end" class="mbs-4">
			<NPagination :displayOrder="['quick-jumper','pages','size-picker']" :pageCount="pageCount" :page="pagination.page" :pageSize="pagination.pageSize" :pageSizes="pagination.pageSizes" :onUpdate:page="pagination.onChange" :onUpdate:pageSize="pagination.onUpdatePageSize" showQuickJumper showSizePicker />
		</NFlex>
	</div>
</template> 