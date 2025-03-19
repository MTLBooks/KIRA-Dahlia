import naive from "naive-ui";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import { createPinia } from "pinia";
import App from "./App.vue";
import "styles/global.css";

const router = createRouter({ history: createWebHistory(), routes });
router.beforeEach(async to => {
	if (noBackend) return true;
	if (to.path === "/user/manage") return await getUserInfoAndCheckRole(["administrator"]); // TODO
	if (to.path === "/stg-secret") return await getUserInfoAndCheckRole(["developer"]);
	if (to.path === "/rbac/api-path") return await getUserInfoAndCheckRole(["root", "developer"]);
	if (to.path === "/rbac/role") return await getUserInfoAndCheckRole(["root"]);
	if (to.path === "/rbac/user-roles") return await getUserInfoAndCheckRole(["root"]);
	console.log("to", to.path);
	return true;
});

const pinia = createPinia();
const app = createApp(App);
app.use(naive);
app.use(router);
app.use(pinia);
app.mount("#app");
