<template>
    <div v-show="show" class="artist-page">
        <div class="artist-info">
            <div class="head">
                <img :src="proxy.$filters.resizeImage(artist.img1v1Url, 1024)" />
            </div>
            <div>
                <div class="name">{{ artist.name }}</div>
                <div class="artist">{{ $t('artist.artist') }}</div>
                <div class="statistics">
                    <a @click="scrollTo('popularTracks')">{{ artist.musicSize }} {{ $t('common.songs') }}</a>
                    ·
                    <a @click="scrollTo('seeMore', 'start')">{{ artist.albumSize }} {{ $t('artist.withAlbums') }}</a>
                    ·
                    <a @click="scrollTo('mvs')">{{ artist.mvSize }} {{ $t('artist.videos') }}</a>
                </div>
                <div class="description" @click="toggleFullDescription">
                    {{ artist.briefDesc }}
                </div>
                <div class="buttons">
                    <ButtonTwoTone icon-class="play" @click="playPopularSongs()">
                        {{ $t('common.play') }}
                    </ButtonTwoTone>
                    <ButtonTwoTone color="grey" @click="followArtist">
                        <span v-if="artist.followed">{{ $t('artist.following') }}</span>
                        <span v-else>{{ $t('artist.follow') }}</span>
                    </ButtonTwoTone>
                    <ButtonTwoTone
                        icon-class="more"
                        :icon-button="true"
                        :horizontal-padding="0"
                        color="grey"
                        @click="openMenu"
                    />
                </div>
            </div>
        </div>
        <div class="latest-release">
            <div class="section-title">{{ $t('artist.latestRelease') }}</div>
            <div class="release">
                <div class="container">
                    <Cover
                        :id="latestRelease.id"
                        :image-url="proxy.$filters.resizeImage(latestRelease.picUrl)"
                        type="album"
                        :fixed-size="128"
                        :play-button-size="30"
                    />
                    <div class="info">
                        <div class="name">
                            <router-link :to="`/album/${latestRelease.id}`">{{ latestRelease.name }}</router-link>
                        </div>
                        <div class="date">
                            {{ proxy.$filters.formatDate(latestRelease.publishTime) }}
                        </div>
                        <div class="type">
                            {{ proxy.$filters.formatAlbumType(latestRelease.type, latestRelease) }}
                            · {{ latestRelease.size }} {{ $t('common.songs') }}
                        </div>
                    </div>
                </div>
                <div v-show="latestMV.id" class="container latest-mv">
                    <div
                        class="cover"
                        @mouseover="mvHover = true"
                        @mouseleave="mvHover = false"
                        @click="goToMv(latestMV.id)"
                    >
                        <img :src="latestMV.coverUrl" />
                        <transition name="fade">
                            <div
                                v-show="mvHover"
                                class="shadow"
                                :style="{
                                    background: 'url(' + latestMV.coverUrl + ')',
                                }"
                            />
                        </transition>
                    </div>
                    <div class="info">
                        <div class="name">
                            <router-link :to="'/mv/' + latestMV.id">{{ latestMV.name }}</router-link>
                        </div>
                        <div class="date">
                            {{ proxy.$filters.formatDate(latestMV.publishTime) }}
                        </div>
                        <div class="type">{{ $t('artist.latestMV') }}</div>
                    </div>
                </div>
                <div v-show="!latestMV.id" />
            </div>
        </div>
        <div id="popularTracks" class="popular-tracks">
            <div class="section-title">{{ $t('artist.popularSongs') }}</div>
            <TrackList :tracks="popularTracks.slice(0, showMorePopTracks ? 24 : 12)" :type="'tracklist'" />

            <div id="seeMore" class="show-more">
                <button @click="showMorePopTracks = !showMorePopTracks">
                    <span v-show="!showMorePopTracks">{{ $t('artist.showMore') }}</span>
                    <span v-show="showMorePopTracks">{{ $t('artist.showLess') }}</span>
                </button>
            </div>
        </div>
        <div v-if="albums.length !== 0" id="albums" class="albums">
            <div class="section-title">{{ $t('artist.albums') }}</div>
            <CoverRow :type="'album'" :items="albums" :sub-text="'releaseYear'" :show-play-button="true" />
        </div>
        <div v-if="mvs.length !== 0" id="mvs" class="mvs">
            <div class="section-title">
                MVs
                <router-link v-show="hasMoreMV" :to="`/artist/${artist.id}/mv`">{{ $t('home.seeMore') }}</router-link>
            </div>
            <MvRow :mvs="mvs" subtitle="publishTime" />
        </div>
        <div v-if="eps.length !== 0" class="eps">
            <div class="section-title">{{ $t('artist.EPsSingles') }}</div>
            <CoverRow :type="'album'" :items="eps" :sub-text="'albumType+releaseYear'" :show-play-button="true" />
        </div>

        <div v-if="similarArtist.length !== 0" class="similar-artists">
            <div class="section-title">{{ $t('artist.similarArtists') }}</div>
            <CoverRow type="artist" :column-number="6" gap="36px 28px" :items="similarArtist.slice(0, 12)" />
        </div>

        <Modal
            :show="showFullDescription"
            :close="toggleFullDescription"
            :show-footer="false"
            :click-outside-hide="true"
            :title="$t('artist.artistDesc')"
        >
            <p class="description-fulltext">
                {{ artist.briefDesc }}
            </p>
        </Modal>
        <ContextMenu ref="artistMenu">
            <div class="item" @click="copyUrl(artist.id)">{{ $t('contextMenu.copyUrl') }}</div>
        </ContextMenu>
    </div>
