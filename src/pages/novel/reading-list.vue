<script setup lang="tsx">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { readingListMy, readingListCreate } from '../../api/ReadingList/ReadingListController'

const router = useRouter()
const items = ref<any[]>([])
const name = ref('')

const pagination = reactive({
	page: 1,
	pageSize: 20,
	showSizePicker: true,
	pageSizes: [10, 20, 50, 100],
	onChange: async (page: number) => { pagination.page = page },
	onUpdatePageSize: async (pageSize: number) => { pagination.pageSize = pageSize; pagination.page = 1 }
})
const totalCount = computed(() => items.value.length)
const pageCount = computed(() => Math.ceil(totalCount.value / pagination.pageSize) || 1)
const pageSlice = computed(() => {
	const start = (pagination.page - 1) * pagination.pageSize
	return items.value.slice(start, start + pagination.pageSize)
})

const columns = computed<DataTableColumns<any>>(() => [
	{ title: 'ID', key: 'listId', sorter: 'default' },
	{ title: 'Name', key: 'name' },
	{ title: 'Visibility', key: 'visibility' },
	{ title: 'Items', key: 'itemsCount' },
	{ title: 'Updated', key: 'updatedAt', render: (row) => new Date(row.updatedAt ?? Date.now()).toLocaleString() },
	{ title: 'Actions', key: 'actions', render: (row) => (
		<NButton size="small" onClick={() => router.push(`/novel/reading-list/${row.listId}`)}>{{ icon: () => <Icon name="openInNew" /> }}</NButton>
	) }
])

async function load() {
	const res = await readingListMy()
	items.value = res?.result ?? []
}

async function createList() {
	if (!name.value) return
	await readingListCreate({ name: name.value })
	name.value = ''
	await load()
}

onMounted(load)
</script>

<template>
	<div class="container">
		<PageHeading>Reading Lists</PageHeading>
		<NSpace align="center" justify="space-between" class="mlb-4">
			<NFlex align="center">
				<NInput v-model:value="name" placeholder="New list name" />
				<NButton @click="createList"><template #icon><Icon name="add" /></template>Create</NButton>
			</NFlex>
		</NSpace>

		<NDataTable :columns="columns" :data="pageSlice" :pagination="false" :bordered="false" :rowKey="row => row.listId" />
		<NFlex justify="end" class="mbs-4">
			<NPagination :displayOrder="['quick-jumper','pages','size-picker']" :pageCount="pageCount" :page="pagination.page" :pageSize="pagination.pageSize" :pageSizes="pagination.pageSizes" :onUpdate:page="pagination.onChange" :onUpdate:pageSize="pagination.onUpdatePageSize" showQuickJumper showSizePicker />
		</NFlex>
	</div>
</template> 