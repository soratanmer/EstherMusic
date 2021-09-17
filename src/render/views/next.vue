<template>
    <div class="next-tracks">
        <h1>{{ $t('next.nowPlaying') }}</h1>
        <TrackList :tracks="[currentTrack]" type="playlist" dbclick-track-func="none" />
        <h1 v-show="playNextList.length > 0">
            插队播放
            <button @click="clearPlayNextList()">清除队列</button>
        </h1>
        <TrackList
            v-show="playNextList.length > 0"
            :tracks="playNextTracks"
            type="playlist"
            :highlight-playing-track="false"
            dbclick-track-func="playTrackOnListByID"
            item-key="id+index"
            :extra-context-menu-item="['removeTrackFromQueue']"
        />
        <h1>{{ $t('next.nextUp') }}</h1>
        <TrackList
            :tracks="filteredTracks"
            type="playlist"
            :highlight-playing-track="false"
            dbclick-track-func="playTrackOnListByID"
        />
    </div>
</template>

<script>
    import { ref, computed, watch, onActivated, getCurrentInstance } from 'vue'
    import { useStore } from 'vuex'

    import { getTrackDetail } from '@render/NeteastApi/track'

    import TrackList from '@render/components/TrackList.vue'

    export default {
        name: 'Next',
        components: {
            TrackList,
        },
        setup() {
            const store = useStore()
            const { proxy } = getCurrentInstance()

            const tracks = ref([])

            const player = computed(() => store.state.player)

            const clearPlayNextList = () => {
                store.commit('player/clearPlayNextList')
            }

            const playTrackOnListByID = () => {
                store.dispatch('player/playTrackOnListByID')
            }

            const currentTrack = computed(() => {
                return player.value.currentTrack
            })

            const playerShuffle = computed(() => {
                return player.value.shuffle
            })

            const filteredTracks = computed(() => {
                let trackIDs = player.value.list.slice(player.value.current + 1, player.value.current + 100)
                return tracks.value.filter((t) => trackIDs.includes(t.id))
            })

            const playNextList = computed(() => {
                return player.value.playNextList
            })

            const playNextTracks = computed(() => {
                return playNextList.value.map((tid) => {
                    return tracks.value.find((t) => t.id === tid)
                })
            })

            const loadTracks = () => {
                // 获取播放列表当前歌曲后100首歌
                let trackIDs = player.value.list.slice(player.value.current + 1, player.value.current + 100)

                // 将playNextList的歌曲加进trackIDs
                trackIDs.push(...playNextList.value)

                // 获取已经加载了的歌曲
                let loadedTrackIDs = tracks.value.map((t) => t.id)

                if (trackIDs.length > 0) {
                    getTrackDetail(trackIDs.join(',')).then((res) => {
                        let newTracks = res.songs.filter((t) => !loadedTrackIDs.includes(t.id))
                        tracks.value.push(...newTracks)
                    })
                }
            }

            watch([currentTrack, playerShuffle, playNextList], () => {
                loadTracks()
            })

            onActivated(() => {
                loadTracks()
                proxy.$root.$refs.scrollbar.restorePosition()
            })

            return {
                store,
                tracks,
                player,
                playTrackOnListByID,
                clearPlayNextList,
                currentTrack,
                playerShuffle,
                filteredTracks,
                playNextList,
                playNextTracks,
                loadTracks,
            }
        },
    }
</script>

<style lang="scss" scoped>
    h1 {
        margin-top: 36px;
        margin-bottom: 18px;
        cursor: default;
        color: var(--color-text);
        display: flex;
        justify-content: space-between;
        button {
            color: var(--color-text);
            border-radius: 8px;
            padding: 0 14px;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: 0.2s;
            opacity: 0.68;
            font-weight: 500;
            &:hover {
                opacity: 1;
                background: var(--color-secondary-bg);
            }
            &:active {
                opacity: 1;
                transform: scale(0.92);
            }
        }
    }
</style>