</template>

<script>
    import { ref, computed, onActivated, getCurrentInstance } from 'vue'
    import { useStore } from 'vuex'
    import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
    import NProgress from 'nprogress'
    import { useI18n } from 'vue-i18n'
    import useClipboard from 'vue-clipboard3'

    import { getArtist, getArtistAlbum, artistMv, followAArtist, similarArtists } from '@render/NeteastApi/artist'

    import { isAccountLoggedIn } from '@render/utils/auth'

    import ButtonTwoTone from '@render/components/ButtonTwoTone.vue'
    import TrackList from '@render/components/TrackList.vue'
    import CoverRow from '@render/components/CoverRow.vue'
    import Cover from '@render/components/Cover.vue'
    import MvRow from '@render/components/MvRow.vue'
    import Modal from '@render/components/Modal.vue'
    import ContextMenu from '@render/components/ContextMenu.vue'

    export default {
        name: 'Artist',
        components: {
            Cover,
            ButtonTwoTone,
            TrackList,
            CoverRow,
            MvRow,
            Modal,
            ContextMenu,
        },
        setup() {
            const store = useStore()
            const route = useRoute()
            const router = useRouter()
            const { t } = useI18n()
            const { proxy } = getCurrentInstance()
            const { toClipboard } = useClipboard()

            const show = ref(false)
            const artist = ref({
                img1v1Url: 'https://p1.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg',
            })
            const popularTracks = ref([])
            const albumsData = ref([])
            const latestRelease = ref({
                picUrl: '',
                publishTime: 0,
                id: 0,
                name: '',
                type: '',
                size: '',
            })
            const showMorePopTracks = ref(false)
            const showFullDescription = ref(false)
            const mvs = ref([])
            const hasMoreMV = ref(false)
            const similarArtist = ref([])
            const mvHover = ref(false)

            const player = computed(() => store.state.player)

            const showToast = (toast) => {
                store.dispatch('toast/showToast', toast)
            }

            const albums = computed(() => {
                return albumsData.value.filter((a) => a.type === '专辑')
            })

            const eps = computed(() => {
                return albumsData.value.filter((a) => ['EP/Single', 'EP', 'Single'].includes(a.type))
            })

            const latestMV = computed(() => {
                const mv = mvs.value[0] || []
                return {
                    id: mv.id || mv.vid,
                    name: mv.name || mv.title,
                    coverUrl: `${mv.imgurl16v9 || mv.cover || mv.coverUrl}?param=464y260`,
                    publishTime: mv.publishTime,
                }
            })

            const goToAlbum = (id) => {
                router.push({
                    name: 'album',
                    params: {
                        id,
                    },
                })
            }

            const goToMv = (id) => {
                router.push({
                    path: '/mv/' + id,
                })
            }

            const playPopularSongs = (trackID = 'first') => {
                let trackIDs = popularTracks.value.map((track) => track.id)
                if (trackIDs === undefined) {
                    dispatch('toast/showToast', `无法播放 ${artist.value.name}`, { root: true })
                } else {
                    store.dispatch('player/replacePlaylist', { trackIDs, id: artist.value.id, type: 'artist', trackID })
                }
            }

            const followArtist = () => {
                if (!isAccountLoggedIn()) {
                    showToast(t('toast.needToLogin'))
                    return
                }
                followAArtist({
                    id: artist.value.id,
                    t: artist.value.followed ? 0 : 1,
                }).then((res) => {
                    if (res.code === 200) {
                        artist.value.followed = !artist.value.followed
                    }
                })
            }

            const scrollTo = (div, block = 'center') => {
                document.getElementById(div).scrollIntoView({
                    behavior: 'smooth',
                    block,
                })
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
                setTimeout(() => {
                    if (!show.value) {
                        NProgress.start()
                    }
                }, 1000)
                show.value = false
                proxy.$root.$refs.main.scrollTo({
                    top: 0,
                })
                getArtist(id).then((res) => {
                    artist.value = res.artist
                    popularTracks.value = res.hotSongs
                    if (next !== undefined) {
                        next()
                    }
                    NProgress.done()
                    show.value = true
                })
                getArtistAlbum({ id: id, limit: 200 }).then((res) => {
                    albumsData.value = res.hotAlbums
                    latestRelease.value = res.hotAlbums[0]
                })
                artistMv({ id }).then((res) => {
                    mvs.value = res.mvs
                    hasMoreMV.value = res.hasMore
                })
                similarArtists(id).then((res) => {
                    similarArtist.value = res.artists
                })
            }

            const openMenu = (e) => {
                proxy.$refs.artistMenu.openMenu(e)
            }

            const copyUrl = async (id) => {
                try {
                    await toClipboard('https://music.163.com/#/artist?id=' + id)
                    showToast(t('toast.copied'))
                } catch (error) {
                    showToast(`${t('toast.copyFailed')}${error}`)
                }
            }

            onBeforeRouteUpdate((to, from, next) => {
                artist.value.img1v1Url = 'https://p1.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg'
                loadData(to.params.id, next)
            })

            onActivated(() => {
                if (artist.value?.id?.toString() !== route.params.id) {
                    loadData(route.params.id)
                } else {
                    proxy.$root.$refs.scrollbar.restorePosition()
                }
            })

            return {
                store,
                route,
                proxy,
                router,
                show,
                artist,
                popularTracks,
                albumsData,
                latestRelease,
                showMorePopTracks,
                showFullDescription,
                mvs,
                hasMoreMV,
                similarArtist,
                mvHover,
                showToast,
                albums,
                eps,
                latestMV,
                goToAlbum,
                goToMv,
                playPopularSongs,
                followArtist,
                scrollTo,
                toggleFullDescription,
                loadData,
                openMenu,
                copyUrl,
            }
        },
    }
