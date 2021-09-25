import axios from 'axios'
import Cookies from 'js-cookie'
import isElectron from 'is-electron'

let baseURL = ''

if (isElectron()) {
    if (import.meta.env.MODE === 'production') {
        baseURL = import.meta.env.VITE_APP_ELECTRON_API_URL
    } else {
        baseURL = import.meta.env.VITE_APP_ELECTRON_API_URL_DEV
    }
} else {
    baseURL = import.meta.env.VITE_APP_NETEASE_API_URL
}

const service = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 15000,
})

service.interceptors.request.use(function (config) {
    if (!config.params) {
        config.params = {}
    }
    if (baseURL[0] !== '/' && !isElectron()) {
        config.params.cookie = `MUSIC_U=${Cookies.get('MUSIC_U')};`
    }
    if (!isElectron()) {
        config.params.realIP = '116.25.146.177'
    }

    const proxy = JSON.parse(localStorage.getItem('settings')).proxyConfig
    if (['HTTP', 'HTTPS'].includes(proxy.protocol)) {
        config.params.proxy = `${proxy.protocol}://${proxy.server}:${proxy.port}`
    }

    return config
})

service.interceptors.response.use(
    (response) => {
        const res = response.data
        return res
    },
    (error) => {
        return Promise.reject(error)
    },
)

export default service
