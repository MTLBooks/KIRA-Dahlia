<script setup lang="tsx">
import { ref, computed, reactive, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chapterListByNovelUuid } from '../api/Chapter/ChapterController'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const novelUuid = ref(route.query.novelUuid as string || '')
const items = ref<any[]>([])
const totalCount = ref(0)
const loading = ref(false)

// Chapter modal state
const showChapterModal = ref(false)
const selectedChapter = ref<any>(null)
const editingChapter = ref(false)

// Chapter form
const chapterForm = ref({
  title: '',
  content: '',
  sequence: 0
})

const pagination = reactive({
  page: 1,
  pageSize: 50,
  showSizePicker: true,
  pageSizes: [20, 50, 100],
  onChange: async (page: number) => { pagination.page = page; await load() },
  onUpdatePageSize: async (pageSize: number) => { pagination.pageSize = pageSize; pagination.page = 1; await load() }
})

const pageCount = computed(() => Math.ceil(totalCount.value / pagination.pageSize) || 1)
const pageSlice = computed(() => items.value)

const columns = computed<DataTableColumns<any>>(() => [
  { title: '#', key: 'sequence', width: 80 },
  { title: 'Title', key: 'title', width: 300 },
  { title: 'Published', key: 'publishedAt', width: 200, render: (row) => new Date(row.publishedAt ?? Date.now()).toLocaleString() },
  { 
    title: 'Actions', 
    key: 'actions', 
    width: 200,
    render: (row) => (
      <div style="display: flex; gap: 8px;">
        <NButton size="small" onClick={() => moveChapter(row.chapterId, 'up')} disabled={row.sequence === 1} type="default">
          <Icon name="keyboardArrowUp" />
        </NButton>
        <NButton size="small" onClick={() => moveChapter(row.chapterId, 'down')} disabled={row.sequence === totalCount.value} type="default">
          <Icon name="keyboardArrowDown" />
        </NButton>
        <NButton size="small" onClick={() => openChapterModal(row)} type="primary">
          <Icon name="edit" />
        </NButton>
        <NButton size="small" onClick={() => deleteChapter(row.chapterId)} type="error">
          <Icon name="delete" />
        </NButton>
      </div>
    )
  }
])

async function load() {
  if (!novelUuid.value) {
    console.log('❌ No novelUuid, skipping load')
    return
  }
  
  console.log('🔄 Loading chapters for UUID:', novelUuid.value)
  
  try {
    loading.value = true
    const from = (pagination.page - 1) * pagination.pageSize
    const res = await chapterListByNovelUuid({ 
      novelUuid: novelUuid.value, 
      from, 
      size: pagination.pageSize 
    })
    
    console.log('📊 API response:', res)
    
    if (res?.success) {
      items.value = res.result?.items ?? []
      totalCount.value = res.result?.total ?? 0
      console.log('✅ Loaded chapters:', items.value.length, 'Total:', totalCount.value)
    } else {
      items.value = []
      totalCount.value = 0
      console.log('❌ API not successful:', res)
    }
  } catch (error) {
    console.error('❌ Failed to load chapters:', error)
    message.error('Failed to load chapters')
    items.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
    console.log('🏁 Loading finished, items:', items.value.length)
  }
}

function openChapterModal(chapter?: any) {
  if (chapter) {
    selectedChapter.value = chapter
    editingChapter.value = true
    chapterForm.value = {
      title: chapter.title,
      content: chapter.content || '',
      sequence: chapter.sequence
    }
  } else {
    selectedChapter.value = null
    editingChapter.value = false
    chapterForm.value = {
      title: '',
      content: '',
      sequence: items.value.length + 1
    }
  }
  showChapterModal.value = true
}

function saveChapter() {
  // TODO: Implement chapter save API
  message.success('Chapter saved successfully')
  selectedChapter.value = null
  chapterForm.value = { title: '', content: '', sequence: 0 }
  showChapterModal.value = false
}

function deleteChapter(chapterId: number) {
  if (confirm('Are you sure you want to delete this chapter?')) {
    // TODO: Implement chapter delete API
    console.log('🗑️ Deleting chapter:', chapterId)
    message.success('Chapter deleted successfully')
    load()
  }
}

function moveChapter(chapterId: number, direction: 'up' | 'down') {
  // TODO: Implement chapter reordering API
  console.log(`🔄 Moving chapter ${chapterId} ${direction}`)
  message.success('Chapter order updated')
  load()
}

function clearSearch() {
  novelUuid.value = ''
  items.value = []
  totalCount.value = 0
}

function onUuidInput(value: string) {
  if (value && value.length > 0) {
    novelUuid.value = value;
    load();
  }
}

// Watch for route changes to update novelUuid
watch(() => route.query.novelUuid, (newUuid) => {
  console.log('🔄 Route UUID changed:', newUuid)
  if (newUuid) {
    novelUuid.value = newUuid as string
    // Small delay to ensure the ref is updated before loading
    nextTick(() => {
      load()
    })
  }
}, { immediate: true })

