import isElectron from 'is-electron'
import cloneDeep from 'lodash/cloneDeep'

import { playlistCategories } from '@render/utils/staticData'
import shortcuts from '@common/shortcuts'

const enabledPlaylistCategories = playlistCategories.filter((c) => c.enable).map((c) => c.name)

const state = {
    lang: null,
    musicLanguage: 'all',
    appearance: 'auto',
    musicQuality: 320000,
    lyricFontSize: 28,
    outputDevice: 'default',
    showPlaylistsByAppleMusic: true,
    enableUnblockNeteaseMusic: false,
    automaticallyCacheSongs: isElectron() ? true : false,
    cacheLimit: false,
    showLyricsTranslation: true,
    minimizeToTray: false,
    enableGlobalShortcut: true,
    showLibraryDefault: false,
    enabledPlaylistCategories,
    shortcuts,
    proxyConfig: {
        protocol: 'noProxy',
        server: '',
        port: null,
    },
}

const mutations = {
    changeLang(state, lang) {
        state.lang = lang
    },
    changeMusicQuality(state, value) {
        state.musicQuality = value
    },
    changeLyricFontSize(state, value) {
        state.lyricFontSize = value
    },
    changeOutputDevice(state, deviceId) {
        state.outputDevice = deviceId
    },
    updateSettings(state, { key, value }) {
        state[key] = value
    },
    togglePlaylistCategory(state, name) {
        const index = state.enabledPlaylistCategories.findIndex((c) => c === name)
        if (index !== -1) {
            state.enabledPlaylistCategories = state.enabledPlaylistCategories.filter((c) => c !== name)
        } else {
            state.enabledPlaylistCategories.push(name)
        }
    },
    updateShortcut(state, { id, type, shortcut }) {
        let newShortcut = state.shortcuts.find((s) => s.id === id)
        newShortcut[type] = shortcut
        state.shortcuts = state.shortcuts.map((s) => {
            if (s.id !== id) {
                return s
            }
            return newShortcut
        })
    },
    restoreDefaultShortcuts(state) {
        state.shortcuts = cloneDeep(shortcuts)
    },
}

export default {
    namespaced: true,
    state,
    mutations,
}
