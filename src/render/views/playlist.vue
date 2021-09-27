<template>
    <div v-show="show" class="playlist">
        <div v-if="specialPlaylistInfo === undefined && !isLikeSongsPage" class="playlist-info">
            <Cover
                :id="playlist.id"
                :image-url="proxy.$filters.resizeImage(playlist.coverImgUrl, 1024)"
                :show-play-button="true"
                :always-show-shadow="true"
                :click-cover-to-play="true"
                :fixed-size="288"
                type="playlist"
                :cover-hover="false"
                :play-button-size="18"
                @click.right="openMenu"
            />
            <div class="info">
                <div class="title" @click.right="openMenu">
                    <span v-if="playlist.privacy === 10" class="lock-icon"> <svg-icon icon-name="lock" /></span
                    >{{ playlist.name }}
                </div>
                <div class="artist">
                    Playlist by
                    <span
                        v-if="[5277771961, 5277965913, 5277969451, 5277778542, 5278068783].includes(playlist.id)"
                        style="font-weight: 600"
                        >Apple Music</span
                    >
                    <a
                        v-else
                        :href="`https://music.163.com/#/user/home?id=${playlist.creator.userId}`"
                        target="blank"
                        >{{ playlist.creator.nickname }}</a
                    >
                </div>
                <div class="date-and-count">
                    {{ $t('playlist.updatedAt') }}
                    {{ proxy.$filters.formatDate(playlist.updateTime) }} ·
                    {{ playlist.trackCount }}
                    {{ $t('common.songs') }}
                </div>
                <div class="description" @click="toggleFullDescription">
                    {{ playlist.description }}
                </div>
                <div class="buttons">
                    <ButtonTwoTone icon-class="play" @click="playPlaylistByID()">
                        {{ $t('common.play') }}
                    </ButtonTwoTone>
                    <ButtonTwoTone
                        v-if="playlist.creator.userId !== data.user.userId"
                        :icon-class="playlist.subscribed ? 'heart-solid' : 'heart'"
                        :icon-button="true"
                        :horizontal-padding="0"
                        :color="playlist.subscribed ? 'blue' : 'grey'"
                        :text-color="playlist.subscribed ? '#335eea' : ''"
                        :background-color="playlist.subscribed ? 'var(--color-secondary-bg)' : ''"
                        @click="likePlaylist"
                    />
                    <ButtonTwoTone
                        icon-class="more"
                        :icon-button="true"
                        :horizontal-padding="0"
                        color="grey"
                        @click="openMenu"
                    />
                </div>
            </div>
            <div v-if="displaySearchInPlaylist" class="search-box">
                <div class="container" :class="{ active: inputFocus }">
                    <svg-icon icon-name="search" />
                    <div class="input">
                        <input
                            v-model.trim="inputSearchKeyWords"
                            v-focus
                            :placeholder="inputFocus ? '' : $t('playlist.search')"
                            @input="inputDebounce()"
                            @focus="inputFocus = true"
                            @blur="inputFocus = false"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div v-if="specialPlaylistInfo !== undefined" class="special-playlist">
            <div class="title" :class="specialPlaylistInfo.gradient" @click.right="openMenu">
                {{ specialPlaylistInfo.name }}
            </div>
            <div class="subtitle"> {{ playlist.englishTitle }} · {{ playlist.updateFrequency }} </div>

            <div class="buttons">
                <ButtonTwoTone class="play-button" icon-class="play" color="grey" @click="playPlaylistByID()">
                    {{ $t('common.play') }}
                </ButtonTwoTone>
                <ButtonTwoTone
                    v-if="playlist.creator.userId !== data.user.userId"
                    :icon-class="playlist.subscribed ? 'heart-solid' : 'heart'"
                    :icon-button="true"
                    :horizontal-padding="0"
                    :color="playlist.subscribed ? 'blue' : 'grey'"
                    :text-color="playlist.subscribed ? '#335eea' : ''"
                    :background-color="playlist.subscribed ? 'var(--color-secondary-bg)' : ''"
                    @click="likePlaylist"
                />
                <ButtonTwoTone
                    icon-class="more"
                    :icon-button="true"
                    :horizontal-padding="0"
                    color="grey"
                    @click="openMenu"
                />
            </div>
        </div>

        <div v-if="isLikeSongsPage" class="user-info">
            <h1>
                <img class="avatar" :src="proxy.$filters.resizeImage(data.user.avatarUrl)" />{{ data.user.nickname
                }}{{ $t('library.sLikedSongs') }}
            </h1>
            <div class="search-box-likepage" @click="searchInPlaylist()">
                <div class="container" :class="{ active: inputFocus }">
                    <svg-icon icon-name="search" />
                    <div class="input" :style="{ width: searchInputWidth }">
                        <input
                            v-if="displaySearchInPlaylist"
                            v-model.trim="inputSearchKeyWords"
                            v-focus
                            :placeholder="inputFocus ? '' : $t('playlist.search')"
                            @input="inputDebounce()"
                            @focus="inputFocus = true"
                            @blur="inputFocus = false"
                        />
                    </div>
                </div>
            </div>
        </div>

        <TrackList
            :id="playlist.id"
            :tracks="filteredTracks"
            type="playlist"
            :extra-context-menu-item="isUserOwnPlaylist ? ['removeTrackFromPlaylist'] : []"
        />

        <div class="load-more">
            <ButtonTwoTone v-show="hasMore" color="grey" :loading="loadingMore" @click="loadMore()">{{
                $t('explore.loadMore')
            }}</ButtonTwoTone>
        </div>

        <Modal
            :show="showFullDescription"
            :close="toggleFullDescription"
            :show-footer="false"
            :click-outside-hide="true"
            :title="$t('modal.playlistDescription')"
            >{{ playlist.description }}</Modal
        >

        <ContextMenu ref="playlistMenu">
            <div class="item" @click="likePlaylist(true)">
                {{ playlist.subscribed ? $t('contextMenu.removeFromLibrary') : $t('contextMenu.saveToLibrary') }}</div
            >
            <div class="item" @click="searchInPlaylist()">{{ $t('contextMenu.searchInPlaylist') }} </div>
            <div v-if="playlist.creator.userId === data.user.userId" class="item" @click="editPlaylist">
                {{ $t('contextMenu.editPlaylist') }}
            </div>
            <div v-if="playlist.creator.userId === data.user.userId" class="item" @click="deletePlaylists()">
                {{ $t('contextMenu.deletePlaylist') }}
            </div>
        </ContextMenu>
    </div>