onMounted(() => {
  console.log('🚀 Chapter page mounted')
  console.log('📱 Route query:', route.query)
  console.log('🔑 Novel UUID from route:', route.query.novelUuid)
  console.log('🔑 Novel UUID ref value:', novelUuid.value)
  
  // Check if we have a UUID in the route and load chapters
  const routeUuid = route.query.novelUuid as string
  if (routeUuid) {
    console.log('✅ Setting UUID from route and loading chapters:', routeUuid)
    novelUuid.value = routeUuid
    // Small delay to ensure the ref is updated before loading
    nextTick(() => {
      load()
    })
  }
})
</script>

<template>
  <div class="container">
    <div class="header">
      <NButton @click="router.back()" class="back-btn">
        <template #icon><Icon name="arrowBack" /></template>
        Back to Novels
      </NButton>
      <PageHeading>Chapter Management</PageHeading>
    </div>

    <!-- Manual UUID Search -->
    <NCard title="Search Chapters" class="mb-4">
      <NFlex align="center" gap="16">
        <NInput 
          v-model:value="novelUuid" 
          placeholder="Enter Novel UUID" 
          style="min-width: 400px"
          @keyup.enter="load"
          @input="onUuidInput"
        />
        <NButton @click="load" type="primary" :loading="loading">
          <template #icon><Icon name="search" /></template>
          Search Chapters
        </NButton>
        <NButton @click="clearSearch" type="default">
          <template #icon><Icon name="clear" /></template>
          Clear
        </NButton>
      </NFlex>
    </NCard>

    <div v-if="loading" class="loading">
      <NSpin size="large" />
      <p>Loading chapters...</p>
    </div>

    <div v-else-if="novelUuid && !loading" class="chapter-content">
      <!-- Novel Info -->
      <NCard title="Novel Information" class="mb-4">
        <NFlex gap="16" align="center">
          <div>
            <strong>Novel UUID:</strong> {{ novelUuid }}
          </div>
          <div>
            <strong>Total Chapters:</strong> {{ totalCount }}
          </div>
          <NButton @click="openChapterModal()" type="primary">
            <template #icon><Icon name="add" /></template>
            Add New Chapter
          </NButton>
        </NFlex>
      </NCard>

      <!-- Chapters List -->
      <NCard title="Chapters" class="mb-4">
        <div v-if="items.length === 0" class="empty-state">
          <NEmpty description="No chapters found for this novel" />
          <p>This novel has no chapters yet. Add the first chapter!</p>
          <NButton @click="openChapterModal()" type="primary" class="mt-4">
            <template #icon><Icon name="add" /></template>
            Add First Chapter
          </NButton>
        </div>
        
        <div v-else class="chapters-list">
          <NDataTable
            :columns="columns"
            :data="pageSlice"
            :pagination="false"
            :bordered="false"
            :rowKey="row => row.chapterId"
          />
          
          <!-- Pagination -->
          <NFlex justify="end" class="mt-4">
            <NPagination 
              :page="pagination.page" 
              :pageSize="pagination.pageSize" 
              :pageCount="pageCount"
              :pageSizes="pagination.pageSizes"
              :onUpdate:page="pagination.onChange" 
              :onUpdate:pageSize="pagination.onUpdatePageSize" 
              showQuickJumper 
              showSizePicker 
            />
          </NFlex>
        </div>
      </NCard>
    </div>

    <!-- Chapter Edit Modal -->
    <NModal v-model:show="showChapterModal" preset="card" title="Chapter" style="width: 90%; max-width: 1000px;">
      <div class="chapter-edit-content">
        <NFlex vertical gap="16">
          <NFormItem label="Title">
            <NInput v-model:value="chapterForm.title" placeholder="Chapter title" />
          </NFormItem>
          <NFormItem label="Sequence">
            <NInputNumber v-model:value="chapterForm.sequence" placeholder="Chapter sequence" />
          </NFormItem>
          <NFormItem label="Content">
            <NInput type="textarea" v-model:value="chapterForm.content" placeholder="Chapter content" :rows="15" />
          </NFormItem>
          <NFlex gap="16">
            <NButton @click="saveChapter" type="primary">
              <template #icon><Icon name="save" /></template>
              {{ editingChapter ? 'Update' : 'Create' }} Chapter
            </NButton>
            <NButton @click="showChapterModal = false" type="default">
              Cancel
            </NButton>
          </NFlex>
        </NFlex>
      </div>
    </NModal>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.back-btn {
  margin-right: 16px;
}

.loading {
  text-align: center;
  padding: 48px;
}

.chapter-content {
  max-width: 1200px;
}

.chapters-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chapter-actions-row {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-top: 8px;
}

.mt-4 {
  margin-top: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}

.empty-state {
  text-align: center;
  padding: 48px;
  border-radius: 8px;
}

.chapter-edit-content {
  max-height: 70vh;
  overflow-y: auto;
}

/* Improve data table styling */
:deep(.n-data-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.n-data-table .n-data-table-td) {
  padding: 12px 16px;
}

:deep(.n-data-table .n-data-table-th) {
  font-weight: 600;
}

/* Improve card styling */
:deep(.n-card) {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Improve button spacing */
:deep(.n-button) {
  border-radius: 6px;
}

/* Improve input styling */
:deep(.n-input) {
  border-radius: 6px;
}

/* Improve pagination styling */
:deep(.n-pagination) {
  margin-top: 16px;
}
</style> 