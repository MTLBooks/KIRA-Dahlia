<script setup lang="tsx">
import { searchVideoByKeyword, deleteVideoByKvid } from "../../api/Video/VideoController";

const keyword = ref("");
const list = ref<any[]>([]);
const loading = ref(false);

async function doDelete(videoId: number | string) {
  const res = await deleteVideoByKvid({ videoId });
  if (res?.success) await doSearch();
}

const columns = [
  { title: 'ID', key: 'videoId' },
  { title: 'Title', key: 'title' },
  {
    title: 'Actions', key: 'actions', render: (row: any) => (
      <NSpace>
        <NPopconfirm onPositiveClick={() => doDelete(row.videoId)}>
          {{
            trigger: () => <NButton size="small" type="error"><Icon name="delete" /></NButton>,
            default: () => 'Delete this video?'
          }}
        </NPopconfirm>
      </NSpace>
    )
  }
];

async function doSearch() {
  loading.value = true;
  const res = await searchVideoByKeyword(keyword.value || "");
  if (res?.success && Array.isArray(res.result)) list.value = res.result as any[];
  loading.value = false;
}

onMounted(() => doSearch());
</script>

<template>
  <div class="container">
    <PageHeading>Video Manage</PageHeading>
    <NSpace class="mb-4">
      <NInput v-model:value="keyword" placeholder="Keyword" />
      <NButton :loading="loading" @click="doSearch">Search</NButton>
    </NSpace>
    <NDataTable :data="list" :columns="columns" :pagination="false" :bordered="false" />
  </div>
</template> 