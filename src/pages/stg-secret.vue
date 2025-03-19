<script setup lang="ts">
	import { GetStgEnvBackEndSecretResponse } from "api/Secret/ConsoleSecretControllerDto";
	import { useMessage } from "naive-ui";

	const message = useMessage();

	const secretType = ref<"hidden" | "windows" | "bash">("hidden");

	type StgEnvBackEndSecret = GetStgEnvBackEndSecretResponse["result"];
	const stgEnvBackEndSecretData = ref<StgEnvBackEndSecret["envs"]>(); // 环境变量数据（对象格式）
	const computedWindwowsStgEnvBackEndSecretData = computed(() => { // 环境变量数据（Windows Powershell 字符串格式）
		return Object.entries(stgEnvBackEndSecretData.value ?? {})
			.map(([key, value]) => `$env:${key}="${value}"`)
			.join("\n") + "\n\nclear";
	});
	const computedBashStgEnvBackEndSecretData = computed(() => { // 环境变量数据（Bash 字符串格式）
		return Object.entries(stgEnvBackEndSecretData.value ?? {})
			.map(([key, value]) => `export ${key}="${value}"`)
			.join("\n") + "\n\nclear";
	});

	/**
	 * 拷贝环境变量机密到剪贴板。
	 */
	function copySecret() {
		if (secretType.value === "hidden")
			return;
		else if (secretType.value === "windows")
			navigator.clipboard.writeText(computedWindwowsStgEnvBackEndSecretData.value).then(() => {
				message.info("密钥已复制");
			});
		else
			navigator.clipboard.writeText(computedBashStgEnvBackEndSecretData.value).then(() => {
				message.info("密钥已复制");
			});
	}

	/**
	 * 获取预生产环境后端环境变量机密
	 */
	async function getStgEnvBackEndSecret() {
		const stgEnvBackEndSecretResult = await getStgEnvBackEndSecretController();
		if (stgEnvBackEndSecretResult.success)
			stgEnvBackEndSecretData.value = stgEnvBackEndSecretResult.result.envs;
	}

	onMounted(getStgEnvBackEndSecret);
</script>

<template>
	<div class="container">
		<NH2>KIRAKIRA 预生产环境 环境变量</NH2>
		<NFlex size="small"><NTag type="error">密钥严禁公开</NTag><NTag>请先阅读使用说明</NTag></NFlex>
		<NCollapse class="mt-4 mb-4">
			<NCollapseItem title="使用说明" name="1">
				<p>点击下方按钮后，将会显示 KIRAKIRA 预生产环境的环境变量。</p>
				<br />
				<p>这些环境变量包括了后端程序端口、Cloudflare 密钥、数据库密钥、搜索引擎密钥、邮件服务密钥和获取以下密钥使用的密钥。</p>
				<p><b>任何对密钥的公开披露或滥用行为将会导致严重的隐私泄露事故，并涉嫌违法！</b></p>
				<br />
				<p>最佳实践：随用随取，请不要保存这些密钥至本地。仅在程序启动前复制并粘贴一次，然后清空剪贴板。</p>
				<br />
				<p>请允许我引用某些 linux 发行版中的安全格言：</p>
				<p class="ml-2 mt-2">We trust you have received the usual lecture from the local System</p>
				<p class="ml-2">Administrator. It usually boils down to these three things:</p>
				<ul class="ml-2">
					<li class="ml-4 mt-1">#1) Respect the privacy of others.</li>
					<li class="ml-4">#2) Think before you type.</li>
					<li class="ml-4">#3) With great power comes great responsibility.</li>
				</ul>
				<br />
				<p class="ml-2">我们信任您已经从系统管理员那里了解了日常注意事项。</p>
				<p class="ml-2">总结起来无外乎这三点：</p>
				<ul class="ml-2">
					<li class="ml-4 mt-1">#1) 尊重别人的隐私。</li>
					<li class="ml-4">#2) 输入前要先考虑（后果和风险）。</li>
					<li class="ml-4">#3) 权力越大，责任越大。</li>
				</ul>
				<NDivider />
			</NCollapseItem>
		</NCollapse>
		<NButton :disabled="secretType === 'windows'" strong secondary type="warning" class="mr-2 mb-2" @click="secretType = 'windows'">展示 Windows PowerShell 格式的环境变量</NButton>
		<NButton :disabled="secretType === 'bash'" strong secondary type="warning" class="mr-2 mb-2" @click="secretType = 'bash'">展示 Bash (macOS / Linux) 格式的环境变量</NButton>
		<NButton :disabled="secretType === 'hidden'" strong secondary class="mr-2 mb-2" @click="secretType = 'hidden'">隐藏</NButton>
		<NButton :disabled="secretType === 'hidden'" strong secondary class="mr-2 mb-2" @click="copySecret">复制</NButton>

		<pre v-if="secretType === 'windows'" class="code-space"><code>{{ computedWindwowsStgEnvBackEndSecretData }}</code></pre>
		<pre v-else-if="secretType === 'bash'" class="code-space"><code>{{ computedBashStgEnvBackEndSecretData }}</code></pre>
	</div>
</template>

<style lang="css" scoped>
	.code-space {
		background-color: #EEEEEEFF;
    border: 1px solid #AAAAAAFF;
    border-radius: 5px 5px;
    padding: 10px;
	}
</style>
