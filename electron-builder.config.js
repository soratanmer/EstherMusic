/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
    appId: 'com.EstherMusic.app',
    productName: 'EstherMusic',
    copyright: 'Copyright © 2021 EstherMusic',
    asar: true,
    files: ['dist/main/**/*', 'dist/render/**/*', 'public/**/*'],
    publish: [
        {
            provider: 'github',
            owner: 'soratanmer',
            repo: 'EstherMusic',
            vPrefixedTagName: true,
            releaseType: 'draft',
        },
    ],
    directories: {
        output: 'release/${version}',
    },
    npmRebuild: false,
    buildDependenciesFromSource: true,
    mac: {
        target: [
            {
                target: 'dmg',
                arch: ['x64', 'arm64', 'universal'],
            },
        ],
        artifactName: '${productName}-${os}-${version}-${arch}.${ext}',
        category: 'public.app-category.music',
        darkModeSupport: true,
    },
    win: {
        target: [
            {
                target: 'nsis',
                arch: ['x64'],
            },
            {
                target: '7z',
                arch: ['x64'],
            },
        ],
        publisherName: 'EstherMusic',
        icon: 'public/icons/icon.ico',
        publish: ['github'],
    },
    linux: {
        target: [
            {
                target: 'AppImage',
                arch: ['x64'],
            },
            {
                target: 'tar.gz',
                arch: ['x64'],
            },
            {
                target: 'deb',
                arch: ['x64', 'armv7l'],
            },
            {
                target: 'rpm',
                arch: ['x64'],
            },
            {
                target: 'snap',
                arch: ['x64'],
            },
            {
                target: 'pacman',
                arch: ['x64'],
            },
        ],
        category: 'Music',
        icon: 'public/icons/icon.icns',
    },
    dmg: {
        icon: 'public/icons/icon.icns',
    },
    nsis: {
        oneClick: false,
        perMachine: false,
        allowElevation: true,
        allowToChangeInstallationDirectory: true,
        deleteAppDataOnUninstall: true,
        installerLanguages: 'zh_CN',
        language: 2052,
    },
}

module.exports = config
