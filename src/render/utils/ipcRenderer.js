import store from '@render/store'

const player = store.state.player

export function ipcRenderer(vueInstance) {
    const self = vueInstance
    // 添加专有的类名
    document.body.setAttribute('data-electron', 'yes')
    document.body.setAttribute('data-electron-os', window.require('os').platform())
    // ipc message channel

    const ipcRenderer = window.require('electron').ipcRenderer

    // listens to the main process 'changeRouteTo' event and changes the route from
    // inside this Vue instance, according to what path the main process requires.
    // responds to Menu click() events at the main process and changes the route accordingly.

    ipcRenderer.on('changeRouteTo', (event, path) => {
        self.$router.push(path)
        if (store.state.showLyrics) {
            store.commit('toggleLyrics')
        }
    })

    ipcRenderer.on('search', () => {
        // 触发数据响应
        self.$refs.navbar.$refs.searchInput.focus()
        self.$refs.navbar.inputFocus = true
    })

    ipcRenderer.on('play', () => {
        store.dispatch('player/playOrPause')
    })

    ipcRenderer.on('next', () => {
        store.dispatch('player/playNextTrack')
    })

    ipcRenderer.on('previous', () => {
        store.dispatch('player/playPrevTrack')
    })

    ipcRenderer.on('moveToFMTrash', () => {
        store.dispatch('player/moveToFMTrash')
    })

    ipcRenderer.on('increaseVolume', () => {
        if (player.volume + 0.1 >= 1) {
            store.commit('player/setVolume', 1)
            return
        }
        let volume = player.volume + 0.1
        store.commit('player/setVolume', volume)
    })

    ipcRenderer.on('decreaseVolume', () => {
        if (player.volume - 0.1 <= 0) {
            store.commit('player/setVolume', 0)
            return
        }
        let volume = player.volume - 0.1
        store.commit('player/setVolume', volume)
    })

    ipcRenderer.on('like', () => {
        store.dispatch('liked/likeATrack', player.currentTrack.id)
    })

    ipcRenderer.on('repeat', () => {
        store.commit('player/switchRepeatMode')
    })

    ipcRenderer.on('shuffle', () => {
        store.commit('player/switchShuffle')
    })

    ipcRenderer.on('routerGo', (event, where) => {
        self.$refs.navbar.go(where)
    })

    ipcRenderer.on('nextUp', () => {
        self.$refs.player.goToNextTracksPage()
    })
}
