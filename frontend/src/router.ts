import { createRouter, createMemoryHistory } from "vue-router";

import Home from "./views/Home.vue";
import Scoreboard from "./views/Scoreboard.vue";
import Settings from "./views/Settings.vue";
import Events from "./views/Events.vue";

const routes = [
	{ path: "/", component: Home },
  { path: "/events", component: Events },
	{ path: "/scoreboard", component: Scoreboard },
	{ path: "/settings", component: Settings },
];

const router = createRouter({
	history: createMemoryHistory(),
	routes,
});

export default router;
