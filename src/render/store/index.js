import { createStore } from 'vuex'
import isElectron from 'is-electron'

import state from './state'
import mutations from './mutations'
import modules from './modules'

import { changeAppearance } from '@render/utils/common'

// vuex 自定义插件
import initLocalStorage from './plugins/localStorage'
import { getSendSettingsPlugin } from './plugins/sendSettings'

const saveToLocalStorage = initLocalStorage([
    'contextMenu',
    'data',
    'liked',
    'modals',
    'player',
    'settings',
    'toast',
    'dailyTracks',
])

let plugins = [saveToLocalStorage]
if (isElectron()) {
    let sendSettings = getSendSettingsPlugin()
    plugins.push(sendSettings)
}

const options = {
    state,
    mutations,
    plugins,
    modules,
}

const store = createStore(options)

if ([undefined, null].includes(store.state.settings.lang)) {
    const defaultLang = 'en'
    const langMapper = new Map().set('zh', 'zh-CN').set('zh-TW', 'zh-TW').set('en', 'en').set('tr', 'tr')
    store.state.settings.lang = langMapper.get(navigator.language.slice(0, 2)) || defaultLang
    localStorage.setItem('settings', JSON.stringify(store.state.settings))
}

changeAppearance(store.state.settings.appearance)

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (store.state.settings.appearance === 'auto') {
        changeAppearance(store.state.settings.appearance)
    }
})

export default store