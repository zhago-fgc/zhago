import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import ModuleView from './views/ModuleView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/m/:name', component: ModuleView, props: true },
  ],
})
