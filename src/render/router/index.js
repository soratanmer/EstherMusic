import { createRouter, createWebHashHistory } from 'vue-router'
import isElectron from 'is-electron'

import { isLooseLoggedIn, isAccountLoggedIn } from '@render/utils/auth'

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('@render/views/home.vue'),
        meta: {
            keepAlive: true,
            savePosition: true,
        },
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@render/views/login.vue'),
    },
    {
        path: '/login/username',
        name: 'loginUsername',
        component: () => import('@render/views/loginUsername.vue'),
    },
    {
        path: '/login/account',
        name: 'loginAccount',
        component: () => import('@render/views/loginAccount.vue'),
    },
    {
        path: '/playlist/:id',
        name: 'playlist',
        component: () => import('@render/views/playlist.vue'),
    },
    {
        path: '/album/:id',
        name: 'album',
        component: () => import('@render/views/album.vue'),
    },
    {
        path: '/artist/:id',
        name: 'artist',
        component: () => import('@render/views/artist.vue'),
        meta: {
            keepAlive: true,
            savePosition: true,
        },
    },
    {
        path: '/artist/:id/mv',
        name: 'artistMV',
        component: () => import('@render/views/artistMV.vue'),
        meta: {
            keepAlive: true,
        },
    },
    {
        path: '/mv/:id',
        name: 'mv',
        component: () => import('@render/views/mv.vue'),
    },
    {
        path: '/next',
        name: 'next',
        component: () => import('@render/views/next.vue'),
        meta: {
            keepAlive: true,
            savePosition: true,
        },
    },
    {
        path: '/history',
        name: 'history',
        component: () => import('@render/views/history.vue'),
        meta: {
            keepAlive: true,
            savePosition: true,
        },
    },
    {
        path: '/search/:keywords?',
        name: 'search',
        component: () => import('@render/views/search.vue'),
        meta: {
            keepAlive: true,
        },
    },
    {
        path: '/search/:keywords/:type',
        name: 'searchType',
        component: () => import('@render/views/searchType.vue'),
    },
    {
        path: '/new-album',
        name: 'newAlbum',
        component: () => import('@render/views/newAlbum.vue'),
    },
    {
        path: '/explore',
        name: 'explore',
        component: () => import('@render/views/explore.vue'),
        meta: {
            keepAlive: true,
            savePosition: true,
        },
    },
    {
        path: '/library',
        name: 'library',
        component: () => import('@render/views/library.vue'),
        meta: {
            requireLogin: true,
            keepAlive: true,
            savePosition: true,
        },
    },
    {
        path: '/library/liked-songs',
        name: 'likedSongs',
        component: () => import('@render/views/playlist.vue'),
        meta: {
            requireLogin: true,
        },
    },
    {
        path: '/settings',
        name: 'settings',
        component: () => import('@render/views/settings.vue'),
    },
    {
        path: '/daily/songs',
        name: 'dailySongs',
        component: () => import('@render/views/dailyTracks.vue'),
        meta: {
            requireAccountLogin: true,
        },
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

const originalPush = router.push
router.push = function push(location) {
    return originalPush.call(this, location).catch((err) => err)
}

router.beforeEach((to, from, next) => {
    // 需要登录的逻辑
    if (to.meta.requireAccountLogin) {
        if (isAccountLoggedIn()) {
            next()
        } else {
            next({ path: '/login/account' })
        }
    } else if (to.meta.requireLogin) {
        if (isLooseLoggedIn()) {
            next()
        } else {
            if (isElectron()) {
                next({ path: '/login/account' })
            } else {
                next({ path: '/login' })
            }
        }
    } else {
        next()
    }
})

export default router
