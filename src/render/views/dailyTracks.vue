<template>
    <div v-show="show">
        <div class="special-playlist">
            <div class="title gradient">{{ $t('dailyTracks.title') }}</div>
            <div class="subtitle">{{ $t('dailyTracks.subtitle') }}</div>
        </div>

        <TrackList :tracks="dailyTracks" type="playlist" dbclick-track-func="dailyTracks" />
    </div>
</template>

<script>
    import { ref, computed, getCurrentInstance } from 'vue'
    import { useStore } from 'vuex'
    import NProgress from 'nprogress'

    import { dailyRecommendTracks } from '@render/NeteastApi/playlist'

    import TrackList from '@render/components/TrackList.vue'

    export default {
        name: 'DailyTracks',
        components: {
            TrackList,
        },
        setup() {
            const store = useStore()
            const { proxy } = getCurrentInstance()

            const show = ref(false)

            const player = computed(() => store.state.player)
            const data = computed(() => store.state.data)
            const dailyTracks = computed(() => store.state.dailyTracks)

            const updateDailyTracks = (tracks) => {
                store.commit('updateDailyTracks', tracks)
            }

            const loadDailyTracks = () => {
                dailyRecommendTracks().then((result) => {
                    updateDailyTracks(result.data.dailySongs)
                    NProgress.done()
                    show.value = true
                })
            }

            if (dailyTracks.value.length === 0) {
                setTimeout(() => {
                    if (!show.value) {
                        NProgress.start()
                    }
                }, 1000)
                loadDailyTracks()
            } else {
                show.value = true
            }

            proxy.$root.$refs.main.scrollTo(0, 0)

            return {
                store,
                proxy,
                show,
                player,
                data,
                dailyTracks,
                updateDailyTracks,
                loadDailyTracks,
            }
        },
    }
</script>

<style lang="scss" scoped>
    .special-playlist {
        margin-top: 192px;
        margin-bottom: 128px;
        border-radius: 1.25em;
        text-align: center;

        @keyframes letterSpacing4 {
            from {
                letter-spacing: 0px;
            }

            to {
                letter-spacing: 4px;
            }
        }

        @keyframes letterSpacing1 {
            from {
                letter-spacing: 0px;
            }

            to {
                letter-spacing: 1px;
            }
        }

        .title {
            font-size: 84px;
            line-height: 1.05;
            font-weight: 700;
            text-transform: uppercase;

            letter-spacing: 4px;
            animation-duration: 0.8s;
            animation-name: letterSpacing4;
            -webkit-text-fill-color: transparent;
            -webkit-background-clip: text;
            background-clip: text;
            // background-image: linear-gradient(
            //   225deg,
            //   var(--color-primary),
            //   var(--color-primary)
            // );

            img {
                height: 78px;
                border-radius: 0.125em;
                margin-right: 24px;
            }
        }
        .subtitle {
            font-size: 18px;
            letter-spacing: 1px;
            margin: 28px 0 54px 0;
            animation-duration: 0.8s;
            animation-name: letterSpacing1;
            text-transform: uppercase;
            color: var(--color-text);
        }
        .buttons {
            margin-top: 32px;
            display: flex;
            justify-content: center;
            button {
                margin-right: 16px;
            }
        }
    }

    .gradient {
        background: linear-gradient(to left, #dd2476, #ff512f);
    }
</style>
