import { app, dialog, globalShortcut, ipcMain } from 'electron'
import match from '@revincx/unblockneteasemusic'
import { registerGlobalShortcut } from '@main/globalShortcut'
import cloneDeep from 'lodash/cloneDeep'

import shortcuts from '@common/shortcuts'
import { createMenu } from '@main/menu'

export function initIpcMain(win, store): void {
    console.log('initIpcMain')

    ipcMain.on('unblock-music', (event, track) => {
        // 兼容 unblockneteasemusic 所使用的 api 字段
        track.alias = track.alia || []
        track.duration = track.dt || 0
        track.album = track.al || []
        track.artists = track.ar || []

        const matchPromise = match(track.id, ['qq', 'kuwo', 'migu'], track)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject('timeout')
            }, 3000)
        })
        Promise.race([matchPromise, timeoutPromise])
            .then((res) => {
                event.returnValue = res
            })
            .catch((err) => {
                console.log('unblock music error: ', err)
                event.returnValue = null
            })
    })

    ipcMain.on('close', (e) => {
        if (process.platform == 'darwin') {
            win.hide()
        }
        e.preventDefault() //阻止默认行为
        dialog
            .showMessageBox({
                type: 'info',
                title: 'Information',
                cancelId: 2,
                defaultId: 0,
                message: '确定要关闭吗？',
                buttons: ['最小化', '直接退出'],
            })
            .then((result) => {
                if (result.response == 0) {
                    e.preventDefault() //阻止默认行为
                    win.minimize() //调用 最小化实例方法
                } else if (result.response == 1) {
                    win = null
                    //app.quit();
                    app.exit() //exit()直接关闭客户端，不会执行quit();
                }
            })
            .catch((err) => {
                console.log(err)
            })
    })

    ipcMain.on('minimize', () => {
        win.minimize()
    })

    ipcMain.on('maximizeOrUnmaximize', () => {
        const isMaximized = win.isMaximized()
        isMaximized ? win.unmaximize() : win.maximize()
        win.webContents.send('isMaximized', isMaximized)
    })

    ipcMain.on('settings', (event, options) => {
        store.set('settings', options)
        // const isRegisterShortcut = globalShortcut.isRegistered('Alt+CommandOrControl+P')
        if (options.enableGlobalShortcut) {
            // !isRegisterShortcut && registerGlobalShortcut(win)
            registerGlobalShortcut(win, store)
        } else {
            // isRegisterShortcut && globalShortcut.unregisterAll()
            globalShortcut.unregisterAll()
        }
    })

    ipcMain.on('setProxy', (event, config) => {
        const proxyRules = `${config.protocol}://${config.server}:${config.port}`
        win.webContents.session.setProxy(
            {
                proxyRules,
            },
            () => {
                console.log('finished setProxy')
            },
        )
    })

    // eslint-disable-next-line no-unused-vars
    ipcMain.on('removeProxy', (event, arg) => {
        console.log('removeProxy')
        win.webContents.session.setProxy({})
    })

    ipcMain.on('switchGlobalShortcutStatusTemporary', (e, status) => {
        if (status === 'disable') {
            globalShortcut.unregisterAll()
        } else {
            registerGlobalShortcut(win, store)
        }
    })

    ipcMain.on('updateShortcut', (e, { id, type, shortcut }) => {
        console.log('updateShortcut')
        let shortcuts = store.get('settings.shortcuts')
        let newShortcut = shortcuts.find((s) => s.id === id)
        newShortcut[type] = shortcut
        store.set('settings.shortcuts', shortcuts)

        createMenu(win, store)
        globalShortcut.unregisterAll()
        registerGlobalShortcut(win, store)
    })

    ipcMain.on('restoreDefaultShortcuts', () => {
        console.log('restoreDefaultShortcuts')
        store.set('settings.shortcuts', cloneDeep(shortcuts))

        createMenu(win, store)
        globalShortcut.unregisterAll()
        registerGlobalShortcut(win, store)
    })
}
