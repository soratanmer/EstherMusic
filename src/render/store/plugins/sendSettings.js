import isElectron from 'is-electron'

export function getSendSettingsPlugin() {
    const ipcRenderer = isElectron() ? window.require('electron').ipcRenderer : null
    return (store) => {
        store.subscribe((mutation, state) => {
            if (mutation.type !== 'settings/updateSettings') {
                return
            }
            ipcRenderer.send('settings', {
                minimizeToTray: state.settings.minimizeToTray,
                enableGlobalShortcut: state.settings.enableGlobalShortcut,
                appearance: state.settings.appearance,
                showLibraryDefault: state.settings.showLibraryDefault,
            })
        })
    }
}
