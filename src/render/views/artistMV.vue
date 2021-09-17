<template>
    <div v-show="show">
        <h1>
            <img class="avatar" :src="proxy.$filters.resizeImage(artist.img1v1Url, 1024)" />{{ artist.name }}'s Music
            Videos
        </h1>
        <MvRow :mvs="mvs" subtitle="publishTime" />
        <div class="load-more">
            <ButtonTwoTone v-show="hasMore" color="grey" @click="loadMVs">{{ $t('explore.loadMore') }}</ButtonTwoTone>
        </div>
    </div>
</template>

<script>
    import { ref, onActivated, getCurrentInstance } from 'vue'
    import { useRoute, onBeforeRouteUpdate } from 'vue-router'
    import NProgress from 'nprogress'

    import { artistMv, getArtist } from '@render/NeteastApi/artist'

    import ButtonTwoTone from '@render/components/ButtonTwoTone.vue'
    import MvRow from '@render/components/MvRow.vue'

    export default {
        name: 'ArtistMV',
        components: {
            MvRow,
            ButtonTwoTone,
        },
        setup() {
            const route = useRoute()
            const { proxy } = getCurrentInstance()

            const id = ref(0)
            const show = ref(false)
            const hasMore = ref({})
            const artist = ref({})
            const mvs = ref([])

            const loadMVs = () => {
                artistMv({
                    id: id.value,
                    limit: 100,
                    offset: mvs.value.length,
                }).then((res) => {
                    mvs.value.push(...res.mvs)
                    hasMore.value = res.hasMore
                    NProgress.done()
                    show.value = true
                })
            }

            const loadData = () => {
                setTimeout(() => {
                    if (!show.value) {
                        NProgress.start()
                    }
                }, 1000)
                getArtist(id.value).then((res) => {
                    artist.value = res.artist
                    loadMVs()
                })
            }

            onBeforeRouteUpdate((to, from, next) => {
                id.value = to.params.id
                loadData()
                next()
            })

            id.value = route.params.id
            loadData()

            onActivated(() => {
                if (route.params.id !== id.value) {
                    id.value = route.params.id
                    mvs.value = []
                    artist.value = {}
                    show.value = false
                    hasMore.value = true
                    loadData()
                }
            })

            return {
                route,
                proxy,
                id,
                show,
                hasMore,
                artist,
                mvs,
                loadMVs,
                loadData,
            }
        },
    }
</script>

<style lang="scss" scoped>
    h1 {
        font-size: 42px;
        color: var(--color-text);
        .avatar {
            height: 44px;
            margin-right: 12px;
            vertical-align: -7px;
            border-radius: 50%;
            border: rgba(0, 0, 0, 0.2);
        }
    }
    .load-more {
        display: flex;
        justify-content: center;
    }
</style>
