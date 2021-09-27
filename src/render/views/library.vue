<template>
    <div v-show="show" ref="library">
        <h1>
            <img class="avatar" :src="proxy.$filters.resizeImage(data.user.avatarUrl)" />{{ data.user.nickname
            }}{{ $t('library.sLibrary') }}
        </h1>
        <div class="section-one">
            <div class="liked-songs" @click="goToLikedSongsList">
                <div class="top">
                    <p>
                        <span v-for="(line, index) in pickedLyric" v-show="line !== ''" :key="`${line}${index}`"
                            >{{ line }}<br
                        /></span>
                    </p>
                </div>
                <div class="bottom">
                    <div class="titles">
                        <div class="title">{{ $t('library.likedSongs') }}</div>
                        <div class="sub-title"> {{ liked.songs.length }} {{ $t('common.songs') }} </div>
                    </div>
                    <button @click.stop="playLikedSongs">
                        <svg-icon icon-name="play" />
                    </button>
                </div>
            </div>
            <div class="songs">
                <TrackList
                    :id="liked.playlists.length > 0 ? liked.playlists[0].id : 0"
                    :tracks="liked.songsWithDetails"
                    :column-number="3"
                    type="tracklist"
                    dbclick-track-func="playPlaylistByID"
                />
            </div>
        </div>

        <div class="section-two">
            <div class="tabs-row">
                <div class="tabs">
                    <div
                        class="tab"
                        :class="{ active: currentTab === 'minePlaylists' }"
                        @click="updateCurrentTab('minePlaylists')"
                    >
                        {{ $t('library.minePlaylists') }}
                    </div>
                    <div
                        class="tab"
                        :class="{ active: currentTab === 'likedPlaylists' }"
                        @click="updateCurrentTab('likedPlaylists')"
                    >
                        {{ $t('library.likedPlaylists') }}
                    </div>
                    <div class="tab" :class="{ active: currentTab === 'albums' }" @click="updateCurrentTab('albums')">
                        {{ $t('library.albums') }}
                    </div>
                    <div class="tab" :class="{ active: currentTab === 'artists' }" @click="updateCurrentTab('artists')">
                        {{ $t('library.artists') }}
                    </div>
                    <div class="tab" :class="{ active: currentTab === 'mvs' }" @click="updateCurrentTab('mvs')">
                        {{ $t('library.mvs') }}
                    </div>
                </div>
                <button v-show="currentTab === 'minePlaylists'" class="tab-button" @click="openAddPlaylistModal"
                    ><svg-icon icon-name="plus" />{{ $t('library.newPlayList') }}
                </button>
            </div>

            <div v-show="currentTab === 'minePlaylists'">
                <CoverRow
                    :items="liked.minePlaylists.slice(1)"
                    type="playlist"
                    sub-text="creator"
                    :show-play-button="true"
                />
            </div>

            <div v-show="currentTab === 'likedPlaylists'">
                <CoverRow :items="liked.likedPlaylists" type="playlist" sub-text="creator" :show-play-button="true" />
            </div>

            <div v-show="currentTab === 'albums'">
                <CoverRow :items="liked.albums" type="album" sub-text="artist" :show-play-button="true" />
            </div>

            <div v-show="currentTab === 'artists'">
                <CoverRow :items="liked.artists" type="artist" :show-play-button="true" />
            </div>

            <div v-show="currentTab === 'mvs'">
                <MvRow :mvs="liked.mvs" />
            </div>
        </div>
    </div>
</template>

