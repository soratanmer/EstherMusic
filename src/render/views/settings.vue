<template>
    <div class="settings-page" @click="exitRecordShortcut()">
        <div class="container">
            <div v-if="showUserInfo" class="user">
                <div class="left">
                    <img class="avatar" :src="data.user.avatarUrl" />
                    <div class="info">
                        <div class="nickname">{{ data.user.nickname }}</div>
                        <div class="extra-info">
                            <span v-if="data.user.vipType !== 0" class="vip"
                                ><img
                                    class="cvip"
                                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHIAAAA8CAYAAAC6j+5hAAAQK0lEQVR4AXzNh5WDMAwA0Dv3Su+wIfuxC3MwgCMUOz3xe1/N7e/X0lovhJCVUroR8r9DfVBKAuQAM8QYQ4815wlHQqQsIh6kFEA+USpRCP4H92yMfmCCtScL7rVzd967Fz5kmcf6zHmeJdDf66LIowJzWd5zUlUlqmsU6wo1TVI/adsmutZd1z7p+6Q7HePY7WCbpmGd53kBF87L4yiTMAaiM+u9N2NTIpB1CZEHuZAGHLFS8T9UXdJqzeHRw5VX3Z8YAIAPwf5Ii8k6Hsfx0nBxgEQwcWQIDKGPEZolAhIRGLg8hCaJUEuEVwhFIN8QMkOgfXsCApNESBLj+yNCEYjEg0iRicB7mdP05T7n+eulcbzv+2IMAHyAF/HI5J2pwBGBpIA4iCZqGwF5yKSJ4AJpIm1EoCfytJWAwKqN8MZRmYEIpI0IJCuJtUD/VoGIQ6aL01Yi8OuBu+95nlzo2bIsR8bggPxikn6ZwGuXiEhS2+iJQBKJEEJpIm1Epksr2ggiEanIRGDRRhCJuY1Znjaxm9R3CCRTIxHZtTHJI0MkbUQqMq+2bfllDMAHTbwax0HlZYGBymRWaaOIDIFQy/SkjaBtlFlFpgjs2whlE0nEQddGEonN24hAaWaSSQOjic5EwhXNpJH+JrrJw5yWbQQRiEQE0kJLREobEcmcIhGB8i7KpCIUkQhEome0MLJ5G7PAto2Q55TvaGHTxlqivItdG0PksszOGW/m4D/8sGFOQ55KzE0ko4UqE4nayHypIq6eVARGC5V+UmuBKjLkBe2kCv2kaiMRWM+qg0RQgZ7LMgm2pseHRR0247ITmY8cBPazqu+iytRGqlBE5neRpIX9rML/zCqJRJWZGwkqEJAY6QL7WSWRKDJppH9f+r8mLvJ7SASuVEQmiWRqIdBEMq7U30+qkie1eRdFHDKZVY6bflIVJEL9LqYWAgJJmthMqkITSZfnIpHoua53Mm1dv7vIk9RGoZeISEAc06qNdLSFJKhAeEGmS5VUoSGwnlZklm+jkJv4vrtUmVJ5H2li9zaCCtRGIhKZiNy2+WQweachEZDYzik0bcxXKvRtVImAxPrASXPqQvsDp34j2ybWIj8mEAdVG0kOHG0jTEATaSNprKcu8vxPVyoJWSIp72N55HCx1lcqqZNKBkh0uFJJlRm8kXntr9TyfYQkkfRG6vuYr1Tex6KJJDKrIwehNNJYPM+HelZDHO8jLSSdW1rOAci5bYnCeSprmLHtubbte8fXtm3btm3btm3bxq/9TqfeqtpZ0+fszrs5VbUqU+Pkq9W9GzsCjAUnAmJ1Nus2mZpwKy29FOfGHLhrzz7duU8+SNQN553NuREdHF++E0O/k0GGvp9zIz5v1q9vv+befewhd+9Vl7s9t9vaDfX3CjA+qSpOzMblRoEIkC7DAFmAyG7kniogwo1rrriCe+T6a9zsj9/PPZGvX3rO1VZX+zBF8jn5WvCF2GhyDDD1vEgK/D7qq4ZBUngNwwto1kfvuUtPOdEN9PVwucGhFW5kmJCUIADJYTW5gxNX/IuWX2Jx99wdt6r//LVnn6EW/2uvuUbwiX//6kuupamRa0bOkciLZpAIp4Hv51IjDMuoX956za0/PqrmRg6nDJBBAiLlREgrN/7DbszlsWP328fNSf7HI2ir84RDJJCDT/rOyy4OuhGh1Q7S5kguN+ywwpKotc8O29MJFQLE/NwIIbxmeMIh0ro3eOR2nLgxGyXwJ2+5MfgPI8TW1VTjgAPJ50whdusN1wNMbd5odiSfUI0gi+tIgrnBxCi14UheyQEnQhkPIh1wfKDxJ9Wy0lKEUrOuOycXYnlobAqxP73xiutqb6cuDp1SCwNpciSfVIsNEmF2aKBPYHITAADJkR5Ia2Oc2nAicYbZiax11lpDAHJP1RRiH7z2KgHHDQAopRwpANMDCV16yknkyGrfjb4TPZi1cCTgadP/eDcef8B+2j9jDrH1tbU8ppLPmULsLltuFjemsoJEWDWD9GGmARGn2bkGByi0JrmRQHLxDyeKGKBoyYUXQmkR1IwP3sk5bYPodNbf3eXK5UUpFZWoM0dxa+h3/vbOG26wr0eFmUKO9N1oduRnzz3ltlh/Hdff2xWpO/p4Xflc8Of22n4bv4vDAEV6jgTAUE/VB/rqfXeZnsyN553jujva1U4OQqrXS0Vz3BRin7j5BoADSCn0LSC5DWd1JDo4Jogd7S1S7Od1cro624Iw77v6coDk3KhCrK+PHOkfbPDoO1Fz5GrLLWs6he213dYo/rkVR06cDrOhzhZi991xe3VEZQeZjiPFiRhVcStuyw3WTfpZ6QAlFv8C04coUnOk1orzYErHJvhE9tx2a2W9EY88+dd3cdZZa83g3/nzvbfcvMODfk81FZCAaD3s9PV0+U7Ma44P9HUH2nmvx9SNeQccypGASNJqRlF9bY0hnJ4NgDzhiHMjT/5RK5pC7PN33hbBKMGIKo3QSpONIEjJizzhgKQtFyxDuGZEbqSQKhDhyPCoCk4UbTg+FjzYSE7k5jitccTuqQIgmuON9fWmEHvYnrv5k400cqQ33TCHVlHBofW9xx/i5jhcySA5R8aXGzxnvOTk4xP/CXEQb8RBbSWl7soFFnKfrriySD6Wz8W6EUX/uiNrmk7Giy4wnxlkaWlBIOFEE0gcdjo7WqdB7OpsNxx2rvDdGIIYqU5AMsT4/Ch66tbkBsAG4yPiRjqlCsQS983Kq7lZa4z4ks8BproBgML/+nPPCr54r91/j7zIZkdi6p9GaAVMcZ+UHpIX5WNL+bH3DtvEnlIRXhFSIYAUEcD8HIlB8fuPP5Kc5Lu6ABESmOI+hgjJ12K34qCmhgb3zcvPB1+E4w/cvwCQJWaQvBWXZkNg7qFBdcIB4aBDIP+plBsifdlYTlSJIaukhPOj5EUJpbEgP1tpZUAEUHUrbr3REdMLsfSiCxvni/bQynuqaYG87NSTqOSoCUJsaJDQ6hf/BJDyo0hOVMmHgtJSbQ8nAHKVWIAkU4h959EHzYNi68Sfd1TTaprPNdTvQ4T4pKqDFGlb4yK+FvfWw/cXFFrhyCsXWDAQWnnFUQVqDrEp5EiBia24VMZYG06O8SEHEBmmp7qcMur9Rs+FDFImD6HDjlcv4lEONLGHnfbSMnZjTgO93dqYyhRirY40zhd5M67YEKVDpdaMHFbhSDgRyuQ3xmn1X1lvlD0Tw6xRxOuNavnRXoryI38rTnT7JRcKNED0B8fBEGsHaXIkrzYWNZyKE7nUYKAAqIVVP0f6YoD+jSpTQ6Cns523xRPvNwo0rh2H+/vdzA/fjcLocxJOARBFv+zvBEJsUXMk398o0vLVSW54sE8g+opx5LRwio/hSMDzICq5EarKVsgLHJx4xF8Zt12Ju+eKS/H7xH0CkmHKWOxvgERYNYGkPdWwI2UH5+4rLnEfPvloNHJ7XU770gyXyYaMqaISY4CHxtxP5ZOqyIdJoZUmHH7JAfGi8QPXXBkuarffBj1VBaAOE2H1/OOPnvb71h8bQVM8D+YN56khttjrjbRoHAbJq43+1F/ZACCIITcqOZLcCKluBMixVVc2jrG2ITcq9xsppB6z397q75Mw2tzYQNvi5hAb2MGxO9IOEvcb4y7jVAMiL1R5j8iN+e04htjYWA+Q8SEVjuT7G4/fdL15sNzb1eE7Ug2r3R0dcriJ/T0Isdp1uA2Qt+3iG1UFOjKYIwFOcyQ7kdwYLP4prNYDJOVIAklhFTBl1cP0guEAdN05Z+a2xQd6elylHBrKyyLAndHnxuXaQCjv+iHWv0kFybWC/8eRVpCAiEcrSEA0bsWFW3GcH6FM+A5H/P3GUw49iJ5A+jrugH3V+42tzU3GEAuQhS0c+/cbs9kgSADE0jEgJk3+qTEuwIIhlUIrhVUA1K7G+beMJVTeeyVOl+nrxvPPATwGiRCbYo4UiObQGroax4NjiJ0IoBxa40H6SoLIN6qy0ZN648H7UgWIRSt5IQNv4IAQW+yFY1yHM4NkiOEDTtz0H1Lc6OfIuHfh8E+peIT4fqPAvPfKy1KDKDtCjQ31gJh4v7GtpRkhtphbcXRJ1Q5SoOExfr1Rg8nlRh2UBxPKBJzofUxupOm/nECLnTP/ev9tt99O26sA8cgwRRtOjJmXqSALSH8rLgzSfr8RUpxIboTqFZBKbiSgAAiY6h4OCn85zUoYDIMKT/sXnm8e1IxBN7ICIVbgFRhaAbEgR1JeFMXu4XAHh5vjihuhBpcBRN2RajhVt+L47v/E6qvKpMRUVkBzIj15yw1Ro3yt8Ds3Bt7cqL21JSnEem4sNQ2KPTdaHQl4BDAUVuHC+HCKvAg1Nf0PpPYOHPwuVfFujN8aF9VGT2KTqUl3+WknuYevv9q9/cgDuY6/7KN+9eIz7qV77owWuk50O22+qetsa7W+Jw5JvfMvNaoxR9pDK94Lxx5aATHgxsAhh2GyMv9t7WxS2wiiINw7ZxOyT/w3YPBtdBGDL+R76C66hrWVIO8FCgq+rtYgsvimtS/qve7XM6US7MwBgDkSvbF5gAPtN6Y39wYbsaT+WubFuZiMUkFeHN6Ms2sqpFOlYKMC47j1FEdizu8bGwrI3apKartx257PowQ7lYjY4HAI8MMdaXAwznEcRWQU59SJWnF+FBQQUWOzdCrgAjJuTALKkauYsQZDAIgouEvFgNwEpCNLyOLl1I48tmgG+uL8+43GX/8PjuTtRkioEkipWuWo7gz+25/eSAGXOaruROFOhBvDq422copDAZ8bE/PlOEqkjxDDieNG4WKG0L+b943ThCriQu51Y44aW6cau4hCgsKNtSY3akWAA/qjCQg3srQmN6q0vnz8yy2vHnmZhf7xRePbeXFaeU1FN2YxZ72RrKPG5EQK6Hh/VFmVA11IwbJKMfmlMXeo7JGroTg2N94jL29vb4+jHqPE+rIjR3Rj/UY55feNdKNhIv5s1jGc+3vjMvjPmAXFe2qjpVPBjchTDVlxcGMex/2ZnRlttd6Y3fhVjNGPDt4t8b6xW4WAKYIzlVQ48u4IznBmDBmqaYOTs1QpplwJAdMmR3he3NSRTiqpBgSsVSJ+v7+//y7G6EdRYj4cypVXllXvi3Ckwe8b2Rc99T86EvyHshr6I3qkC5i+b8TNfyir6Ita3YUU83ElpAt63bbtUIymH6L75WcJeGUMpztxUVJ53AiZOLsF1JpSjbWClGrMGE4mNzIwPvRFzFKdUFLhRo7hcE3FvngtPosh+uF0mT2UcN/p0zjsVPlmnASEI3luBBDwnt7o0Ik5ML6RcN4fPfxvvVOlgKvXOPJV1VMcjnc53banQzGcfoDumSXiV3FBOb3tRogoPA+HAQ47yylEnE9yBFONU7qxYDkNbpSgdCNEnLpRKyY4YaZ66Y2NeqKjHhnpo0kJ9VGCHuv3qTi7oL7Jsb6oFX0x/5kKd6vBifYbTrzVHwV6Yq3crXKXylEcd6la8VYcR3GY3mgV59fXp1Nx7HNiHzGKkfgLQfHe2MpsYnIAAAAASUVORK5CYII="
                                />
                                <span class="text">黑胶VIP</span>
                            </span>
                            <span v-else class="text">{{ data.user.signature }}</span>
                        </div>
                    </div>
                </div>
                <div class="right">
                    <button @click="logout">
                        <svg-icon icon-name="logout" />
                        {{ $t('settings.logout') }}
                    </button>
                </div>
            </div>

            <div class="item">
                <div class="left">
                    <div class="title">{{ $t('settings.language') }}</div>
                </div>
                <div class="right">
                    <select v-model="lang">
                        <option value="en">🇬🇧 English</option>
                        <option value="zh-CN">🇨🇳 简体中文</option>
                        <option value="zh-TW">ᴛᴡ 繁體中文</option>
                    </select>
                </div>
            </div>
            <div class="item">
                <div class="left">
                    <div class="title">
                        {{ $t('settings.appearance.text') }}
                    </div>
                </div>
                <div class="right">
                    <select v-model="appearance">
                        <option value="auto">
                            {{ $t('settings.appearance.auto') }}
                        </option>
                        <option value="light"> 🌞 {{ $t('settings.appearance.light') }} </option>
                        <option value="dark"> 🌚 {{ $t('settings.appearance.dark') }} </option>
                    </select>
                </div>
            </div>

            <div class="item">
                <div class="left">
                    <div class="title"> 音乐语种偏好 </div>
                </div>
                <div class="right">
                    <select v-model="musicLanguage">
                        <option value="all">无偏好</option>
                        <option value="zh">华语</option>
                        <option value="ea">欧美</option>
                        <option value="jp">日语</option>
                        <option value="kr">韩语</option>
                    </select>
                </div>
            </div>

            <h3>{{ $t('settings.soundQuality') }}</h3>
            <div class="item">
                <div class="left">
                    <div class="title">
                        {{ $t('settings.musicQuality.text') }}
                    </div>
                </div>
                <div class="right">
                    <select v-model="musicQuality">
                        <option value="128000"> {{ $t('settings.musicQuality.low') }} - 128Kbps </option>
                        <option value="192000"> {{ $t('settings.musicQuality.medium') }} - 192Kbps </option>
                        <option value="320000"> {{ $t('settings.musicQuality.high') }} - 320Kbps </option>
                        <option value="999000"> {{ $t('settings.musicQuality.lossless') }} - FLAC </option>
                    </select>
                </div>
            </div>
            <div v-if="isElectron" class="item">
                <div class="left">
                    <div class="title">
                        {{ $t('settings.deviceSelector') }}
                    </div>
                </div>
                <div class="right">
                    <select v-model="outputDevice">
                        <option
                            v-for="device in allOutputDevices"
                            :key="device.deviceId"
                            :value="device.deviceId"
                            :selected="device.deviceId == outputDevice"
                        >
                            {{ device.label }}
                        </option>
                    </select>
                </div>
            </div>

            <h3 v-if="isElectron">{{ $t('settings.cache') }}</h3>
            <div v-if="isElectron" class="item">
                <div class="left">
                    <div class="title">
                        {{ $t('settings.automaticallyCacheSongs') }}
                    </div>
                </div>
                <div class="right">
                    <div class="toggle">
                        <input
                            id="automatically-cache-songs"
                            v-model="automaticallyCacheSongs"
                            type="checkbox"
                            name="automatically-cache-songs"
                        />
                        <label for="automatically-cache-songs" />
                    </div>
                </div>
            </div>
            <div v-if="isElectron" class="item">
                <div class="left">
                    <div class="title">
                        {{ $t('settings.cacheLimit.text') }}
                    </div>
                </div>
                <div class="right">
                    <select v-model="cacheLimit">
                        <option :value="false">
                            {{ $t('settings.cacheLimit.none') }}
                        </option>
                        <option :value="512">500MB</option>
                        <option :value="1024">1GB</option>
                        <option :value="2048">2GB</option>
                        <option :value="4096">4GB</option>
                        <option :value="8192"> 8GB </option>
                    </select>
                </div>
            </div>
            <div v-if="isElectron" class="item">
                <div class="left">
                    <div class="title">
                        {{
                            $t('settings.cacheCount', {
                                song: tracksCache.length,
                                size: tracksCache.size,
                            })
                        }}
                    </div>
                </div>
                <div class="right">
                    <button @click="clearCache()">
                        {{ $t('settings.clearSongsCache') }}
                    </button>
                </div>
            </div>

            <h3>{{ $t('settings.lyric') }}</h3>
            <div class="item">
                <div class="left">
                    <div class="title">
                        {{ $t('settings.showLyricsTranslation') }}
                    </div>
                </div>
                <div class="right">
                    <div class="toggle">
                        <input
                            id="show-lyrics-translation"
                            v-model="showLyricsTranslation"
                            type="checkbox"
                            name="show-lyrics-translation"
                        />
                        <label for="show-lyrics-translation" />
                    </div>
                </div>
            </div>
            <div class="item">
                <div class="left">
                    <div class="title">
                        {{ $t('settings.lyricFontSize.text') }}
                    </div>
                </div>
                <div class="right">
                    <select v-model="lyricFontSize">
                        <option value="16"> {{ $t('settings.lyricFontSize.small') }} - 16px </option>
                        <option value="22"> {{ $t('settings.lyricFontSize.medium') }} - 22px </option>
                        <option value="28"> {{ $t('settings.lyricFontSize.large') }} - 28px </option>
                        <option value="36"> {{ $t('settings.lyricFontSize.xlarge') }} - 36px </option>
                    </select>
                </div>
            </div>

            <h3 v-if="isElectron">{{ $t('settings.thirdParties') }}</h3>
            <div v-if="isElectron" class="item">
                <div class="left">
                    <div class="title">
                        {{ $t('settings.open') }}
                        <a href="https://github.com/nondanee/UnblockNeteaseMusic" target="blank">UnblockNeteaseMusic</a>
                    </div>
                </div>
                <div class="right">
                    <div class="toggle">
                        <input
                            id="enable-unblock-netease-music"
                            v-model="enableUnblockNeteaseMusic"
                            type="checkbox"
                            name="enable-unblock-netease-music"
                        />
                        <label for="enable-unblock-netease-music" />
                    </div>
                </div>
            </div>

            <h3>{{ $t('settings.other') }}</h3>
            <div v-if="isElectron && !isMac" class="item">
                <div class="left">
                    <div class="title">{{ $t('settings.minimizeToTray') }}</div>
                </div>
                <div class="right">
                    <div class="toggle">
                        <input id="minimize-to-tray" v-model="minimizeToTray" type="checkbox" name="minimize-to-tray" />
                        <label for="minimize-to-tray" />
                    </div>
                </div>
            </div>

            <div v-if="isElectron" class="item">
                <div class="left">
                    <div class="title">
                        {{ $t('settings.showLibraryDefault') }}
                    </div>
                </div>
                <div class="right">
                    <div class="toggle">
                        <input
                            id="show-library-default"
                            v-model="showLibraryDefault"
                            type="checkbox"
                            name="show-library-default"
                        />
                        <label for="show-library-default" />
                    </div>
                </div>
            </div>

            <div class="item">
                <div class="left">
                    <div class="title">
                        {{ $t('settings.showPlaylistsByAppleMusic') }}
                    </div>
                </div>
                <div class="right">
                    <div class="toggle">
                        <input
                            id="show-playlists-by-apple-music"
                            v-model="showPlaylistsByAppleMusic"
                            type="checkbox"
                            name="show-playlists-by-apple-music"
                        />
                        <label for="show-playlists-by-apple-music" />
                    </div>
                </div>
            </div>

            <div v-if="isElectron">
                <h3>{{ $t('settings.proxy') }}</h3>
                <div class="item">
                    <div class="left">
                        <div class="title">{{ $t('settings.proxyOptions.agreement') }}</div>
                    </div>
                    <div class="right">
                        <select v-model="proxyProtocol">
                            <option value="noProxy">{{ $t('settings.proxyOptions.close') }}</option>
                            <option value="HTTP">HTTP {{ $t('settings.proxy') }}</option>
                            <option value="HTTPS">HTTPS {{ $t('settings.proxy') }}</option>
                            <!-- <option value="SOCKS"> SOCKS {{ $t('settings.proxy') }} </option> -->
                        </select>
                    </div>
                </div>
                <div id="proxy-form" :class="{ disabled: proxyProtocol === 'noProxy' }">
                    <input
                        v-model="proxyServer"
                        class="text-input"
                        :placeholder="$t('settings.proxyOptions.address')"
                        :disabled="proxyProtocol === 'noProxy'"
                    /><input
                        v-model="proxyPort"
                        class="text-input"
                        :placeholder="$t('settings.proxyOptions.port')"
                        type="number"
                        min="1"
                        max="65535"
                        :disabled="proxyProtocol === 'noProxy'"
                    />
                    <button @click="sendProxyConfig">{{ $t('settings.proxyOptions.update') }}</button>
                </div>
            </div>

            <div v-if="isElectron">
                <h3>{{ $t('settings.shortcut') }}</h3>
                <div class="item">
                    <div class="left">
                        <div class="title">
                            {{ $t('settings.enableGlobalShortcut') }}
                        </div>
                    </div>
                    <div class="right">
                        <div class="toggle">
                            <input
                                id="enable-enable-global-shortcut"
                                v-model="enableGlobalShortcut"
                                type="checkbox"
                                name="enable-enable-global-shortcut"
                            />
                            <label for="enable-enable-global-shortcut" />
                        </div>
                    </div>
                </div>
                <div
                    id="shortcut-table"
                    :class="{ 'global-disabled': !enableGlobalShortcut }"
                    tabindex="0"
                    @keydown="handleShortcutKeydown"
                >
                    <div class="row row-head">
                        <div class="col">{{ $t('settings.shortcutOptions.functions') }}</div>
                        <div class="col">{{ $t('settings.shortcut') }}</div>
                        <div class="col">{{ $t('settings.shortcutOptions.global') }}</div>
                    </div>
                    <div v-for="shortcut in settings.shortcuts" :key="shortcut.id" class="row">
                        <div class="col">{{ shortcut.name }}</div>
                        <div class="col">
                            <div
                                class="keyboard-input"
                                :class="{
                                    active: shortcutInput.id === shortcut.id && shortcutInput.type === 'shortcut',
                                }"
                                @click.stop="readyToRecordShortcut(shortcut.id, 'shortcut')"
                            >
                                {{
                                    shortcutInput.id === shortcut.id &&
                                    shortcutInput.type === 'shortcut' &&
                                    recordedShortcutComputed !== ''
                                        ? formatShortcut(recordedShortcutComputed)
                                        : formatShortcut(shortcut.shortcut)
                                }}
                            </div>
                        </div>
                        <div class="col">
                            <div
                                class="keyboard-input"
                                :class="{
                                    active:
                                        shortcutInput.id === shortcut.id &&
                                        shortcutInput.type === 'globalShortcut' &&
                                        enableGlobalShortcut,
                                }"
                                @click.stop="readyToRecordShortcut(shortcut.id, 'globalShortcut')"
                                >{{
                                    shortcutInput.id === shortcut.id &&
                                    shortcutInput.type === 'globalShortcut' &&
                                    recordedShortcutComputed !== ''
                                        ? formatShortcut(recordedShortcutComputed)
                                        : formatShortcut(shortcut.globalShortcut)
                                }}</div
                            >
                        </div>
                    </div>
                    <button class="restore-default-shortcut" @click="restoreDefaultShortcuts">{{
                        $t('settings.shortcutOptions.default')
                    }}</button>
                </div>
            </div>

            <div class="footer">
                <p class="author">
                    MADE BY
                    <a href="https://github.com/soratanmer" target="_blank">SORATA FUJISAWA</a>
                </p>
                <p class="version">v{{ version }}</p>
            </div>
        </div>
    </div>
