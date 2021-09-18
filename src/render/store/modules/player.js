import { shuffle } from 'lodash'
import { Howler, Howl } from 'howler'
import isElectron from 'is-electron'

import { getTrackDetail, scrobble, getMP3 } from '@render/NeteastApi/track'
import { getAlbum } from '@render/NeteastApi/album'
import { getPlaylistDetail } from '@render/NeteastApi/playlist'
import { getArtist } from '@render/NeteastApi/artist'
import { personalFM, fmTrash } from '@render/NeteastApi/others'

import { isAccountLoggedIn } from '@render/utils/auth'
import { cacheTrackSource, getTrackSource } from '@render/utils/db'

const ipcRenderer = isElectron() ? window.require('electron').ipcRenderer : null

const state = {
    // 播放器状态
    playing: false, // 是否正在播放中
    progress: 0, // 当前播放歌曲的进度
    enabled: false, // 是否启用Player
    repeatMode: 'on', // off | on | one
    shuffle: false, // true | false
    volume: 0.1, // 0 to 1
    volumeBeforeMuted: 1, // 用于保存静音前的音量

    // 播放信息
    list: [], // 播放列表
    current: 0, // 当前播放歌曲在播放列表里的index
    shuffledList: [], // 被随机打乱的播放列表，随机播放模式下会使用此播放列表
    shuffledCurrent: 0, // 当前播放歌曲在随机列表里面的index
    playlistSource: { type: 'album', id: 123 }, // 当前播放列表的信息
    currentTrack: { id: 86827685 }, // 当前播放歌曲的详细信息
    playNextList: [], // 当这个list不为空时，会优先播放这个list的歌
    isPersonalFM: false, // 是否是私人FM模式
    personalFMTrack: { id: 0 }, // 私人FM当前歌曲
    personalFMNextTrack: { id: 0 }, // 私人FM下一首歌曲信息（为了快速加载下一首）

    howler: null,
}

const getters = {
    getNextTrack(state) {
        if (state.playNextList.length > 0) {
            let trackID = state.playNextList.shift()
            return [trackID, state.current]
        }

        // 当歌曲是列表最后一首 && 循环模式开启
        if (state.list.length === state.current + 1 && state.repeatMode === 'on') {
            return [state.list[0], 0]
        }

        // 返回 [trackID, index]
        return [state.list[state.current + 1], state.current + 1]
    },
    getPrevTrack(state) {
        // 当歌曲是列表第一首 && 循环模式开启
        if (state.current === 0 && state.repeatMode === 'on') {
            return [state.list[state.list.length - 1], state.list.length - 1]
        }

        // 返回 [trackID, index]
        return [state.list[state.current - 1], state.current - 1]
    },
    currentTrackDuration(state) {
        const trackDuration = state.currentTrack.dt || 1000
        let duration = ~~(trackDuration / 1000)
        return duration > 1 ? duration - 1 : duration
    },
    isCurrentTrackLiked(state, getters, rootState) {
        return rootState.liked.songs.includes(state.currentTrack.id)
    },
    seek:
        (state) =>
        (time = null) => {
            if (time !== null) {
                state.howler?.seek(time)
            }
            return state.howler === null ? 0 : state.howler.seek()
        },
}

