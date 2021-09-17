const state = {
    user: {},
    likedSongPlaylistID: 0,
    lastRefreshCookieDate: 0,
    loginMode: null,
}

const mutations = {
    updateData(state, { key, value }) {
        state[key] = value
    },
}

export default {
    namespaced: true,
    state,
    mutations,
}
