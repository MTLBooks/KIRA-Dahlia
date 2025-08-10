<script setup lang="tsx">
import { getPendingReviewVideo, approvePendingReviewVideo } from "../../api/Video/VideoController";

const list = ref<any[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(20);

async function approve(videoId: number | string) {
  const res = await approvePendingReviewVideo({ videoId });
  if (res?.success) await load();
}

const columns = [
  { title: 'ID', key: 'videoId' },
  { title: 'Title', key: 'title' },
  {
    title: 'Actions', key: 'actions', render: (row: any) => (
      <NSpace>
        <NButton size="small" type="success" onClick={() => approve(row.videoId)}><Icon name="check" /></NButton>
      </NSpace>
    )
  }
];

async function load() {
  loading.value = true;
  const res = await getPendingReviewVideo(page.value, pageSize.value);
  if (res?.success && Array.isArray(res.result)) list.value = res.result as any[];
  loading.value = false;
}

onMounted(() => load());
</script>

<template>
  <div class="container">
    <PageHeading>Pending Review</PageHeading>
    <NDataTable :data="list" :columns="columns" :pagination="false" :bordered="false" />
  </div>
</template> 