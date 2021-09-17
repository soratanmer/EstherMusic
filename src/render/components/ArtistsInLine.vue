<template>
    <span class="artist-in-line">
        {{ computedPrefix }}
        <span v-for="(ar, index) in filteredArtists" :key="ar.id">
            <router-link v-if="ar.id !== 0" :to="`/artist/${ar.id}`">
                {{ ar.name }}
            </router-link>
            <span v-else>{{ ar.name }}</span>
            <span v-if="index !== filteredArtists.length - 1">, </span>
        </span>
    </span>
</template>

<script>
    import { computed } from 'vue'

    export default {
        name: 'ArtistInLine',
        props: {
            artists: {
                type: Array,
                required: true,
            },
            exclude: {
                type: String,
                default: '',
            },
            prefix: {
                type: String,
                default: '',
            },
        },
        setup(props) {
            const filteredArtists = computed(() => {
                return props.artists.filter((a) => a.name !== props.exclude)
            })

            const computedPrefix = computed(() => {
                if (filteredArtists.value.length !== 0) {
                    return props.prefix
                } else {
                    return ''
                }
            })

            return {
                filteredArtists,
                computedPrefix,
            }
        },
    }
</script>
