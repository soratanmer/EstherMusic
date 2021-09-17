<template>
    <div id="app" :class="{ 'user-select-none': userSelectNone }">
        <Scrollbar v-show="!showLyrics" ref="scrollbar" />
        <Navbar />
        <main ref="main" :style="{ overflow: enableScrolling ? 'auto' : 'hidden' }" @scroll="handleScroll">
            <router-view v-slot="{ Component, route }">
                <transition>
                    <keep-alive v-if="route.meta.keepAlive">
                        <component :is="Component" />
                    </keep-alive>
                    <component :is="Component" v-else />
                </transition>
            </router-view>
        </main>
        <transition name="slide-up">
            <Player v-if="enablePlayer" v-show="showPlayer" ref="player" />
        </transition>
        <Toast />
        <ModalAddTrackToPlaylist v-if="accountLoggedIn" />
        <ModalNewPlaylist v-if="accountLoggedIn" />
        <transition name="slide-up">
            <Lyrics v-if="enablePlayer" v-show="showLyrics" />
        </transition>
    </div>
</template>

<script>
    import { ref, defineComponent, computed, getCurrentInstance } from 'vue'
    import { useStore } from 'vuex'
    import { useRoute, useRouter } from 'vue-router'

    import { isAccountLoggedIn, isLooseLoggedIn } from '@render/utils/auth'

    import Scrollbar from '@render/components/Scrollbar.vue'
    import Navbar from '@render/components/Navbar.vue'
    import Player from '@render/components/Player.vue'
    import Toast from '@render/components/Toast.vue'
    import ModalAddTrackToPlaylist from '@render/components/ModalAddTrackToPlaylist.vue'
    import ModalNewPlaylist from '@render/components/ModalNewPlaylist.vue'
    import Lyrics from '@render/views/lyrics.vue'

    export default defineComponent({
        name: 'App',
        components: {
            Scrollbar,
            Navbar,
            Player,
            Toast,
            ModalAddTrackToPlaylist,
            ModalNewPlaylist,
            Lyrics,
        },
        setup() {
            const route = useRoute()
            const router = useRouter()
            const store = useStore()
            const { proxy } = getCurrentInstance()

            const userSelectNone = ref(false)

            const showLyrics = computed(() => store.state.showLyrics)
            const showLibraryDefault = computed(() => store.state.showLibraryDefault)
            const settings = computed(() => store.state.settings)
            const player = computed(() => store.state.player)
            const enableScrolling = computed(() => store.state.enableScrolling)

            const showPlayer = computed(() => {
                return ['mv', 'loginUsername', 'login', 'loginAccount', 'lastfmCallback'].includes(route.name) === false
            })

            const enablePlayer = computed(() => {
                return player.value.enabled && route.name !== 'lastfmCallback'
            })

            const showNavbar = computed(() => {
                return route.name !== 'lastfmCallback'
            })

            const accountLoggedIn = computed(() => {
                return isAccountLoggedIn()
            })

            const handleKeydown = (e) => {
                if (e.code === 'Space') {
                    if (e.target.tagName === 'INPUT') {
                        return false
                    }
                    if (route.name === 'mv') {
                        return false
                    }
                    e.preventDefault()
                    store.dispatch('player/playOrPause')
                }
            }

            const fetchData = () => {
                store.dispatch('player/initPlayer')
                if (!isLooseLoggedIn()) {
                    return
                }
                store.dispatch('liked/fetchLikedSongs')
                store.dispatch('liked/fetchLikedSongsWithDetails')
                store.dispatch('liked/fetchLikedPlaylist')
                if (isAccountLoggedIn()) {
                    store.dispatch('liked/fetchLikedAlbums')
                    store.dispatch('liked/fetchLikedArtists')
                    store.dispatch('liked/fetchLikedMVs')
                }
            }

            const handleScroll = () => {
                proxy.$refs.scrollbar.handleScroll()
            }

            window.addEventListener('keydown', handleKeydown)
            fetchData()

            return {
                route,
                router,
                store,
                proxy,
                userSelectNone,
                showLyrics,
                showLibraryDefault,
                settings,
                player,
                enableScrolling,
                showPlayer,
                enablePlayer,
                showNavbar,
                accountLoggedIn,
                handleKeydown,
                fetchData,
                handleScroll,
            }
        },
    })
</script>

<style lang="scss">
    #app {
        width: 100%;
        transition: all 0.4s;
    }

    main {
        position: fixed;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        overflow: auto;
        padding: 64px 10vw 96px 10vw;
        box-sizing: border-box;
    }

    @media (max-width: 1336px) {
        main {
            padding: 64px 5vw 96px 5vw;
        }
    }

    main::-webkit-scrollbar {
        width: 0px;
    }

    .slide-up-enter-active,
    .slide-up-leave-active {
        transition: transform 0.4s;
    }
    .slide-up-enter,
    .slide-up-leave-to {
        transform: translateY(100%);
    }
</style>
