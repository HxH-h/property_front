import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'





createApp(App)
.use(store)
.use(router)
.use(VueAxios,axios)
.use(ElementPlus , {
    locale: zhCn,
})
.use(createPinia())
.mount('#app')