</template>

<script>
    import { ref, computed, getCurrentInstance } from 'vue'
    import { useStore } from 'vuex'
    import { useRoute, useRouter } from 'vue-router'
    import NProgress from 'nprogress'
    import { useI18n } from 'vue-i18n'

    import { getPlaylistDetail, subscribePlaylist, deletePlaylist } from '@render/NeteastApi/playlist'
    import { getTrackDetail } from '@render/NeteastApi/track'

    import { isAccountLoggedIn } from '@render/utils/auth'
    import specialPlaylist from '@render/utils/specialPlaylist'

    import ButtonTwoTone from '@render/components/ButtonTwoTone.vue'
    import SvgIcon from '@render/components/SvgIcon.vue'
    import ContextMenu from '@render/components/ContextMenu.vue'
    import TrackList from '@render/components/TrackList.vue'
    import Cover from '@render/components/Cover.vue'
    import Modal from '@render/components/Modal.vue'

    export default {
        name: 'Playlist',
        components: {
            Cover,
            ButtonTwoTone,
            TrackList,
            Modal,
            ContextMenu,
            SvgIcon,
        },
        directives: {
            focus: {
                mounted(el) {
                    el.focus()
                },
            },
        },
        setup() {
            const store = useStore()
            const route = useRoute()
            const router = useRouter()
            const { proxy } = getCurrentInstance()
            const { t } = useI18n()

            const ids = ref()
            const show = ref(false)
            const playlist = ref({
                id: 0,
                coverImgUrl: '',
                creator: {
                    userId: '',
                },
                trackIds: [],
            })
            const showFullDescription = ref(false)
            const tracks = ref([])
            const loadingMore = ref(false)
            const lastLoadedTrackIndex = ref(10)
            const displaySearchInPlaylist = ref(false) // 是否显示搜索框
            const searchKeyWords = ref('') // 搜索使用的关键字
            const inputSearchKeyWords = ref('') // 搜索框中正在输入的关键字
            const inputFocus = ref(false)
            const debounceTimeout = ref(null)
            const searchInputWidth = ref('0px') // 搜索框宽度
            const hasMore = ref(false)

            const player = computed(() => store.state.player)
            const data = computed(() => store.state.data)

            const showToast = (toast) => {
                store.dispatch('toast/showToast', toast)
            }

            const playPlaylistByID = (trackID = 'first') => {
                store.dispatch('player/playPlaylistByID', { id: ids.value, trackID })
            }

            const isLikeSongsPage = computed(() => {
                return route.name === 'likedSongs'
            })

            const specialPlaylistInfo = computed(() => {
                return specialPlaylist[playlist.value.id]
            })

            const isUserOwnPlaylist = computed(() => {
                return (
                    playlist.value.creator.userId === data.value.user.userId &&
                    playlist.value.id !== data.value.likedSongPlaylistID
                )
            })

            const filteredTracks = computed(() => {
                return tracks.value.filter(
                    (track) =>
                        (track.name && track.name.toLowerCase().includes(searchKeyWords.value.toLowerCase())) ||
                        (track.al.name && track.al.name.toLowerCase().includes(searchKeyWords.value.toLowerCase())) ||
                        track.ar.find(
                            (artist) =>
                                artist.name && artist.name.toLowerCase().includes(searchKeyWords.value.toLowerCase()),
                        ),
                )
            })

            const likePlaylist = (toast = false) => {
                if (!isAccountLoggedIn()) {
                    showToast(t('toast.needToLogin'))
                    return
                }
                subscribePlaylist({
                    id: playlist.value.id,
                    t: playlist.value.subscribed ? 2 : 1,
                }).then((res) => {
                    if (res.code === 200) {
                        playlist.value.subscribed = !playlist.value.subscribed
                        if (toast === true) {
                            showToast(
                                playlist.value.subscribed
                                    ? t('toast.subscribedPlaylist')
                                    : t('toast.unsubscribedPlaylist'),
                            )
                        }
                    }
                    getPlaylistDetail(ids.value, true).then((result) => {
                        playlist.value = result.playlist
                    })
                })
            }

            const loadMore = (loadNum = 50) => {
                let trackIDs = playlist.value.trackIds.filter((t, index) => {
                    if (index > lastLoadedTrackIndex.value && index <= lastLoadedTrackIndex.value + loadNum) {
                        return t
                    }
                })
                trackIDs = trackIDs.map((t) => t.id)
                getTrackDetail(trackIDs.join(',')).then((res) => {
                    tracks.value.push(...res.songs)
                    lastLoadedTrackIndex.value += trackIDs.length
                    loadingMore.value = false
                    if (lastLoadedTrackIndex.value + 1 === playlist.value.trackIds.length) {
                        hasMore.value = false
                    } else {
                        hasMore.value = true
                    }
                })
            }

            const handleScroll = (e) => {
                let dom = document.querySelector('html')
                let scrollHeight = Math.max(dom.scrollHeight, dom.scrollHeight)
                let scrollTop = e.target.scrollingElement.scrollTop
                let clientHeight = dom.innerHeight || Math.min(dom.clientHeight, dom.clientHeight)
                if (clientHeight + scrollTop + 200 >= scrollHeight) {
                    if (lastLoadedTrackIndex.value + 1 === playlist.value.trackIds.length || loadingMore.value) {
                        return
                    }
                    loadingMore.value = true
                    loadMore()
                }
            }

            const openMenu = (e) => {
                proxy.$refs.playlistMenu.openMenu(e)
            }

            const deletePlaylists = () => {
                if (!isAccountLoggedIn()) {
                    showToast(t('toast.needToLogin'))
                    return
                }
                let confirmation = confirm(`${t('confirm.deletePlaylists')} ${playlist.value.name}？`)
                if (confirmation === true) {
                    deletePlaylist(playlist.value.id).then((res) => {
                        if (res.code === 200) {
                            showToast(`${t('toast.deletePlaylistsSucceed')} ${playlist.value.name}`)
                            router.go(-1)
                        } else {
                            showToast(t('toast.error'))
                        }
                    })
                }
            }

            const editPlaylist = () => {
                showToast(t('toast.development'))
            }

            const searchInPlaylist = () => {
                displaySearchInPlaylist.value = !displaySearchInPlaylist.value || isLikeSongsPage.value
                if (displaySearchInPlaylist.value === false) {
                    searchKeyWords.value = ''
                    inputSearchKeyWords.value = ''
                } else {
                    searchInputWidth.value = '172px'
                    loadMore()
                }
            }

            const removeTrack = (trackID) => {
                if (!isAccountLoggedIn()) {
                    showToast(t('toast.needToLogin'))
                    return
                }
                tracks.value = tracks.value.filter((t) => t.id !== trackID)
            }

            const inputDebounce = () => {
                if (debounceTimeout.value) {
                    clearTimeout(debounceTimeout.value)
                }
                debounceTimeout.value = setTimeout(() => {
                    searchKeyWords.value = inputSearchKeyWords.value
                }, 600)
            }

            const toggleFullDescription = () => {
                showFullDescription.value = !showFullDescription.value
                if (showFullDescription.value) {
                    store.commit('enableScrolling', false)
                } else {
                    store.commit('enableScrolling', true)
                }
            }

            const loadData = (id, next = undefined) => {
                ids.value = id
                getPlaylistDetail(ids.value, true)
                    .then((res) => {
                        playlist.value = res.playlist
                        tracks.value = res.playlist.tracks.slice(0, 50)
                        NProgress.done()
                        if (next !== undefined) {
                            next()
                        }
                        show.value = true
                        lastLoadedTrackIndex.value = tracks.value.length - 1
                        return res
                    })
                    .then(() => {
                        if (playlist.value.trackCount > tracks.value.length) {
                            loadingMore.value = true
                            loadMore()
                        }
                    })
            }

            if (route.name === 'likedSongs') {
                loadData(data.value.likedSongPlaylistID)
            } else {
                loadData(route.params.id)
            }

            setTimeout(() => {
                if (!show.value) {
                    NProgress.start()
                }
            }, 1000)

            return {
                store,
                route,
                router,
                proxy,
                show,
                playlist,
                showFullDescription,
                tracks,
                loadingMore,
                lastLoadedTrackIndex,
                displaySearchInPlaylist,
                searchKeyWords,
                hasMore,
                inputSearchKeyWords,
                inputFocus,
                debounceTimeout,
                searchInputWidth,
                player,
                data,
                showToast,
                isLikeSongsPage,
                specialPlaylistInfo,
                isUserOwnPlaylist,
                filteredTracks,
                playPlaylistByID,
                likePlaylist,
                loadMore,
                handleScroll,
                openMenu,
                deletePlaylists,
                editPlaylist,
                searchInPlaylist,
                removeTrack,
                inputDebounce,
                toggleFullDescription,
                loadData,
            }
        },
    }
