<template>
    <div class="newAlbum">
        <h1>{{ $t('home.newAlbum') }}</h1>
        <div class="playlist-row">
            <div class="playlists">
                <CoverRow type="album" :items="albums" sub-text="artist" :show-play-button="true" />
            </div>
        </div>
    </div>
</template>

<script>
    import { ref } from 'vue'
    import NProgress from 'nprogress'

    import { newAlbums } from '@render/NeteastApi/album'

    import CoverRow from '@render/components/CoverRow.vue'

    export default {
        name: 'NewAlbum',
        components: {
            CoverRow,
        },
        setup() {
            const albums = ref([])

            newAlbums({
                area: 'EA',
                limit: 100,
            }).then((res) => {
                albums.value = res.albums
                NProgress.done
            })

            return {
                albums,
            }
        },
    }
</script>

<style lang="scss" scoped>
    h1 {
        color: var(--color-text);
        font-size: 56px;
    }
</style>
