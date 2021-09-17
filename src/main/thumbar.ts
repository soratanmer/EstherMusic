import { nativeImage, ipcMain } from 'electron'
import path from 'path'

export function createThumbar(win): void {
    console.log('createThumbar')

    const getNativeIcon = (name) => {
        return nativeImage.createFromPath(path.join(__dirname, '../../public/thumbar/', name))
    }

    const previousButton = {
        icon: getNativeIcon('arrow-left.png'),
        click() {
            win.webContents.send('previous')
        },
    }
    const nextButton = {
        icon: getNativeIcon('arrow.png'),
        click() {
            win.webContents.send('next')
        },
    }
    const playButton = {
        icon: getNativeIcon('play.png'),
        click() {
            win.webContents.send('play')
        },
    }

    const pauseButton = {
        icon: getNativeIcon('pause.png'),
        click() {
            win.webContents.send('play')
        },
    }

    const trashButton = {
        icon: getNativeIcon('delete.png'),
        click() {
            win.webContents.send('moveToFMTrash')
        },
    }

    ipcMain.on('player', (e, { playing, isPersonalFM }) => {
        if (isPersonalFM) {
            if (playing) {
                win.setThumbarButtons([trashButton, pauseButton, nextButton])
            } else {
                win.setThumbarButtons([trashButton, playButton, nextButton])
            }
        } else {
            if (playing) {
                win.setThumbarButtons([previousButton, pauseButton, nextButton])
            } else {
                win.setThumbarButtons([previousButton, playButton, nextButton])
            }
        }
    })
}
