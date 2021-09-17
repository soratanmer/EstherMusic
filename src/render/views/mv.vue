<template>
    <div class="mv-page">
        <div class="current-video">
            <div class="video">
                <video ref="videoPlayer" class="plyr" />
            </div>
            <div class="video-info">
                <div class="title">
                    <router-link :to="'/artist/' + mv.data.artistId">{{ mv.data.artistName }}</router-link>
                    -
                    {{ mv.data.name }}
                    <div class="like-button">
                        <button-icon @click="likeMV">
                            <svg-icon v-if="mv.subed" icon-name="heart-solid" />
                            <svg-icon v-else icon-name="heart" />
                        </button-icon>
                    </div>
                </div>
                <div class="info">
                    {{ proxy.$filters.formatPlayCount(mv.data.playCount) }} Views ·
                    {{ mv.data.publishTime }}
                </div>
            </div>
        </div>
        <div class="more-video">
            <div class="section-title">{{ $t('mv.moreVideo') }}</div>
            <MvRow :mvs="simiMvs" />
        </div>
    </div>
</template>

<script>
    import { ref, computed, onMounted, getCurrentInstance } from 'vue'
    import { useStore } from 'vuex'
    import { useRoute, onBeforeRouteUpdate } from 'vue-router'
    import Plyr from 'plyr'
    import NProgress from 'nprogress'
    import { useI18n } from 'vue-i18n'

    import '@render/styles/plyr.css'

    import { mvDetail, mvUrl, simiMv, likeAMV } from '@render/NeteastApi/mv'

    import { isAccountLoggedIn } from '@render/utils/auth'

    import SvgIcon from '@render/components/SvgIcon.vue'
    import ButtonIcon from '@render/components/ButtonIcon.vue'
    import MvRow from '@render/components/MvRow.vue'

    export default {
        name: 'MV',
        components: {
            MvRow,
            ButtonIcon,
            SvgIcon,
        },
        setup() {
            const store = useStore()
            const route = useRoute()
            const { proxy } = getCurrentInstance()
            const { t } = useI18n()

            const mv = ref({
                url: '',
                data: {
                    name: '',
                    artistName: '',
                    playCount: '',
                    publishTime: '',
                },
            })
            const player = ref(null)
            const simiMvs = ref([])

            const players = computed(() => store.state.player)

            const showToast = (toast) => {
                store.dispatch('toast/showToast', toast)
            }

            const getData = (id) => {
                mvDetail(id).then((res) => {
                    mv.value = res
                    let requests = res.data.brs.map((br) => {
                        return mvUrl({
                            id,
                            r: br.br,
                        })
                    })
                    Promise.all(requests).then((results) => {
                        let sources = results.map((result) => {
                            return {
                                src: result.data.url.replace(/^http:/, 'https:'),
                                type: 'video/mp4',
                                size: result.data.r,
                            }
                        })
                        player.value.source = {
                            type: 'video',
                            title: mv.value.data.name,
                            sources: sources,
                            poster: mv.value.data.cover.replace(/^http:/, 'https:'),
                        }
                        NProgress.done()
                    })
                })
                simiMv(id).then((res) => {
                    simiMvs.value = res.mvs
                })
            }

            const likeMV = () => {
                if (!isAccountLoggedIn()) {
                    showToast(t('toast.needToLogin'))
                    return
                }
                likeAMV({
                    mvid: mv.value.data.id,
                    t: mv.value.subed ? 0 : 1,
                }).then((res) => {
                    if (res.code === 200) {
                        mv.value.subed = !mv.value.subed
                    }
                })
            }

            onBeforeRouteUpdate((to, from, next) => {
                getData(to.params.id)
                next()
            })

            onMounted(() => {
                let videoOptions = {
                    settings: ['quality'],
                    autoplay: false,
                    quality: {
                        default: 1080,
                        options: [1080, 720, 480, 240],
                    },
                }
                if (route.query.autoplay === 'true') {
                    videoOptions.autoplay = true
                }
                player.value = new Plyr(proxy.$refs.videoPlayer, videoOptions)
                player.value.volume = players.value.volume
                player.value.on('playing', () => {
                    store.dispatch('player/pause')
                })
                getData(route.params.id)
                console.log('qier222: 网易云你这mv音频码率也太糊了吧🙄')
                console.log('sorata: 確かに🙄')
            })

            return {
                store,
                proxy,
                route,
                mv,
                player,
                simiMvs,
                showToast,
                getData,
                likeMV,
            }
        },
    }
</script>

<style lang="scss" scoped>
    .video {
        --plyr-color-main: #335eea;
        --plyr-control-radius: 8px;
    }

    .mv-page {
        width: 100%;
        margin-top: 32px;
    }
    .current-video {
        width: 100%;
    }
    .video {
        border-radius: 16px;
        background: transparent;
        overflow: hidden;
        max-height: 100vh;
    }

    .video-info {
        margin-top: 12px;
        color: var(--color-text);
        .title {
            font-size: 24px;
            font-weight: 600;
        }
        .artist {
            font-size: 14px;
            opacity: 0.88;
            margin-top: 2px;
            font-weight: 600;
        }
        .info {
            font-size: 12px;
            opacity: 0.68;
            margin-top: 12px;
        }
    }

    .more-video {
        margin-top: 48px;
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--color-text);
            opacity: 0.88;
            margin-bottom: 12px;
        }
    }

    .like-button {
        display: inline-block;
        .svg-icon {
            height: 18px;
            width: 18px;
            color: var(--color-primary);
        }
    }
</style>
