<template>
    <div v-show="show" class="album-page">
        <div class="playlist-info">
            <Cover
                :id="album.id"
                :image-url="proxy.$filters.resizeImage(album.picUrl, 1024)"
                :show-play-button="true"
                :always-show-shadow="true"
                :click-cover-to-play="true"
                :fixed-size="288"
                type="album"
                :cover-hover="false"
                :play-button-size="18"
                @click.right="openMenu"
            />
            <div class="info">
                <div class="title" @click.right="openMenu">{{ title }}</div>
                <div v-if="subtitle !== ''" class="subtitle" @click.right="openMenu">
                    {{ subtitle }}
                </div>
                <div class="artist">
                    <span v-if="album.artist.id !== 104700">
                        <span>{{ proxy.$filters.formatAlbumType(album.type, album) }} by </span
                        ><router-link :to="`/artist/${album.artist.id}`">{{ album.artist.name }}</router-link></span
                    >
                    <span v-else>Compilation by Various Artists</span>
                </div>
                <div class="date-and-count">
                    <span v-if="album.mark === 1056768" class="explicit-symbol"><ExplicitSymbol /></span>
                    <span :title="proxy.$filters.formatDate(album.publishTime)">{{
                        new Date(album.publishTime).getFullYear()
                    }}</span>
                    <span> · {{ album.size }} {{ $t('common.songs') }}</span
                    >,
                    {{ proxy.$filters.formatTime(albumTime, 'Human') }}
                </div>
                <div class="description" @click="toggleFullDescription">
                    {{ album.description }}
                </div>
                <div class="buttons" style="margin-top: 32px">
                    <ButtonTwoTone icon-class="play" @click="playAlbumByID(album.id)">
                        {{ $t('common.play') }}
                    </ButtonTwoTone>
                    <ButtonTwoTone
                        :icon-class="dynamicDetail.isSub ? 'heart-solid' : 'heart'"
                        :icon-button="true"
                        :horizontal-padding="0"
                        :color="dynamicDetail.isSub ? 'blue' : 'grey'"
                        :text-color="dynamicDetail.isSub ? '#335eea' : ''"
                        :background-color="dynamicDetail.isSub ? 'var(--color-secondary-bg)' : ''"
                        @click="likeAlbum"
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
        </div>
        <div v-if="Object.keys(tracksByDisc).length !== 1">
            <div v-for="(disc, cd) in tracksByDisc" :key="cd">
                <h2>Disc {{ cd }}</h2>
                <TrackList :id="album.id" :tracks="disc" :type="'album'" :album-object="album" />
            </div>
        </div>
        <div v-else>
            <TrackList :id="album.id" :tracks="tracks" :type="'album'" :album-object="album" />
        </div>
        <div class="extra-info">
            <div class="album-time" />
            <div class="release-date">
                {{ $t('album.released') }}
                {{ proxy.$filters.formatDate(album.publishTime, 'MMMM D, YYYY') }}
            </div>
            <div v-if="album.company !== null" class="copyright"> © {{ album.company }} </div>
        </div>
        <div v-if="filteredMoreAlbums.length !== 0" class="more-by">
            <div class="section-title">
                More by
                <router-link :to="`/artist/${album.artist.id}`">{{ album.artist.name }} </router-link>
            </div>
            <div>
                <CoverRow type="album" :items="filteredMoreAlbums" sub-text="albumType+releaseYear" />
            </div>
        </div>
        <Modal
            :show="showFullDescription"
            :close="toggleFullDescription"
            :show-footer="false"
            :click-outside-hide="true"
            :title="$t('album.albumDesc')"
        >
            <p class="description-fulltext">
                {{ album.description }}
            </p>
        </Modal>
        <ContextMenu ref="albumMenu">
            <div class="item" @click="likeAlbum(true)">
                {{ dynamicDetail.isSub ? $t('contextMenu.removeFromLibrary') : $t('contextMenu.saveToLibrary') }}</div
            >
            <div class="item">{{ $t('contextMenu.addToPlaylist') }}</div>
            <div class="item" @click="copyUrl(album.id)">{{ $t('contextMenu.copyUrl') }} </div>
        </ContextMenu>
    </div>
