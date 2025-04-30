<script setup lang="ts">
</script>

<template>
	<div class="container">
		<PageHeading>KIRAKIRA 用户管理</PageHeading>
		<n-alert title="警告！" type="warning">
			还在施工！小心塌方！！！
		</n-alert>
		<NCollapse class="mlb-4">
			<NCollapseItem title="使用说明">
				<NP>TODO</NP>
				<NUl>
					<NLi>And TODO</NLi>
					<NLi>...</NLi>
				</NUl>
			</NCollapseItem>
		</NCollapse>
		<NFlex justify="right">
			<NInputNumber placeholder="要查询的用户的 UID" :showButton="false" />
			<NButton ><template #icon><Icon name="search" /></template>查询</NButton>
		</NFlex>
		<>
	</div>
</template>
