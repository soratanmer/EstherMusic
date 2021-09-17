const state = {
    addTrackToPlaylistModal: {
        show: false,
        selectedTrackID: 0,
    },
    newPlaylistModal: {
        show: false,
        afterCreateAddTrackID: 0,
    },
}

const mutations = {
    updateModal(state, { modalName, key, value }) {
        state[modalName][key] = value
        if (key === 'show') {
            // 100ms的延迟是为等待右键菜单blur之后再disableScrolling
            value === true ? setTimeout(() => (state.enableScrolling = false), 100) : (state.enableScrolling = true)
        }
    },
}

export default {
    namespaced: true,
    state,
    mutations,
}