</template>

<script>
    import { ref, computed, onActivated } from 'vue'
    import { useStore } from 'vuex'
    import { useRoute, useRouter } from 'vue-router'
    import { useI18n } from 'vue-i18n'
    import is_electron from 'is-electron'

    import { isLooseLoggedIn, doLogout } from '@render/utils/auth'
    import { changeAppearance, bytesToSize } from '@render/utils/common'
    import { countDBSize, clearDB } from '@render/utils/db'

    import pkg from '@root/package.json'

    import SvgIcon from '@render/components/SvgIcon.vue'

    const ipcRenderer = is_electron() ? window.require('electron').ipcRenderer : null

    const validShortcutCodes = ['=', '-', '~', '[', ']', ';', "'", ',', '.', '/']

    export default {
        name: 'Settings',
        components: {
            SvgIcon,
        },
        setup() {
            const store = useStore()
            const route = useRoute()
            const router = useRouter()
            const i18n = useI18n()
            const { t } = useI18n()

            const tracksCache = ref({
                size: '0KB',
                length: 0,
            })
            const allOutputDevices = ref([
                {
                    deviceId: 'default',
                    label: 'settings.permissionRequired',
                },
            ])
            const shortcutInput = ref({
                id: '',
                type: '',
                recording: false,
            })
            const recordedShortcut = ref([])
            const withoutAudioPriviledge = ref()

            const player = computed(() => store.state.player)
            const settings = computed(() => store.state.settings)
            const data = computed(() => store.state.data)

            const isElectron = computed(() => {
                return is_electron()
            })

            const showToast = (toast) => {
                store.dispatch('toast/showToast', toast)
            }

            const countDBSized = () => {
                countDBSize().then((res) => {
                    if (res === undefined) {
                        tracksCache.value = {
                            size: '0KB',
                            length: 0,
                        }
                        return
                    }
                    tracksCache.value.size = bytesToSize(res.bytes)
                    tracksCache.value.length = res.length
                })
            }

            const clearCache = () => {
                clearDB().then(() => {
                    countDBSized()
                })
            }

            const isMac = computed(() => {
                return /macintosh|mac os x/i.test(navigator.userAgent)
            })

            const version = computed(() => {
                return pkg.version
            })

            const showUserInfo = computed(() => {
                return isLooseLoggedIn() && data.value.user.nickname
            })

            const recordedShortcutComputed = computed(() => {
                let shortcut = []
                recordedShortcut.value.map((e) => {
                    if (e.keyCode >= 65 && e.keyCode <= 90) {
                        // A-Z
                        shortcut.push(e.code.replace('Key', ''))
                    } else if (e.key === 'Meta') {
                        // ⌘ Command on macOS
                        shortcut.push('Command')
                    } else if (['Alt', 'Control', 'Shift'].includes(e.key)) {
                        shortcut.push(e.key)
                    } else if (e.keyCode >= 48 && e.keyCode <= 57) {
                        // 0-9
                        shortcut.push(e.code.replace('Digit', ''))
                    } else if (e.keyCode >= 112 && e.keyCode <= 123) {
                        // F1-F12
                        shortcut.push(e.code)
                    } else if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                        // Arrows
                        shortcut.push(e.code.replace('Arrow', ''))
                    } else if (validShortcutCodes.includes(e.key)) {
                        shortcut.push(e.key)
                    }
                })
                const sortTable = {
                    Control: 1,
                    Shift: 2,
                    Alt: 3,
                    Command: 4,
                }
                shortcut = shortcut.sort((a, b) => {
                    if (!sortTable[a] || !sortTable[b]) return 0
                    if (sortTable[a] - sortTable[b] <= -1) {
                        return -1
                    } else if (sortTable[a] - sortTable[b] >= 1) {
                        return 1
                    } else {
                        return 0
                    }
                })
                shortcut = shortcut.join('+')
                return shortcut
            })

            const lang = computed({
                get() {
                    return settings.value.lang
                },
                set(lang) {
                    i18n.locale.value = lang
                    store.commit('settings/changeLang', lang)
                },
            })

            const musicLanguage = computed({
                get() {
                    return settings.value.musicLanguage ?? 'all'
                },
                set(value) {
                    store.commit('settings/updateSettings', {
                        key: 'musicLanguage',
                        value,
                    })
                },
            })

            const appearance = computed({
                get() {
                    if (settings.value.appearance === undefined) {
                        return 'auto'
                    }
                    return settings.value.appearance
                },
                set(value) {
                    store.commit('settings/updateSettings', {
                        key: 'appearance',
                        value,
                    })
                    changeAppearance(value)
                },
            })

            const musicQuality = computed({
                get() {
                    if (settings.value.musicQuality === undefined) {
                        return 320000
                    }
                    return settings.value.musicQuality
                },
                set(value) {
                    if (value === settings.value.musicQuality) {
                        return
                    }
                    store.commit('settings/changeMusicQuality', value)
                    clearCache()
                },
            })

            const lyricFontSize = computed({
                get() {
                    if (settings.value.lyricFontSize === undefined) {
                        return 28
                    }
                    return settings.value.lyricFontSize
                },
                set(value) {
                    store.commit('settings/changeLyricFontSize', value)
                },
            })

            const outputDevice = computed({
                get() {
                    const isValidDevice = allOutputDevices.value.find(
                        (device) => device.deviceId === settings.value.outputDevice,
                    )
                    if (settings.value.outputDevice === undefined || isValidDevice === undefined) {
                        return 'fefault' // Default deviceID
                    }
                    return settings.value.outputDevice
                },
                set(deviceID) {
                    if (deviceID === settings.value.outputDevice || deviceID === undefined) {
                        return
                    }
                    store.commit('settings/changeOutputDevice', deviceID)
                    store.dispatch('player/setOutputDevice')
                },
            })

            const enableUnblockNeteaseMusic = computed({
                get() {
                    const value = settings.value.enableUnblockNeteaseMusic
                    return value !== undefined ? value : true
                },
                set(value) {
                    store.commit('settings/updateSettings', {
                        key: 'enableUnblockNeteaseMusic',
                        value,
                    })
                },
            })

            const showPlaylistsByAppleMusic = computed({
                get() {
                    if (settings.value.showPlaylistsByAppleMusic === undefined) {
                        return true
                    }
                    return settings.value.showPlaylistsByAppleMusic
                },
                set(value) {
                    store.commit('settings/updateSettings', {
                        key: 'showPlaylistsByAppleMusic',
                        value,
                    })
                },
            })

            const automaticallyCacheSongs = computed({
                get() {
                    if (settings.value.automaticallyCacheSongs === undefined) {
                        return false
                    }
                    return settings.value.automaticallyCacheSongs
                },
                set(value) {
                    store.commit('settings/updateSettings', {
                        key: 'automaticallyCacheSongs',
                        value,
                    })
                    if (value === false) {
                        clearCache()
                    }
                },
            })

            const showLyricsTranslation = computed({
                get() {
                    return settings.value.showLyricsTranslation
                },
                set(value) {
                    store.commit('settings/updateSettings', {
                        key: 'showLyricsTranslation',
                        value,
                    })
                },
            })

            const minimizeToTray = computed({
                get() {
                    return settings.value.minimizeToTray
                },
                set(value) {
                    store.commit('settings/updateSettings', {
                        key: 'minimizeToTray',
                        value,
                    })
                },
            })

            const enableGlobalShortcut = computed({
                get() {
                    return settings.value.enableGlobalShortcut
                },
                set(value) {
                    store.commit('settings/updateSettings', {
                        key: 'enableGlobalShortcut',
                        value,
                    })
                },
            })

            const showLibraryDefault = computed({
                get() {
                    return settings.value.showLibraryDefault || false
                },
                set(value) {
                    store.commit('settings/updateSettings', {
                        key: 'showLibraryDefault',
                        value,
                    })
                },
            })

            const cacheLimit = computed({
                get() {
                    return settings.value.cacheLimit || false
                },
                set(value) {
                    store.commit('settings/updateSettings', {
                        key: 'cacheLimit',
                        value,
                    })
                },
            })

            const proxyProtocol = computed({
                get() {
                    return settings.value.proxyConfig?.protocol || 'noProxy'
                },
                set(value) {
                    let config = settings.value.proxyConfig || {}
                    config.protocol = value
                    if (value === 'noProxy') {
                        ipcRenderer.send('removeProxy')
                        showToast(t('toast.removeProxy'))
                    }
                    store.commit('settings/updateSettings', {
                        key: 'proxyConfig',
                        value: config,
                    })
                },
            })

            const proxyServer = computed({
                get() {
                    return settings.value.proxyConfig?.server || ''
                },
                set(value) {
                    let config = settings.value.proxyConfig || {}
                    config.server = value
                    store.commit('settings/updateSettings', {
                        key: 'proxyConfig',
                        value: config,
                    })
                },
            })

            const proxyPort = computed({
                get() {
                    return settings.value.proxyConfig?.port || ''
                },
                set(value) {
                    let config = settings.value.proxyConfig || {}
                    config.port = value
                    store.commit('settings/updateSettings', {
                        key: 'proxyConfig',
                        value: config,
                    })
                },
            })

            const getAllOutputDevices = () => {
                navigator.mediaDevices.enumerateDevices().then((devices) => {
                    allOutputDevices.value = devices.filter((device) => {
                        return device.kind == 'audiooutput'
                    })
                    if (allOutputDevices.value.length > 0 && allOutputDevices.value[0].label !== '') {
                        withoutAudioPriviledge.value = false
                    } else {
                        allOutputDevices.value = [
                            {
                                deviceId: 'default',
                                label: 'settings.permissionRequired',
                            },
                        ]
                    }
                })
            }

            const logout = () => {
                doLogout()
                router.push({
                    name: 'home',
                })
            }

            const sendProxyConfig = () => {
                if (proxyProtocol.value === 'noProxy') {
                    return
                }
                const config = settings.value.proxyConfig
                if (config.server === '' || !config.port || config.protocol === 'noProxy') {
                    ipcRenderer.send('removeProxy')
                } else {
                    ipcRenderer.send('setProxy', config)
                }
                showToast(t('toast.updateProxy'))
            }

            const formatShortcut = (shortcut) => {
                shortcut = shortcut
                    .replaceAll('+', ' + ')
                    .replace('Up', '↑')
                    .replace('Down', '↓')
                    .replace('Right', '→')
                    .replace('Left', '←')
                if (settings.value.lang === 'zh-CN') {
                    shortcut = shortcut.replace('Space', '空格')
                } else if (settings.value.lang === 'zh-TW') {
                    shortcut = shortcut.replace('Space', '空白鍵')
                }
                if (process.platform === 'darwin') {
                    return shortcut
                        .replace('CommandOrControl', '⌘')
                        .replace('Command', '⌘')
                        .replace('Alt', '⌥')
                        .replace('Control', '⌃')
                        .replace('Shift', '⇧')
                }
                return shortcut.replace('CommandOrControl', 'Ctrl')
            }

            const readyToRecordShortcut = (id, type) => {
                if (type === 'globalShortcut' && enableGlobalShortcut.value === false) {
                    return
                }
                shortcutInput.value = { id, type, recording: true }
                recordedShortcut.value = []
                ipcRenderer.send('switchGlobalShortcutStatusTemporary', 'disable')
            }

            const saveShortcut = () => {
                const { id, type } = shortcutInput.value
                const payload = {
                    id,
                    type,
                    shortcut: recordedShortcutComputed.value,
                }
                store.commit('settings/updateSettings', payload)
                ipcRenderer.send('updateShortcut', payload)
                showToast(t('toast.savedShortcut'))
                recordedShortcut.value = []
            }

            const handleShortcutKeydown = (e) => {
                if (shortcutInput.value.recording === false) return
                e.preventDefault()
                if (recordedShortcut.value.find((s) => s.keyCode === e.keyCode)) return
                recordedShortcut.value.push(e)
                if (
                    (e.keyCode >= 65 && e.keyCode <= 90) || // A-Z
                    (e.keyCode >= 48 && e.keyCode <= 57) || // 0-9
                    (e.keyCode >= 112 && e.keyCode <= 123) || // F1-F12
                    ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key) || // Arrows
                    validShortcutCodes.includes(e.key)
                ) {
                    saveShortcut()
                }
            }

            const handleShortcutKeyup = (e) => {
                if (recordedShortcut.value.find((s) => s.keyCode === e.keyCode)) {
                    recordedShortcut.value = recordedShortcut.value.filter((s) => s.keyCode !== e.keyCode)
                }
            }

            const exitRecordShortcut = () => {
                shortcutInput.value = { id: '', type: '', recording: false }
                recordedShortcut.value = []
                if (isElectron.value) {
                    ipcRenderer.send('switchGlobalShortcutStatusTemporary', 'enable')
                }
            }

            const restoreDefaultShortcuts = () => {
                store.commit('settings/restoreDefaultShortcuts')
                ipcRenderer.send('restoreDefaultShortcuts')
            }

            onActivated(() => {
                countDBSize('tracks')
                if (isElectron.value) {
                    getAllOutputDevices()
                }
            })

            countDBSize('tracks')
            if (isElectron.value) {
                getAllOutputDevices()
            }

            return {
                store,
                route,
                tracksCache,
                allOutputDevices,
                player,
                settings,
                data,
                isElectron,
                showToast,
                isMac,
                version,
                showUserInfo,
                lang,
                musicLanguage,
                appearance,
                musicQuality,
                lyricFontSize,
                outputDevice,
                enableUnblockNeteaseMusic,
                showPlaylistsByAppleMusic,
                automaticallyCacheSongs,
                showLyricsTranslation,
                minimizeToTray,
                enableGlobalShortcut,
                showLibraryDefault,
                cacheLimit,
                proxyProtocol,
                proxyServer,
                proxyPort,
                countDBSized,
                clearCache,
                getAllOutputDevices,
                logout,
                sendProxyConfig,
                restoreDefaultShortcuts,
                exitRecordShortcut,
                saveShortcut,
                handleShortcutKeyup,
                handleShortcutKeydown,
                readyToRecordShortcut,
                formatShortcut,
                shortcutInput,
                recordedShortcut,
                recordedShortcutComputed,
            }
        },
    }
