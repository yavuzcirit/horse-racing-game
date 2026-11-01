import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { logger } from './shared/lib/logger'

import './app/styles/tokens.css'
import './app/styles/base.css'

const app = createApp(App)

app.use(createPinia())

app.config.errorHandler = (error, _instance, info) => {
  logger.error(`Unhandled error (${info})`, error)
}

app.mount('#app')
