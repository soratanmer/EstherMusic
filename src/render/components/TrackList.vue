<template>
    <div class="track-list">
        <ContextMenu ref="menu">
            <div class="item-info">
                <img :src="proxy.$filters.resizeImage(rightClickedTrack.al.picUrl, 224)" />
                <div class="info">
                    <div class="title">{{ rightClickedTrack.name }}</div>
                    <div class="subtitle">
                        {{ rightClickedTrack.ar[0].name }}
                    </div>
                </div>
            </div>
            <hr />
            <div class="item" @click="play">{{ $t('contextMenu.play') }}</div>
            <div class="item" @click="addToQueue">
                {{ $t('contextMenu.addToQueue') }}
            </div>
            <div
                v-if="extraContextMenuItem.includes('removeTrackFromQueue')"
                class="item"
                @click="removeTrackFromQueue"
            >
                从队列删除
            </div>
            <hr />
            <div v-show="!isRightClickedTrackLiked" class="item" @click="like">
                {{ $t('contextMenu.saveToMyLikedSongs') }}
            </div>
            <div v-show="isRightClickedTrackLiked" class="item" @click="like">
                {{ $t('contextMenu.removeFromMyLikedSongs') }}
            </div>
            <div
                v-if="extraContextMenuItem.includes('removeTrackFromPlaylist')"
                class="item"
                @click="removeTrackFromPlaylist"
            >
                从歌单中删除
            </div>
            <div class="item" @click="addTrackToPlaylist">{{ $t('contextMenu.addToPlaylist') }}</div>
        </ContextMenu>
        <div :style="listStyles">
            <TrackListItem
                v-for="(track, index) in tracks"
                :key="itemKey === 'id' ? track.id : `${track.id}${index}`"
                :track-prop="track"
                :highlight-playing-track="highlightPlayingTrack"
                @dblclick="playThisList(track.id)"
                @click.right="openMenu($event, track, index)"
            />
        </div>
    </div>
</template>