</template>

<script>
    import { ref, computed, getCurrentInstance } from 'vue'
    import { useStore } from 'vuex'
    import { useRoute, onBeforeRouteUpdate } from 'vue-router'
    import NProgress from 'nprogress'
    import useClipboard from 'vue-clipboard3'
    import { useI18n } from 'vue-i18n'
    import { groupBy } from 'lodash'

    import { getArtistAlbum } from '@render/NeteastApi/artist'
    import { getTrackDetail } from '@render/NeteastApi/track'
    import { getAlbum, albumDynamicDetail, likeAAlbum } from '@render/NeteastApi/album'

    import { splitSoundtrackAlbumTitle, splitAlbumTitle } from '@render/utils/common'
    import { isAccountLoggedIn } from '@render/utils/auth'

    import ExplicitSymbol from '@render/components/ExplicitSymbol.vue'
    import ButtonTwoTone from '@render/components/ButtonTwoTone.vue'
    import ContextMenu from '@render/components/ContextMenu.vue'
    import TrackList from '@render/components/TrackList.vue'
    import CoverRow from '@render/components/CoverRow.vue'
    import Cover from '@render/components/Cover.vue'
    import Modal from '@render/components/Modal.vue'
    import SvgIcon from '@render/components/SvgIcon.vue'

    export default {
        name: 'Album',
        components: {
            Cover,
            ButtonTwoTone,
            TrackList,
            ExplicitSymbol,
            CoverRow,
            Modal,
            ContextMenu,
            SvgIcon,
        },
        setup() {
            const store = useStore()
            const route = useRoute()
            const { proxy } = getCurrentInstance()
            const { toClipboard } = useClipboard()
            const { t } = useI18n()

            const album = ref({
                id: 0,
                picUrl: '',
                artist: {
                    id: 0,
                },
            })
            const tracks = ref([])
            const showFullDescription = ref(false)
            const show = ref(false)
            const moreAlbums = ref([])
            const dynamicDetail = ref({})
            const subtitle = ref('')
            const title = ref('')

            const player = computed(() => store.state.player)
            const data = computed(() => store.state.data)

            const showToast = (toast) => {
                store.dispatch('toast/showToast', toast)
            }

            const albumTime = computed(() => {
                let time = 0
                tracks.value.map((t) => {
                    time + t.dt
                })
                return time
            })

            const filteredMoreAlbums = computed(() => {
                let moreAlbum = moreAlbums.value.filter((a) => a.id !== album.value.id)
                let realAlbum = moreAlbum.filter((a) => a.type === '专辑')
                let eps = moreAlbum.filter((a) => a.type === 'EP' || (a.type === 'EP/Single' && a.size > 1))
                let restItem = moreAlbum.filter(
                    (a) =>
                        realAlbum.find((a1) => a1.id === a.id) === undefined &&
                        eps.find((a1) => a1.id === a.id) === undefined,
                )
                if (realAlbum.length === 0) {
                    return [...realAlbum, ...eps, ...restItem].slice(0, 5)
                } else {
                    return [...realAlbum, ...restItem].slice(0, 5)
                }
            })

            const tracksByDisc = computed(() => {
                return groupBy(tracks.value, 'cd')
            })

            const openMenu = (e) => {
                proxy.$refs.albumMenu.openMenu(e)
            }

            const toggleFullDescription = () => {
                showFullDescription.value = !showFullDescription.value
                if (showFullDescription.value) {
                    store.commit('enableScrolling', false)
                } else {
                    store.commit('enableScrolling', true)
                }
            }

            const playAlbumByID = (id, trackID = 'first') => {
                store.dispatch('player/playAlbumByID', { id, trackID })
            }

            const likeAlbum = (toast = false) => {
                if (!isAccountLoggedIn()) {
                    showToast(t('toast.needToLogin'))
                    return
                }
                likeAAlbum({
                    id: album.value.id,
                    t: dynamicDetail.value.isSub ? 0 : 1,
                })
                    .then((res) => {
                        if (res.code === 200) {
                            dynamicDetail.value.isSub = !dynamicDetail.value.isSub
                            if (toast === true) {
                                showToast(
                                    dynamicDetail.value.isSub
                                        ? t('toast.subscribedPlaylist')
                                        : t('toast.unsubscribedPlaylist'),
                                )
                            }
                        }
                    })
                    .catch((error) => {
                        showToast(`${error.response.data.message || error}`)
                    })
            }

            const formatTitle = () => {
                let splitTitle = splitSoundtrackAlbumTitle(album.value.name)
                let splitTitle2 = splitAlbumTitle(splitTitle.title)
                title.value = splitTitle2.title
                if (splitTitle.subtitle !== '' && splitTitle2.subtitle !== '') {
                    subtitle.value = splitTitle.subtitle + ' · ' + splitTitle2.subtitle
                } else {
                    subtitle.value = splitTitle.subtitle === '' ? splitTitle2.subtitle : splitTitle.subtitle
                }
            }

            const loadData = (id) => {
                setTimeout(() => {
                    if (!show.value) {
                        NProgress.start()
                    }
                }, 1000)
                getAlbum(id).then((res) => {
                    album.value = res.album
                    tracks.value = res.songs
                    formatTitle()
                    NProgress.done()
                    show.value = true

                    // to get explicit mark
                    let trackIDs = tracks.value.map((t) => t.id)
                    getTrackDetail(trackIDs.join(',')).then((res) => {
                        tracks.value = res.songs
                    })

                    // get more album by this artist
                    getArtistAlbum({
                        id: album.value.artist.id,
                        limit: 100,
                    }).then((result) => {
                        moreAlbums.value = result.hotAlbums
                    })
                })
                albumDynamicDetail(id).then((res) => {
                    dynamicDetail.value = res
                })
            }

            const copyUrl = async (id) => {
                try {
                    await toClipboard('https://music.163.com/#/album?id=' + id)
                    showToast(t('toast.copied'))
                } catch (error) {
                    showToast(`${t('toast.copyFailed')}${error}`)
                }
            }

            loadData(route.params.id)

            onBeforeRouteUpdate((to, from, next) => {
                show.value = false
                loadData(to.params.id)
                next()
            })

            return {
                store,
                route,
                proxy,
                album,
                tracks,
                tracksByDisc,
                showFullDescription,
                show,
                moreAlbums,
                dynamicDetail,
                subtitle,
                title,
                player,
                data,
                showToast,
                albumTime,
                filteredMoreAlbums,
                openMenu,
                toggleFullDescription,
                playAlbumByID,
                likeAlbum,
                formatTitle,
                loadData,
                copyUrl,
            }
        },
    }