const mutations = {
    setPlaying(state, bool) {
        state.playing = bool
    },
    setProgress(state, progress) {
        if (state.howler) {
            state.howler.seek(progress)
        }
        state.progress = progress
    },
    setEnabled(state, bool) {
        state.enabled = bool
    },
    setRepeatMode(state, mode) {
        if (state.isPersonalFM) {
            return
        }
        if (!['off', 'on', 'one'].includes(mode)) {
            console.warn("repeatMode: invalid args, must be 'on' | 'off' | 'one'")
            return
        }
        state.repeatMode = mode
    },
    setShuffle(state, shuffle) {
        if (state.isPersonalFM) {
            return
        }
        if (shuffle !== true && shuffle !== false) {
            console.warn('shuffle: invalid args, must be Boolean')
            return
        }
        state.shuffle = shuffle
    },
    setVolume(state, volume) {
        state.volume = volume
        Howler.volume(volume)
    },
    setVolumeBeforeMuted(state, volume) {
        state.volumeBeforeMuted = volume
    },
    setList(state, list) {
        state.list = list
    },
    setCurrent(state, current) {
        if (state.shuffle) {
            state.shuffledCurrent = current
        } else {
            state.current = current
        }
    },
    changeCurrent(state, current) {
        state.current = current
    },
    setShuffledList(state, list) {
        state.shuffledList = list
    },
    setShuffledCurrent(state, index) {
        state.shuffledCurrent = index
    },
    setPlaylistSource(state, source) {
        state.playlistSource = source
    },
    setCurrentTrack(state, track) {
        state.currentTrack = track
    },
    setPlayNextList(state, list) {
        state.playNextList = list
    },
    setIsPersonalFM(state, bool) {
        state.isPersonalFM = bool
    },
    setPersonalFMTrack(state, track) {
        state.personalFMTrack = track
    },
    setPersonalFMNextTrack(state, track) {
        state.personalFMNextTrack = track
    },
    setHowler(state, obj) {
        state.howler = obj
    },
    removeTrackFromQueue(state, index) {
        state.playNextList.splice(index, 1)
    },
    clearPlayNextList(state) {
        state.playNextList = []
    },
    switchShuffle(state) {
        state.shuffle = !state.shuffle
        state.list = state.shuffle ? state.shuffledList : state.list
    },
    switchRepeatMode(state) {
        if (state.repeatMode === 'on') {
            state.repeatMode = 'one'
        } else if (state.repeatMode === 'one') {
            state.repeatMode = 'off'
        } else {
            state.repeatMode = 'on'
        }
    },
    appendTrack(state, trackID) {
        state.list.append(trackID)
    },
    mute(state) {
        if (state.volume === 0) {
            state.volume = state.volumeBeforeMuted
        } else {
            state.volumeBeforeMuted = state.volume
            state.volume = 0
        }
    },
}

