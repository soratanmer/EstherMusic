const state = {
    history: [],
}

const mutations = {
    setHistory(state, history) {
        state.history = history
    },
}

const actions = {
    updateHistory({ state, commit }, currentTrack) {
        let history = state.history.filter((t) => t.id !== currentTrack.id)
        if (history.length >= 100) {
            history.pop()
        }
        history.unshift(currentTrack)
        commit('setHistory', history)
    },
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
}
