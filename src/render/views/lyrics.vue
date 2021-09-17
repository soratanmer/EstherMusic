<template>
    <transition name="slide-up">
        <div class="lyrics-page" :class="{ 'no-lyric': noLyric }">
            <div class="lyrics-background">
                <div class="top-right" :style="{ backgroundImage: `url(${bgImageUrl})` }" />
                <div class="bottom-left" :style="{ backgroundImage: `url(${bgImageUrl})` }" />
            </div>
            <div class="left-side">
                <div>
                    <div class="cover">
                        <div class="cover-container">
                            <img :src="imageUrl" />
                            <div class="shadow" :style="{ backgroundImage: `url(${imageUrl})` }"></div>
                        </div>
                    </div>
                    <div class="controls">
                        <div class="top-part">
                            <div class="track-info">
                                <div class="title" :title="currentTrack.name">
                                    <router-link
                                        :to="`/${player.playlistSource.type}/${player.playlistSource.id}`"
                                        @click="toggleLyrics"
                                        >{{ currentTrack.name }}
                                    </router-link>
                                </div>
                                <div class="subtitle">
                                    <router-link :to="`/artist/${artist.id}`" @click="toggleLyrics"
                                        >{{ artist.name }}
                                    </router-link>
                                    -
                                    <router-link :to="`/album/${album.id}`" :title="album.name" @click="toggleLyrics"
                                        >{{ album.name }}
                                    </router-link>
                                </div>
                            </div>
                            <div class="buttons">
                                <button-icon :title="$t('player.like')" @click="likeATrack(currentTrack.id)">
                                    <svg-icon :icon-name="isCurrentTrackLiked ? 'heart-solid' : 'heart'" />
                                </button-icon>
                            </div>
                        </div>
                        <div class="progress-bar">
                            <span>{{ proxy.$filters.formatTrackTime(progress) }}</span>
                            <div class="slider">
                                <vue-slider
                                    v-model:modelValue="progress"
                                    @update:modelValue="changeProgress"
                                    :min="0"
                                    :max="currentTrackDuration"
                                    :interval="1"
                                    :drag-on-click="true"
                                    :duration="0"
                                    :dot-size="12"
                                    :height="2"
                                    :tooltip-formatter="proxy.$filters.formatTrackTime"
                                    :lazy="true"
                                    :silent="true"
                                ></vue-slider>
                            </div>
                            <span>{{ proxy.$filters.formatTrackTime(currentTrackDuration) }}</span>
                        </div>
                        <div class="media-controls">
                            <button-icon
                                v-show="!player.isPersonalFM"
                                :title="player.repeatMode === 'one' ? $t('player.repeatTrack') : $t('player.repeat')"
                                :class="{ active: player.repeatMode !== 'off' }"
                                @click="switchRepeatMode()"
                            >
                                <svg-icon v-show="player.repeatMode !== 'one'" icon-name="repeat" />
                                <svg-icon v-show="player.repeatMode === 'one'" icon-name="repeat-1" />
                            </button-icon>
                            <div class="middle">
                                <button-icon
                                    v-show="!player.isPersonalFM"
                                    :title="$t('player.previous')"
                                    @click="playPrevTrack()"
                                >
                                    <svg-icon icon-name="previous" />
                                </button-icon>
                                <button-icon v-show="player.isPersonalFM" title="不喜欢" @click="moveToFMTrash()">
                                    <svg-icon icon-name="thumbs-down" />
                                </button-icon>
                                <button-icon
                                    id="play"
                                    :title="$t(player.playing ? 'player.pause' : 'player.play')"
                                    @click="playOrPause()"
                                >
                                    <svg-icon :icon-name="player.playing ? 'pause' : 'play'" />
                                </button-icon>
                                <button-icon :title="$t('player.next')" @click="playNextTrack()">
                                    <svg-icon icon-name="next" />
                                </button-icon>
                            </div>
                            <button-icon
                                v-show="!player.isPersonalFM"
                                :title="$t('player.shuffle')"
                                :class="{ active: player.shuffle }"
                                @click="switchShuffle()"
                            >
                                <svg-icon icon-name="shuffle" />
                            </button-icon>
                        </div>
                    </div>
                </div>
            </div>
            <div class="right-side">
                <transition name="slide-fade">
                    <div v-show="!noLyric" ref="lyricsContainer" class="lyrics-container" :style="lyricFontSize">
                        <div id="line-1" class="line"></div>
                        <div
                            v-for="(line, index) in lyricWithTranslation"
                            :id="`line${index}`"
                            :key="index"
                            class="line"
                            :class="{
                                highlight: highlightLyricIndex === index,
                            }"
                            @click="clickLyricLine(line.time)"
                            @dblclick="clickLyricLine(line.time, true)"
                        >
                            <span v-html="formatLine(line)"></span>
                        </div>
                    </div>
                </transition>
            </div>
            <div class="close-button" @click="toggleLyrics">
                <button>
                    <svg-icon icon-name="arrow-down" />
                </button>
            </div>
        </div>
    </transition>
