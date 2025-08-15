<script setup lang="tsx">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { novelSearch } from '../../api/Novel/NovelController'

const router = useRouter()
const q = ref('')
const items = ref<any[]>([])
const from = ref(0)
const size = ref(20)
const loading = ref(false)

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
	{ title: 'ID', key: 'novelId', sorter: 'default' },
	{ title: 'Title', key: 'title' },
	{ title: 'Favs', key: 'favoritesCount' },
	{ title: 'Likes', key: 'upvoteCount' },
	{ title: 'Updated', key: 'updatedAt', render: (row) => new Date(row.updatedAt ?? Date.now()).toLocaleString() },
	{ title: 'Actions', key: 'actions', render: (row) => (
		<NButton size="small" onClick={() => router.push(`/novel/manage/${row.novelId}`)}>{{ icon: () => <Icon name="openInNew" /> }}</NButton>
	) }
])

async function search(reset = true) {
	if (loading.value) return
	loading.value = true
	try {
		if (reset) { from.value = 0; items.value = [] }
		const res = await novelSearch({ q: q.value, from: from.value, size: size.value })
		const chunk = res?.result ?? res ?? []
		items.value = reset ? chunk : items.value.concat(chunk)
		from.value += size.value
	} finally {
		loading.value = false
	}
}
</script>

<template>
	<div class="container">
		<PageHeading>Novels</PageHeading>
		<NSpace align="center" justify="space-between" class="mlb-4">
			<NFlex align="center">
				<NInput v-model:value="q" placeholder="Search novels" />
				<NButton :loading="loading" @click="search(true)"><template #icon><Icon name="search" /></template>Search</NButton>
				<NButton :loading="loading" @click="search(false)"><template #icon><Icon name="unfoldMore" /></template>Load more</NButton>
			</NFlex>
		</NSpace>

		<NDataTable :columns="columns" :data="pageSlice" :pagination="false" :bordered="false" :rowKey="row => row.novelId" />
		<NFlex justify="end" class="mbs-4">
			<NPagination :displayOrder="['quick-jumper','pages','size-picker']" :pageCount="pageCount" :page="pagination.page" :pageSize="pagination.pageSize" :pageSizes="pagination.pageSizes" :onUpdate:page="pagination.onChange" :onUpdate:pageSize="pagination.onUpdatePageSize" showQuickJumper showSizePicker />
		</NFlex>
	</div>
</template> 