<script>
    import { ref, computed, getCurrentInstance } from 'vue'
    import { useStore } from 'vuex'
    import { useI18n } from 'vue-i18n'

    import { addOrRemoveTrackFromPlaylist } from '@render/NeteastApi/playlist'

    import { isAccountLoggedIn } from '@render/utils/auth'

    import TrackListItem from '@render/components/TrackListItem.vue'
    import ContextMenu from '@render/components/ContextMenu.vue'

    export default {
        name: 'TrackList',
        components: {
            TrackListItem,
            ContextMenu,
        },
        props: {
            tracks: {
                type: Array,
                default: () => {
                    return []
                },
            },
            type: {
                type: String,
                default: 'tracklist',
            }, // tracklist | album | playlist | cloudDisk
            id: {
                type: Number,
                default: 0,
            },
            dbclickTrackFunc: {
                type: String,
                default: 'default',
            },
            albumObject: {
                type: Object,
                default: () => {
                    return {
                        artist: {
                            name: '',
                        },
                    }
                },
            },
            extraContextMenuItem: {
                type: Array,
                default: () => {
                    return [
                        // 'removeTrackFromPlaylist'
                        // 'removeTrackFromQueue'
                    ]
                },
            },
            columnNumber: {
                type: Number,
                default: 4,
            },
            highlightPlayingTrack: {
                type: Boolean,
                default: true,
            },
            itemKey: {
                type: String,
                default: 'id',
            },
        },
        setup(props) {
            const store = useStore()
            const { t } = useI18n()
            const { proxy } = getCurrentInstance()

            const rightClickedTrack = ref({
                id: 0,
                name: '',
                ar: [
                    {
                        name: '',
                    },
                ],
                al: {
                    picUrl: '',
                },
            })
            const rightClickedTrackIndex = ref(-1)
            const listStyles = ref({})

            const liked = computed(() => store.state.liked)
            const player = computed(() => store.state.player)

            const updateModal = (modal) => {
                store.commit('modals/updateModal', modal)
            }

            const showToast = (toast) => {
                store.dispatch('toast/showToast', toast)
            }

            const likeATrack = (id) => {
                store.dispatch('liked/likeATrack', id)
            }

            const isRightClickedTrackLiked = computed(() => {
                return liked.value.songs.includes(rightClickedTrack.value?.id)
            })

            const openMenu = (e, track, index = -1) => {
                rightClickedTrack.value = track
                rightClickedTrackIndex.value = index
                proxy.$refs.menu.openMenu(e)
            }

            const closeMenu = () => {
                rightClickedTrack.value = {
                    id: 0,
                    name: '',
                    ar: [
                        {
                            name: '',
                        },
                    ],
                    al: {
                        picUrl: '',
                    },
                }
                rightClickedTrackIndex.value = -1
            }

            const playThisListDefault = (trackID) => {
                if (props.type === 'playlist') {
                    store.dispatch('player/playPlaylistByID', { id: props.id, trackID })
                } else if (props.type === 'album') {
                    store.dispatch('player/playAlbumByID', { id: props.id, trackID })
                } else if (props.type === 'tracklist') {
                    let trackIDs = props.tracks.map((t) => t.id)
                    store.dispatch('player/replacePlaylist', { trackIDs, id: props.id, type: 'artist', trackID })
                }
            }

            const playThisList = (trackID) => {
                if (props.dbclickTrackFunc === 'default') {
                    playThisListDefault(trackID)
                } else if (props.dbclickTrackFunc === 'none') {
                    // do nothing
                } else if (props.dbclickTrackFunc === 'playTrackOnListByID') {
                    store.dispatch('player/playTrackOnListByID', { id: trackID })
                } else if (props.dbclickTrackFunc === 'playPlaylistByID') {
                    store.dispatch('player/playPlaylistByID', { id: props.id, trackID })
                } else if (props.dbclickTrackFunc === 'playAList') {
                    let trackIDs = props.tracks.map((t) => t.id)
                    store.dispatch('player/replacePlaylist', { trackIDs, id: props.id, type: 'artist', trackID })
                } else if (props.dbclickTrackFunc === 'dailyTracks') {
                    let trackIDs = props.tracks.map((t) => t.id)
                    store.dispatch('player/replacePlaylist', { trackIDs, id: '/daily/songs', type: 'url', trackID })
                }
            }

            const play = () => {
                store.dispatch('player/addTrackToPlayNext', { trackID: rightClickedTrack.value.id, playNow: true })
            }

            const addToQueue = () => {
                store.dispatch('player/addTrackToPlayNext', { trackID: rightClickedTrack.value.id })
            }

            const like = () => {
                likeATrack(rightClickedTrack.value.id)
            }

            const addTrackToPlaylist = () => {
                if (!isAccountLoggedIn()) {
                    showToast(t('toast.needToLogin'))
                    return
                }
                updateModal({
                    modalName: 'addTrackToPlaylistModal',
                    key: 'show',
                    value: true,
                })
                updateModal({
                    modalName: 'addTrackToPlaylistModal',
                    key: 'selectedTrackID',
                    value: rightClickedTrack.value.id,
                })
            }

            const removeTrackFromPlaylist = () => {
                if (!isAccountLoggedIn()) {
                    showToast(t('toast.needToLogin'))
                    return
                }
                if (confirm(`确定要从歌单删除 ${rightClickedTrack.value.name}？`)) {
                    let trackID = rightClickedTrack.value.id
                    addOrRemoveTrackFromPlaylist({
                        op: 'del',
                        pid: props.id,
                        tracks: trackID,
                    }).then((res) => {
                        showToast(res.body.code === 200 ? t('toast.removedFromPlaylist') : res.body.message)
                        proxy.$parent.removeTrack(trackID)
                    })
                }
            }

            const removeTrackFromQueue = () => {
                store.commit('player/removeTrackFromQueue', rightClickedTrackIndex.value)
            }

            if (props.type === 'tracklist') {
                listStyles.value = {
                    display: 'grid',
                    gap: '4px',
                    gridTemplateColumns: `repeat(${props.columnNumber}, 1fr)`,
                }
            }

            return {
                store,
                proxy,
                rightClickedTrack,
                rightClickedTrackIndex,
                listStyles,
                liked,
                player,
                updateModal,
                showToast,
                likeATrack,
                isRightClickedTrackLiked,
                openMenu,
                closeMenu,
                playThisListDefault,
                playThisList,
                play,
                addToQueue,
                like,
                addTrackToPlaylist,
                removeTrackFromPlaylist,
                removeTrackFromQueue,
            }
        },
    }
</script>