</template>

<script>
    import { computed, watch, ref, onUnmounted, getCurrentInstance } from 'vue'
    import { useStore } from 'vuex'
    import { useRouter } from 'vue-router'
    import VueSlider from 'vue-slider-component'

    import { getLyric } from '@render/NeteastApi/track'

    import { lyricParser } from '@render/utils/lyrics'

    import ButtonIcon from '@render/components/ButtonIcon.vue'
    import SvgIcon from '@render/components/SvgIcon.vue'

    export default {
        name: 'Lyrics',
        components: {
            ButtonIcon,
            SvgIcon,
            VueSlider,
        },
        setup() {
            const store = useStore()
            const router = useRouter()
            const { proxy } = getCurrentInstance()

            const progress = ref(Number(localStorage.getItem('playerCurrentTrackTime')))
            const lyricsInterval = ref(null)
            const lyrics = ref([])
            const tlyrics = ref([])
            const highlightLyricIndex = ref(-1)
            const minimize = ref(true)

            const player = computed(() => store.state.player)
            const settings = computed(() => store.state.settings)
            const showLyrics = computed(() => store.state.showLyrics)

            const toggleLyrics = () => {
                store.commit('toggleLyrics')
            }

            const switchRepeatMode = () => {
                store.commit('player/switchRepeatMode')
            }

            const switchShuffle = () => {
                store.commit('player/switchShuffle')
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

            const likeATrack = (id) => {
                store.dispatch('liked/likeATrack', id)
            }

            const currentTrack = computed(() => {
                return player.value.currentTrack
            })

            const imageUrl = computed(() => {
                return `${player.value.currentTrack.al?.picUrl}?param=1024y1024`
            })

            const bgImageUrl = computed(() => {
                return `${player.value.currentTrack?.al?.picUrl}?param=512y512`
            })

            const lyricWithTranslation = computed(() => {
                let ret = []
                // 空内容的去除
                const lyricFiltered = lyrics.value.filter(({ content }) => Boolean(content))
                // content统一转换数组形式
                if (lyricFiltered.length) {
                    lyricFiltered.forEach((l) => {
                        const { rawTime, time, content } = l
                        const lyricItem = { time, content, contents: [content] }
                        const sameTimeTLyric = tlyrics.value.find(
                            ({ rawTime: tLyricRawTime }) => tLyricRawTime === rawTime,
                        )
                        if (sameTimeTLyric) {
                            const { content: tLyricContent } = sameTimeTLyric
                            if (content) {
                                lyricItem.contents.push(tLyricContent)
                            }
                        }
                        ret.push(lyricItem)
                    })
                } else {
                    ret = lyricFiltered.map(({ time, content }) => ({
                        time,
                        content,
                        contents: [content],
                    }))
                }
                return ret
            })

            const lyricFontSize = computed(() => {
                return {
                    fontSize: `${settings.value.lyricFontSize || 28}px`,
                }
            })

            const noLyric = computed(() => {
                return lyrics.value.length === 0
            })

            const artist = computed(() => {
                return currentTrack.value?.ar
                    ? currentTrack.value.ar[0]
                    : {
                          id: 0,
                          name: 'unknown',
                      }
            })

            const album = computed(() => {
                return (
                    currentTrack.value?.al || {
                        id: 0,
                        name: 'unknown',
                    }
                )
            })

            const isCurrentTrackLiked = computed(() => {
                return store.getters['player/isCurrentTrackLiked']
            })

            const currentTrackDuration = computed(() => {
                return store.getters['player/currentTrackDuration']
            })

            const goToList = () => {
                router.push({
                    path: `/${player.value.playlistSource.type}/${player.value.playlistSource.id}`,
                })
                toggleLyrics()
            }

            const getLyrics = () => {
                if (!currentTrack.value.id) {
                    return
                }
                return getLyric(currentTrack.value.id).then((res) => {
                    if (!res?.lrc?.lyric) {
                        lyrics.value = []
                        tlyrics.value = []
                        return false
                    } else {
                        let { lyric, tlyric } = lyricParser(res)
                        lyrics.value = lyric
                        tlyrics.value = tlyric
                        return true
                    }
                })
            }

            const clickLyricLine = (value, startPlay = false) => {
                // TODO: 双击选择还会选中文字，考虑搞个右键菜单复制歌词
                if (window.getSelection().toString().length === 0) {
                    player.value.howler.seek(value)
                }
                if (startPlay === true) {
                    store.dispatch('player/play')
                }
            }

            const setLyricsInterval = () => {
                lyricsInterval.value = setInterval(() => {
                    progress.value = player.value.howler.seek() ?? 0
                    let oldHighlightLyricIndex = highlightLyricIndex.value
                    highlightLyricIndex.value = lyrics.value.findIndex((l, index) => {
                        const nextLyric = lyrics.value[index + 1]
                        return progress.value >= l.time && (nextLyric ? progress.value < nextLyric.time : true)
                    })
                    if (oldHighlightLyricIndex !== highlightLyricIndex.value) {
                        const el = document.getElementById(`line${highlightLyricIndex.value}`)
                        if (el) {
                            el.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center',
                            })
                        }
                    }
                }, 10)
            }

            const formatLine = (line) => {
                const showLyricsTranslation = settings.value.showLyricsTranslation
                if (showLyricsTranslation && line.contents[1]) {
                    return `<span>${line.contents[0]}<br/>${line.contents[1]}</span>`
                } else if (line.contents[0] !== undefined) {
                    return `<span>${line.contents[0]}</span>`
                }
                return 'unknown'
            }

            const changeProgress = (value) => {
                if (!value) {
                    return
                }
                store.commit('player/setProgress', value)
            }

            watch(currentTrack, () => {
                getLyrics()
            })

            watch(showLyrics, (show) => {
                if (show) {
                    setLyricsInterval()
                    getLyrics()
                    store.commit('enableScrolling', false)
                } else {
                    clearInterval(lyricsInterval.value)
                    store.commit('enableScrolling', true)
                }
            })

            onUnmounted(() => {
                clearInterval(lyricsInterval.value)
            })

            return {
                store,
                proxy,
                progress,
                lyricsInterval,
                switchRepeatMode,
                playOrPause,
                playPrevTrack,
                switchShuffle,
                playNextTrack,
                lyrics,
                tlyrics,
                highlightLyricIndex,
                minimize,
                player,
                settings,
                showLyrics,
                toggleLyrics,
                likeATrack,
                currentTrack,
                isCurrentTrackLiked,
                imageUrl,
                bgImageUrl,
                lyricWithTranslation,
                lyricFontSize,
                noLyric,
                artist,
                album,
                getLyrics,
                clickLyricLine,
                setLyricsInterval,
                formatLine,
                moveToFMTrash,
                changeProgress,
                goToList,
                currentTrackDuration,
            }
        },
    }
