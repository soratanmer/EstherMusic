<template>
    <div v-show="show" class="search">
        <h1>
            <span>{{ $t('search.searchFor') }} {{ typeNameTable[type] }}</span>
            "{{ keywords }}"
        </h1>

        <div v-if="type === 'artists'">
            <CoverRow type="artist" :items="result" :column-number="6" />
        </div>
        <div v-if="type === 'albums'">
            <CoverRow type="album" :items="result" sub-text="artist" sub-text-font-size="14px" />
        </div>
        <div v-if="type === 'tracks'">
            <TrackList :tracks="result" type="playlist" dbclick-track-func="playAList" />
        </div>
        <div v-if="type === 'musicVideos'">
            <MvRow :mvs="result" />
        </div>
        <div v-if="type === 'playlists'">
            <CoverRow type="playlist" :items="result" sub-text="title" />
        </div>

        <div class="load-more">
            <ButtonTwoTone v-show="hasMore" color="grey" @click="fetchData">{{ $t('explore.loadMore') }}</ButtonTwoTone>
        </div>
    </div>
</template>

<script>
    import { ref, computed } from 'vue'
    import { useRoute } from 'vue-router'
    import { camelCase } from 'change-case'
    import NProgress from 'nprogress'
    import { useI18n } from 'vue-i18n'

    import { getTrackDetail } from '@render/NeteastApi/track'
    import { search } from '@render/NeteastApi/others'

    import TrackList from '@render/components/TrackList.vue'
    import MvRow from '@render/components/MvRow.vue'
    import CoverRow from '@render/components/CoverRow.vue'
    import ButtonTwoTone from '@render/components/ButtonTwoTone.vue'

    export default {
        name: 'Search',
        components: {
            TrackList,
            MvRow,
            CoverRow,
            ButtonTwoTone,
        },
        setup() {
            const route = useRoute()
            const { t } = useI18n()

            const show = ref(false)
            const result = ref([])
            const hasMore = ref(true)

            const keywords = computed(() => {
                return route.params.keywords
            })

            const type = computed(() => {
                return camelCase(route.params.type)
            })

            const typeNameTable = computed(() => {
                return {
                    musicVideos: t('search.mv'),
                    tracks: t('search.song'),
                    albums: t('search.album'),
                    artists: t('search.artist'),
                    playlists: t('search.playlist'),
                }
            })

            const getTracksDetail = () => {
                const trackIDs = result.value.map((t) => t.id)
                if (trackIDs.length === 0) {
                    return
                }
                getTrackDetail(trackIDs.join(',')).then((res) => {
                    result.value = res.songs
                })
            }

            const fetchData = () => {
                const typeTable = {
                    musicVideos: 1004,
                    tracks: 1,
                    albums: 10,
                    artists: 100,
                    playlists: 1000,
                }
                return search({
                    keywords: keywords.value,
                    type: typeTable[type.value],
                    offset: result.value.length,
                }).then((res) => {
                    hasMore.value = res.result.hasMore ?? true
                    switch (type.value) {
                        case 'musicVideos':
                            result.value.push(...res.result.mvs)
                            if (res.result.mvCount <= result.value.length) {
                                hasMore.value = false
                            }
                            break
                        case 'artists':
                            result.value.push(...res.result.artists)
                            break
                        case 'albums':
                            result.value.push(...res.result.albums)
                            if (res.result.albumCount <= result.value.length) {
                                hasMore.value = false
                            }
                            break
                        case 'tracks':
                            result.value.push(...res.result.songs)
                            getTracksDetail()
                            break
                        case 'playlists':
                            result.value.push(...res.result.playlists)
                            break
                    }
                    NProgress.done()
                    show.value = true
                })
            }

            fetchData()

            return {
                route,
                show,
                result,
                hasMore,
                keywords,
                type,
                typeNameTable,
                getTracksDetail,
                fetchData,
            }
        },
    }
</script>

<style lang="scss" scoped>
    h1 {
        margin-top: 32px;
        margin-bottom: 28px;
        color: var(--color-text);
        span {
            opacity: 0.58;
        }
    }
    .load-more {
        display: flex;
        justify-content: center;
        margin-top: 32px;
    }

    .button.more {
        .svg-icon {
            height: 24px;
            width: 24px;
        }
    }
</style>
