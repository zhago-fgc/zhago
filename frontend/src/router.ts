import { createRouter, createMemoryHistory } from "vue-router";

import Home from "./views/Home.vue";
import Bracket from "./views/Bracket.vue";
import Commentary from "./views/Commentary.vue";
import BreakTimer from "./views/BreakTimer.vue";
import Top8 from "./views/Top8.vue";
import OverlayControl from "./views/OverlayControl.vue";
import Players from "./views/Players.vue";
import Commentators from "./views/Commentators.vue";
import Assets from "./views/Assets.vue";
import Overlays from "./views/Overlays.vue";
import Settings from "./views/Settings.vue";

const routes = [
	{ path: "/", component: Home },
	{ path: "/bracket", component: Bracket },
	{ path: "/commentary", component: Commentary },
	{ path: "/break-timer", component: BreakTimer },
	{ path: "/top8", component: Top8 },
	{ path: "/overlay/:type", component: OverlayControl },
	{ path: "/players", component: Players },
	{ path: "/commentators", component: Commentators },
	{ path: "/assets", component: Assets },
	{ path: "/overlays", component: Overlays },
	{ path: "/settings", component: Settings },
];

const router = createRouter({
	history: createMemoryHistory(),
	routes,
});

export default router;
