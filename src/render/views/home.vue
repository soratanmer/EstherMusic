<template>
    <div v-show="show" class="home">
        <div v-if="settings.showPlaylistsByAppleMusic !== false" class="index-row first-row">
            <div class="title">by Apple Music</div>
            <CoverRow :type="'playlist'" :items="byAppleMusics" sub-text="appleMusic" :image-size="1024" />
        </div>
        <div class="index-row">
            <div class="title">
                {{ $t('home.recommendPlaylist') }}
                <router-link to="/explore?category=推荐歌单">{{ $t('home.seeMore') }}</router-link>
            </div>
            <CoverRow type="playlist" :items="recommendPlaylists.items" sub-text="copywriter" />
        </div>
        <div class="index-row">
            <div class="title">For You</div>
            <div class="for-you-row">
                <DailyTracksCard />
                <FMCard />
            </div>
        </div>
        <div class="index-row">
            <div class="title">{{ $t('home.recommendArtist') }}</div>
            <CoverRow type="artist" :column-number="6" :items="recommendArtists.items" />
        </div>
        <div class="index-row">
            <div class="title">
                {{ $t('home.newAlbum') }}
                <router-link to="/new-album">{{ $t('home.seeMore') }}</router-link>
            </div>
            <CoverRow type="album" :items="newReleasesAlbum.items" sub-text="artist" />
        </div>
        <div class="index-row">
            <div class="title">
                {{ $t('home.charts') }}
                <router-link to="/explore?category=排行榜">{{ $t('home.seeMore') }}</router-link>
            </div>
            <CoverRow type="playlist" :items="topList.items" sub-text="updateFrequency" :image-size="1024" />
        </div>
    </div>
</template>

<script>
    import { computed, ref, onMounted, onActivated, getCurrentInstance } from 'vue'
    import { useStore } from 'vuex'
    import NProgress from 'nprogress'

    import { newAlbums } from '@render/NeteastApi/album'
    import { toplists, recommendPlaylist } from '@render/NeteastApi/playlist'
    import { toplistOfArtists } from '@render/NeteastApi/artist'

    import { byAppleMusic } from '@render/utils/staticData'
    import { countDBSize } from '@render/utils/db'

    import CoverRow from '@render/components/CoverRow.vue'
    import FMCard from '@render/components/FMCard.vue'
    import DailyTracksCard from '@render/components/DailyTracksCard.vue'

    export default {
        name: 'Home',
        components: {
            CoverRow,
            FMCard,
            DailyTracksCard,
        },
        setup() {
            const store = useStore()
            const { proxy } = getCurrentInstance()

            const show = ref(false)
            const recommendPlaylists = ref({
                items: [],
            })
            const newReleasesAlbum = ref({
                items: [],
            })
            const topList = ref({
                items: [],
                ids: [19723756, 180106, 60198, 3812895, 60131],
            })
            const recommendArtists = ref({
                items: [],
                indexs: [],
            })

            const settings = computed(() => store.state.settings)

            const byAppleMusics = computed(() => {
                return byAppleMusic
            })

            const loadData = () => {
                setTimeout(() => {
                    if (!show.value) {
                        NProgress.start()
                    }
                }, 1000)
                recommendPlaylist({
                    limit: 10,
                }).then((data) => {
                    recommendPlaylists.value.items = data.result
                    NProgress.done()
                    show.value = true
                })
                newAlbums({
                    area: settings.value.musicLanguage ?? 'ALL',
                    limit: 10,
                }).then((data) => {
                    newReleasesAlbum.value.items = data.albums
                })
                const toplistOfArtistsAreaTable = {
                    all: null,
                    zh: 1,
                    ea: 2,
                    jp: 4,
                    kr: 3,
                }
                toplistOfArtists(toplistOfArtistsAreaTable[settings.value.musicLanguage ?? 'all']).then((data) => {
                    let indexs = []
                    while (indexs.length < 6) {
                        let tmp = ~~(Math.random() * 100)
                        if (!indexs.includes(tmp)) indexs.push(tmp)
                    }
                    recommendArtists.value.indexs = indexs
                    recommendArtists.value.items = data.list.artists.filter((l, index) => indexs.includes(index))
                })
                toplists().then((data) => {
                    topList.value.items = data.list.filter((l) => topList.value.ids.includes(l.id))
                })
                countDBSize()
            }

            onMounted(() => {
                loadData()
            })

            onActivated(() => {
                loadData()
                proxy.$root.$refs.scrollbar.restorePosition()
            })

            return {
                show,
                settings,
                byAppleMusics,
                recommendPlaylists,
                recommendArtists,
                newReleasesAlbum,
                topList,
            }
        },
    }
</script>

<style lang="scss" scoped>
    .index-row {
        margin-top: 54px;
    }
    .index-row.first-row {
        margin-top: 32px;
    }
    .playlists {
        display: flex;
        flex-wrap: wrap;
        margin: {
            right: -12px;
            left: -12px;
        }
        .index-playlist {
            margin: 12px 12px 24px 12px;
        }
    }

    .title {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 20px;
        font-size: 28px;
        font-weight: 700;
        color: var(--color-text);
        a {
            font-size: 13px;
            font-weight: 600;
            opacity: 0.68;
        }
    }

    footer {
        display: flex;
        justify-content: center;
        margin-top: 48px;
    }

    .for-you-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
        margin-bottom: 78px;
    }
</style>
