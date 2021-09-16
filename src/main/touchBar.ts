// Icon follow touchbar design guideline.
// See: https://developer.apple.com/design/human-interface-guidelines/macos/touch-bar/touch-bar-icons-and-images/
// Icon Resource: https://devimages-cdn.apple.com/design/resources/

import { TouchBar, nativeImage, ipcMain } from 'electron'
import path from 'path'

const { TouchBarButton, TouchBarSpacer } = TouchBar

export function createTouchBar(win) {
    console.log('createTouchBar')

    const getNativeIcon = (name) => {
        return nativeImage.createFromPath(path.join(__dirname, '../../public/touchbar/', name))
    }

    const previousPage = new TouchBarButton({
        click: () => {
            win.webContents.send('routerGo', 'back')
        },
        icon: getNativeIcon('page_prev.png'),
    })

    const nextPage = new TouchBarButton({
        click: () => {
            win.webContents.send('routerGo', 'forward')
        },
        icon: getNativeIcon('page_next.png'),
    })

    const searchButton = new TouchBarButton({
        click: () => {
            win.webContents.send('search')
        },
        icon: getNativeIcon('search.png'),
    })

    const playButton = new TouchBarButton({
        click: () => {
            win.webContents.send('play')
        },
        icon: getNativeIcon('play.png'),
    })

    const previousTrackButton = new TouchBarButton({
        click: () => {
            win.webContents.send('previous')
        },
        icon: getNativeIcon('backward.png'),
    })

    const nextTrackButton = new TouchBarButton({
        click: () => {
            win.webContents.send('next')
        },
        icon: getNativeIcon('forward.png'),
    })

    const likeButton = new TouchBarButton({
        click: () => {
            win.webContents.send('like')
        },
        icon: getNativeIcon('like.png'),
    })

    const nextUpButton = new TouchBarButton({
        click: () => {
            win.webContents.send('nextUp')
        },
        icon: getNativeIcon('next_up.png'),
    })

    ipcMain.on('player', (e, { playing, likedCurrentTrack }) => {
        playButton.icon = playing === true ? getNativeIcon('pause.png') : getNativeIcon('play.png')
        likeButton.icon = likedCurrentTrack ? getNativeIcon('like_fill.png') : getNativeIcon('like.png')
    })

    const touchBar = new TouchBar({
        items: [
            previousPage,
            nextPage,
            searchButton,
            new TouchBarSpacer({ size: 'flexible' }),
            previousTrackButton,
            playButton,
            nextTrackButton,
            new TouchBarSpacer({ size: 'flexible' }),
            likeButton,
            nextUpButton,
        ],
    })
    return touchBar
}
