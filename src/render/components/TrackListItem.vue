<template>
    <div
        class="track"
        :class="trackClass"
        :style="trackStyle"
        :title="showUnavailableSongInGreyStyle ? track.reason : ''"
        @mouseover="hover = true"
        @mouseleave="hover = false"
    >
        <img v-if="!isAlbum" :src="imgUrl" :class="{ hover: focus }" @click="goToAlbum" />
        <div v-if="showOrderNumber" class="no">
            <button v-show="focus && track.playable && !isPlaying" @click="playTrack">
                <svg-icon icon-name="play" style="height: 14px; width: 14px" />
            </button>
            <span v-show="(!focus || !track.playable) && !isPlaying">{{ track.no }}</span>
            <button v-show="isPlaying">
                <svg-icon icon-name="volume" style="height: 16px; width: 16px" />
            </button>
        </div>
        <div class="title-and-artist">
            <div class="container">
                <div class="title">
                    {{ track.name }}
                    <span v-if="isAlbum" class="featured">
                        <ArtistsInLine :artists="track.ar" :exclude="proxy.$parent.albumObject.artist.name" prefix="-"
                    /></span>
                    <span v-if="isAlbum && track.mark === 1318912" class="explicit-symbol"><ExplicitSymbol /></span>
                    <span v-if="isTranslate" :title="translate" class="translate"> ({{ translate }}) </span>
                </div>
                <div v-if="!isAlbum" class="artist">
                    <span v-if="track.mark === 1318912" class="explicit-symbol before-artist"
                        ><ExplicitSymbol :size="15"
                    /></span>
                    <ArtistsInLine :artists="artists" />
                </div>
            </div>
            <div />
        </div>
        <div v-if="showAlbumName" class="album">
            <router-link :to="`/album/${album.id}`">{{ album.name }}</router-link>
            <div />
        </div>
        <div v-if="showLikeButton" class="actions">
            <button @click="likeThisSong">
                <svg-icon
                    icon-name="heart"
                    :style="{
                        visibility: focus && !isLiked ? 'visible' : 'hidden',
                    }"
                />
                <svg-icon v-show="isLiked" icon-name="heart-solid" />
            </button>
        </div>
        <div v-if="showTrackTime" class="time">
            {{ proxy.$filters.formatTime(track.dt) }}
        </div>
    </div>
</template>

<script>
    import { ref, computed, getCurrentInstance } from 'vue'
    import { useStore } from 'vuex'
    import { useRouter } from 'vue-router'
    import isElectron from 'is-electron'

    import ArtistsInLine from '@render/components/ArtistsInLine.vue'
    import ExplicitSymbol from '@render/components/ExplicitSymbol.vue'
    import SvgIcon from '@render/components/SvgIcon.vue'

    export default {
        name: 'TrackListItem',
        components: {
            ArtistsInLine,
            ExplicitSymbol,
            SvgIcon,
        },
        props: {
            trackProp: Object,
            highlightPlayingTrack: {
                type: Boolean,
                default: true,
            },
        },
        setup(props) {
            const { proxy } = getCurrentInstance()
            const store = useStore()
            const router = useRouter()

            const hover = ref(false)
            const trackStyle = ref({})

            const settings = computed(() => store.state.settings)
            const liked = computed(() => store.state.liked)

            const likeATrack = (id) => {
                store.dispatch('liked/likeATrack', id)
            }

            const type = computed(() => {
                return proxy.$parent.type
            })

            const track = computed(() => {
                return type.value === 'cloudDisk' ? props.trackProp.simpleSong : props.trackProp
            })

            const imgUrl = computed(() => {
                let image =
                    track.value?.al?.picUrl ??
                    track.value?.album?.picUrl ??
                    'https://p2.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg'
                return proxy.$filters.resizeImage(image, 224)
            })

            const artists = computed(() => {
                if (track.value.ar !== undefined) {
                    return track.value.ar
                }
                if (track.value.artists !== undefined) {
                    return track.value.artists
                }
                return []
            })

            const album = computed(() => {
                return track.value.album || track.value.al
            })

            const translate = computed(() => {
                let t
                if (track.value?.tns?.length > 0) {
                    t = track.value.tns[0]
                } else {
                    t = track.value.alia[0]
                }
                return t
            })

            const isAlbum = computed(() => {
                return type.value === 'album'
            })

            const isTranslate = computed(() => {
                return track.value?.tns?.length > 0 || track.value.alia?.length > 0
            })

            const isPlaylist = computed(() => {
                return type.value === 'playlist'
            })

            const isLiked = computed(() => {
                return liked.value.songs.includes(track.value?.id)
            })

            const isPlaying = computed(() => {
                return store.state.player.currentTrack.id === track.value?.id
            })

            const showUnavailableSongInGreyStyle = computed(() => {
                return isElectron() ? !settings.value.enableUnblockNeteaseMusic : true
            })

            const isMenuOpened = computed(() => {
                return proxy.$parent.rightClickedTrack.id === track.value.id ? true : false
            })

            const focus = computed(() => {
                return (hover.value && proxy.$parent.rightClickedTrack.id === 0) || isMenuOpened.value
            })

            const trackClass = computed(() => {
                let trackClass = [type.value]
                if (!track.value.playable && showUnavailableSongInGreyStyle.value) {
                    trackClass.push('disable')
                }
                if (isPlaying.value && props.highlightPlayingTrack) {
                    trackClass.push('playing')
                }
                if (focus.value) {
                    trackClass.push('focus')
                }
                return trackClass
            })

            const showLikeButton = computed(() => {
                return type.value !== 'tracklist'
            })

            const showOrderNumber = computed(() => {
                return type.value === 'album'
            })

            const showAlbumName = computed(() => {
                return type.value !== 'album' && type.value !== 'tracklist'
            })

            const showTrackTime = computed(() => {
                return type.value !== 'tracklist'
            })

            const goToAlbum = () => {
                router.push({
                    path: `/album/${track.value.al.id}`,
                })
            }

            const playTrack = () => {
                proxy.$parent.playThisList(track.value.id)
            }

            const likeThisSong = () => {
                likeATrack(track.value.id)
            }

            return {
                proxy,
                store,
                router,
                hover,
                trackStyle,
                settings,
                liked,
                likeATrack,
                type,
                track,
                imgUrl,
                artists,
                album,
                translate,
                isAlbum,
                isTranslate,
                isPlaylist,
                isLiked,
                isPlaying,
                showUnavailableSongInGreyStyle,
                isMenuOpened,
                focus,
                trackClass,
                showLikeButton,
                showOrderNumber,
                showAlbumName,
                showTrackTime,
                goToAlbum,
                playTrack,
                likeThisSong,
            }
        },
    }