const actions = {
    initPlayer({ state, commit, dispatch }) {
        Howler.autoUnlock = false
        Howler.usingWebAudio = true
        Howler.volume(state.volume)

        if (state.enabled) {
            // 恢复当前播放歌曲
            dispatch('replaceCurrentTrack', { id: state.currentTrack.id, autoplay: false }).then(() => {
                state.howler?.seek(localStorage.getItem('playerCurrentTrackTime') ?? 0)
            })
            dispatch('initMediaSession')
        }

        // 初始化私人FM
        if (state.personalFMTrack.id === 0 || state.personalFMNextTrack.id === 0) {
            personalFM().then((result) => {
                commit('setPersonalFMTrack', result.data[0])
                commit('setPersonalFMNextTrack', result.data[1])
            })
        }
    },
    sendSelfToIpcMain({ state, rootState }) {
        if (!isElectron()) {
            return false
        }
        ipcRenderer.send('player', {
            playing: state.playing,
            likedCurrentTrack: rootState.liked.songs.includes(state.currentTrack.id),
            isPersonalFM: state.isPersonalFM,
        })
    },
    setIntervals({ state, commit }) {
        setInterval(() => {
            if (state.howler === null) {
                return
            }
            commit('setProgress', state.howler.seek())
            localStorage.setItem('playerCurrentTrackTime', state.progress)
        }, 1000)
    },
    shuffleTheList({ state, commit }, firstTrackID = state.currentTrack.id) {
        let list = state.list.filter((tid) => tid !== firstTrackID)
        if (firstTrackID === 'first') {
            list = state.list
        }
        commit('setShuffledList', shuffle(list))
        if (firstTrackID !== 'first') {
            state.shuffledList.unshift(firstTrackID)
        }
    },
    scrobble({ state }, { track, time, completed = false }) {
        console.debug(
            `[debug][Player.js] scrobble track 👉 ${track.name} by ${track.ar[0].name} 👉 time:${time} completed: ${completed}`,
        )
        const trackDuration = ~~(track.dt / 1000)
        time = completed ? trackDuration : ~~time
        scrobble({
            id: track.id,
            sourceid: state.playlistSource.id,
            time,
        })
    },
    playAudioSource({ state, commit, dispatch }, { source, autoplay = true }) {
        Howler.unload()
        const howler = new Howl({
            src: [source],
            html5: true,
            format: ['mp3', 'flac'],
        })
        commit('setHowler', howler)
        if (autoplay) {
            dispatch('play')
            dispatch('sendSelfToIpcMain')
            document.title = `${state.currentTrack.name} · ${state.currentTrack.ar[0].name} - EstherMusic`
        }
        dispatch('setOutputDevice')
        state.howler.once('end', () => {
            dispatch('nextTrackCallback')
        })
    },
    getAudioSourceFromCache(context, id) {
        return getTrackSource(id).then((track) => {
            if (!track) {
                return
            }
            const source = URL.createObjectURL(new Blob([track.source]))
            return source
        })
    },
    getAudioSourceFromNetease({ rootState }, track) {
        if (isAccountLoggedIn()) {
            return getMP3(track.id).then((result) => {
                if (!result.data[0]) {
                    return null
                }
                if (!result.data[0].url) {
                    return null
                }
                if (result.data[0].freeTrialInfo !== null) {
                    return null // 跳过只能试听的歌曲
                }
                const source = result.data[0].url.replace(/^http:/, 'https:')
                if (rootState.settings.automaticallyCacheSongs) {
                    cacheTrackSource(track, source, result.data[0].br)
                }
                return source
            })
        } else {
            return new Promise((resolve) => {
                resolve(`https://music.163.com/song/media/outer/url?id=${track.id}`)
            })
        }
    },
    getAudioSourceFromUnblockMusic({ rootState }, track) {
        console.debug('[debug][Player.js] _getAudioSourceFromUnblockMusic')
        if (!isElectron() || rootState.settings.enableUnblockNeteaseMusic === false) {
            return null
        }
        const source = ipcRenderer.sendSync('unblock-music', track)
        if (rootState.settings.automaticallyCacheSongs && source?.url) {
            // TODO: 将unblockMusic字样换成真正的来源（比如酷我咪咕等）
            cacheTrackSource(track, source.url, 128000, 'unblockMusic')
        }
        return source?.url
    },
    getAudioSource({ dispatch }, track) {
        return dispatch('getAudioSourceFromCache', String(track.id))
            .then((source) => {
                return source ?? dispatch('getAudioSourceFromNetease', track)
            })
            .then((source) => {
                return source ?? dispatch('getAudioSourceFromUnblockMusic', track)
            })
    },
    replaceCurrentTrack({ state, dispatch, commit }, { id, autoplay = true, ifUnplayableThen = 'playNextTrack' }) {
        if (autoplay && state.currentTrack.name) {
            dispatch('scrobble', { track: state.currentTrack, time: state.howler?.seek() })
        }
        return getTrackDetail(id).then((data) => {
            let track = data.songs[0]
            commit('setCurrentTrack', track)
            dispatch('updateMediaSessionMetaData', track)
            return dispatch('getAudioSource', track).then((source) => {
                if (source) {
                    dispatch('playAudioSource', { source, autoplay })
                    dispatch('cacheNextTrack')
                    return source
                } else {
                    dispatch('toast/showToast', `无法播放 ${track.name}`, { root: true })
                    ifUnplayableThen === 'playNextTrack' ? dispatch('playNextTrack') : dispatch('playPrevTrack')
                }
            })
        })
    },
    cacheNextTrack({ state, dispatch, getters }) {
        let nextTrackID = state.isPersonalFM ? state.personalFMNextTrack.id : getters.getNextTrack[0]
        if (!nextTrackID) {
            return
        }
        if (state.personalFMTrack.id === nextTrackID) {
            return
        }
        getTrackDetail(nextTrackID).then((data) => {
            let track = data.songs[0]
            dispatch('getAudioSource', track)
        })
    },
    initMediaSession({ dispatch, getters }) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => {
                dispatch('play')
            })
            navigator.mediaSession.setActionHandler('pause', () => {
                dispatch('pause')
            })
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                dispatch('playPrevTrack')
            })
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                dispatch('playNextTrack')
            })
            navigator.mediaSession.setActionHandler('stop', () => {
                dispatch('pause')
            })
            navigator.mediaSession.setActionHandler('seekto', (event) => {
                getters.seek(event.seekTime)
                dispatch('updateMediaSessionPositionState')
            })
            navigator.mediaSession.setActionHandler('seekbackward', (event) => {
                getters.seek(getters.seek() - (event.seekOffset || 10))
                dispatch('updateMediaSessionPositionState')
            })
            navigator.mediaSession.setActionHandler('seekforward', (event) => {
                getters.seek(getters.seek() + (event.seekOffset || 10))
                dispatch('updateMediaSessionPositionState')
            })
        }
    },
    updateMediaSessionMetaData(context, track) {
        if ('mediaSession' in navigator === false) {
            return
        }
        let artists = track.ar.map((a) => a.name)
        navigator.mediaSession.metadata = new window.MediaMetadata({
            title: track.name,
            artist: artists.join(','),
            album: track.al.name,
            artwork: [
                {
                    src: track.al.picUrl + '?param=512y512',
                    type: 'image/jpg',
                    sizes: '512x512',
                },
            ],
        })
    },
    updateMediaSessionPositionState({ state, getters }) {
        if ('mediaSession' in navigator === false) {
            return
        }
        if ('setPositionState' in navigator.mediaSession) {
            navigator.mediaSession.setPositionState({
                duration: ~~(state.currentTrack.dt / 1000),
                playbackRate: 1.0,
                position: getters.seek(),
            })
        }
    },
    nextTrackCallback({ state, dispatch }) {
        dispatch('scrobble', { track: state.currentTrack, time: 0, completed: true })
        if (!state.isPersonalFM && state.repeatMode === 'one') {
            dispatch('replaceCurrentTrack', { id: state.currentTrack.id })
        } else {
            dispatch('playNextTrack')
        }
    },
    loadPersonalFMNextTrack({ state, dispatch, commit }) {
        return personalFM().then((result) => {
            commit('setPersonalFMNextTrack', result.data[0])
            dispatch('cacheNextTrack') // cache next track
            return state.personalFMNextTrack
        })
    },
    playNextTrack({ state, dispatch, getters, commit }, isFM = false) {
        if (state.isPersonalFM || isFM === true) {
            commit('setIsPersonalFM', true)
            commit('setPersonalFMTrack', state.personalFMNextTrack)
            dispatch('replaceCurrentTrack', { id: state.personalFMTrack.id })
            dispatch('loadPersonalFMNextTrack')
            return true
        }
        // TODO: 切换歌曲时增加加载中的状态
        const [trackID, index] = getters.getNextTrack
        if (trackID === undefined) {
            state.howler?.stop()
            commit('setPlaying', false)
            return false
        }
        commit('changeCurrent', index)
        dispatch('replaceCurrentTrack', { id: trackID })
        return true
    },
    playPrevTrack({ getters, dispatch, commit }) {
        const [trackID, index] = getters.getPrevTrack
        if (trackID === undefined) {
            state.howler?.stop()
            commit('setPlaying', false)
            return false
        }
        commit('changeCurrent', index)
        dispatch('replaceCurrentTrack', { id: trackID, autoplay: true, ifUnplayableThen: 'playPrevTrack' })
        return true
    },
    pause({ state, commit }) {
        state.howler?.pause()
        commit('setPlaying', false)
        document.title = 'EstherMusic'
    },
    play({ state, commit }) {
        if (state.howler?.playing()) {
            return
        }
        state.howler?.play()
        commit('setPlaying', true)
        document.title = `${state.currentTrack.name} · ${state.currentTrack.ar[0].name} - EstherMusic`
    },
    playOrPause({ state, dispatch }) {
        if (state.howler?.playing()) {
            dispatch('pause')
        } else {
            dispatch('play')
        }
        dispatch('sendSelfToIpcMain')
    },
    setOutputDevice({ state, rootState }) {
        if (state.howler?._sounds.length <= 0 || !state.howler?._sounds[0]._node) {
            return
        }
        state.howler?._sounds[0]._node.setSinkId(rootState.settings.outputDevice)
    },
    replacePlaylist({ state, dispatch, commit }, { trackIDs, id, type, trackID = 'first' }) {
        commit('setIsPersonalFM', false)
        if (!state.enabled) {
            commit('setEnabled', true)
        }
        commit('setList', trackIDs)
        commit('changeCurrent', 0)
        commit('setPlaylistSource', { type, id })
        if (state.shuffle) {
            dispatch('shuffleTheList', trackID)
        }
        if (trackID === 'first') {
            dispatch('replaceCurrentTrack', { id: state.list[0] })
        } else {
            commit('changeCurrent', trackIDs.indexOf(trackID))
            dispatch('replaceCurrentTrack', { id: trackID })
        }
    },
    playAlbumByID({ dispatch }, { id, trackID = 'first' }) {
        getAlbum(id).then((data) => {
            let trackIDs = []
            data.songs.forEach((track) => {
                if (track.playable) {
                    trackIDs.push(track.id)
                }
            })
            if (trackIDs.length !== 0) {
                dispatch('replacePlaylist', { trackIDs, id, type: 'album', trackID })
            } else {
                dispatch('toast/showToast', `无法播放专辑 ${data.album.name} 中的歌曲`, { root: true })
            }
        })
    },
    playPlaylistByID({ dispatch }, { id, trackID = 'first', noCache = false }) {
        console.debug(`[debug][Player.js] playPlaylistByID 👉 id:${id} trackID:${trackID} noCache:${noCache}`)
        getPlaylistDetail(id, noCache).then((data) => {
            let playlist = data.playlist.trackIds.map((t) => t.id)
            getTrackDetail(playlist.join(',')).then((res) => {
                let trackIDs = []
                res.songs.forEach((track) => {
                    if (track.playable) {
                        trackIDs.push(track.id)
                    }
                })
                if (trackIDs.length !== 0) {
                    dispatch('replacePlaylist', { trackIDs, id, type: 'playlist', trackID })
                } else {
                    dispatch('toast/showToast', `无法播放歌单 ${data.playlist.name} 中的歌曲`, { root: true })
                }
            })
        })
    },
    playArtistByID({ dispatch }, { id, trackID = 'first' }) {
        getArtist(id).then((data) => {
            let trackIDs = []
            data.hotSongs.forEach((track) => {
                if (track.playable) {
                    trackIDs.push(track.id)
                }
            })
            if (trackIDs.length !== 0) {
                dispatch('replacePlaylist', { trackIDs, id, type: 'artist', trackID })
            } else {
                dispatch('toast/showToast', `无法播放歌手 ${data.artist.name} 中的歌曲`, { root: true })
            }
        })
    },
    playTrackOnListByID({ state, dispatch, commit }, { id, listName = 'default' }) {
        if (listName === 'default') {
            commit(
                'changeCurrent',
                state.list.findIndex((t) => t === id),
            )
        }
        dispatch('replaceCurrentTrack', { id })
    },
    addTrackToPlayNext({ state, dispatch }, { trackID, playNow = false }) {
        state.playNextList.push(trackID)
        if (playNow) {
            dispatch('playNextTrack')
        }
    },
    playPersonalFM({ state, dispatch, commit }) {
        commit('setIsPersonalFM', true)
        if (!state.enabled) {
            commit('setEnabled', true)
        }
        if (state.currentTrack.id !== state.personalFMTrack.id) {
            dispatch('replaceCurrentTrack', { id: state.personalFMTrack.id }).then(() => dispatch('playOrPause'))
        } else {
            dispatch('playOrPause')
        }
    },
    moveToFMTrash({ state, dispatch, commit }) {
        commit('setIsPersonalFM', true)
        dispatch('playNextTrack')
        fmTrash(state.personalFMTrack.id)
    },
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
}
