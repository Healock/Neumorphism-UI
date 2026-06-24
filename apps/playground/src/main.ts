import { createApp } from 'vue'
import 'virtual:uno.css'
import '@healock/neumorphism-ui/style.css'
import { NeumorphismUI } from '@healock/neumorphism-ui'
import App from './App.vue'

createApp(App).use(NeumorphismUI).mount('#app')
