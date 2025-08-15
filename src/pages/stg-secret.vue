<script setup lang="ts">
const message = useMessage();
const secretType = ref<"hidden" | "windows" | "bash">("hidden");
const getShownText = (shown: boolean) => shown ? "Show" : "Hide";

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
		<PageHeading>KIRAKIRA Staging Environment Variables</PageHeading>
		<NFlex size="small">
			<NTag type="error">Do not disclose secrets</NTag>
			<NTag>Please read the instructions</NTag>
		</NFlex>
		<NCollapse class="mlb-4">
			<NCollapseItem title="Instructions">
				<NP>Click the buttons below to display KIRAKIRA staging environment variables.</NP>
				<NP>
					These variables include backend server port, Cloudflare secrets, database credentials, search engine
					credentials, mail service credentials, and the credentials used to retrieve them.<br />
					<b>Any disclosure or misuse may cause serious data leaks and legal issues!</b>
				</NP>
				<NP>Best practice: fetch when needed, do not store locally. Copy/paste before startup, then clear your
					clipboard.</NP>
				<NP>Allow me to quote a security motto from some Linux distributions:</NP>
				<NBlockquote>
					<NP>We trust you have received the usual lecture from the local System Administrator. It usually
						boils down to these three things:</NP>
					<NOl class="paren-after">
						<NLi>Respect the privacy of others.</NLi>
						<NLi>Think before you type.</NLi>
						<NLi>With great power comes great responsibility.</NLi>
					</NOl>
				</NBlockquote>
				<NBlockquote>
					<NP>We trust you understand the daily cautions from your system administrator. In short:</NP>
					<NOl class="paren-after">
						<NLi>Respect others' privacy.</NLi>
						<NLi>Think before you type (about risks and consequences).</NLi>
						<NLi>With great power comes great responsibility.</NLi>
					</NOl>
				</NBlockquote>
			</NCollapseItem>
		</NCollapse>
		<NFlex class="mbe-4 justify-between">
			<NFlex>
				<NButton :secondary="secretType !== 'windows'" strong type="warning"
					@click="secretType = secretType !== 'windows' ? 'windows' : 'hidden'">{{ getShownText(secretType !==
						"windows") }} Windows PowerShell formatted env</NButton>
				<NButton :secondary="secretType !== 'bash'" strong type="warning"
					@click="secretType = secretType !== 'bash' ? 'bash' : 'hidden'">{{ getShownText(secretType !==
						"bash") }} Bash (macOS / Linux) formatted env</NButton>
			</NFlex>
			<NFlex>
				<NButton :disabled="secretType === 'hidden'" strong secondary @click="copySecret"><template #icon>
						<Icon name="contentCopy" />
					</template>Copy</NButton>
			</NFlex>
		</NFlex>

		<NCollapseTransition :show="secretType !== 'hidden'">
			<NCode v-if="secretType === 'windows'" :code="computedWindwowsStgEnvBackEndSecretData" showLineNumbers
				language="powershell" />
			<NCode v-else-if="secretType === 'bash'" :code="computedBashStgEnvBackEndSecretData" showLineNumbers
				language="bash" />
		</NCollapseTransition>
	</div>
</template>
