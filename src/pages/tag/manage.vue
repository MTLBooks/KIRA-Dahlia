<script setup lang="tsx">
import { searchVideoTag, createVideoTag } from "../../api/VideoTag/VideoTagController";
import type { VideoTag } from "../../api/VideoTag/VideoTagControllerDto";

const searchKey = ref("");
const newTagName = ref("");
const list = ref<VideoTag[]>([]);
const loading = ref(false);
const creating = ref(false);

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

async function doSearch() {
  loading.value = true;
  const res = await searchVideoTag(searchKey.value || "");
  if (res?.success && Array.isArray(res.result)) list.value = res.result as VideoTag[];
  loading.value = false;
}

async function doCreate() {
  if (!newTagName.value.trim()) return;
  creating.value = true;
  const payload = {
    tagNameList: [
      {
        lang: 'en',
        tagName: [
          { name: newTagName.value.trim(), isDefault: true, isOriginalTagName: true },
        ],
      },
    ],
  };
  const res = await createVideoTag(payload);
  creating.value = false;
  if (res?.success) {
    newTagName.value = "";
    await doSearch();
  }
}

onMounted(() => doSearch());
</script>

<template>
  <div class="container">
    <PageHeading>Tags - Manage</PageHeading>
    <NSpace class="mb-4">
      <NInput v-model:value="searchKey" placeholder="Search tag name" />
      <NButton :loading="loading" @click="doSearch">Search</NButton>
    </NSpace>

    <NCard title="Create New Tag" class="mb-4">
      <NSpace>
        <NInput v-model:value="newTagName" placeholder="New tag name (en)" />
        <NButton type="primary" :loading="creating" @click="doCreate">Create</NButton>
      </NSpace>
    </NCard>

    <NDataTable :data="list" :columns="columns" :pagination="false" :bordered="false" />
  </div>
</template> 