<script setup lang="tsx">
import { ref, computed, onMounted } from 'vue'
import { genreList, genreCreate, genreUpdate } from '../../api/Taxonomy/NovelTaxonomyController'

const message = useMessage()
const items = ref<any[]>([])
const name = ref('')

const isShowEditModal = ref(false)
const isUpdating = ref(false)
const currentItem = ref<any>(null)
const editForm = ref({
	slug: '',
	nameEn: ''
})

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
	{ title: 'ID', key: 'genreId', sorter: 'default' },
	{ title: 'Slug', key: 'slug' },
	{ title: 'Name (en)', key: 'names', render: (row) => row.names?.en ?? row.slug },
	{ title: 'Updated', key: 'updatedAt', render: (row) => new Date(row.updatedAt).toLocaleString() },
	{ title: 'Actions', key: 'actions', render: (row) => (
		<NButton size="small" onClick={() => openEdit(row)}>{{ icon: () => <Icon name="edit" /> }}</NButton>
	) }
])

async function load() {
	const res = await genreList()
	items.value = res?.result ?? []
}

async function createGenreQuick() {
	if (!name.value) return
	await genreCreate({ slug: name.value.toLowerCase().replace(/\s+/g,'-'), names: { en: name.value } })
	name.value = ''
	await load()
}

function openEdit(row: any) {
	currentItem.value = row
	editForm.value = {
		slug: row.slug,
		nameEn: row.names?.en || ''
	}
	isShowEditModal.value = true
}

async function updateGenre() {
	if (!currentItem.value || !editForm.value.slug || !editForm.value.nameEn) return
	
	isUpdating.value = true
	try {
		await genreUpdate({
			genreId: currentItem.value.genreId,
			slug: editForm.value.slug,
			names: { en: editForm.value.nameEn }
		})
		message.success('Genre updated successfully')
		isShowEditModal.value = false
		await load()
	} catch (error) {
		message.error('Failed to update genre')
		console.error(error)
	} finally {
		isUpdating.value = false
	}
}

onMounted(load)
</script>

<template>
	<div class="container">
		<PageHeading>Genres</PageHeading>
		<NSpace align="center" justify="space-between" class="mlb-4">
			<NFlex align="center">
				<NInput v-model:value="name" placeholder="New genre name" />
				<NButton @click="createGenreQuick"><template #icon><Icon name="add" /></template>Create</NButton>
			</NFlex>
		</NSpace>

		<NDataTable :columns="columns" :data="pageSlice" :pagination="false" :bordered="false" :rowKey="row => row.genreId" />
		<NFlex justify="end" class="mbs-4">
			<NPagination :displayOrder="['quick-jumper','pages','size-picker']" :pageCount="pageCount" :page="pagination.page" :pageSize="pagination.pageSize" :pageSizes="pagination.pageSizes" :onUpdate:page="pagination.onChange" :onUpdate:pageSize="pagination.onUpdatePageSize" showQuickJumper showSizePicker />
		</NFlex>

		<NModal class="is-[600px]" v-model:show="isShowEditModal" :maskClosable="false" preset="card" title="Edit Genre">
			<NForm>
				<NFormItem label="ID">
					<NInput :value="currentItem?.genreId" disabled />
				</NFormItem>
				<NFormItem label="Slug" :rule="{ required: true }">
					<NInput v-model:value="editForm.slug" placeholder="Genre slug" />
				</NFormItem>
				<NFormItem label="Name (English)" :rule="{ required: true }">
					<NInput v-model:value="editForm.nameEn" placeholder="Genre name in English" />
				</NFormItem>
			</NForm>
			<template #footer>
				<NFlex class="justify-end">
					<NButton @click="isShowEditModal=false">Cancel</NButton>
					<NButton :disabled="!editForm.slug || !editForm.nameEn" :loading="isUpdating" type="primary" @click="updateGenre">Update</NButton>
				</NFlex>
			</template>
		</NModal>
	</div>
</template> 