</script>

<style lang="scss" scoped>
    .settings-page {
        display: flex;
        justify-content: center;
        margin-top: 32px;
    }
    .container {
        margin-top: 24px;
        width: 720px;
    }
    h2 {
        margin-top: 48px;
        font-size: 36px;
        color: var(--color-text);
    }

    h3 {
        margin-top: 48px;
        padding-bottom: 12px;
        font-size: 26px;
        color: var(--color-text);
        border-bottom: 1px solid rgba(128, 128, 128, 0.18);
    }

    .user {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--color-secondary-bg);
        color: var(--color-text);
        padding: 16px 20px;
        border-radius: 16px;
        margin-bottom: 48px;
        img.avatar {
            border-radius: 50%;
            height: 64px;
            width: 64px;
        }
        img.cvip {
            height: 13px;
            margin-right: 4px;
        }
        .left {
            display: flex;
            align-items: center;
            .info {
                margin-left: 24px;
            }
            .nickname {
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 2px;
            }
            .extra-info {
                font-size: 13px;
                .text {
                    opacity: 0.68;
                }
                .vip {
                    display: flex;
                    align-items: center;
                }
            }
        }
        .right {
            .svg-icon {
                height: 18px;
                width: 18px;
                margin-right: 4px;
            }
            button {
                display: flex;
                align-items: center;
                font-size: 18px;
                font-weight: 600;
                text-decoration: none;
                border-radius: 10px;
                padding: 8px 12px;
                opacity: 0.68;
                color: var(--color-text);
                transition: 0.2s;
                margin: {
                    right: 12px;
                    left: 12px;
                }
                &:hover {
                    opacity: 1;
                    background: #eaeffd;
                    color: #335eea;
                }
                &:active {
                    opacity: 1;
                    transform: scale(0.92);
                    transition: 0.2s;
                }
            }
        }
    }

    .item {
        margin: 24px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--color-text);

        .title {
            font-size: 16px;
            font-weight: 500;
            opacity: 0.78;
        }
    }

    select {
        min-width: 192px;
        font-weight: 600;
        border: none;
        padding: 8px 12px 8px 12px;
        border-radius: 8px;
        color: var(--color-text);
        background: var(--color-secondary-bg);
        appearance: none;
        &:focus {
            outline: none;
            color: var(--color-primary);
            background: var(--color-primary-bg);
        }
    }

    button {
        color: var(--color-text);
        background: var(--color-secondary-bg);
        padding: 8px 12px 8px 12px;
        font-weight: 600;
        border-radius: 8px;
        transition: 0.2s;
        &:hover {
            transform: scale(1.06);
        }
        &:active {
            transform: scale(0.94);
        }
    }

    input.text-input {
        background: var(--color-secondary-bg);
        border: none;
        margin-right: 22px;
        padding: 8px 12px 8px 12px;
        border-radius: 8px;
        color: var(--color-text);
        font-weight: 600;
        font-size: 16px;
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }
    input[type='number'] {
        -moz-appearance: textfield;
    }

    #proxy-form {
        display: flex;
        align-items: center;
    }
    #proxy-form.disabled {
        opacity: 0.47;
        button:hover {
            transform: unset;
        }
    }

    #shortcut-table {
        font-size: 14px;
        /* border: 1px solid black; */
        user-select: none;
        color: var(--color-text);
        .row {
            display: flex;
        }
        .row.row-head {
            opacity: 0.58;
            font-size: 13px;
            font-weight: 500;
        }
        .col {
            min-width: 192px;
            padding: 8px;
            display: flex;
            align-items: center;
            /* border: 1px solid red; */
            &:first-of-type {
                padding-left: 0;
                min-width: 128px;
            }
        }
        .keyboard-input {
            font-weight: 600;
            background-color: var(--color-secondary-bg);
            padding: 8px 12px 8px 12px;
            border-radius: 0.5rem;
            min-width: 146px;
            min-height: 34px;
            box-sizing: border-box;
            &.active {
                color: var(--color-primary);
                background-color: var(--color-primary-bg);
            }
        }
        .restore-default-shortcut {
            margin-top: 12px;
        }
        &.global-disabled {
            .row .col:last-child {
                opacity: 0.48;
            }
            .row.row-head .col:last-child {
                opacity: 1;
            }
        }
        &:focus {
            outline: none;
        }
    }

    .footer {
        text-align: center;
        margin-top: 6rem;
        color: var(--color-text);
        font-weight: 600;
        .author {
            font-size: 0.9rem;
        }
        .version {
            font-size: 0.88rem;
            opacity: 0.58;
            margin-top: -10px;
        }
    }

    .beforeAnimation {
        -webkit-transition: 0.2s cubic-bezier(0.24, 0, 0.5, 1);
        transition: 0.2s cubic-bezier(0.24, 0, 0.5, 1);
    }
    .afterAnimation {
        box-shadow: 0 0 0 1px hsla(0, 0%, 0%, 0.1), 0 4px 0px 0 hsla(0, 0%, 0%, 0.04), 0 4px 9px hsla(0, 0%, 0%, 0.13),
            0 3px 3px hsla(0, 0%, 0%, 0.05);
        -webkit-transition: 0.35s cubic-bezier(0.54, 1.6, 0.5, 1);
        transition: 0.35s cubic-bezier(0.54, 1.6, 0.5, 1);
    }
    .toggle {
        margin: auto;
    }
    .toggle input {
        opacity: 0;
        position: absolute;
    }
    .toggle input + label {
        position: relative;
        display: inline-block;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-transition: 0.4s ease;
        transition: 0.4s ease;
        height: 32px;
        width: 52px;
        background: var(--color-secondary-bg);
        border-radius: 8px;
    }
    .toggle input + label:before {
        content: '';
        position: absolute;
        display: block;
        -webkit-transition: 0.2s cubic-bezier(0.24, 0, 0.5, 1);
        transition: 0.2s cubic-bezier(0.24, 0, 0.5, 1);
        height: 32px;
        width: 52px;
        top: 0;
        left: 0;
        border-radius: 8px;
    }
    .toggle input + label:after {
        content: '';
        position: absolute;
        display: block;
        box-shadow: 0 0 0 1px hsla(0, 0%, 0%, 0.02), 0 4px 0px 0 hsla(0, 0%, 0%, 0.01), 0 4px 9px hsla(0, 0%, 0%, 0.08),
            0 3px 3px hsla(0, 0%, 0%, 0.03);
        -webkit-transition: 0.35s cubic-bezier(0.54, 1.6, 0.5, 1);
        transition: 0.35s cubic-bezier(0.54, 1.6, 0.5, 1);
        background: #fff;
        height: 20px;
        width: 20px;
        top: 6px;
        left: 6px;
        border-radius: 6px;
    }
    .toggle input:checked + label:before {
        background: var(--color-primary);
        -webkit-transition: width 0.2s cubic-bezier(0, 0, 0, 0.1);
        transition: width 0.2s cubic-bezier(0, 0, 0, 0.1);
    }
    .toggle input:checked + label:after {
        left: 26px;
    }
</style>