</script>

<style lang="scss" scoped>
    .artist-page {
        margin-top: 32px;
    }

    .artist-info {
        display: flex;
        align-items: center;
        margin-bottom: 26px;
        color: var(--color-text);
        img {
            height: 248px;
            width: 248px;
            border-radius: 50%;
            margin-right: 56px;
            box-shadow: rgba(0, 0, 0, 0.2) 0px 12px 16px -8px;
        }
        .name {
            font-size: 56px;
            font-weight: 700;
        }

        .artist {
            font-size: 18px;
            opacity: 0.88;
            margin-top: 24px;
        }

        .statistics {
            font-size: 14px;
            opacity: 0.68;
            margin-top: 2px;
        }

        .buttons {
            margin-top: 26px;
            display: flex;
            .shuffle {
                padding: 8px 11px;
                .svg-icon {
                    margin: 0;
                }
            }
        }

        .description {
            user-select: none;
            font-size: 14px;
            opacity: 0.68;
            margin-top: 24px;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            cursor: pointer;
            white-space: pre-line;
            &:hover {
                transition: opacity 0.3s;
                opacity: 0.88;
            }
        }
    }

    .section-title {
        font-weight: 600;
        font-size: 22px;
        opacity: 0.88;
        color: var(--color-text);
        margin-bottom: 16px;
        padding-top: 46px;

        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        a {
            font-size: 13px;
            font-weight: 600;
            opacity: 0.68;
        }
    }

    .latest-release {
        color: var(--color-text);
        .release {
            display: flex;
        }
        .container {
            display: flex;
            flex: 1;
            align-items: center;
            border-radius: 12px;
        }
        img {
            height: 96px;
            border-radius: 8px;
        }
        .info {
            margin-left: 24px;
        }
        .name {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .date {
            font-size: 14px;
            opacity: 0.78;
        }
        .type {
            margin-top: 2px;
            font-size: 12px;
            opacity: 0.68;
        }
    }

    .popular-tracks {
        .show-more {
            display: flex;

            button {
                padding: 4px 8px;
                margin-top: 8px;
                border-radius: 6px;
                font-size: 12px;
                opacity: 0.78;
                color: var(--color-secondary);
                font-weight: 600;
                &:hover {
                    opacity: 1;
                }
            }
        }
    }

    .similar-artists {
        .section-title {
            margin-bottom: 24px;
        }
    }

    .latest-mv {
        .cover {
            position: relative;
            transition: transform 0.3s;
            &:hover {
                cursor: pointer;
            }
        }
        img {
            border-radius: 0.75em;
            height: 128px;
            object-fit: cover;
            user-select: none;
        }

        .shadow {
            position: absolute;
            top: 6px;
            height: 100%;
            width: 100%;
            filter: blur(16px) opacity(0.4);
            transform: scale(0.9, 0.9);
            z-index: -1;
            background-size: cover;
            border-radius: 0.75em;
        }

        .fade-enter-active,
        .fade-leave-active {
            transition: opacity 0.3s;
        }
        .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
            opacity: 0;
        }
    }

    .description-fulltext {
        font-size: 16px;
        margin-top: 24px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
        white-space: pre-line;
    }
</style>
