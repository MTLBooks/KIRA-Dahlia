<script setup lang="ts">
	import { useThemeVars } from "naive-ui";
	const siteName = import.meta.env.VITE_SITE_NAME || '';
	const themeVars = useThemeVars();

	const props = defineProps<{
		width?: number;
	}>();

	const DEFAULT_WIDTH = 300, DEFAULT_HEIGHT = 40;
	const width = computed(() => props.width ?? DEFAULT_WIDTH),
		height = computed(() => width.value / DEFAULT_WIDTH * DEFAULT_HEIGHT);
</script>

<template>
	<svg class="shrink-0" :width="width" :height="height" :viewBox="`0 0 ${DEFAULT_WIDTH} ${DEFAULT_HEIGHT}`" :fill="themeVars.primaryColor" xmlns="http://www.w3.org/2000/svg">
		<!-- {{ siteName }} CONSOLE Text -->
		<text x="10" y="25" font-family="Arial, sans-serif" font-size="24" font-weight="bold" :fill="themeVars.primaryColor">
			{{ siteName }} CONSOLE
		</text>
	</svg>
</template>
