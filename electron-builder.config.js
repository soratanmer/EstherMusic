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
    directories: {
        output: 'release/${version}',
    },
    npmRebuild: false,
    buildDependenciesFromSource: true,
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
        artifactName: '${productName}_${version}_${os}_${arch}.${ext}',
        icon: 'public/icons/icon.ico',
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
