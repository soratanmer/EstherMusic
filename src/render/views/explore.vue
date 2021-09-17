<template>
    <div class="explore-page">
        <h1>{{ $t('explore.explore') }}</h1>
        <div class="buttons">
            <div
                v-for="category in settings.enabledPlaylistCategories"
                :key="category"
                class="button"
                :class="{
                    active: category === activeCategory && !showCatOptions,
                }"
                @click="goToCategory(category)"
            >
                {{ category }}
            </div>
            <div class="button more" :class="{ active: showCatOptions }" @click="showCatOptions = !showCatOptions">
                <svg-icon icon-name="more" />
            </div>
        </div>

        <div v-show="showCatOptions" class="panel">
            <div v-for="bigCat in allBigCats" :key="bigCat" class="big-cat">
                <div class="name">{{ bigCat }}</div>
                <div class="cats">
                    <div
                        v-for="cat in getCatsByBigCat(bigCat)"
                        :key="cat.name"
                        class="cat"
                        :class="{
                            active: settings.enabledPlaylistCategories.includes(cat.name),
                        }"
                        @click="toggleCat(cat.name)"
                    >
                        <span>{{ cat.name }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="playlists">
            <CoverRow
                type="playlist"
                :items="playlists"
                :sub-text="subText"
                :show-play-button="true"
                :show-play-count="activeCategory !== '排行榜' ? true : false"
                :image-size="activeCategory !== '排行榜' ? 512 : 1024"
            />
        </div>
        <div v-show="['推荐歌单', '排行榜'].includes(activeCategory) === false" class="load-more">
            <ButtonTwoTone
                v-show="showLoadMoreButton && hasMore"
                color="grey"
                :loading="loadingMore"
                @click="getPlaylist"
                >{{ $t('explore.loadMore') }}</ButtonTwoTone
            >
        </div>
    </div>
</template>

<script>
    import { computed, ref, onActivated, getCurrentInstance } from 'vue'
    import { useRoute } from 'vue-router'
    import { useStore } from 'vuex'
    import NProgress from 'nprogress'

    import { topPlaylist, highQualityPlaylist, recommendPlaylist, toplists } from '@render/NeteastApi/playlist'

    import { playlistCategories } from '@render/utils/staticData'

    import ButtonTwoTone from '@render/components/ButtonTwoTone.vue'
    import CoverRow from '@render/components/CoverRow.vue'
    import SvgIcon from '@render/components/SvgIcon.vue'

    export default {
        name: 'Explore',
        components: {
            CoverRow,
            ButtonTwoTone,
            SvgIcon,
        },
        setup() {
            const store = useStore()
            const route = useRoute()
            const { proxy } = getCurrentInstance()

            const show = ref(false)
            const playlists = ref([])
            const activeCategory = ref('全部')
            const loadingMore = ref(false)
            const showLoadMoreButton = ref(false)
            const hasMore = ref(true)
            const allBigCats = ref(['语种', '风格', '场景', '情感', '主题'])
            const showCatOptions = ref(false)

            const settings = computed(() => store.state.settings)

            const subText = computed(() => {
                if (activeCategory.value === '排行榜') {
                    return 'updateFrequency'
                }
                if (activeCategory.value === '推荐歌单') {
                    return 'copywriter'
                }
                return 'none'
            })

            const goToCategory = (Category) => {
                NProgress.start()
                showLoadMoreButton.value = false
                hasMore.value = true
                playlists.value = []
                activeCategory.value = Category
                getPlaylist()
            }

            const updatePlaylist = (playlist) => {
                playlists.value.push(...playlist)
                loadingMore.value = false
                showLoadMoreButton.value = true
                NProgress.done()
                show.value = true
            }

            const getRecommendPlayList = () => {
                recommendPlaylist({
                    limit: 100,
                }).then((res) => {
                    playlists.value = []
                    updatePlaylist(res.result)
                })
            }

            const getHighQualityPlaylist = () => {
                let playlist = playlists.value
                let before = playlist.length !== 0 ? playlist[playlist.length - 1].updateTime : 0
                highQualityPlaylist({
                    limit: 50,
                    before,
                }).then((res) => {
                    updatePlaylist(res.playlists)
                    hasMore.value = res.more
                })
            }

            const getTopLists = () => {
                toplists().then((res) => {
                    playlists.value = []
                    updatePlaylist(res.list)
                })
            }

            const getTopPlayList = () => {
                topPlaylist({
                    cat: activeCategory.value,
                    offset: playlists.value.length,
                }).then((res) => {
                    updatePlaylist(res.playlists)
                    hasMore.value = res.more
                })
            }

            const getCatsByBigCat = (name) => {
                return playlistCategories.filter((c) => c.bigCat === name)
            }

            const toggleCat = (name) => {
                store.commit('settings/togglePlaylistCategory', name)
            }

            const getPlaylist = () => {
                loadingMore.value = true
                if (activeCategory.value === '推荐歌单') {
                    return getRecommendPlayList()
                }
                if (activeCategory.value === '精品歌单') {
                    return getHighQualityPlaylist()
                }
                if (activeCategory.value === '排行榜') {
                    return getTopLists()
                }
                return getTopPlayList()
            }

            const loadData = () => {
                setTimeout(() => {
                    if (!show.value) {
                        NProgress.start()
                    }
                }, 1000)
                activeCategory.value = route.meta.category === undefined ? '全部' : route.meta.category

                getPlaylist()
            }

            onActivated(() => {
                loadData()
                proxy.$root.$refs.scrollbar.restorePosition()
            })

            return {
                settings,
                activeCategory,
                showCatOptions,
                goToCategory,
                allBigCats,
                getCatsByBigCat,
                toggleCat,
                playlists,
                subText,
                showLoadMoreButton,
                hasMore,
                loadingMore,
                getPlaylist,
            }
        },
    }
</script>

<style lang="scss" scoped>
    .explore-page {
        margin-top: 32px;
    }

    h1 {
        color: var(--color-text);
        font-size: 56px;
    }
    .buttons {
        display: flex;
        flex-wrap: wrap;
    }
    .button {
        user-select: none;
        cursor: pointer;
        padding: 8px 16px;
        margin: 10px 16px 6px 0;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: 600;
        font-size: 18px;
        border-radius: 10px;
        background-color: var(--color-secondary-bg);
        color: var(--color-secondary);
        transition: 0.2s;

        &:hover {
            background-color: var(--color-primary-bg);
            color: var(--color-primary);
        }
    }
    .button.active {
        background-color: var(--color-primary-bg);
        color: var(--color-primary);
    }
    .panel {
        margin-top: 10px;
        background: var(--color-secondary-bg);
        border-radius: 10px;
        padding: 8px;
        color: var(--color-text);

        .big-cat {
            display: flex;
            margin-bottom: 32px;
        }

        .name {
            font-size: 24px;
            font-weight: 700;
            opacity: 0.68;
            margin-left: 24px;
            min-width: 54px;
            height: 26px;
            margin-top: 8px;
        }
        .cats {
            margin-left: 24px;
            display: flex;
            flex-wrap: wrap;
        }
        .cat {
            user-select: none;
            margin: 4px 0px 0 0;
            display: flex;
            // justify-content: center;
            align-items: center;
            font-weight: 500;
            font-size: 16px;
            transition: 0.2s;
            min-width: 98px;

            span {
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                padding: 6px 12px;
                height: 26px;
                border-radius: 10px;
                opacity: 0.88;
                &:hover {
                    opacity: 1;
                    background-color: var(--color-primary-bg);
                    color: var(--color-primary);
                }
            }
        }
        .cat.active {
            color: var(--color-primary);
        }
    }

    .playlists {
        margin-top: 24px;
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
