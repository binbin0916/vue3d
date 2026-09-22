import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import 'element-plus/theme-chalk/index.css';

// @ts-expect-error
import 'virtual:svg-icons-register';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