<script>
    import { ref, computed, getCurrentInstance, onActivated } from 'vue'
    import { useStore } from 'vuex'
    import { useRouter } from 'vue-router'
    import { useI18n } from 'vue-i18n'
    import NProgress from 'nprogress'

    import { getLyric } from '@render/NeteastApi/track'

    import { randomNum, dailyTask } from '@render/utils/common'
    import { isAccountLoggedIn } from '@render/utils/auth'

    import ContextMenu from '@render/components/ContextMenu.vue'
    import TrackList from '@render/components/TrackList.vue'
    import CoverRow from '@render/components/CoverRow.vue'
    import SvgIcon from '@render/components/SvgIcon.vue'
    import MvRow from '@render/components/MvRow.vue'

    export default {
        name: 'Library',
        components: {
            SvgIcon,
            CoverRow,
            TrackList,
            MvRow,
            ContextMenu,
        },
        setup() {
            const store = useStore()
            const router = useRouter()
            const { proxy } = getCurrentInstance()
            const { t } = useI18n()

            const show = ref(false)
            const likedSongs = ref([])
            const lyric = ref(undefined)
            const currentTab = ref('minePlaylists')

            const data = computed(() => store.state.data)
            const liked = computed(() => store.state.liked)
            const player = computed(() => store.state.player)

            const showToast = (toast) => {
                store.dispatch('toast/showToast', toast)
            }

            const updateModal = (modal) => {
                store.commit('modals/updateModal', modal)
            }

            const updateData = (data) => {
                store.commit('data/updateData', data)
            }

            const pickedLyric = computed(() => {
                if (lyric.value === undefined) {
                    return ''
                }
                let lyrics = lyric.value.split('\n')
                lyrics = lyrics.filter((l) => {
                    if (l.includes('作词') || l.includes('作曲')) {
                        return false
                    }
                    return true
                })
                let lineIndex = randomNum(0, lyrics.length - 1)
                while (lineIndex + 4 > lyrics.length) {
                    lineIndex = randomNum(0, lyrics.length - 1)
                }
                return [
                    lyrics[lineIndex].split(']')[1],
                    lyrics[lineIndex + 1].split(']')[1],
                    lyrics[lineIndex + 2].split(']')[1],
                ]
            })

            const playLikedSongs = () => {
                store.dispatch('player/playPlaylistByID', {
                    id: liked.value.playlists[0].id,
                    trackID: 'first',
                    noCache: true,
                })
            }

            const updateCurrentTab = (tab) => {
                if (!isAccountLoggedIn() && tab !== 'minePlaylists') {
                    showToast(t('toast.needToLogin'))
                    return
                }
                currentTab.value = tab
            }

            const goToLikedSongsList = () => {
                router.push({
                    path: '/library/liked-songs',
                })
            }

            const getRandomLyric = () => {
                if (liked.value.songs.length === 0) {
                    return
                }
                getLyric(liked.value.songs[randomNum(0, liked.value.songs.length - 1)]).then((res) => {
                    if (res.lrc !== undefined) {
                        lyric.value = res.lrc.lyric
                    }
                })
            }

            const openAddPlaylistModal = () => {
                if (!isAccountLoggedIn()) {
                    showToast(t('toast.needToLogin'))
                    return
                }
                updateModal({
                    modalName: 'newPlaylistModal',
                    key: 'show',
                    value: true,
                })
            }

            const openPlaylistTabMenu = (e) => {
                proxy.$refs.playlistTabMenu.openMenu(e)
            }

            const loadData = () => {
                if (liked.value.songsWithDetails.length > 0) {
                    NProgress.done()
                    show.value = true
                    store.dispatch('liked/fetchLikedSongsWithDetails')
                    getRandomLyric()
                } else {
                    store.dispatch('liked/fetchLikedSongsWithDetails').then(() => {
                        NProgress.done()
                        show.value = true
                        getRandomLyric()
                    })
                }
                store.dispatch('liked/fetchLikedSongs')
                store.dispatch('liked/fetchLikedPlaylist')
                store.dispatch('liked/fetchLikedAlbums')
                store.dispatch('liked/fetchLikedArtists')
                store.dispatch('liked/fetchLikedMVs')
            }
            setTimeout(() => {
                if (!show.value) {
                    NProgress.start()
                }
            }, 1000)
            loadData()

            onActivated(() => {
                proxy.$root.$refs.scrollbar.restorePosition()
                loadData()
                dailyTask()
            })

            return {
                proxy,
                show,
                likedSongs,
                lyric,
                currentTab,
                data,
                liked,
                player,
                showToast,
                updateModal,
                updateData,
                pickedLyric,
                playLikedSongs,
                updateCurrentTab,
                goToLikedSongsList,
                getRandomLyric,
                openAddPlaylistModal,
                openPlaylistTabMenu,
                loadData,
            }
        },
    }
