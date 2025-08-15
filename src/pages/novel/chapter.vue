<script setup lang="tsx">
import { ref, computed } from 'vue'
import { chapterListByNovelUuid } from '../../api/Chapter/ChapterController'

const novelUuid = ref('')
const items = ref<any[]>([])

const pagination = reactive({
	page: 1,
	pageSize: 50,
	showSizePicker: true,
	pageSizes: [20, 50, 100],
	onChange: async (page: number) => { pagination.page = page },
	onUpdatePageSize: async (pageSize: number) => { pagination.pageSize = pageSize; pagination.page = 1 }
})
const totalCount = ref(0)
const pageCount = computed(() => Math.ceil(totalCount.value / pagination.pageSize) || 1)
const pageSlice = computed(() => items.value)

const columns = computed<DataTableColumns<any>>(() => [
	{ title: '#', key: 'sequence' },
	{ title: 'Title', key: 'title' },
	{ title: 'Published', key: 'publishedAt', render: (row) => new Date(row.publishedAt ?? Date.now()).toLocaleString() }
])

async function load() {
	if (!novelUuid.value) return
	const from = (pagination.page - 1) * pagination.pageSize
	const res = await chapterListByNovelUuid({ novelUuid: novelUuid.value, from, size: pagination.pageSize })
	items.value = res?.result?.items ?? []
	totalCount.value = res?.result?.total ?? 0
}
</script>

<template>
	<div class="container">
		<PageHeading>Chapters</PageHeading>
		<NSpace align="center" justify="space-between" class="mlb-4">
			<NFlex align="center">
				<NInput v-model:value="novelUuid" placeholder="Novel UUID" />
				<NButton @click="load"><template #icon><Icon name="unfoldMore" /></template>Load</NButton>
			</NFlex>
		</NSpace>

		<NDataTable :columns="columns" :data="pageSlice" :pagination="false" :bordered="false" :rowKey="row => row.chapterId" />
		<NFlex justify="end" class="mbs-4">
			<NPagination :displayOrder="['quick-jumper','pages','size-picker']" :pageCount="pageCount" :page="pagination.page" :pageSize="pagination.pageSize" :pageSizes="pagination.pageSizes" :onUpdate:page="(p:number)=>{pagination.page=p;load()}" :onUpdate:pageSize="(s:number)=>{pagination.pageSize=s;pagination.page=1;load()}" showQuickJumper showSizePicker />
		</NFlex>
	</div>
</template> 