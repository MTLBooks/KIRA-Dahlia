<script setup lang="ts">

</script>

<template>
	<div class="container">
		<Logo :width="400" />
		<div class="mlb-4">
			<NTag>
				<template #icon>
					<Icon name="forkRight" />
				</template>
				Develop
			</NTag>
			<!-- FIXME: 这里模仿 Cerasus 做一个显示当前分支的 tag。 -->
		</div>
		<NH4>GitHub</NH4>
		<NFlex>
			<NButton dashed color="#00dc82" tag="a" target="_blank" href="https://github.com/KIRAKIRA-DOUGA/KIRAKIRA-Cerasus">Cerasus</NButton><!-- Color of Nuxt -->
			<NButton dashed color="#3178c6" tag="a" target="_blank" href="https://github.com/KIRAKIRA-DOUGA/KIRAKIRA-Rosales">Rosales</NButton><!-- Color of TypeScript -->
			<NButton dashed color="#63e2b7" tag="a" target="_blank" href="https://github.com/KIRAKIRA-DOUGA/KIRAKIRA-Lycoris">Lycoris</NButton><!-- Color of Naive UI -->
		</NFlex>
	</div>
</template>
