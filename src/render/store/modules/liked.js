import { isAccountLoggedIn, isLooseLoggedIn } from '@render/utils/auth'
import { likeATrack, getTrackDetail } from '@render/NeteastApi/track'
import { getPlaylistDetail } from '@render/NeteastApi/playlist'
import { userPlaylist, userLikedSongsIDs, likedAlbums, likedArtists, likedMVs } from '@render/NeteastApi/user'

const state = {
    songs: [],
    songsWithDetails: [], // 只有前12首
    playlists: [],
    minePlaylists: [],
    likedPlaylists: [],
    albums: [],
    artists: [],
    mvs: [],
}

const mutations = {
    setSongs(state, song) {
        state.songs = song
    },
    setSongsWithDetails(state, song) {
        state.songsWithDetails = song
    },
    setPlaylists(state, list) {
        state.playlists = list
    },
    setMinePlaylists(state, list) {
        state.minePlaylists = list
    },
    setLikedPlaylists(state, list) {
        state.likedPlaylists = list
    },
    setAlbums(state, album) {
        state.albums = album
    },
    setArtists(state, artist) {
        state.artists = artist
    },
    setMvs(state, mv) {
        state.mvs = mv
    },
}

const actions = {
    likeATrack({ state, commit, dispatch }, id) {
        if (!isAccountLoggedIn()) {
            dispatch('toast/showToast', '此操作需要登录网易云账号', { root: true })
            return
        }
        let like = true
        if (state.songs.includes(id)) {
            like = false
        }
        likeATrack({ id, like }).then(() => {
            if (like === false) {
                commit(
                    'setSongs',
                    state.songs.filter((d) => d !== id),
                )
            } else {
                let newLikeSongs = state.songs
                newLikeSongs.push(id)
                commit('setSongs', newLikeSongs)
            }
            dispatch('fetchLikedSongsWithDetails')
            dispatch('player/sendSelfToIpcMain', null, { root: true })
        })
    },
    fetchLikedSongs: ({ rootState, commit, dispatch }) => {
        if (!isLooseLoggedIn()) {
            return
        }
        if (isAccountLoggedIn()) {
            return userLikedSongsIDs(rootState.data.user.userId).then((result) => {
                if (result.ids) {
                    commit('setSongs', result.ids)
                    dispatch('player/sendSelfToIpcMain', null, { root: true })
                }
            })
        } else {
            // TODO:搜索ID登录的用户
        }
    },
    fetchLikedSongsWithDetails: ({ rootState, commit }) => {
        return getPlaylistDetail(rootState.data.likedSongPlaylistID, true).then((result) => {
            if (result.playlist?.trackIds?.length === 0) {
                return new Promise((resolve) => {
                    resolve()
                })
            }
            return getTrackDetail(
                result.playlist.trackIds
                    .slice(0, 12)
                    .map((t) => t.id)
                    .join(','),
            ).then((result) => {
                commit('setSongsWithDetails', result.songs)
            })
        })
    },
    fetchLikedPlaylist: ({ state, rootState, commit }) => {
        if (!isLooseLoggedIn()) {
            return
        }
        if (isAccountLoggedIn()) {
            return userPlaylist({
                uid: rootState.data.user.userId,
                limit: 2000, // 最多只加载2000个歌单（等有用户反馈问题再修）
                timestamp: new Date().getTime(),
            }).then((result) => {
                if (result.playlist) {
                    commit('setPlaylists', result.playlist)
                    // 更新用户”喜欢的歌曲“歌单ID
                    commit(
                        'data/updateData',
                        {
                            key: 'likedSongPlaylistID',
                            value: result.playlist[0].id,
                        },
                        { root: true },
                    )
                    let mineLists = []
                    let likedLists = []
                    result.playlist.forEach((element) => {
                        if (element.creator.userId === rootState.data.user.userId) {
                            mineLists.push(element)
                        } else if (element.creator.userId !== rootState.data.user.userId) {
                            likedLists.push(element)
                        }
                    })
                    commit('setMinePlaylists', mineLists)
                    commit('setLikedPlaylists', likedLists)
                }
            })
        } else {
            // TODO:搜索ID登录的用户
        }
    },
    fetchLikedAlbums: ({ commit }) => {
        if (!isAccountLoggedIn()) {
            return
        }
        return likedAlbums({ limit: 2000 }).then((result) => {
            if (result.data) {
                commit('setAlbums', result.data)
            }
        })
    },
    fetchLikedArtists: ({ commit }) => {
        if (!isAccountLoggedIn()) {
            return
        }
        return likedArtists({ limit: 2000 }).then((result) => {
            if (result.data) {
                commit('setArtists', result.data)
            }
        })
    },
    fetchLikedMVs: ({ commit }) => {
        if (!isAccountLoggedIn()) {
            return
        }
        return likedMVs({ limit: 2000 }).then((result) => {
            if (result.data) {
                commit('setMvs', result.data)
            }
        })
    },
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
}
