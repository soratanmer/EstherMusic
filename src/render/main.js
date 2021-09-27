import { createApp } from 'vue'
import 'vite-plugin-svg-icons/register'
import isElectron from 'is-electron'
import NProgress from 'nprogress'

import App from '@render/App.vue'
import router from '@render/router'
import store from '@render/store'
import i18n from '@render/locale'

import { dailyTask } from '@render/utils/common'
import { globFilters } from '@render/utils/filters'
import { ipcRenderer } from '@render/utils/ipcRenderer'

import '@render/styles/slider.scss'
import '@render/styles/global.scss'
import 'nprogress/nprogress.css'

window.resetApp = () => {
    localStorage.clear()
    indexedDB.deleteDatabase('EstherMusic')
    document.cookie.split(';').forEach(function (c) {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
    })
    return '已重置应用，请刷新页面（按Ctrl/Command + R）'
}

console.log(
    '如出现问题，可尝试在本页输入 %cresetApp()%c 然后按回车重置应用。',
    'background: #eaeffd;color:#335eea;padding: 4px 6px;border-radius:3px;',
    'background:unset;color:unset;',
)

const app = createApp(App)

if (isElectron()) {
    ipcRenderer(app)
}

NProgress.configure({ showSpinner: false, trickleSpeed: 100 })
dailyTask()
globFilters(app)

app.use(router)
app.use(i18n)
app.use(store)
app.mount('#app')