</script>

<style lang="scss" scoped>
    .album-page {
        margin-top: 32px;
    }

    .playlist-info {
        display: flex;
        width: 78vw;
        margin-bottom: 72px;
        .info {
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            margin-left: 56px;
            color: var(--color-text);
            .title {
                font-size: 56px;
                font-weight: 700;
            }
            .subtitle {
                font-size: 22px;
                font-weight: 600;
            }
            .artist {
                font-size: 18px;
                opacity: 0.88;
                margin-top: 24px;
                a {
                    font-weight: 600;
                }
            }
            .date-and-count {
                font-size: 14px;
                opacity: 0.68;
                margin-top: 2px;
            }
            .description {
                user-select: none;
                font-size: 14px;
                opacity: 0.68;
                margin-top: 24px;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 3;
                overflow: hidden;
                cursor: pointer;
                white-space: pre-line;
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

    .explicit-symbol {
        opacity: 0.28;
        color: var(--color-text);
        margin-right: 4px;
        .svg-icon {
            margin-bottom: -3px;
        }
    }

    .extra-info {
        margin-top: 36px;
        margin-bottom: 36px;
        font-size: 12px;
        opacity: 0.48;
        color: var(--color-text);
        div {
            margin-bottom: 4px;
        }
        .album-time {
            opacity: 0.68;
        }
    }

    .more-by {
        border-top: 1px solid rgba(128, 128, 128, 0.18);

        padding-top: 22px;
        .section-title {
            font-size: 22px;
            font-weight: 600;
            opacity: 0.88;
            color: var(--color-text);
            margin-bottom: 20px;
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
