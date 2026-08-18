import { createRouter, createWebHistory } from 'vue-router';
import AddOns from '../features/addons/AddOnsView.vue';
import Home from '../features/home/HomeView.vue';
import Logs from '../features/logs/LogsView.vue';
import ModuleView from '../features/modules/ModuleView.vue';
import Settings from '../features/settings/SettingsView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/addons', component: AddOns },
    { path: '/logs', component: Logs },
    { path: '/m/:name', component: ModuleView, props: true },
    { path: '/settings', component: Settings },
  ],
});
