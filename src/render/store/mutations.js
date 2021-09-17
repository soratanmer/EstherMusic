export default {
    toggleLyrics(state) {
        state.showLyrics = !state.showLyrics
    },
    updateDailyTracks(state, dailyTracks) {
        state.dailyTracks = dailyTracks
    },
    enableScrolling(state, status = null) {
        state.enableScrolling = status ? status : !state.enableScrolling
    },
}
