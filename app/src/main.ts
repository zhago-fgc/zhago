import { createApp } from 'vue';
import './shared/composables/theme'; // side-effect import applies dark mode before first paint
import './style.css';
import App from './app/App.vue';
import { router } from './app/router';

createApp(App).use(router).mount('#app');
