import { createApp } from 'vue';
import './theme'; // side-effect import — applies the .dark class before first paint
import './style.css';
import App from './App.vue';
import { router } from './router';

createApp(App).use(router).mount('#app');
