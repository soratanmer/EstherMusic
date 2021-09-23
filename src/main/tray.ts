import path from 'path'
import { app, nativeImage, Tray, Menu } from 'electron'

export function createTray(win): Tray {
    console.log('createTray')

    const getNativeIcon = (name): Electron.NativeImage => {
        return nativeImage.createFromPath(path.join(__dirname, '../../public/tray/', name))
    }

    const icon = getNativeIcon('menu.png')
    const tray: Tray = new Tray(icon)

    tray.setToolTip('EstherMusic')

    tray.on('click', () => {
        win.show()
    })

    tray.on('right-click', () => {
        const contextMenu: Menu = Menu.buildFromTemplate([
            {
                label: '播放/暂停',
                icon: getNativeIcon('play.png'),
                click: () => {
                    win.webContents.send('play')
                },
            },
            {
                label: '上一首',
                icon: getNativeIcon('left.png'),
                accelerator: 'CmdOrCtrl+Left',
                click: () => {
                    win.webContents.send('previous')
                },
            },
            {
                label: '下一首',
                icon: getNativeIcon('right.png'),
                accelerator: 'CmdOrCtrl+Right',
                click: () => {
                    win.webContents.send('next')
                },
            },
            {
                label: '循环播放',
                icon: getNativeIcon('repeat.png'),
                accelerator: 'Alt+R',
                click: () => {
                    win.webContents.send('repeat')
                },
            },
            {
                label: '加入喜欢',
                icon: getNativeIcon('like.png'),
                accelerator: 'CmdOrCtrl+L',
                click: () => {
                    win.webContents.send('like')
                },
            },
            {
                label: '退出',
                icon: getNativeIcon('exit.png'),
                accelerator: 'CmdOrCtrl+W',
                click: () => {
                    app.exit()
                },
            },
        ])

        tray.popUpContextMenu(contextMenu)
    })

    return tray
}
