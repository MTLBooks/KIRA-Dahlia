<script setup lang="tsx">
import { ref, computed, onMounted } from 'vue'
import { tagList, tagCreate, tagUpdate } from '../../api/Taxonomy/NovelTaxonomyController'

const message = useMessage()
const items = ref<any[]>([])
const total = ref(0)
const name = ref('')
const description = ref('')
const color = ref('#999999')

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
	{ title: 'ID', key: 'tagId', sorter: 'default' },
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
		const res = await tagList(pagination.page, pagination.pageSize)
		if (res?.success) {
			items.value = res.result.items || []
			total.value = res.result.total || 0
		}
	} catch (error) {
		console.error('Failed to load tags:', error)
		message.error('Failed to load tags')
	}
}

async function createTagQuick() {
	if (!name.value) return
	
	try {
		await tagCreate({ 
			name: name.value, 
			description: description.value || undefined,
			color: color.value || undefined
		})
		message.success('Tag created successfully')
		name.value = ''
		description.value = ''
		color.value = '#999999'
		await load()
	} catch (error) {
		console.error('Failed to create tag:', error)
		message.error('Failed to create tag')
	}
}

function openEdit(row: any) {
	currentItem.value = row
	editForm.value = {
		name: row.names?.en || '',
		description: row.description || '',
		color: row.color || '#999999'
	}
	isShowEditModal.value = true
}

async function updateTag() {
	if (!currentItem.value || !editForm.value.name) return
	
	isUpdating.value = true
	try {
		await tagUpdate({
			tagId: currentItem.value.tagId,
			name: editForm.value.name,
			description: editForm.value.description || undefined,
			color: editForm.value.color || undefined
		})
		message.success('Tag updated successfully')
		isShowEditModal.value = false
		await load()
	} catch (error) {
		console.error('Failed to update tag:', error)
		message.error('Failed to update tag')
	} finally {
		isUpdating.value = false
	}
}

onMounted(load)
</script>

<template>
	<div class="container">
		<PageHeading>Tags</PageHeading>
		
		<!-- Create Form -->
		<NCard title="Create New Tag" class="mlb-4">
			<NFlex align="center" gap="12">
				<NInput v-model:value="name" placeholder="Tag name" style="min-width: 200px" />
				<NInput v-model:value="description" placeholder="Description (optional)" style="min-width: 300px" />
				<NInput v-model:value="color" placeholder="Color" style="width: 100px" />
				<NButton @click="createTagQuick" :disabled="!name">
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
			:rowKey="row => row.tagId" 
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
		<NModal class="is-[600px]" v-model:show="isShowEditModal" :maskClosable="false" preset="card" title="Edit Tag">
			<NForm>
				<NFormItem label="ID">
					<NInput :value="currentItem?.tagId" disabled />
				</NFormItem>
				<NFormItem label="Name" :rule="{ required: true }">
					<NInput v-model:value="editForm.name" placeholder="Tag name" />
				</NFormItem>
				<NFormItem label="Description">
					<NInput v-model:value="editForm.description" placeholder="Tag description" />
				</NFormItem>
				<NFormItem label="Color">
					<NInput v-model:value="editForm.color" placeholder="Color hex code" />
				</NFormItem>
			</NForm>
			<template #footer>
				<NFlex class="justify-end">
					<NButton @click="isShowEditModal=false">Cancel</NButton>
					<NButton :disabled="!editForm.name" :loading="isUpdating" type="primary" @click="updateTag">Update</NButton>
				</NFlex>
			</template>
		</NModal>
	</div>
</template> 