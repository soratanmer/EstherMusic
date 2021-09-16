import * as path from 'path'
import { app, protocol, BrowserWindow, shell, globalShortcut, nativeTheme, nativeImage } from 'electron'
import Store from 'electron-store'
import express from 'express'
import expressProxy from 'express-http-proxy'

import { startNeteaseMusicApi } from '@main/services'
import { initIpcMain } from '@main/ipcMain'
import { createMenu } from '@main/menu'
import { createThumbar } from '@main/thumbar'
import { createTouchBar } from '@main/touchBar'
import { createTray } from '@main/tray'
import { createDockMenu } from '@main/dockMenu'
import { registerGlobalShortcut } from '@main/globalShortcut'

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

const isDev = !app.isPackaged

let window: BrowserWindow
let expressApp: express
let willQuitApp: boolean = process.platform === 'darwin' ? false : true

let store: Store = new Store({
    windowWidth: {
        width: {
            type: 'number',
            default: 1440,
        },
        height: {
            type: 'number',
            default: 840,
        },
    },
} as object)

const getNativeIcon = (name) => {
    return nativeImage.createFromPath(path.join(__dirname, '../../public/icons/', name))
}

const createExpressApp = () => {
    console.log('creating express app.')

    expressApp = express()
    expressApp.use('/', express.static(path.resolve(__dirname, '../render/')))
    expressApp.use('/api', expressProxy('http://127.0.0.1:3000'))
    expressApp.use('/player', (req, res) => {
        window.webContents
            .executeJavaScript('window.Fiesta.player')
            .then((result) => {
                res.send({
                    currentTrack: result._isPersonalFM ? result._personalFMTrack : result._currentTrack,
                    progress: result._progress,
                })
            })
            .catch((error) => {
                console.log('error: ', error)
            })
    })
    expressApp = expressApp.listen(27232, '127.0.0.1')
}

const createWindow = () => {
    console.log('creating app window')
    const showLibraryDefault = store.get('settings.showLibraryDefault')

    const appearance = store.get('settings.appearance')

    const options = {
        width: store.get('window.width') || 1440,
        height: store.get('window.height') || 840,
        minWidth: 1080,
        minHeight: 720,
        titleBarStyle: 'hiddenInset',
        frame: process.platform !== 'win32',
        title: 'Fiesta',
        icon: getNativeIcon('icon.png'),
        show: false,
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            contextIsolation: false,
        },
        backgroundColor:
            ((appearance === undefined || appearance === 'auto') && nativeTheme.shouldUseDarkColors) ||
            appearance === 'dark'
                ? '#222'
                : '#fff',
        x: null,
        y: null,
    }

    if (store.get('window.x') && store.get('window.y')) {
        options.x = store.get('window.x')
        options.y = store.get('window.y')
    }

    window = new BrowserWindow(options as object)

    // hide menu bar on Microsoft Windows and Linux
    window.setMenuBarVisibility(false)

    if (isDev) {
        window.loadURL(
            showLibraryDefault
                ? `http://localhost:${process.env.DEV_SERVER_PORT}/#/library`
                : `http://localhost:${process.env.DEV_SERVER_PORT}`,
        )
        if (!process.env.IS_TEST) {
            window.webContents.openDevTools()
        }
    } else {
        window.loadURL(showLibraryDefault ? 'http://localhost:27232/#/library' : 'http://localhost:27232')
    }
}

const handleWindowEvents = () => {
    window.once('ready-to-show', () => {
        console.log('windows ready-to-show event')
        window.show()
    })

    window.on('close', (e) => {
        console.log('windows close event')
        if (willQuitApp) {
            /* the user tried to quit the app */
            app.quit()
        } else {
            /* the user only tried to close the window */
            e.preventDefault()
            window.hide()
        }
    })

    window.on('resized', () => {
        store.set('window', window.getBounds())
    })

    window.on('moved', () => {
        store.set('window', window.getBounds())
    })

    window.on('minimize', () => {
        if (['win32', 'linux'].includes(process.platform) && store.get('settings.minimizeToTray')) {
            window.hide()
        }
    })

    window.webContents.on('new-window', function (e, url) {
        e.preventDefault()
        console.log('open url')
        const excludeHosts = ['www.last.fm']
        const exclude = excludeHosts.find((host) => url.includes(host))
        if (exclude) {
            const newWindow = new BrowserWindow({
                width: 800,
                height: 600,
                titleBarStyle: 'default',
                title: 'Fiesta',
                icon: getNativeIcon('icon.png'),
                webPreferences: {
                    webSecurity: false,
                    nodeIntegration: true,
                    contextIsolation: false,
                },
            })
            newWindow.loadURL(url)
            return
        }
        shell.openExternal(url)
    })
}

const handleAppEvents = () => {
    app.on('ready', async () => {
        // This method will be called when Electron has finished
        // initialization and is ready to create browser windows.
        // Some APIs can only be used after this event occurs.
        console.log('app ready event')

        // create window
        createWindow()

        window.once('ready-to-show', () => {
            window.show()
        })

        handleWindowEvents()

        // init ipcMain
        initIpcMain(window, store)

        // set proxy
        const proxyRules = store.get('proxy') as string

        if (proxyRules) {
            window.webContents.session.setProxy({ proxyRules }).then((result) => {
                console.log('finished setProxy', result)
            })
        }

        // create menu
        createMenu(window, store)

        // create dock menu for macOS
        if (app.dock) {
            app.dock.setMenu(createDockMenu(window))
        }

        // create touch bar
        window.setTouchBar(createTouchBar(window))

        createThumbar(window)

        createTray(window)

        // register global shortcuts
        if (store.get('settings.enableGlobalShortcut')) {
            registerGlobalShortcut(window, store)
        }
    })

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        console.log('app activate event')
        if (window === null) {
            createWindow()
        } else {
            window.show()
        }
    })

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })

    app.on('before-quit', () => {
        willQuitApp = true
    })

    app.on('quit', () => {
        expressApp.close()
    })

    app.on('will-quit', () => {
        // unregister all global shortcuts
        globalShortcut.unregisterAll()
    })
}

const init = () => {
    console.log('initializing.')

    // Make sure the app is singleton.
    if (!app.releaseSingleInstanceLock) {
        return app.quit()
    }

    // Start netease music api
    startNeteaseMusicApi()

    // create Express App
    createExpressApp()

    // Scheme must be registered before the app is ready
    protocol.registerSchemesAsPrivileged([
        {
            scheme: 'app',
            privileges: {
                secure: true,
                standard: true,
            },
        },
    ])

    // handle app events
    handleAppEvents()
}

init()
