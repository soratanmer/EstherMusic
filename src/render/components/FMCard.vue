<template>
    <div class="fm" data-theme="dark">
        <img :src="albumPic" />
        <div class="container">
            <div class="info">
                <div class="title">{{ personalFMTrack.name }}</div>
                <div class="artist">
                    <ArtistsInLine :artists="artists" />
                    -
                    <router-link :to="`/album/${album?.id}`" :title="album?.name">{{ album?.name }}</router-link>
                </div>
            </div>
            <div class="controls">
                <div class="buttons">
                    <button-icon title="不喜欢" @click="moveToFMTrash"
                        ><svg-icon id="thumbs-down" icon-name="thumbs-down"
                    /></button-icon>
                    <button-icon :title="$t(isPlaying ? 'player.pause' : 'player.play')" class="play" @click="play">
                        <svg-icon :icon-name="isPlaying ? 'pause' : 'play'"
                    /></button-icon>
                    <button-icon :title="$t('player.next')" @click="next"><svg-icon icon-name="next" /></button-icon
                ></div>
                <div class="card-name"><svg-icon icon-name="fm" />私人FM</div>
            </div>
        </div>
    </div>
</template>

<script>
    import { computed, ref, watch, getCurrentInstance } from 'vue'
    import { useStore } from 'vuex'
    import { useRouter } from 'vue-router'

    import { personalFM } from '@render/NeteastApi/others'

    import ArtistsInLine from '@render/components/ArtistsInLine.vue'
    import ButtonIcon from '@render/components/ButtonIcon.vue'
    import SvgIcon from '@render/components/SvgIcon.vue'

    export default {
        name: 'FMCard',
        components: {
            ArtistsInLine,
            ButtonIcon,
            SvgIcon,
        },
        setup() {
            const router = useRouter()
            const store = useStore()
            const { proxy } = getCurrentInstance()

            const album = ref()
            const albumPic = ref('')

            const player = computed(() => store.state.player)

            const personalFMTrack = computed({
                get() {
                    return player.value.personalFMTrack
                },
                set(value) {
                    store.commit('player/setPersonalFMTrack', value)
                },
            })

            const personalFMNextTrack = computed({
                get() {
                    return player.value.personalFMNextTrack
                },
                set(value) {
                    store.commit('player/setPersonalFMNextTrack', value)
                },
            })

            const artists = computed(() => {
                return personalFMTrack.value.artists || personalFMTrack.value.ar || []
            })

            const isPlaying = computed(() => {
                return player.value.playing && player.value.isPersonalFM
            })

            const init = () => {
                personalFM().then((result) => {
                    personalFMTrack.value = result.data[0]
                    personalFMNextTrack.value = result.data[1]
                    album.value = result.data[0].album
                    albumPic.value = proxy.$filters.resizeImage(result.data[0].album.picUrl, 1024)
                })
            }

            const play = () => {
                store.dispatch('player/playPersonalFM')
            }

            const next = () => {
                store.dispatch('player/playNextTrack', true)
            }

            const goToAlbum = () => {
                if (personalFMTrack.value.album.id === 0) {
                    return
                }
                router.push({
                    path: `/album/${personalFMTrack.value.album.id}`,
                })
            }

            const moveToFMTrash = () => {
                store.dispatch('player/moveToFMTrash')
            }

            if (player.value.personalFMTrack.id === 0 || player.value.personalFMNextTrack.id === 0) {
                init()
            } else {
                album.value = personalFMTrack.value.album
                albumPic.value = proxy.$filters.resizeImage(personalFMTrack.value.album.picUrl, 1024)
            }

            watch(personalFMTrack, () => {
                album.value = personalFMTrack.value.album
                albumPic.value = proxy.$filters.resizeImage(personalFMTrack.value.album.picUrl, 1024)
            })

            return {
                router,
                store,
                player,
                personalFMTrack,
                albumPic,
                isPlaying,
                artists,
                album,
                play,
                next,
                goToAlbum,
                moveToFMTrash,
            }
        },
    }
</script>

<style lang="scss" scoped>
    .fm {
        padding: 1rem;
        border-radius: 1rem;
        display: flex;
        height: 198px;
        box-sizing: border-box;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }
    img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        animation: move 38s infinite;
        animation-direction: alternate;
        z-index: -1;
    }
    .container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        color: var(--color-text);
        width: 100%;
        .title {
            font-size: 1.6rem;
            font-weight: 600;
            margin-bottom: 0.6rem;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            word-break: break-all;
        }
        .artist {
            opacity: 0.68;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            word-break: break-all;
        }
        .controls {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-left: -0.4rem;
            .buttons {
                display: flex;
            }
            .button-icon {
                margin: 0 8px 0 0;
            }
            .svg-icon {
                width: 24px;
                height: 24px;
            }
            .svg-icon#thumbs-down {
                width: 22px;
                height: 22px;
            }
            .card-name {
                font-size: 1rem;
                opacity: 0.78;
                display: flex;
                align-items: center;
                font-weight: 600;
                user-select: none;
                .svg-icon {
                    width: 18px;
                    height: 18px;
                    margin-right: 6px;
                }
            }
        }
    }

    @keyframes move {
        0% {
            transform: translateY(0);
        }
        100% {
            transform: translateY(-50%);
        }
    }
</style>
