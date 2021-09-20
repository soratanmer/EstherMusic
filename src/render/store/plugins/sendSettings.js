import isElectron from 'is-electron'

export function getSendSettingsPlugin() {
    const ipcRenderer = isElectron() ? window.require('electron').ipcRenderer : null
    return (store) => {
        store.subscribe((mutation, state) => {
            if (mutation.type !== 'settings/updateSettings') {
                return
            }
            ipcRenderer.send('settings', state.settings)
        })
    }
}
