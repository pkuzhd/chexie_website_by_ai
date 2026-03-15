import { createApp, ref } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

const currentUser = ref(null)
app.provide('currentUser', currentUser)

app.use(router)
app.mount('#app')
