const state = {
    show: false,
    text: '',
    timer: null,
}

const mutations = {
    setShow(state, show) {
        state.show = show
    },
    setText(state, text) {
        state.text = text
    },
    setTimer(state, time) {
        state.timer = time
    },
    updateToast(state, { show, text, timer }) {
        state.show = show
        state.text = text
        state.timer = timer
    },
}

const actions = {
    showToast({ state, commit }, text) {
        if (state.timer !== null) {
            clearTimeout(state.timer)
            commit('updateToast', {
                show: false,
                text: '',
                timer: null,
            })
        }
        commit('updateToast', {
            show: true,
            text,
            timer: setTimeout(() => {
                commit('updateToast', {
                    show: false,
                    text: state.text,
                    timer: null,
                })
            }, 3200),
        })
    },
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
}
