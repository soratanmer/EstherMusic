<template>
    <div v-show="show" class="search-page">
        <div v-show="artists.length > 0 || albums.length > 0" class="row">
            <div v-show="artists.length > 0" class="artists">
                <div v-show="artists.length > 0" class="section-title">
                    {{ $t('search.artist')
                    }}<router-link :to="`/search/${keywords}/artists`">{{ $t('home.seeMore') }}</router-link>
                </div>
                <CoverRow type="artist" :column-number="3" :items="artists.slice(0, 3)" gap="34px 24px" />
            </div>

            <div class="albums">
                <div v-show="albums.length > 0" class="section-title">
                    {{ $t('search.album')
                    }}<router-link :to="`/search/${keywords}/albums`">{{ $t('home.seeMore') }}</router-link>
                </div>
                <CoverRow
                    type="album"
                    :items="albums.slice(0, 3)"
                    sub-text="artist"
                    :column-number="3"
                    sub-text-font-size="14px"
                    gap="34px 24px"
                    :play-button-size="26"
                />
            </div>
        </div>

        <div v-show="tracks.length > 0" class="tracks">
            <div class="section-title">
                {{ $t('search.song')
                }}<router-link :to="`/search/${keywords}/tracks`">{{ $t('home.seeMore') }}</router-link>
            </div>
            <TrackList :tracks="tracks" type="tracklist" />
        </div>

        <div v-show="musicVideos.length > 0" class="music-videos">
            <div class="section-title">
                {{ $t('search.mv')
                }}<router-link :to="`/search/${keywords}/music-videos`">{{ $t('home.seeMore') }}</router-link>
            </div>
            <MvRow :mvs="musicVideos.slice(0, 5)" />
        </div>

        <div v-show="playlists.length > 0" class="playlists">
            <div class="section-title">
                {{ $t('search.playlist')
                }}<router-link :to="`/search/${keywords}/playlists`">{{ $t('home.seeMore') }}</router-link>
            </div>
            <CoverRow
                type="playlist"
                :items="playlists.slice(0, 12)"
                sub-text="title"
                :column-number="6"
                sub-text-font-size="14px"
                gap="34px 24px"
                :play-button-size="26"
            />
        </div>

        <div v-show="!haveResult" class="no-results">
            <div>
                <svg-icon icon-name="search" />
                {{ keywords.length === 0 ? $t('search.enterKeywords') : $t('search.noResult') }}
            </div>
        </div>
    </div>
</template>

<script>
    import { ref, computed, watch } from 'vue'
    import { useStore } from 'vuex'
    import { useRoute } from 'vue-router'
    import NProgress from 'nprogress'

    import { getTrackDetail } from '@render/NeteastApi/track'
    import { search } from '@render/NeteastApi/others'

    import TrackList from '@render/components/TrackList.vue'
    import MvRow from '@render/components/MvRow.vue'
    import CoverRow from '@render/components/CoverRow.vue'
    import SvgIcon from '@render/components/SvgIcon.vue'

    export default {
        name: 'Search',
        components: {
            TrackList,
            MvRow,
            CoverRow,
            SvgIcon,
        },
        setup() {
            const store = useStore()
            const route = useRoute()

            const show = ref(false)
            const tracks = ref([])
            const artists = ref([])
            const albums = ref([])
            const playlists = ref([])
            const musicVideos = ref([])
            const result = ref([])

            const player = computed(() => store.state.player)

            const keywords = computed(() => {
                return route.params.keywords ?? ''
            })

            const haveResult = computed(() => {
                return (
                    tracks.value.length +
                        artists.value.length +
                        albums.value.length +
                        playlists.value.length +
                        musicVideos.value.length >
                    0
                )
            })

            const showToast = (value) => {
                return store.dispatch('toast/showToast', value)
            }

            const playTrackInSearchResult = (id) => {
                let track = tracks.value.find((t) => t.id === id)
            }

            const searchs = (type = 'all') => {
                const typeTable = {
                    all: 1018,
                    musicVideos: 1004,
                    tracks: 1,
                    albums: 10,
                    artists: 100,
                    playlists: 1000,
                }
                return search({
                    keywords: keywords.value,
                    type: typeTable[type],
                    limit: 16,
                })
                    .then((res) => {
                        return {
                            result: res.result,
                            type,
                        }
                    })
                    .catch((err) => {
                        showToast(err.response.data.msg || err.response.data.message)
                    })
            }

            const getTracksDetail = () => {
                const trackIDs = tracks.value.map((t) => t.id)
                if (trackIDs.length === 0) {
                    return
                }
                getTrackDetail(trackIDs.join(',')).then((res) => {
                    tracks.value = res.songs
                })
            }

            const getData = () => {
                setTimeout(() => {
                    if (!show.value) {
                        NProgress.start()
                    }
                }, 1000)
                show.value = false

                const requestAll = (requests) => {
                    const keyword = keywords.value
                    Promise.all(requests).then((data) => {
                        if (keyword != keywords.value) {
                            return
                        }
                        data.map((res) => {
                            const searchType = res.type
                            if (res.result === undefined) {
                                return
                            }
                            switch (searchType) {
                                case 'all':
                                    result.value = res.result
                                    break
                                case 'musicVideos':
                                    musicVideos.value = res.result.mvs ?? []
                                    break
                                case 'artists':
                                    artists.value = res.result.artists ?? []
                                    break
                                case 'albums':
                                    albums.value = res.result.albums ?? []
                                    break
                                case 'tracks':
                                    tracks.value = res.result.songs ?? []
                                    getTracksDetail()
                                    break
                                case 'playlists':
                                    playlists.value = res.result.playlists ?? []
                                    break
                            }
                        })
                        NProgress.done()
                        show.value = true
                    })
                }

                const requests = [searchs('artists'), searchs('albums'), searchs('tracks')]
                const requests2 = [searchs('musicVideos'), searchs('playlists')]

                requestAll(requests)
                requestAll(requests2)
            }

            watch(keywords, (newKeywords) => {
                if (newKeywords.length === 0) {
                    return
                }
                getData()
            })

            getData()

            return {
                store,
                route,
                show,
                tracks,
                artists,
                albums,
                playlists,
                musicVideos,
                player,
                keywords,
                haveResult,
                playTrackInSearchResult,
                searchs,
                getTracksDetail,
                getData,
            }
        },
    }
</script>

<style lang="scss" scoped>
    .section-title {
        font-weight: 600;
        font-size: 22px;
        opacity: 0.88;
        color: var(--color-text);
        margin-bottom: 16px;

        display: flex;
        justify-content: space-between;
        align-items: center;
        a {
            font-size: 13px;
            font-weight: 600;
            opacity: 0.68;
        }
    }

    .row {
        display: flex;
        flex-wrap: wrap;
        margin-top: 32px;

        .artists {
            flex: 1;
            margin-right: 8rem;
        }
        .albums {
            flex: 1;
        }
    }

    .tracks,
    .music-videos,
    .playlists {
        margin-top: 46px;
    }

    .no-results {
        position: absolute;
        top: 64px;
        right: 0;
        left: 0;
        bottom: 64px;
        font-size: 24px;
        color: var(--color-text);
        opacity: 0.38;
        display: flex;
        justify-content: center;
        align-items: center;
        div {
            display: flex;
            align-items: center;
        }
        .svg-icon {
            height: 24px;
            width: 24px;
            margin-right: 16px;
        }
    }
</style>
