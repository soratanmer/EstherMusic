import { app, Menu } from 'electron'
import defaultShortcuts from '@common/shortcuts'

const isMac = process.platform === 'darwin'

export function createMenu(win, store): void {
    console.log('createMenu')

    let shortcuts = store.get('settings.shortcuts')
    if (shortcuts === undefined) {
        shortcuts = defaultShortcuts
    }
    let menu = null
    const template = [
        ...(isMac
            ? [
                  {
                      label: app.name,
                      submenu: [
                          { role: 'about' },
                          { type: 'separator' },
                          { role: 'services' },
                          { type: 'separator' },
                          { type: 'separator' },
                          {
                              label: 'Preferences...',
                              accelerator: 'CmdOrCtrl+,',
                              click: () => {
                                  win.webContents.send('changeRouteTo', '/settings')
                              },
                              role: 'preferences',
                          },
                          { type: 'separator' },
                          { role: 'hide' },
                          { role: 'hideothers' },
                          { role: 'unhide' },
                          { type: 'separator' },
                          { role: 'quit' },
                      ],
                  },
              ]
            : []),
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                ...(isMac
                    ? [
                          { role: 'delete' },
                          { role: 'selectAll' },
                          { type: 'separator' },
                          {
                              label: 'Speech',
                              submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
                          },
                      ]
                    : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
                {
                    label: 'Search',
                    accelerator: 'CmdOrCtrl+F',
                    click: () => {
                        win.webContents.send('search')
                    },
                },
            ],
        },
        {
            label: 'Controls',
            submenu: [
                {
                    label: 'Play',
                    accelerator: shortcuts.find((s) => s.id === 'play').shortcut,
                    click: () => {
                        win.webContents.send('play')
                    },
                },
                {
                    label: 'Next',
                    accelerator: shortcuts.find((s) => s.id === 'next').shortcut,
                    click: () => {
                        win.webContents.send('next')
                    },
                },
                {
                    label: 'Previous',
                    accelerator: shortcuts.find((s) => s.id === 'previous').shortcut,
                    click: () => {
                        win.webContents.send('previous')
                    },
                },
                {
                    label: 'Increase Volume',
                    accelerator: shortcuts.find((s) => s.id === 'increaseVolume').shortcut,
                    click: () => {
                        win.webContents.send('increaseVolume')
                    },
                },
                {
                    label: 'Decrease Volume',
                    accelerator: shortcuts.find((s) => s.id === 'decreaseVolume').shortcut,
                    click: () => {
                        win.webContents.send('decreaseVolume')
                    },
                },
                {
                    label: 'Like',
                    accelerator: shortcuts.find((s) => s.id === 'like').shortcut,
                    click: () => {
                        win.webContents.send('like')
                    },
                },
                {
                    label: 'Repeat',
                    accelerator: 'Alt+R',
                    click: () => {
                        win.webContents.send('repeat')
                    },
                },
                {
                    label: 'Shuffle',
                    accelerator: 'Alt+S',
                    click: () => {
                        win.webContents.send('shuffle')
                    },
                },
            ],
        },
        {
            label: 'Window',
            submenu: [
                { role: 'close' },
                { role: 'minimize' },
                { role: 'zoom' },
                { role: 'reload' },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
                { type: 'separator' },
                { role: 'togglefullscreen' },
                ...(isMac
                    ? [
                          { type: 'separator' },
                          { role: 'front' },
                          { type: 'separator' },
                          {
                              role: 'window',
                              id: 'window',
                              label: 'EstherMusic',
                              type: 'checkbox',
                              checked: true,
                              click: () => {
                                  const current = menu.getMenuItemById('window')
                                  if (current.checked === false) {
                                      win.hide()
                                  } else {
                                      win.show()
                                  }
                              },
                          },
                      ]
                    : [{ role: 'close' }]),
            ],
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'GitHub',
                    click: async () => {
                        const { shell } = require('electron')
                        await shell.openExternal('https://github.com/soratanmer/EstherMusic')
                    },
                },
                {
                    label: 'Electron',
                    click: async () => {
                        const { shell } = require('electron')
                        await shell.openExternal('https://electronjs.org')
                    },
                },
                {
                    label: '开发者工具',
                    accelerator: 'F12',
                    click: () => {
                        win.webContents.openDevTools()
                    },
                },
            ],
        },
    ]
    menu = Menu.buildFromTemplate(template as any)
    Menu.setApplicationMenu(menu)
}