</script>

<style lang="scss" scoped>
    h1 {
        font-size: 42px;
        color: var(--color-text);
        display: flex;
        align-items: center;
        .avatar {
            height: 44px;
            margin-right: 12px;
            vertical-align: -7px;
            border-radius: 50%;
            border: rgba(0, 0, 0, 0.2);
        }
    }

    .section-one {
        display: flex;
        margin-top: 24px;
        .songs {
            flex: 7;
            margin-top: 8px;
            margin-left: 36px;
            overflow: hidden;
        }
    }

    .liked-songs {
        flex: 3;
        margin-top: 8px;
        cursor: pointer;
        border-radius: 16px;
        padding: 18px 24px;
        display: flex;
        flex-direction: column;
        transition: all 0.4s;
        box-sizing: border-box;

        background: var(--color-primary-bg);

        .bottom {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: var(--color-primary);

            .title {
                font-size: 24px;
                font-weight: 700;
            }
            .sub-title {
                font-size: 15px;
                margin-top: 2px;
            }

            button {
                margin-bottom: 2px;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 44px;
                width: 44px;
                background: var(--color-primary);
                border-radius: 50%;
                transition: 0.2s;
                box-shadow: 0 6px 12px -4px rgba(0, 0, 0, 0.2);
                cursor: default;

                .svg-icon {
                    color: var(--color-primary-bg);
                    margin-left: 4px;
                    height: 16px;
                    width: 16px;
                }
                &:hover {
                    transform: scale(1.06);
                    box-shadow: 0 6px 12px -4px rgba(0, 0, 0, 0.4);
                }
                &:active {
                    transform: scale(0.94);
                }
            }
        }

        .top {
            flex: 1;
            display: flex;
            flex-wrap: wrap;
            font-size: 14px;
            opacity: 0.88;
            color: var(--color-primary);
            p {
                margin-top: 2px;
            }
        }
    }

    .section-two {
        margin-top: 54px;
        min-height: calc(100vh - 182px);
    }

    .tabs-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 24px;
    }

    .tabs {
        display: flex;
        flex-wrap: wrap;
        font-size: 18px;
        color: var(--color-text);
        .tab {
            font-weight: 600;
            padding: 8px 14px;
            margin-right: 14px;
            border-radius: 8px;
            cursor: pointer;
            user-select: none;
            transition: 0.2s;
            opacity: 0.68;
            &:hover {
                opacity: 0.88;
                background-color: var(--color-secondary-bg);
            }
        }
        .tab.active {
            opacity: 0.88;
            background-color: var(--color-secondary-bg);
        }
        .tab.dropdown {
            display: flex;
            align-items: center;
            padding: 0;
            overflow: hidden;
            .text {
                padding: 8px 3px 8px 14px;
            }
            .icon {
                height: 100%;
                display: flex;
                align-items: center;
                padding: 0 8px 0 3px;
                .svg-icon {
                    height: 16px;
                    width: 16px;
                }
            }
        }
    }

    button.tab-button {
        color: var(--color-text);
        border-radius: 8px;
        padding: 0 14px;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: 0.2s;
        opacity: 0.68;
        font-weight: 500;
        .svg-icon {
            width: 14px;
            height: 14px;
            margin-right: 8px;
        }
        &:hover {
            opacity: 1;
            background: var(--color-secondary-bg);
        }
        &:active {
            opacity: 1;
            transform: scale(0.92);
        }
    }
</style>
