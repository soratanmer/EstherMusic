<template>
    <div class="player">
        <div class="progress-bar" @click.stop>
            <vue-slider
                ref="slider"
                v-model:modelValue="progress"
                :min="0"
                :max="currentTrackDuration"
                :interval="0.001"
                :drag-on-click="true"
                :duration="0"
                :dot-size="12"
                :height="2"
                :tooltip-formatter="proxy.$filters.formatTrackTime"
                :lazy="true"
                :silent="true"
                @update:modelValue="changeProgress"
            />
        </div>
        <div class="controls">
            <div class="playing">
                <div class="container" @click.stop>
                    <img :src="currentTrack.al && currentTrackPicUrl" @click="goToAlbum()" />
                    <div class="track-info" :title="audioSource">
                        <div class="name" @click="goToList">
                            {{ currentTrack.name }}
                        </div>
                        <div class="artist">
                            <span
                                v-for="(ar, index) in currentTrack.ar"
                                :key="ar.id"
                                @click="ar.id !== 0 && goToArtist(ar.id)"
                            >
                                <span class="ar">{{ ar.name }}</span
                                ><span v-if="index !== currentTrack.ar.length - 1">, </span>
                            </span>
                        </div>
                    </div>
                    <div class="like-button">
                        <button-icon :title="$t('player.like')" @click="likeATrack(player.currentTrack.id)">
                            <svg-icon v-show="!isCurrentTrackLiked" icon-name="heart" />
                            <svg-icon v-show="isCurrentTrackLiked" icon-name="heart-solid" />
                        </button-icon>
                    </div>
                </div>
                <div class="blank" />
            </div>
            <div class="middle-control-buttons">
                <div class="blank" />
                <div class="container" @click.stop>
                    <button-icon v-show="!player.isPersonalFM" :title="$t('player.previous')" @click="playPrevTrack()"
                        ><svg-icon icon-name="previous"
                    /></button-icon>
                    <button-icon v-show="player.isPersonalFM" :title="$t('player.disliked')" @click="moveToFMTrash()"
                        ><svg-icon icon-name="thumbs-down"
                    /></button-icon>
                    <button-icon
                        class="play"
                        :title="$t(player.playing ? 'player.pause' : 'player.play')"
                        @click="playOrPause()"
                    >
                        <svg-icon :icon-name="player.playing ? 'pause' : 'play'"
                    /></button-icon>
                    <button-icon :title="$t('player.next')" @click="playNextTrack()"
                        ><svg-icon icon-name="next"
                    /></button-icon>
                </div>
                <div class="blank" />
            </div>
            <div class="right-control-buttons">
                <div class="blank" />
                <div class="container" @click.stop>
                    <button-icon
                        :title="$t('player.nextUp')"
                        :class="{
                            active: route.name === 'next',
                            disabled: player.isPersonalFM,
                        }"
                        @click="goToNextTracksPage"
                        ><svg-icon icon-name="list"
                    /></button-icon>
                    <button-icon
                        :class="{
                            active: player.repeatMode !== 'off',
                            disabled: player.isPersonalFM,
                        }"
                        :title="player.repeatMode === 'one' ? $t('player.repeatTrack') : $t('player.repeat')"
                        @click="switchRepeatMode()"
                    >
                        <svg-icon v-show="player.repeatMode !== 'one'" icon-name="repeat" />
                        <svg-icon v-show="player.repeatMode === 'one'" icon-name="repeat-1" />
                    </button-icon>
                    <button-icon
                        :class="{
                            active: player.shuffle,
                            disabled: player.isPersonalFM,
                        }"
                        :title="$t('player.shuffle')"
                        @click="switchShuffle()"
                        ><svg-icon icon-name="shuffle"
                    /></button-icon>
                    <div class="volume-control">
                        <button-icon :title="$t('player.mute')" @click="mute()">
                            <svg-icon v-show="volume > 0.5" icon-name="volume" />
                            <svg-icon v-show="volume === 0" icon-name="volume-mute" />
                            <svg-icon v-show="volume <= 0.5 && volume !== 0" icon-name="volume-half" />
                        </button-icon>
                        <div class="volume-bar">
                            <vue-slider
                                v-model="volume"
                                :min="0"
                                :max="1"
                                :interval="0.01"
                                :drag-on-click="true"
                                :duration="0"
                                :tooltip-formatter="formatVolume"
                                :dot-size="12"
                            />
                        </div>
                    </div>

                    <button-icon class="lyrics-button" title="歌词" style="margin-left: 12px" @click="toggleLyrics"
                        ><svg-icon icon-name="arrow-up"
                    /></button-icon>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { ref, computed, watch, onUnmounted, getCurrentInstance } from 'vue'
    import { useStore } from 'vuex'
    import { useRoute, useRouter } from 'vue-router'
    import VueSlider from 'vue-slider-component'
    import { useI18n } from 'vue-i18n'

    import ButtonIcon from '@render/components/ButtonIcon.vue'
    import SvgIcon from '@render/components/SvgIcon.vue'

    export default {
        name: 'Player',
        components: {
            ButtonIcon,
            SvgIcon,
            VueSlider,
        },
        setup() {
            const store = useStore()
            const route = useRoute()
            const router = useRouter()
            const { proxy } = getCurrentInstance()
            const { t } = useI18n()

            const progress = ref(Number(localStorage.getItem('playerCurrentTrackTime')))
            const progressInterval = ref()

            const player = computed(() => store.state.player)
            const settings = computed(() => store.state.settings)
            const data = computed(() => store.state.data)

            const toggleLyrics = () => {
                store.commit('toggleLyrics')
            }

            const switchRepeatMode = () => {
                store.commit('player/switchRepeatMode')
            }

            const switchShuffle = () => {
                store.commit('player/switchShuffle')
            }

            const mute = () => {
                store.commit('player/mute')
            }

            const showToast = (id) => {
                store.dispatch('toast/showToast', id)
            }

            const likeATrack = (id) => {
                store.dispatch('liked/likeATrack', id)
            }

            const playPrevTrack = () => {
                store.dispatch('player/playPrevTrack')
            }

            const moveToFMTrash = () => {
                store.dispatch('player/moveToFMTrash')
            }

            const playOrPause = () => {
                store.dispatch('player/playOrPause')
            }

            const playNextTrack = () => {
                store.dispatch('player/playNextTrack')
            }

            const isCurrentTrackLiked = computed(() => {
                return store.getters['player/isCurrentTrackLiked']
            })

            const currentTrackDuration = computed(() => {
                return store.getters['player/currentTrackDuration']
            })

            const currentTrack = computed(() => {
                return player.value.currentTrack
            })

            const currentTrackPicUrl = computed(() => {
                return proxy.$filters.resizeImage(player.value.currentTrack.al.picUrl, 224)
            })

            const volume = computed({
                get() {
                    return player.value.volume
                },
                set(volume) {
                    store.commit('player/setVolume', volume)
                },
            })

            const playing = computed(() => {
                return player.value.playing
            })

            const audioSource = computed(() => {
                return player.value.howler?._src.includes('kuwo.cn') ? t('player.audioSourceFormKuWo') : ''
            })

            const goToNextTracksPage = () => {
                if (player.value.isPersonalFM) {
                    return
                }
                route.name === 'next'
                    ? router.go(-1)
                    : router.push({
                          name: 'next',
                      })
            }

            const formatVolume = (value) => {
                return value.toLocaleString('zh-Hans-CN', { style: 'percent' })
            }

            const goToList = () => {
                if (player.value.playlistSource.id === data.value.likedSongPlaylistID) {
                    router.push({
                        path: '/library/liked-songs',
                    })
                } else if (player.value.playlistSource.type === 'url') {
                    router.push({
                        path: player.value.playlistSource.id,
                    })
                } else {
                    router.push({
                        path: `/${player.value.playlistSource.type}/${player.value.playlistSource.id}`,
                    })
                }
            }

            const goToAlbum = () => {
                if (currentTrack.value.al.id === 0) {
                    return
                }
                router.push({
                    path: `/album/${currentTrack.value.al.id}`,
                })
            }

            const goToArtist = (id) => {
                router.push({
                    path: `/artist/${id}`,
                })
            }

            const setProgressInterval = () => {
                progressInterval.value = setInterval(() => {
                    progress.value = player.value.howler?.seek() ?? 0
                    localStorage.setItem('playerCurrentTrackTime', progress.value)
                }, 1000)
            }

            const changeProgress = (value) => {
                store.commit('player/setProgress', value)
            }

            watch(playing, (show) => {
                if (show) {
                    setProgressInterval()
                } else {
                    clearInterval(progressInterval.value)
                }
            })

            onUnmounted(() => {
                clearInterval(progressInterval.value)
            })

            return {
                store,
                route,
                router,
                proxy,
                progress,
                player,
                settings,
                mute,
                data,
                isCurrentTrackLiked,
                currentTrackDuration,
                toggleLyrics,
                showToast,
                switchRepeatMode,
                switchShuffle,
                likeATrack,
                playPrevTrack,
                playOrPause,
                playNextTrack,
                moveToFMTrash,
                currentTrack,
                currentTrackPicUrl,
                volume,
                playing,
                audioSource,
                goToNextTracksPage,
                formatVolume,
                goToList,
                goToAlbum,
                goToArtist,
                setProgressInterval,
                changeProgress,
            }
        },
    }
