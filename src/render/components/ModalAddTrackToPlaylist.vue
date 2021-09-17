<template>
    <Modal
        class="add-track-to-playlist-modal"
        :show="show"
        :close="close"
        :show-footer="false"
        title="添加到歌单"
        width="25vw"
    >
        <div class="new-playlist-button" @click="newPlaylist">
            <svg-icon icon-name="plus">新建歌单</svg-icon>
        </div>
        <div
            v-for="playlist in ownPlaylists"
            :key="playlist.id"
            class="playlist"
            @click="addTrackToPlaylist(playlist.id)"
        >
            <img :src="proxy.$filters.resizeImage(playlist.coverImgUrl, 224)" />
            <div class="info">
                <div class="title">{{ playlist.name }}</div>
                <div class="track-count">{{ playlist.trackCount }} 首</div>
            </div>
        </div>
    </Modal>
</template>

<script>
    import { ref, computed, getCurrentInstance } from 'vue'
    import { useStore } from 'vuex'
    import { useI18n } from 'vue-i18n'

    import { addOrRemoveTrackFromPlaylist } from '@render/NeteastApi/playlist'

    import Modal from '@render/components/Modal.vue'
    import SvgIcon from '@render/components/SvgIcon.vue'

    export default {
        name: 'ModalAddTrackToPlaylist',
        components: {
            Modal,
            SvgIcon,
        },
        setup() {
            const store = useStore()
            const { t } = useI18n()
            const { proxy } = getCurrentInstance()

            const playlists = ref([])

            const modals = computed(() => store.state.modals)
            const data = computed(() => store.state.data)
            const liked = computed(() => store.state.liked)

            const updateModal = (modal) => {
                store.commit('modals/updateModal', modal)
            }
            const showToast = (toast) => {
                store.dispatch('toast/showToast', toast)
            }

            const show = computed({
                get() {
                    return modals.value.addTrackToPlaylistModal.show
                },
                set(value) {
                    updateModal({
                        modalName: 'addTrackToPlaylistModal',
                        key: 'show',
                        value,
                    })
                    if (value) {
                        store.commit('enableScrolling', false)
                    } else {
                        store.commit('enableScrolling', true)
                    }
                },
            })

            const ownPlaylists = computed(() => {
                return liked.value.playlists.filter(
                    (p) => p.creator.userId === data.value.user.userId && p.id !== data.value.likedSongPlaylistID,
                )
            })

            const close = () => {
                show.value = false
            }

            const addTrackToPlaylist = (playlistID) => {
                addOrRemoveTrackFromPlaylist({
                    op: 'add',
                    pid: playlistID,
                    track: modals.value.addTrackToPlaylistModal.selectedTrackID,
                }).then((res) => {
                    if (res.body.code === 200) {
                        show.value = false
                        showToast(t('toast.savedToPlaylist'))
                    } else {
                        showToast(res.body.message)
                    }
                })
            }

            const newPlaylist = () => {
                updateModal({
                    modalName: 'newPlaylistModal',
                    key: 'afterCreateAddTrackID',
                    value: modals.value.addTrackToPlaylistModal.selectedTrackID,
                })
                close()
                updateModal({
                    modalName: 'newPlaylistModal',
                    key: 'show',
                    value: true,
                })
            }

            return {
                store,
                proxy,
                playlists,
                modals,
                data,
                liked,
                updateModal,
                showToast,
                show,
                ownPlaylists,
                close,
                addTrackToPlaylist,
                newPlaylist,
            }
        },
    }
</script>

<style lang="scss" scoped>
    .new-playlist-button {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 16px;
        font-weight: 500;
        color: var(--color-text);
        background: var(--color-secondary-bg-for-transparent);
        border-radius: 8px;
        height: 48px;
        margin-bottom: 16px;
        margin-right: 6px;
        margin-left: 6px;
        cursor: pointer;
        transition: 0.2s;
        .svg-icon {
            width: 16px;
            height: 16px;
            margin-right: 8px;
        }
        &:hover {
            color: var(--color-primary);
            background: var(--color-primary-bg-for-transparent);
        }
    }
    .playlist {
        display: flex;
        padding: 6px;
        border-radius: 8px;
        cursor: pointer;
        &:hover {
            background: var(--color-secondary-bg-for-transparent);
        }
        img {
            border-radius: 8px;
            height: 42px;
            width: 42px;
            margin-right: 12px;
            border: 1px solid rgba(0, 0, 0, 0.04);
        }
        .info {
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .title {
            font-size: 16px;
            font-weight: 500;
            color: var(--color-text);
            padding-right: 16px;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            overflow: hidden;
            word-break: break-all;
        }
        .track-count {
            margin-top: 2px;
            font-size: 13px;
            opacity: 0.68;
            color: var(--color-text);
        }
    }
</style>