</script>

<style lang="scss" scoped>
    .lyrics-page {
        position: fixed;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
        z-index: 200;
        background: var(--color-body-bg);
        display: flex;
        clip: rect(auto, auto, auto, auto);
    }

    .lyrics-background {
        --contrast-lyrics-background: 75%;
        --brightness-lyrics-background: 150%;
    }

    .lyrics-background {
        filter: blur(50px) contrast(var(--contrast-lyrics-background)) brightness(var(--brightness-lyrics-background));
        position: absolute;
        height: 100vh;
        width: 100vw;
        .top-right,
        .bottom-left {
            z-index: 0;
            width: 140vw;
            height: 140vw;
            opacity: 0.6;
            position: absolute;
            background-size: cover;
        }

        .top-right {
            right: 0;
            top: 0;
            mix-blend-mode: luminosity;
        }

        .bottom-left {
            left: 0;
            bottom: 0;
            animation-direction: reverse;
            animation-delay: 10s;
        }
    }

    @keyframes rotate {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .left-side {
        flex: 1;
        display: flex;
        justify-content: flex-end;
        margin-right: 32px;
        margin-top: 24px;
        align-items: center;
        transition: all 0.5s;

        z-index: 1;

        .controls {
            max-width: 54vh;
            margin-top: 24px;
            color: var(--color-text);

            .title {
                margin-top: 8px;
                font-size: 1.4rem;
                font-weight: 600;
                opacity: 0.88;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 1;
                overflow: hidden;
            }

            .subtitle {
                margin-top: 4px;
                font-size: 1rem;
                opacity: 0.58;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 1;
                overflow: hidden;
            }

            .top-part {
                display: flex;
                justify-content: space-between;

                .buttons {
                    display: flex;
                    align-items: center;

                    button {
                        margin: 0 0 0 4px;
                    }

                    .svg-icon {
                        height: 18px;
                        width: 18px;
                    }
                }
            }

            .progress-bar {
                margin-top: 22px;
                display: flex;
                align-items: center;
                justify-content: space-between;

                .slider {
                    width: 100%;
                    flex-grow: grow;
                    padding: 0 10px;
                }

                span {
                    font-size: 15px;
                    opacity: 0.58;
                    min-width: 28px;
                }
            }

            .media-controls {
                display: flex;
                justify-content: center;
                margin-top: 18px;
                align-items: center;

                button {
                    margin: 0;
                }

                .svg-icon {
                    opacity: 0.38;
                    height: 14px;
                    width: 14px;
                }

                .active .svg-icon {
                    opacity: 0.88;
                }

                .middle {
                    padding: 0 16px;
                    display: flex;
                    align-items: center;

                    button {
                        margin: 0 8px;
                    }

                    button#play .svg-icon {
                        height: 28px;
                        width: 28px;
                        padding: 2px;
                    }

                    .svg-icon {
                        opacity: 0.88;
                        height: 22px;
                        width: 22px;
                    }
                }
            }
        }
    }

    .cover {
        position: relative;

        .cover-container {
            position: relative;
        }

        img {
            border-radius: 0.75em;
            width: 54vh;
            height: 54vh;
            user-select: none;
            object-fit: cover;
        }

        .shadow {
            position: absolute;
            top: 12px;
            height: 54vh;
            width: 54vh;
            filter: blur(16px) opacity(0.6);
            transform: scale(0.92, 0.96);
            z-index: -1;
            background-size: cover;
            border-radius: 0.75em;
        }
    }

    .right-side {
        flex: 1;
        font-weight: 600;
        color: var(--color-text);
        margin-right: 24px;
        z-index: 0;

        .lyrics-container {
            height: 100%;
            display: flex;
            flex-direction: column;
            padding-left: 78px;
            max-width: 460px;
            overflow-y: auto;
            transition: 0.5s;

            .line {
                padding: 18px;
                transition: 0.2s;
                border-radius: 12px;

                &:hover {
                    background: var(--color-secondary-bg-for-transparent);
                }

                span {
                    opacity: 0.28;
                    cursor: default;
                }
            }

            .line#line-1:hover {
                background: unset;
            }

            .highlight span {
                opacity: 0.98;
                transition: 0.5s;
            }
        }

        ::-webkit-scrollbar {
            display: none;
        }

        .lyrics-container .line:first-child {
            margin-top: 50vh;
        }

        .lyrics-container .line:last-child {
            margin-bottom: calc(50vh - 128px);
        }
    }

    .close-button {
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 300;
        border-radius: 0.75rem;
        height: 44px;
        width: 44px;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0.28;
        transition: 0.2s;
        -webkit-app-region: no-drag;

        .svg-icon {
            color: var(--color-text);
            padding-top: 5px;
            height: 22px;
            width: 22px;
        }

        &:hover {
            background: var(--color-secondary-bg-for-transparent);
            opacity: 0.88;
        }
    }

    .lyrics-page.no-lyric {
        .left-side {
            transition: all 0.5s;
            transform: translateX(27vh);
            margin-right: 0;
        }
    }

    @media (max-aspect-ratio: 10/9) {
        .left-side {
            display: none;
        }
        .right-side .lyrics-container {
            max-width: 100%;
        }
    }

    .slide-up-enter-active,
    .slide-up-leave-active {
        transition: all 0.4s;
    }

    .slide-up-enter, .slide-up-leave-to /* .fade-leave-active below version 2.1.8 */ {
        transform: translateY(100%);
    }

    .slide-fade-enter-active {
        transition: all 0.5s ease;
    }

    .slide-fade-leave-active {
        transition: all 0.5s cubic-bezier(0.2, 0.2, 0, 1);
    }

    .slide-fade-enter,
    .slide-fade-leave-to {
        transform: translateX(27vh);
        opacity: 0;
    }
</style>