</script>

<style lang="scss" scoped>
    .player {
        position: fixed;
        bottom: 0;
        right: 0;
        left: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        height: 64px;
        backdrop-filter: saturate(180%) blur(30px);
        // background-color: rgba(255, 255, 255, 0.86);
        background-color: var(--color-navbar-bg);
        z-index: 100;
    }

    @supports (-moz-appearance: none) {
        .player {
            background-color: var(--color-body-bg);
        }
    }

    .progress-bar {
        margin-top: -6px;
        margin-bottom: -6px;
        width: 100%;
    }

    .controls {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        height: 100%;
        padding: {
            right: 10vw;
            left: 10vw;
        }
    }

    @media (max-width: 1336px) {
        .controls {
            padding: 0 5vw;
        }
    }

    .blank {
        flex-grow: 1;
    }

    .playing {
        display: flex;
    }

    .playing .container {
        display: flex;
        align-items: center;
        img {
            height: 46px;
            border-radius: 5px;
            box-shadow: 0 6px 8px -2px rgba(0, 0, 0, 0.16);
            cursor: pointer;
            user-select: none;
        }
        .track-info {
            height: 46px;
            margin-left: 12px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            .name {
                font-weight: 600;
                font-size: 16px;
                opacity: 0.88;
                color: var(--color-text);
                margin-bottom: 4px;
                cursor: pointer;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 1;
                overflow: hidden;
                word-break: break-all;
                &:hover {
                    text-decoration: underline;
                }
            }
            .artist {
                font-size: 12px;
                opacity: 0.58;
                color: var(--color-text);
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 1;
                overflow: hidden;
                word-break: break-all;
                span.ar {
                    cursor: pointer;
                    &:hover {
                        text-decoration: underline;
                    }
                }
            }
        }
    }

    .middle-control-buttons {
        display: flex;
    }

    .middle-control-buttons .container {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 8px;
        .button-icon {
            margin: 0 8px;
        }
        .play {
            height: 42px;
            width: 42px;
            .svg-icon {
                width: 24px;
                height: 24px;
            }
        }
    }

    .right-control-buttons {
        display: flex;
    }

    .right-control-buttons .container {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        .expand {
            margin-left: 24px;
            .svg-icon {
                height: 24px;
                width: 24px;
            }
        }
        .active .svg-icon {
            color: var(--color-primary);
        }
        .volume-control {
            margin-left: 4px;
            display: flex;
            align-items: center;
            .volume-bar {
                width: 84px;
            }
        }
    }

    .like-button {
        margin-left: 16px;
    }

    .button-icon.disabled {
        cursor: default;
        opacity: 0.38;
        &:hover {
            background: none;
        }
        &:active {
            transform: unset;
        }
    }
</style>
