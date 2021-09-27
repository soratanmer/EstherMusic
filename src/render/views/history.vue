<template>
    <div class="history-tracks">
        <h1>{{ $t('history.text') }}</h1>
        <p>{{ $t('history.describe') }}</p>
        <TrackList :tracks="tracks" type="playlist" dbclick-track-func="playTrackOnListByID" />
    </div>
</template>

<script>
    import { computed, getCurrentInstance } from 'vue'
    import { useStore } from 'vuex'

    import TrackList from '@render/components/TrackList.vue'

    export default {
        name: 'Next',
        components: {
            TrackList,
        },
        setup() {
            const store = useStore()
            const { proxy } = getCurrentInstance()

            const user = computed(() => store.state.user)

            const tracks = computed(() => {
                return user.value.history
            })

            const playTrackOnListByID = () => {
                store.dispatch('player/playTrackOnListByID')
            }

            return {
                store,
                proxy,
                user,
                tracks,
                playTrackOnListByID,
            }
        },
    }
</script>

<style lang="scss" scoped>
    h1,
    p {
        margin-top: 36px;
        margin-bottom: 18px;
        cursor: default;
        color: var(--color-text);
        display: flex;
        justify-content: space-between;
    }
</style>
