import deepmerge from 'deepmerge'
import pkg from '@root/package.json'

export default (modules) => (store) => {
    const initStates = () => {
        let states = {}
        if (modules.length) {
            modules.forEach((module) => {
                states[module] = JSON.parse(localStorage.getItem(module))
            })
        }
        store.replaceState(
            deepmerge(store.state, states, {
                arrayMerge: (store, saved) => {
                    return saved
                },
                clone: false,
            }),
        )
    }

    if (localStorage.length !== 0) {
        if (localStorage.getItem('appVersion') === null) {
            localStorage.setItem('appVersion', pkg.version)
        }
        initStates()
    }

    window.addEventListener('storage', (e) => {
        initStates()
    })

    store.subscribe((mutation, state) => {
        let player = {}
        for (const key in state.player) {
            if (Object.hasOwnProperty.call(state.player, key) && key !== 'howler' && key !== 'playing') {
                player[key] = state.player[key]
            }
        }

        modules.forEach((module) => {
            if (module === 'player') {
                localStorage.setItem(module, JSON.stringify(player))
            } else {
                localStorage.setItem(module, JSON.stringify(state[module]))
            }
        })
    })
}