</script>

<style lang="scss" scoped>
    button {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 8px;
        background: transparent;
        border-radius: 25%;
        transition: transform 0.2s;
        .svg-icon {
            height: 16px;
            width: 16px;
            color: var(--color-primary);
        }
        &:hover {
            transform: scale(1.12);
        }
        &:active {
            transform: scale(0.96);
        }
    }

    .track {
        display: flex;
        align-items: center;
        padding: 8px;
        border-radius: 12px;
        user-select: none;

        .no {
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 8px;
            margin: 0 20px 0 10px;
            width: 12px;
            color: var(--color-text);
            cursor: default;
            span {
                opacity: 0.58;
            }
        }

        .explicit-symbol {
            opacity: 0.28;
            color: var(--color-text);
            .svg-icon {
                margin-bottom: -3px;
            }
        }

        .explicit-symbol.before-artist {
            margin-right: 2px;
            .svg-icon {
                margin-bottom: -3px;
            }
        }

        img {
            border-radius: 8px;
            height: 46px;
            width: 46px;
            margin-right: 20px;
            border: 1px solid rgba(0, 0, 0, 0.04);
            cursor: pointer;
        }

        img.hover {
            filter: drop-shadow(100 200 0 black);
        }

        .title-and-artist {
            flex: 1;
            display: flex;
            .container {
                display: flex;
                flex-direction: column;
            }
            .title {
                font-size: 18px;
                font-weight: 600;
                color: var(--color-text);
                cursor: default;
                padding-right: 16px;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 1;
                overflow: hidden;
                word-break: break-all;
                .featured {
                    margin-right: 2px;
                    font-weight: 500;
                    font-size: 14px;
                    opacity: 0.72;
                }
                .translate {
                    color: #aeaeae;
                    margin-left: 4px;
                }
            }
            .artist {
                margin-top: 2px;
                font-size: 13px;
                opacity: 0.68;
                color: var(--color-text);
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 1;
                overflow: hidden;
                a {
                    span {
                        margin-right: 3px;
                        opacity: 0.8;
                    }
                    &:hover {
                        text-decoration: underline;
                        cursor: pointer;
                    }
                }
            }
        }
        .album {
            flex: 1;
            display: flex;
            font-size: 16px;
            opacity: 0.88;
            color: var(--color-text);
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
        }
        .time {
            font-size: 16px;
            width: 50px;
            cursor: default;
            display: flex;
            justify-content: flex-end;
            margin-right: 10px;
            font-variant-numeric: tabular-nums;
            opacity: 0.88;
            color: var(--color-text);
        }
    }

    .track.focus {
        transition: all 0.3s;
        background: var(--color-secondary-bg);
    }

    .track.disable {
        img {
            filter: grayscale(1) opacity(0.6);
        }
        .title,
        .artist,
        .album,
        .time,
        .no,
        .featured {
            opacity: 0.28 !important;
        }
        &:hover {
            background: none;
        }
    }

    .track.tracklist {
        img {
            height: 36px;
            width: 36px;
            border-radius: 6px;
            margin-right: 14px;
            cursor: pointer;
        }
        .title {
            font-size: 16px;
        }
        .artist {
            font-size: 12px;
        }
    }

    .track.album {
        height: 32px;
    }

    .actions {
        width: 80px;
        display: flex;
        justify-content: flex-end;
    }

    .track.playing {
        background: var(--color-primary-bg);
        color: var(--color-primary);
        .title,
        .album,
        .time,
        .title-and-artist .translate {
            color: var(--color-primary);
        }
        .title .featured,
        .artist,
        .explicit-symbol {
            color: var(--color-primary);
            opacity: 0.88;
        }
        .no span {
            color: var(--color-primary);
            opacity: 0.78;
        }
    }
</style>
