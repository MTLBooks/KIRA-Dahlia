<script setup lang="ts">
	import { NTag, NFlex, NButton } from "naive-ui";

	// 获取 Netlify 环境变量
	const branch = import.meta.env.VITE_NETLIFY_GIT_BRANCH
		|| import.meta.env.REACT_APP_NETLIFY_GIT_BRANCH
		|| "local";

	const commitRef = import.meta.env.VITE_NETLIFY_GIT_COMMIT_REF
		|| import.meta.env.REACT_APP_NETLIFY_GIT_COMMIT_REF
		|| "dev";

	const deployContext = import.meta.env.CONTEXT || "development";

	// 根据环境生成显示文本
	const envText = computed(() => {
		switch (deployContext) {
			case "production": return "Production";
			case "deploy-preview": return `PR Preview (${branch})`;
			case "branch-deploy": return `Branch Preview (${branch})`;
			default: return `Local Development (${branch})`;
		}
	});
</script>

<template>
	<div class="container">
		<Logo :width="400" />
		<div class="mlb-4">
			<NTag type="info">
				<template #icon>
					<Icon name="forkRight" />
				</template>
				{{ envText }}
				<n-text v-if="commitRef" depth="3" class="ml-1">
					#{{ commitRef.slice(0, 7) }}
				</n-text>
			</NTag>

			<NTooltip trigger="hover">
				<template #trigger>
					<NTag type="info" round class="ml-2">
						<Icon name="info" class="mr-1" />
						Build Info
					</NTag>
				</template>
				<div class="build-info-tooltip">
					<p><b>Branch:</b> {{ branch }}</p>
					<p><b>Commit:</b> {{ commitRef }}</p>
					<p><b>Env:</b> {{ deployContext }}</p>
					<p><b>Build Time:</b> {{ new Date().toLocaleString() }}</p>
				</div>
			</NTooltip>
		</div>

		<NButton text size="large">
			<template #icon>
				<Icon name="link" />
			</template>
			GitHub
		</NButton>
		<NFlex>
			<NButton dashed color="#00dc82" tag="a" target="_blank" href="https://github.com/KIRAKIRA-DOUGA/KIRAKIRA-Cerasus">
				Cerasus
			</NButton>
			<NButton dashed color="#3178c6" tag="a" target="_blank" href="https://github.com/KIRAKIRA-DOUGA/KIRAKIRA-Rosales">
				Rosales
			</NButton>
			<NButton dashed color="#63e2b7" tag="a" target="_blank" href="https://github.com/KIRAKIRA-DOUGA/KIRAKIRA-Lycoris">
				Lycoris
			</NButton>
		</NFlex>
	</div>
</template>

<style scoped>
.mlb-4 {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.build-info-tooltip {
  padding: 8px;
  line-height: 1.6;
}

.build-info-tooltip p {
  margin: 4px 0;
}
</style>
