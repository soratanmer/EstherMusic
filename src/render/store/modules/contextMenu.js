const state = {
    clickObjectID: 0,
    showMenu: false,
}

const mutations = {
    setClickObjectID(state, id) {
        state.clickObjectID = id
    },
    setShowMenu(state, show) {
        state.showMenu = show
    },
}

export default {
    namespaced: true,
    state,
    mutations,
}
