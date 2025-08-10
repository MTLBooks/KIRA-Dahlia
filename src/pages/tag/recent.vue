<script setup lang="tsx">
import { searchVideoTag } from "../../api/VideoTag/VideoTagController";
import type { VideoTag } from "../../api/VideoTag/VideoTagControllerDto";

const list = ref<VideoTag[]>([]);
const loading = ref(false);

function getDisplayName(tag: VideoTag): string {
  const en = tag.tagNameList.find(t => t.lang === 'en');
  const preferred = en?.tagName.find(n => n.isDefault) || en?.tagName[0];
  if (preferred?.name) return preferred.name;
  const anyLang = tag.tagNameList[0]?.tagName?.[0]?.name;
  return anyLang || `Tag #${tag.tagId}`;
}

const columns = [
  { title: 'ID', key: 'tagId' },
  { title: 'Name', key: 'name', render: (row: VideoTag) => getDisplayName(row) },
];

async function load() {
  loading.value = true;
  const res = await searchVideoTag("");
  if (res?.success && Array.isArray(res.result)) {
    // Best-effort: sort by tagId desc as a proxy for recent changes
    list.value = [...(res.result as VideoTag[])].sort((a, b) => b.tagId - a.tagId);
  }
  loading.value = false;
}

onMounted(() => load());
</script>

<template>
  <div class="container">
    <PageHeading>Tags - Recently Changed</PageHeading>
    <NDataTable :data="list" :columns="columns" :pagination="false" :bordered="false" />
  </div>
</template> 