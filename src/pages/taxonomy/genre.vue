<script setup lang="tsx">
import { ref, computed, onMounted } from 'vue'
import { genreList, genreCreate, genreUpdate } from '../../api/Taxonomy/NovelTaxonomyController'

const message = useMessage()
const items = ref<any[]>([])
const total = ref(0)
const name = ref('')
const description = ref('')
const color = ref('#6666ff')

const isShowEditModal = ref(false)
const isUpdating = ref(false)
const currentItem = ref<any>(null)
const editForm = ref({
	name: '',
	description: '',
	color: ''
})

const pagination = reactive({
	page: 1,
	pageSize: 50,
	showSizePicker: true,
	pageSizes: [20, 50, 100],
	onChange: async (page: number) => { 
		pagination.page = page 
		await load()
	},
	onUpdatePageSize: async (pageSize: number) => { 
		pagination.pageSize = pageSize
		pagination.page = 1
		await load()
	}
})

const columns = computed<DataTableColumns<any>>(() => [
	{ title: 'ID', key: 'genreId', sorter: 'default' },
	{ title: 'Name', key: 'names.en', render: (row) => row.names?.en || row.slug },
	{ title: 'Slug', key: 'slug' },
	{ title: 'Color', key: 'color', render: (row) => (
		<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
			<div style={{ width: '16px', height: '16px', backgroundColor: row.color, borderRadius: '2px' }}></div>
			{row.color}
		</div>
	) },
	{ title: 'Description', key: 'description', ellipsis: true },
	{ title: 'Updated', key: 'updatedAt', render: (row) => new Date(row.updatedAt).toLocaleString() },
	{ title: 'Actions', key: 'actions', render: (row) => (
		<NButton size="small" onClick={() => openEdit(row)}>{{ icon: () => <Icon name="edit" /> }}</NButton>
	) }
])

async function load() {
	try {
		const res = await genreList(pagination.page, pagination.pageSize)
		if (res?.success) {
			items.value = res.result.items || []
			total.value = res.result.total || 0
		}
	} catch (error) {
		console.error('Failed to load genres:', error)
		message.error('Failed to load genres')
	}
}

async function createGenreQuick() {
	if (!name.value) return
	
	try {
		await genreCreate({ 
			name: name.value, 
			description: description.value || undefined,
			color: color.value || undefined
		})
		message.success('Genre created successfully')
		name.value = ''
		description.value = ''
		color.value = '#6666ff'
		await load()
	} catch (error) {
		console.error('Failed to create genre:', error)
		message.error('Failed to create genre')
	}
}

function openEdit(row: any) {
	currentItem.value = row
	editForm.value = {
		name: row.names?.en || '',
		description: row.description || '',
		color: row.color || '#6666ff'
	}
	isShowEditModal.value = true
}

async function updateGenre() {
	if (!currentItem.value || !editForm.value.name) return
	
	isUpdating.value = true
	try {
		await genreUpdate({
			genreId: currentItem.value.genreId,
			name: editForm.value.name,
			description: editForm.value.description || undefined,
			color: editForm.value.color || undefined
		})
		message.success('Genre updated successfully')
		isShowEditModal.value = false
		await load()
	} catch (error) {
		console.error('Failed to update genre:', error)
		message.error('Failed to update genre')
	} finally {
		isUpdating.value = false
	}
}

onMounted(load)
</script>

<template>
	<div class="container">
		<PageHeading>Genres</PageHeading>
		
		<!-- Create Form -->
		<NCard title="Create New Genre" class="mlb-4">
			<NFlex align="center" gap="12">
				<NInput v-model:value="name" placeholder="Genre name" style="min-width: 200px" />
				<NInput v-model:value="description" placeholder="Description (optional)" style="min-width: 300px" />
				<NInput v-model:value="color" placeholder="Color" style="width: 100px" />
				<NButton @click="createGenreQuick" :disabled="!name">
					<template #icon><Icon name="add" /></template>Create
				</NButton>
			</NFlex>
		</NCard>

		<!-- Data Table -->
		<NDataTable 
			:columns="columns" 
			:data="items" 
			:pagination="false" 
			:bordered="false" 
			:rowKey="row => row.genreId" 
		/>
		
		<!-- Pagination -->
		<NFlex justify="end" class="mts-4">
			<NPagination 
				:page="pagination.page" 
				:pageSize="pagination.pageSize" 
				:pageCount="Math.ceil(total / pagination.pageSize)"
				:pageSizes="pagination.pageSizes"
				:onUpdate:page="pagination.onChange" 
				:onUpdate:pageSize="pagination.onUpdatePageSize" 
				showQuickJumper 
				showSizePicker 
			/>
		</NFlex>

		<!-- Edit Modal -->
		<NModal class="is-[600px]" v-model:show="isShowEditModal" :maskClosable="false" preset="card" title="Edit Genre">
			<NForm>
				<NFormItem label="ID">
					<NInput :value="currentItem?.genreId" disabled />
				</NFormItem>
				<NFormItem label="Name" :rule="{ required: true }">
					<NInput v-model:value="editForm.name" placeholder="Genre name" />
				</NFormItem>
				<NFormItem label="Description">
					<NInput v-model:value="editForm.description" placeholder="Genre description" />
				</NFormItem>
				<NFormItem label="Color">
					<NInput v-model:value="editForm.color" placeholder="Color hex code" />
				</NFormItem>
			</NForm>
			<template #footer>
				<NFlex class="justify-end">
					<NButton @click="isShowEditModal=false">Cancel</NButton>
					<NButton :disabled="!editForm.name" :loading="isUpdating" type="primary" @click="updateGenre">Update</NButton>
				</NFlex>
			</template>
		</NModal>
	</div>
</template> 