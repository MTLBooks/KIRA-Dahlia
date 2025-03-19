<script setup lang="ts">
	import { NThemeEditor } from "naive-ui";
	import { zhCN, dateZhCN } from "naive-ui";
	import menuOptions from "./menu";
	import hljs from "highlight.js/lib/core";
	import powershell from "highlight.js/lib/languages/powershell";
	import bash from "highlight.js/lib/languages/bash";

	hljs.registerLanguage("powershell", powershell);
	hljs.registerLanguage("bash", bash);

	const defaultExpandedKeys = menuOptions.map(option => option.key);
	const { theme, themeOverrides } = useOsTheme();

	const selfUserInfoStore = useSelfUserInfoStore();

	if (!noBackend) getSelfUserInfo();
</script>

<template>
	<NMessageProvider>
		<NDialogProvider>
			<NConfigProvider
				:theme
				:themeOverrides
				:hljs="hljs"
				:locale="zhCN"
				:dateLocale="dateZhCN"
			>
				<NThemeEditor>
					<NFlex vertical class="gap-0 h-dvh">
						<NLayoutHeader class="pli-6 bs-16 flex items-center justify-between shrink-0" bordered>
							<Logo />
							<NFlex class="items-center">
								<NFlex class="items-center gap-1.5">
									<!-- TODO: 头像的链接计算... 要根据生产环境还是测试环境计算吗？ -->
									<NAvatar round :size="20" />
									<span>{{ selfUserInfoStore.userNickname }}</span>
									<span class="text-slate-500">@{{ selfUserInfoStore.username }}</span>
								</NFlex>
								<NButton quaternary circle>
									<template #icon>
										<Icon name="logOut" />
									</template>
								</NButton>
							</NFlex>
						</NLayoutHeader>
						<NLayout hasSider>
							<NLayoutSider
								bordered
								collapseMode="width"
								:collapsedWidth="64"
								:width="240"
								showTrigger="bar"
							>
								<NMenu
									:collapsedWidth="64"
									:collapsedIconSize="22"
									:options="menuOptions"
									:defaultExpandedKeys
									:value="$route.path"
								/>
							</NLayoutSider>
							<NLayoutContent>
								<NBackTop :right="100" />
								<RouterView v-slot="{ Component, route }">
									<Transition name="page-jump" mode="out-in">
										<component :is="Component" :key="route.path" />
									</Transition>
								</RouterView>
							</NLayoutContent>
						</NLayout>
					</NFlex>
				</NThemeEditor>
			</NConfigProvider>
		</NDialogProvider>
	</NMessageProvider>
</template>

<style>
	.page-jump-leave-active {
		transition: all 100ms cubic-bezier(0.95, 0.05, 0.795, 0.035);
	}

	.page-jump-enter-active {
		transition: all 600ms cubic-bezier(0.1, 0.9, 0.2, 1);
	}

	.page-jump-enter-from {
		@apply translate-y-[8rem] opacity-0;
	}

	.page-jump-leave-to {
		@apply translate-y-[-2rem] opacity-0;
	}
</style>
