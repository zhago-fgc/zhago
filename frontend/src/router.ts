import { createRouter, createMemoryHistory } from "vue-router";

import Home from "./pages/Home.vue";
import Scoreboard from "./pages/Scoreboard.vue";
import Settings from "./pages/Settings.vue";

const routes = [
	{ path: "/", component: Home },
	{ path: "/scoreboard", component: Scoreboard },
	{ path: "/settings", component: Settings },
];

const router = createRouter({
	history: createMemoryHistory(),
	routes,
});

export default router;
