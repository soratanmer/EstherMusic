import { join } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteSvgIcons from 'vite-plugin-svg-icons'
import vueI18n from '@intlify/vite-plugin-vue-i18n'
import { VitePWA } from 'vite-plugin-pwa'
import dotenv from 'dotenv'

try {
    dotenv.config({ path: join(__dirname, '.env') })
} catch (error) {
    console.log('error: ', error)
}

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        // setting vue-i18-next
        // Suppress warning
        __VUE_I18N_LEGACY_API__: false,
        __VUE_I18N_FULL_INSTALL__: false,
        __INTLIFY_PROD_DEVTOOLS__: false,
    },
    root: join(__dirname, 'src/render'),
    publicDir: join(__dirname, 'src/render/assets'),
    resolve: {
        alias: [
            {
                find: '@render',
                replacement: join(__dirname, 'src/render'),
            },
            {
                find: '@main',
                replacement: join(__dirname, 'src/main'),
            },
            {
                find: '@common',
                replacement: join(__dirname, 'src/common'),
            },
            {
                find: '@root',
                replacement: join(__dirname, './'),
            },
            {
                //解决警告You are running the esm-bundler build of vue-i18n. It is recommended to configure your bundler to explicitly replace feature flag globals with boolean literals to get proper tree-shaking in the final bundle.
                find: 'vue-i18n',
                replacement: 'vue-i18n/dist/vue-i18n.cjs.js',
            },
        ],
    },
    base: './',
    build: {
        outDir: join(__dirname, 'dist/render'),
        emptyOutDir: true,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return id.toString().split('node_modules/')[1].split('/')[0].toString()
                    }
                },
            },
        },
    },
    server: {
        port: +process.env.DEV_SERVER_PORT || 8080,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '/'),
            },
        },
    },
    plugins: [
        vue(),
        viteSvgIcons({
            // 指定需要缓存的图标文件夹
            iconDirs: [join(__dirname, 'src/render/assets/icons')],
            // 指定symbolId格式
            symbolId: 'icon-[name]',
        }),
        vueI18n({
            defaultSFCLang: 'yaml',

            // if you want to use Vue I18n Legacy API, you need to set `compositionOnly: false`
            compositionOnly: false,

            // you need to set i18n resource including paths !
            include: join(__dirname, 'src/render/locale/**'),
        }),
        VitePWA({
            includeAssets: ['favicon.ico', 'robots.txt', 'logos/apple-touch-icon.png'],
            registerType: 'autoUpdate',
            manifest: {
                name: 'Esther Music',
                short_name: 'Esther Music',
                description: 'A third party music player for Netease Music.',
                background_color: '#335eea',
                theme_color: '#ffffff00',
                display: 'standalone',
                icons: [
                    {
                        src: '/logos/16x16.png',
                        sizes: '16x16',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: '/logos/24x24.png',
                        sizes: '24x24',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: '/logos/32x32.png',
                        sizes: '32x32',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: '/logos/48x48.png',
                        sizes: '48x48',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: '/logos/64x64.png',
                        sizes: '64x64',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: '/logos/128x128.png',
                        sizes: '128x128',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: '/logos/256x256.png',
                        sizes: '256x256',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: '/logos/512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: '/logos/1024x1024.png',
                        sizes: '1024x1024',
                        type: 'image/png',
                        purpose: 'any',
                    },
                ],
            },
            workbox: {
                skipWaiting: true,
                clientsClaim: true,
            },
        }),
    ],
})
