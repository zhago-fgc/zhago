import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import ModuleView from './views/ModuleView.vue'
import Settings from './views/Settings.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/m/:name', component: ModuleView, props: true },
    { path: '/settings', component: Settings },
  ],
})