</script>

<style lang="scss" scoped>
    .playlist {
        margin-top: 32px;
    }

    .playlist-info {
        display: flex;
        margin-bottom: 72px;
        position: relative;
        .info {
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            margin-left: 56px;
            .title {
                font-size: 36px;
                font-weight: 700;
                color: var(--color-text);

                .lock-icon {
                    opacity: 0.28;
                    color: var(--color-text);
                    margin-right: 8px;
                    .svg-icon {
                        height: 26px;
                        width: 26px;
                    }
                }
            }
            .artist {
                font-size: 18px;
                opacity: 0.88;
                color: var(--color-text);
                margin-top: 24px;
            }
            .date-and-count {
                font-size: 14px;
                opacity: 0.68;
                color: var(--color-text);
                margin-top: 2px;
            }
            .description {
                font-size: 14px;
                opacity: 0.68;
                color: var(--color-text);
                margin-top: 24px;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 3;
                overflow: hidden;
                cursor: pointer;
                &:hover {
                    transition: opacity 0.3s;
                    opacity: 0.88;
                }
            }
            .buttons {
                margin-top: 32px;
                display: flex;
                button {
                    margin-right: 16px;
                }
            }
        }
    }

    .special-playlist {
        margin-top: 192px;
        margin-bottom: 128px;
        border-radius: 1.25em;
        text-align: center;

        @keyframes letterSpacing4 {
            from {
                letter-spacing: 0px;
            }

            to {
                letter-spacing: 4px;
            }
        }

        @keyframes letterSpacing1 {
            from {
                letter-spacing: 0px;
            }

            to {
                letter-spacing: 1px;
            }
        }

        .title {
            font-size: 84px;
            line-height: 1.05;
            font-weight: 700;
            text-transform: uppercase;

            letter-spacing: 4px;
            animation-duration: 0.8s;
            animation-name: letterSpacing4;
            -webkit-text-fill-color: transparent;
            -webkit-background-clip: text;
            background-clip: text;
            // background-image: linear-gradient(
            //   225deg,
            //   var(--color-primary),
            //   var(--color-primary)
            // );

            img {
                height: 78px;
                border-radius: 0.125em;
                margin-right: 24px;
            }
        }
        .subtitle {
            font-size: 18px;
            letter-spacing: 1px;
            margin: 28px 0 54px 0;
            animation-duration: 0.8s;
            animation-name: letterSpacing1;
            text-transform: uppercase;
            color: var(--color-text);
        }
        .buttons {
            margin-top: 32px;
            display: flex;
            justify-content: center;
            button {
                margin-right: 16px;
            }
        }
    }

    .gradient-test {
        background-image: linear-gradient(to left, #92fe9d 0%, #00c9ff 100%);
    }

    [data-theme='dark'] {
        .gradient-radar {
            background-image: linear-gradient(to left, #92fe9d 0%, #00c9ff 100%);
        }
    }

    .gradient-radar {
        background-image: linear-gradient(to left, #0ba360 0%, #3cba92 100%);
    }

    .gradient-blue-purple {
        background-image: linear-gradient(45deg, #89c4f5 0%, #6284ff 42%, #ff0000 100%);
    }

    .gradient-sharp-blue {
        background-image: linear-gradient(45deg, #00c6fb 0%, #005bea 100%);
    }

    .gradient-yellow-pink {
        background-image: linear-gradient(45deg, #f6d365 0%, #fda085 100%);
    }

    .gradient-pink {
        background-image: linear-gradient(45deg, #ee9ca7 0%, #ffdde1 100%);
    }

    .gradient-indigo-pink-yellow {
        background-image: linear-gradient(43deg, #4158d0 0%, #c850c0 46%, #ffcc70 100%);
    }

    .gradient-light-red-light-blue {
        background-image: linear-gradient(
            225deg,
            hsl(190, 30%, 50%) 0%,
            #081abb 38%,
            #ec3841 58%,
            hsl(13, 99%, 49%) 100%
        );
    }

    .gradient-fog {
        background: linear-gradient(-180deg, #bcc5ce 0%, #929ead 98%),
            radial-gradient(at top left, rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0.3) 100%);
        background-blend-mode: screen;
    }

    .gradient-red {
        background-image: linear-gradient(213deg, #ff0844 0%, #ffb199 100%);
    }

    .gradient-sky-blue {
        background-image: linear-gradient(147deg, #48c6ef 0%, #6f86d6 100%);
    }

    .gradient-dark-blue-midnight-blue {
        background-image: linear-gradient(213deg, #09203f 0%, #537895 100%);
    }

    .gradient-yellow-red {
        background: linear-gradient(147deg, #fec867 0%, #f72c61 100%);
    }

    .gradient-yellow {
        background: linear-gradient(147deg, #fceb02 0%, #fec401 100%);
    }

    .gradient-midnight-blue {
        background-image: linear-gradient(-20deg, #2b5876 0%, #4e4376 100%);
    }

    .gradient-orange-red {
        background-image: linear-gradient(147deg, #ffe53b 0%, #ff2525 74%);
    }

    .gradient-moonstone-blue {
        background-image: linear-gradient(
            147deg,
            hsl(200, 34%, 8%) 0%,
            hsl(204, 35%, 38%) 50%,
            hsl(200, 34%, 18%) 100%
        );
    }

    .gradient-pink-purple-blue {
        background-image: linear-gradient(to right, #ff3cac 0%, #784ba0 50%, #2b86c5 100%) !important;
    }

    .gradient-green {
        background-image: linear-gradient(90deg, #c6f6d5, #68d391, #38b2ac) !important;
    }

    .user-info {
        h1 {
            font-size: 42px;
            position: relative;
            color: var(--color-text);
            .avatar {
                height: 44px;
                margin-right: 12px;
                vertical-align: -7px;
                border-radius: 50%;
                border: rgba(0, 0, 0, 0.2);
            }
        }
    }

    .search-box {
        display: flex;
        position: absolute;
        right: 20px;
        bottom: -55px;
        justify-content: flex-end;
        -webkit-app-region: no-drag;

        .container {
            display: flex;
            align-items: center;
            height: 32px;
            background: var(--color-secondary-bg-for-transparent);
            border-radius: 8px;
            width: 200px;
        }

        .svg-icon {
            height: 15px;
            width: 15px;
            color: var(--color-text);
            opacity: 0.28;
            margin: {
                left: 8px;
                right: 4px;
            }
        }

        input {
            font-size: 16px;
            border: none;
            background: transparent;
            width: 96%;
            font-weight: 600;
            margin-top: -1px;
            color: var(--color-text);
        }

        .active {
            background: var(--color-primary-bg-for-transparent);
            input,
            .svg-icon {
                opacity: 1;
                color: var(--color-primary);
            }
        }
    }

    [data-theme='dark'] {
        .search-box {
            .active {
                input,
                .svg-icon {
                    color: var(--color-text);
                }
            }
        }
    }

    .search-box-likepage {
        display: flex;
        position: absolute;
        right: 12vw;
        top: 95px;
        justify-content: flex-end;
        -webkit-app-region: no-drag;

        .input {
            transition: all 0.5s;
        }

        .container {
            display: flex;
            align-items: center;
            height: 32px;
            background: var(--color-secondary-bg-for-transparent);
            border-radius: 8px;
        }

        .svg-icon {
            height: 15px;
            width: 15px;
            color: var(--color-text);
            opacity: 0.28;
            margin: {
                left: 8px;
                right: 8px;
            }
        }

        input {
            font-size: 16px;
            border: none;
            background: transparent;
            width: 96%;
            font-weight: 600;
            margin-top: -1px;
            color: var(--color-text);
        }

        .active {
            background: var(--color-primary-bg-for-transparent);
            input,
            .svg-icon {
                opacity: 1;
                color: var(--color-primary);
            }
        }
    }

    [data-theme='dark'] {
        .search-box-likepage {
            .active {
                input,
                .svg-icon {
                    color: var(--color-text);
                }
            }
        }
    }

    @media (max-width: 1336px) {
        .search-box-likepage {
            right: 8vw;
        }
    }

    .load-more {
        display: flex;
        justify-content: center;
        margin-top: 32px;
    }
</style>
