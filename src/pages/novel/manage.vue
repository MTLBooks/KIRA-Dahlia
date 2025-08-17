<script setup lang="tsx">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { searchNovels, deleteNovel, getNovel, updateNovel } from '../../api/Novel/NovelController'
import { useTaxonomyStore } from '../../stores/taxonomy'
import { getCoverUrl, getThumbnailUrl } from '../../utils/imageProvider'

const router = useRouter()
const message = useMessage()
const taxonomyStore = useTaxonomyStore()

const items = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const languageFilter = ref('')
const approvalFilter = ref('')
const tagFilter = ref<number | null>(null)
const genreFilter = ref<number | null>(null)

// Modal state
const showNovelModal = ref(false)
const selectedNovel = ref<any>(null)
const novelLoading = ref(false)
const novelUpdating = ref(false)

// Novel edit form
const novelEditForm = ref({
  title: '',
  description: '',
  status: '',
  language: '',
  source: '',
  approvalStatus: '',
  tagIds: [] as number[],
  genreIds: [] as number[],
  coverImg: ''
})



const pagination = reactive({
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
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

const sortField = ref('updatedAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

const statusOptions = [
  { label: 'All', value: '', type: 'option' },
  { label: 'Ongoing', value: 'ongoing', type: 'option' },
  { label: 'Completed', value: 'completed', type: 'option' },
  { label: 'Hiatus', value: 'hiatus', type: 'option' }
]

const languageOptions = [
  { label: 'All', value: '', type: 'option' },
  { label: 'English', value: 'en', type: 'option' },
  { label: 'Chinese', value: 'zh', type: 'option' },
  { label: 'Japanese', value: 'ja', type: 'option' },
  { label: 'Korean', value: 'ko', type: 'option' }
]

const approvalOptions = [
  { label: 'All', value: '', type: 'option' },
  { label: 'Pending', value: 'pending', type: 'option' },
  { label: 'Draft', value: 'draft', type: 'option' },
  { label: 'Under Review', value: 'under_review', type: 'option' },
  { label: 'Approved', value: 'approved', type: 'option' },
  { label: 'Rejected', value: 'rejected', type: 'option' },
  { label: 'Deleted', value: 'deleted', type: 'option' }
]

const approvalStatusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Deleted', value: 'deleted' },
  { label: 'Draft', value: 'draft' },
  { label: 'Under Review', value: 'under_review' }
]

const sortOptions = [
  { label: 'Recently Updated', value: 'updatedAt', type: 'option' },
  { label: 'Most Popular', value: 'upvoteCount', type: 'option' },
  { label: 'Most Favorited', value: 'favoritesCount', type: 'option' },
  { label: 'Most Viewed', value: 'views', type: 'option' },
  { label: 'Most Chapters', value: 'chaptersCount', type: 'option' },
  { label: 'Title A-Z', value: 'title', type: 'option' }
]

// Use store for tag and genre options
const tagOptions = computed(() => taxonomyStore.tagOptions)
const genreOptions = computed(() => taxonomyStore.genreOptions)
const tagsGenresLoading = computed(() => taxonomyStore.tagsLoading || taxonomyStore.genresLoading)

// Computed properties for current tag and genre names
const currentTagNames = computed(() => {
  return taxonomyStore.getTagNames(novelEditForm.value.tagIds).join(', ')
})

const currentGenreNames = computed(() => {
  return taxonomyStore.getGenreNames(novelEditForm.value.genreIds).join(', ')
})

const columns = computed<DataTableColumns<any>>(() => [
  { 
    title: 'ID', 
    key: 'novelId', 
    sorter: true,
    width: 80,
    render: (row: any) => (
      <a 
        href={`/novel/manage/${row.novelId}`}
        style="color: #18a058; text-decoration: underline; font-weight: bold; cursor: pointer;"
        onClick={(e) => {
          e.preventDefault()
          console.log('🆔 ID clicked:', row.novelId)
          viewNovel(row)
        }}
      >
        {row.novelId}
      </a>
    )
  },
  { 
    title: 'Title', 
    key: 'title', 
    sorter: 'default',
    render: (row) => (
      <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        {row.title}
      </div>
    )
  },
  { 
    title: 'Cover', 
    key: 'cover', 
    width: 80,
    render: (row) => {
      if (!row.coverImg) return 'N/A'
      return (
        <img 
          src={getThumbnailUrl(row.coverImg, 50)} 
          alt="Cover" 
          style="width: 50px; height: 70px; object-fit: cover; border-radius: 4px; border: 1px solid #eee;"
        />
      )
    }
  },
  { 
    title: 'Status', 
    key: 'status', 
    sorter: 'default',
    width: 100,
    render: (row) => {
      const statusColors: Record<string, 'success' | 'info' | 'warning'> = {
        ongoing: 'success',
        completed: 'info',
        hiatus: 'warning'
      }
      return <NTag type={statusColors[row.status as keyof typeof statusColors] || 'default'}>{row.status}</NTag>
    }
  },
  { 
    title: 'Language', 
    key: 'language', 
    sorter: 'default',
    width: 100
  },
  { 
    title: 'Views', 
    key: 'views', 
    sorter: 'default',
    width: 80,
    render: (row) => row.views?.toLocaleString() || '0'
  },
  { 
    title: 'Favorites', 
    key: 'favoritesCount', 
    sorter: 'default',
    width: 100,
    render: (row) => row.favoritesCount?.toLocaleString() || '0'
  },
  { 
    title: 'Chapters', 
    key: 'chaptersCount', 
    sorter: 'default',
    width: 100,
    render: (row) => row.chaptersCount?.toLocaleString() || '0'
  },
  { 
    title: 'Rating', 
    key: 'rating', 
    sorter: 'default',
    width: 120,
    render: (row) => {
      const total = (row.upvoteCount || 0) + (row.downvoteCount || 0)
      if (total === 0) return 'N/A'
      const percentage = Math.round(((row.upvoteCount || 0) / total) * 100)
      return `${percentage}% (${row.upvoteCount || 0}/${total})`
    }
  },
  { 
    title: 'Source', 
    key: 'source', 
    width: 100,
    render: (row) => {
      if (!row.source || row.source.length === 0) return 'N/A'
      return row.source.join(', ')
    }
  },
  { 
    title: 'Updated', 
    key: 'updatedAt', 
    sorter: 'default',
    width: 150,
    render: (row) => new Date(row.updatedAt).toLocaleDateString()
  },
  { 
    title: 'Actions', 
    key: 'actions', 
    width: 200,
    render: (row) => (
      <div style="display: flex; gap: 8px;">
        <NButton size="small" onClick={() => viewNovel(row)}>
          <Icon name="visibility" />
        </NButton>
        <NButton size="small" type="success" onClick={() => approveNovel(row)}>
          <Icon name="check" />
        </NButton>
        <NButton size="small" type="warning" onClick={() => rejectNovel(row)}>
          <Icon name="close" />
        </NButton>
        <NButton size="small" type="error" onClick={() => deleteNovelData(row)}>
          <Icon name="delete" />
        </NButton>
      </div>
    )
  }
])

async function load() {
  try {
    loading.value = true
    const params: any = {
      from: (pagination.page - 1) * pagination.pageSize,
      size: pagination.pageSize
    }

    if (searchQuery.value) params.q = searchQuery.value
    if (statusFilter.value) params.status = statusFilter.value
    if (languageFilter.value) params.language = languageFilter.value
    if (approvalFilter.value) params.approvalStatus = approvalFilter.value
    if (tagFilter.value) params.tagIds = [tagFilter.value]
    if (genreFilter.value) params.genreIds = [genreFilter.value]

    // Handle sorting
    if (sortField.value === 'upvoteCount' || sortField.value === 'favoritesCount' || sortField.value === 'views' || sortField.value === 'chaptersCount') {
      params.sort = 'popular'
    } else {
      params.sort = 'recent'
    }

    console.log('🔍 Search params:', params)
    const res = await searchNovels(params)
    console.log('📊 API response:', res)
    
    if (res?.success) {
      // Handle both array and object response formats
      if (Array.isArray(res.result)) {
        // Direct array response
        items.value = res.result
        total.value = res.result.length
      } else if (res.result?.items) {
        // Object with items and total
        items.value = res.result.items || []
        total.value = res.result.total || 0
      } else {
        // Fallback
        items.value = []
        total.value = 0
      }
      
      console.log('📝 Items loaded:', items.value.length)
      console.log('🔢 Total count:', total.value)
    } else {
      console.warn('⚠️ API response not successful:', res)
      items.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('❌ Failed to load novels:', error)
    message.error('Failed to load novels')
    items.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

async function search() {
  pagination.page = 1
  await load()
}

async function resetFilters() {
  searchQuery.value = ''
  statusFilter.value = ''
  languageFilter.value = ''
  approvalFilter.value = ''
  tagFilter.value = null
  genreFilter.value = null
  sortField.value = 'updatedAt'
  sortOrder.value = 'desc'
  pagination.page = 1
  await load()
}

function viewNovel(novel: any) {
  console.log('👁️ View novel clicked:', novel)
  selectedNovel.value = novel
  showNovelModal.value = true
  
  // Ensure tags and genres are loaded before loading novel details
  if (!taxonomyStore.isTagsCacheValid || !taxonomyStore.isGenresCacheValid) {
    console.log('🔄 Tags/genres not loaded, loading them first...')
    loadTagsAndGenres().then(() => {
      loadNovelDetails(novel.novelId)
    })
  } else {
    loadNovelDetails(novel.novelId)
  }
}

async function loadNovelDetails(novelId: number) {
  try {
    novelLoading.value = true
    const res = await getNovel(novelId)
    console.log('📖 Novel details response:', res)
    
    if (res?.success) {
      const novel = res.result
      console.log('📖 Novel data:', novel)
      console.log('🏷️ Novel tagIds:', novel.tagIds)
      console.log('🎭 Novel genreIds:', novel.genreIds)
      console.log('🏷️ Available tag options:', tagOptions.value)
      console.log('🎭 Available genre options:', genreOptions.value)
      
      novelEditForm.value = {
        title: novel.title || '',
        description: novel.description || '',
        status: novel.status || 'ongoing',
        language: novel.language || 'en',
        source: Array.isArray(novel.source) ? novel.source.join(', ') : '',
        approvalStatus: novel.approvalStatus || 'pending',
        tagIds: Array.isArray(novel.tagIds) ? novel.tagIds : [],
        genreIds: Array.isArray(novel.genreIds) ? novel.genreIds : [],
        coverImg: novel.coverImg || ''
      }
      
      console.log('📝 Form populated with:', novelEditForm.value)
    }
  } catch (error) {
    console.error('Failed to load novel details:', error)
    message.error('Failed to load novel details')
  } finally {
    novelLoading.value = false
  }
}

async function updateNovelData() {
  try {
    novelUpdating.value = true
    const sourceArray = novelEditForm.value.source
      .split(',')
      .map(s => s.trim())
      .filter(s => s)
      .map(s => Number(s))
      .filter(n => !isNaN(n))

    const res = await updateNovel({
      novelId: selectedNovel.value.novelId,
      title: novelEditForm.value.title,
      description: novelEditForm.value.description,
      status: novelEditForm.value.status,
      language: novelEditForm.value.language,
      source: sourceArray,
      approvalStatus: novelEditForm.value.approvalStatus,
      tagIds: novelEditForm.value.tagIds,
      genreIds: novelEditForm.value.genreIds,
      coverImg: novelEditForm.value.coverImg
    })

    if (res?.success) {
      message.success('Novel updated successfully')
      await load() // Refresh the list
      showNovelModal.value = false
    }
  } catch (error) {
    console.error('Failed to update novel:', error)
    message.error('Failed to update novel')
  } finally {
    novelUpdating.value = false
  }
}

function approveNovel(novel: any) {
  // TODO: Implement approval logic
  message.success(`Novel "${novel.title}" approved`)
}

function rejectNovel(novel: any) {
  // TODO: Implement rejection logic
  message.warning(`Novel "${novel.title}" rejected`)
}

async function deleteNovelData(novel: any) {
  if (!confirm(`Are you sure you want to delete "${novel.title}"? This action cannot be undone.`)) {
    return
  }

  try {
    await deleteNovel({ novelId: novel.novelId })
    message.success('Novel deleted successfully')
    await load()
  } catch (error) {
    console.error('Failed to delete novel:', error)
    message.error('Failed to delete novel')
  }
}

function handleSortChange(sorter: any) {
  if (sorter.key) {
    sortField.value = sorter.key
    sortOrder.value = sorter.order === 'ascend' ? 'asc' : 'desc'
    load()
  }
}


function closeNovelModal() {
  showNovelModal.value = false
  selectedNovel.value = null
  novelEditForm.value = {
    title: '',
    description: '',
    status: '',
    language: '',
    source: '',
    approvalStatus: '',
    tagIds: [],
    genreIds: [],
    coverImg: ''
  }
}

async function loadTagsAndGenres() {
  try {
    console.log('🔄 Loading tags and genres...')
    // The taxonomyStore handles loading, so we just need to wait for it
    await taxonomyStore.loadAll()
    console.log('🏷️ Tags and genres loaded from store.')
  } catch (error) {
    console.error('❌ Failed to load tags and genres:', error)
  }
}

async function refreshTaxonomy() {
  try {
    console.log('🔄 Refreshing taxonomy data...')
    // Clear cache and reload from API
    taxonomyStore.clearCache()
    await taxonomyStore.loadAll()
    message.success('Tags and genres refreshed successfully')
  } catch (error) {
    console.error('❌ Failed to refresh taxonomy:', error)
    message.error('Failed to refresh tags and genres')
  }
}

onMounted(() => {
  console.log(' Component mounted, initializing taxonomy store...')
  
  // Initialize taxonomy store from localStorage first
  taxonomyStore.initFromStorage()
  
  // Load novels and taxonomy data
  load()
  loadTagsAndGenres()
})
</script>

<template>
  <div class="container">
    <PageHeading>Novel Management</PageHeading>

    <!-- Search and Filters -->
    <NCard title="Search & Filters" class="mb-4">
      <NFlex vertical gap="16">
        <NFlex gap="16" align="center">
          <NInput v-model:value="searchQuery" placeholder="Search novels..." style="min-width: 300px"
            @keyup.enter="search">
            <template #prefix>
              <Icon name="search" />
            </template>
          </NInput>
          <NButton @click="search" type="primary" :loading="loading">
            <template #icon>
              <Icon name="search" />
            </template>
            Search
          </NButton>
          <NButton @click="load" type="info" :loading="loading">
            <template #icon>
              <Icon name="refresh" />
            </template>
            Load All
          </NButton>
          <NButton @click="resetFilters" :disabled="loading">
            <template #icon><Icon name="refresh" /></template>
            Reset
          </NButton>
          <NButton @click="refreshTaxonomy" :disabled="tagsGenresLoading" type="info">
            <template #icon><Icon name="refresh" /></template>
            Refresh Tags/Genres
          </NButton>
        </NFlex>

        <NFlex align="center">
          <NFlex gap="16">
            <NSelect v-model:value="statusFilter" :options="statusOptions" placeholder="Filter by status"
              style="min-width: 150px; flex: 1" :disabled="loading" />
            <NSelect v-model:value="approvalFilter" :options="approvalOptions" placeholder="Filter by approval status"
              style="min-width: 150px; flex: 1" :disabled="loading" />
            <NSelect v-model:value="tagFilter" :options="tagOptions" placeholder="Filter by tag"
              style="min-width: 150px; flex: 1" :disabled="loading" clearable />
            <NSelect v-model:value="genreFilter" :options="genreOptions" placeholder="Filter by genre"
              style="min-width: 150px; flex: 1" :disabled="loading" clearable />
            <NSelect v-model:value="sortField" :options="sortOptions" placeholder="Sort by" 
              style="min-width: 150px; flex: 1" :disabled="loading" />
          </NFlex>
          <NButton @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
            :type="sortOrder === 'asc' ? 'primary' : 'default'" :disabled="loading">
            <template #icon>
              <Icon :name="sortOrder === 'asc' ? 'arrowUpward' : 'arrowDownward'" />
            </template>
            {{ sortOrder === 'asc' ? 'Ascending' : 'Descending' }}
          </NButton>
        </NFlex>
      </NFlex>
    </NCard>

    <!-- Data Table -->
    <NCard title="Novels" class="mb-4">
      <div v-if="loading" class="loading-container">
        <NSpin size="large" />
        <p>Loading novels...</p>
      </div>

      <NDataTable v-else :columns="columns" :data="items" :pagination="false" :bordered="false"
        :rowKey="row => row.novelId" :loading="loading" @update:sorter="handleSortChange" />
    </NCard>

    <!-- Pagination -->
    <NFlex justify="end" class="mt-4">
      <NPagination :page="pagination.page" :pageSize="pagination.pageSize"
        :pageCount="Math.ceil(total / pagination.pageSize)" :pageSizes="pagination.pageSizes"
        :onUpdate:page="pagination.onChange" :onUpdate:pageSize="pagination.onUpdatePageSize" showQuickJumper
        showSizePicker />
    </NFlex>

    <!-- Novel Edit Modal -->
    <NModal v-model:show="showNovelModal" preset="card" title="Edit Novel" style="width: 95%; max-width: 1400px;">
      <div v-if="novelLoading" class="loading-container">
        <NSpin size="large" />
        <p>Loading novel details...</p>
      </div>

      <div v-else-if="selectedNovel" class="novel-edit-content">
        <!-- Header with Novel ID and Title -->
        <div class="modal-header">
          <h3 class="novel-title">{{ selectedNovel.title }}</h3>
          <div class="novel-meta">
            <NTag type="info" size="small">ID: {{ selectedNovel.novelId }}</NTag>
            <NTag type="success" size="small">{{ selectedNovel.status }}</NTag>
            <NTag type="warning" size="small">{{ selectedNovel.language }}</NTag>
          </div>
        </div>

        <!-- Tab Navigation -->
        <NTabs type="line" class="edit-tabs">
          <!-- Basic Information Tab -->
          <NTabPane name="basic" tab="Basic Information">
            <div class="tab-content">
              <NFlex gap="24" vertical>
                <!-- Title & Description -->
                <NCard title="Content" size="small">
                  <NFlex vertical gap="16">
                    <NFormItem label="Title" required>
                      <NInput v-model:value="novelEditForm.title" placeholder="Novel title" />
                    </NFormItem>
                    <NFormItem label="Description">
                      <NInput type="textarea" v-model:value="novelEditForm.description" placeholder="Novel description" :rows="4" />
                    </NFormItem>
                  </NFlex>
                </NCard>

                <!-- Status & Language -->
                <NCard title="Status & Language" size="small">
                  <NFlex gap="16">
                    <NFormItem label="Status" style="flex: 1">
                      <NSelect v-model:value="novelEditForm.status" :options="statusOptions" />
                    </NFormItem>
                    <NFormItem label="Language" style="flex: 1">
                      <NSelect v-model:value="novelEditForm.language" :options="languageOptions" />
                    </NFormItem>
                  </NFlex>
                </NCard>

                <!-- Source & Approval -->
                <NCard title="Source & Approval" size="small">
                  <NFlex gap="16">
                    <NFormItem label="Source IDs (comma-separated)" style="flex: 1">
                      <NInput v-model:value="novelEditForm.source" placeholder="1, 2, 3" />
                      <div class="field-help">Enter source IDs separated by commas</div>
                    </NFormItem>
                    <NFormItem label="Approval Status" style="flex: 1">
                      <NSelect v-model:value="novelEditForm.approvalStatus" :options="approvalStatusOptions" />
                    </NFormItem>
                  </NFlex>
                </NCard>
              </NFlex>
            </div>
          </NTabPane>

          <!-- Tags & Genres Tab -->
          <NTabPane name="taxonomy" tab="Tags & Genres">
            <div class="tab-content">
              <div v-if="tagsGenresLoading" class="loading-options">
                <NSpin size="large" />
                <span>Loading tags and genres (this may take a moment for 2000+ entries)...</span>
              </div>
              <div v-else-if="tagOptions.length === 0 || genreOptions.length === 0" class="no-options">
                <NEmpty description="No tags or genres available" />
              </div>
              <NFlex v-else gap="24" vertical>
                <!-- Tags Selection -->
                <NCard title="Tags" size="small">
                  <NFormItem label="Select Tags">
                    <NSelect 
                      v-model:value="novelEditForm.tagIds" 
                      multiple 
                      :options="tagOptions" 
                      placeholder="Select tags (search from 2000+ tags)"
                      filterable
                      remote
                      :loading="tagsGenresLoading"
                      style="width: 100%"
                    />
                    <div v-if="novelEditForm.tagIds.length > 0" class="selection-info">
                      <NTag type="info" size="small">{{ novelEditForm.tagIds.length }} tags selected</NTag>
                    </div>
                  </NFormItem>
                </NCard>

                <!-- Genres Selection -->
                <NCard title="Genres" size="small">
                  <NFormItem label="Select Genres">
                    <NSelect 
                      v-model:value="novelEditForm.genreIds" 
                      multiple 
                      :options="genreOptions" 
                      placeholder="Select genres (search from 2000+ genres)"
                      filterable
                      remote
                      :loading="tagsGenresLoading"
                      style="width: 100%"
                    />
                    <div v-if="novelEditForm.genreIds.length > 0" class="selection-info">
                      <NTag type="info" size="small">{{ novelEditForm.genreIds.length }} genres selected</NTag>
                    </div>
                  </NFormItem>
                </NCard>
              </NFlex>
            </div>
          </NTabPane>

          <!-- Cover Image Tab -->
          <NTabPane name="cover" tab="Cover Image">
            <div class="tab-content">
              <NCard title="Cover Image" size="small">
                <NFlex gap="24" align="start">
                  <div style="flex: 1;">
                    <NFormItem label="Cover Image Filename" required>
                      <NInput v-model:value="novelEditForm.coverImg" placeholder="s28330054.jpg" />
                      <div class="field-help">Enter the image filename (e.g., s28330054.jpg)</div>
                    </NFormItem>
                  </div>
                  <div v-if="novelEditForm.coverImg" class="cover-preview">
                    <img :src="getCoverUrl(novelEditForm.coverImg, { width: 200, height: 300 })" alt="Novel Cover"
                      style="max-width: 200px; height: auto; border: 2px solid #eee; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
                      @error="novelEditForm.coverImg = ''" />
                  </div>
                </NFlex>
              </NCard>
            </div>
          </NTabPane>

          <!-- Statistics Tab -->
          <NTabPane name="stats" tab="Statistics">
            <div class="tab-content">
              <NCard title="Novel Statistics" size="small">
                <div class="stats-grid">
                  <div class="stat-card">
                    <div class="stat-icon">👁️</div>
                    <div class="stat-label">Views</div>
                    <div class="stat-value">{{ selectedNovel.views?.toLocaleString() || '0' }}</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">❤️</div>
                    <div class="stat-label">Favorites</div>
                    <div class="stat-value">{{ selectedNovel.favoritesCount?.toLocaleString() || '0' }}</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">📚</div>
                    <div class="stat-label">Chapters</div>
                    <div class="stat-value">{{ selectedNovel.chaptersCount?.toLocaleString() || '0' }}</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-label">Rating</div>
                    <div class="stat-value">
                      {{ selectedNovel.upvoteCount || '0' }}/{{ selectedNovel.downvoteCount || '0' }}
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">📅</div>
                    <div class="stat-label">Created</div>
                    <div class="stat-value">{{ new Date(selectedNovel.createdAt).toLocaleDateString() }}</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">🔄</div>
                    <div class="stat-label">Updated</div>
                    <div class="stat-value">{{ new Date(selectedNovel.updatedAt).toLocaleDateString() }}</div>
                  </div>
                </div>
              </NCard>
            </div>
          </NTabPane>
        </NTabs>

        <!-- Action Buttons -->
        <div class="modal-actions">
          <NFlex gap="16" align="center" justify="space-between">
            <div class="action-left">
              <NButton @click="router.push(`/chapter?novelUuid=${selectedNovel.uuid}`)" type="info" size="large">
                <template #icon>
                  <Icon name="article" />
                </template>
                Manage Chapters
              </NButton>
            </div>
            <div class="action-right">
              <NButton @click="closeNovelModal" size="large">
                <template #icon>
                  <Icon name="close" />
                </template>
                Cancel
              </NButton>
              <NButton @click="updateNovelData" :loading="novelUpdating" type="primary" size="large">
                <template #icon>
                  <Icon name="save" />
                </template>
                Save Changes
              </NButton>
            </div>
          </NFlex>
        </div>
      </div>
    </NModal>
  </div>
</template>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #666;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #999;
}

.empty-text {
  margin-top: 10px;
  font-size: 0.9em;
}

.debug-data {
  margin-top: 20px;
  text-align: left;
  max-width: 100%;
  overflow-x: auto;
}

.debug-data h4 {
  margin-bottom: 10px;
  color: #666;
}

.debug-data pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.novel-edit-content {
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.novel-title {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
}

.novel-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.edit-tabs {
  margin-bottom: 24px;
}

.tab-content {
  padding: 16px 0;
  min-height: 300px;
}

.field-help {
  margin-top: 4px;
  color: #6b7280;
  font-size: 12px;
  font-style: italic;
}

.selection-info {
  margin-top: 8px;
}

.current-selection {
  margin-top: 4px;
  color: #6b7280;
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.stat-card {
  text-align: center;
  padding: 20px 16px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}

.modal-actions {
  margin-top: 24px;
  padding-top: 20px;
  margin: 24px -24px -24px -24px;
  padding: 20px 24px;
}

.action-left {
  display: flex;
  gap: 12px;
}

.action-right {
  display: flex;
  gap: 12px;
}

.cover-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.cover-preview img {
  transition: transform 0.2s ease;
}

.cover-preview img:hover {
  transform: scale(1.05);
}
</style> 