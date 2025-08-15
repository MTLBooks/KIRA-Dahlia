<script setup lang="ts">
const selfUserInfoStore = useSelfUserInfoStore();

const email = ref("");
const password = ref("");
const clientOtp = ref(""); // TOTP verification code

/**
 * Login
 */
async function requestLogin() {
	if (!email && !password) {
		console.error("Please enter email and password to log in");
		alert("Please enter email and password to log in");
		return;
	}

	const passwordHash = await generateHash(password.value);
	const userLoginRequest = {
		email: email.value,
		passwordHash,
		clientOtp: clientOtp.value,
	};

	try {
		const loginResult = await userLogin(userLoginRequest);
		if (loginResult.success && loginResult.UUID) {
			// After successful login, fetch user info to update the store
			await getSelfUserInfo(undefined, true);
			// Clear the form
			email.value = "";
			password.value = "";
			clientOtp.value = "";
		} else {
			console.error("Login failed:", loginResult.message);
			alert("Login failed: " + (loginResult.message || "Unknown error"));
		}
	} catch (error) {
		console.error("Login error:", error);
		alert("Login error: " + (error as Error).message);
	}
}

/**
 * Logout
 */
async function logout() {
	await userLogout();
	location.reload(); // Try to refresh the page...
}

const emailRule: FormItemRule = {
	trigger: ["input", "blur-sm"],
	type: "email",
	validator() {
		if (!email.value.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/))
			return new Error("Invalid email");
	},
};
</script>

<template>
	<div class="container">
		<div v-if="!selfUserInfoStore.isLogined">
			<NCard title="Login">
				<NForm>
					<NFormItem label="Email" :rule="emailRule">
						<NInput v-model:value="email" placeholder="Please enter your email" type="text" />
					</NFormItem>
					<NFormItem label="Password">
						<NInput v-model:value="password" placeholder="Please enter your password" type="password" />
					</NFormItem>
					<NP>
						The admin console currently only supports logging in with a TOTP code!<br />
						If you don't have 2FA enabled, you can leave it blank<br />
						If you use email verification, please log in on the KIRAKIRA main site or switch to TOTP.
					</NP>
					<NFormItem label="TOTP code">
						<NInput v-model:value="clientOtp" placeholder="Please enter the TOTP code" />
					</NFormItem>
					<div>
						<NButton type="primary" round attrType="button" @click="requestLogin">Login</NButton>
					</div>
				</NForm>
			</NCard>
		</div>
		<div v-else>
			<NFlex vertical size="large">
				<NAlert type="success">You are logged in</NAlert>
				<NCard title="Your roles">
					<NFlex>
						<NTag v-for="role in selfUserInfoStore.roles" :key="role">{{ role }}</NTag>
					</NFlex>
				</NCard>
				<div>
					<NButton type="error" round attrType="button" @click="logout">Logout</NButton>
				</div>
			</NFlex>
		</div>
	</div>
</template>
