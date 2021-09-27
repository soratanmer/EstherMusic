<template>
    <Modal class="add-playlist-modal" :show="show" :close="close" :title="$t('modal.newPlayList')" width="25vw">
        <template #default>
            <input v-model="title" type="text" :placeholder="$t('modal.playlistTitle')" maxlength="40" />
            <div class="checkbox">
                <input id="checkbox-private" v-model="privatePlaylist" type="checkbox" />
                <label for="checkbox-private">{{ $t('modal.setPrivatePlaylist') }}</label>
            </div>
        </template>
        <template #footer>
            <button class="primary block" @click="createPlaylists">{{ $t('modal.create') }}</button>
        </template>
    </Modal>
</template>

<script>
    import { ref, computed } from 'vue'
    import { useStore } from 'vuex'
    import { useI18n } from 'vue-i18n'

    import { createPlaylist, addOrRemoveTrackFromPlaylist } from '@render/NeteastApi/playlist'

    import Modal from '@render/components/Modal.vue'

    export default {
        name: 'ModalNewPlaylist',
        components: {
            Modal,
        },
        setup() {
            const store = useStore()
            const { t } = useI18n()

            const title = ref('')
            const privatePlaylist = ref(false)

            const modals = computed(() => store.state.modals)

            const updateModal = (modal) => {
                store.commit('modals/updateModal', modal)
            }
            const updateData = (data) => {
                store.commit('data/updateData', data)
            }
            const showToast = (toast) => {
                store.dispatch('toast/showToast', toast)
            }
            const fetchLikedPlaylist = () => {
                store.dispatch('liked/fetchLikedPlaylist')
            }

            const show = computed({
                get() {
                    return modals.value.newPlaylistModal.show
                },
                set(value) {
                    updateModal({
                        modalName: 'newPlaylistModal',
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

            const resetAfterCreateAddTrackID = () => {
                updateModal({
                    modalName: 'newPlaylistModal',
                    key: 'AfterCreateAddTrackID',
                    value: 0,
                })
            }

            const close = () => {
                show.value = false
                title.value = ''
                privatePlaylist.value = false
                resetAfterCreateAddTrackID()
            }

            const createPlaylists = () => {
                let params = {
                    name: title.value,
                }
                if (privatePlaylist.value) {
                    params.type = 10
                }
                createPlaylist(params).then((res) => {
                    if (res.code === 200) {
                        if (modals.value.newPlaylistModal.afterCreateAddTrackID !== 0) {
                            addOrRemoveTrackFromPlaylist({
                                op: 'add',
                                pid: res.id,
                                tracks: modals.value.newPlaylistModal.afterCreateAddTrackID,
                            }).then((result) => {
                                if (result.body.code === 200) {
                                    showToast(t('toast.savedToPlaylist'))
                                } else {
                                    showToast(result.body.message)
                                }
                                resetAfterCreateAddTrackID()
                            })
                        }
                        close()
                        showToast(t('toast.CreatePlaylistsSucceed'))
                        updateData({
                            key: 'libraryPlaylistFilter',
                            value: 'mine',
                        })
                        fetchLikedPlaylist()
                    }
                })
            }

            return {
                store,
                title,
                privatePlaylist,
                modals,
                updateModal,
                updateData,
                showToast,
                fetchLikedPlaylist,
                show,
                resetAfterCreateAddTrackID,
                close,
                createPlaylists,
            }
        },
    }
</script>

<style lang="scss" scoped>
    .add-playlist-modal {
        .content {
            display: flex;
            flex-direction: column;
            input {
                margin-bottom: 12px;
            }
            input[type='text'] {
                width: calc(100% - 24px);
                flex: 1;
                background: var(--color-secondary-bg-for-transparent);
                font-size: 16px;
                border: none;
                font-weight: 600;
                padding: 8px 12px;
                border-radius: 8px;
                margin-top: -1px;
                color: var(--color-text);
                &:focus {
                    background: var(--color-primary-bg-for-transparent);
                    opacity: 1;
                }
                [data-theme='light'] &:focus {
                    color: var(--color-primary);
                }
            }
            .checkbox {
                input[type='checkbox' i] {
                    margin: 3px 3px 3px 4px;
                }
                display: flex;
                align-items: center;
                label {
                    font-size: 12px;
                }
            }
        }
    }
</style>
