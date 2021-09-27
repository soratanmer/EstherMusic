<template>
    <div class="login">
        <div class="login-container">
            <div class="section-1">
                <img src="/logos/netease-music.png" />
            </div>
            <div class="title">{{ $t('login.loginText') }}</div>
            <div class="section-2">
                <div v-show="mode === 'phone'" class="input-box">
                    <div class="container" :class="{ active: inputFocus === 'phone' }">
                        <svg-icon icon-name="mobile" />
                        <div class="inputs">
                            <input
                                id="countryCode"
                                v-model="countryCode"
                                :placeholder="inputFocus === 'phone' ? '' : $t('login.countryCode')"
                                @focus="inputFocus = 'phone'"
                                @blur="inputFocus = ''"
                                @keyup.enter="login"
                            />
                            <input
                                id="phoneNumber"
                                v-model="phoneNumber"
                                :placeholder="inputFocus === 'phone' ? '' : $t('login.phone')"
                                @focus="inputFocus = 'phone'"
                                @blur="inputFocus = ''"
                                @keyup.enter="login"
                            />
                        </div>
                    </div>
                </div>
                <div v-show="mode === 'email'" class="input-box">
                    <div class="container" :class="{ active: inputFocus === 'email' }">
                        <svg-icon icon-name="mail" />
                        <div class="inputs">
                            <input
                                id="email"
                                v-model="email"
                                type="email"
                                :placeholder="inputFocus === 'email' ? '' : $t('login.email')"
                                @focus="inputFocus = 'email'"
                                @blur="inputFocus = ''"
                                @keyup.enter="login"
                            />
                        </div>
                    </div>
                </div>
                <div class="input-box">
                    <div class="container" :class="{ active: inputFocus === 'password' }">
                        <svg-icon icon-name="lock" />
                        <div class="inputs">
                            <input
                                id="password"
                                v-model="password"
                                type="password"
                                :placeholder="inputFocus === 'password' ? '' : $t('login.password')"
                                @focus="inputFocus = 'password'"
                                @blur="inputFocus = ''"
                                @keyup.enter="login"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div class="confirm">
                <button v-show="!processing" @click="login">
                    {{ $t('login.login') }}
                </button>
                <button v-show="processing" class="loading" disabled>
                    <span />
                    <span />
                    <span />
                </button>
            </div>
            <div class="other-login">
                <a v-show="mode !== 'email'" @click="mode = 'email'">{{ $t('login.loginWithEmail') }}</a>
                <a v-show="mode !== 'phone'" @click="mode = 'phone'">{{ $t('login.loginWithPhone') }}</a>
            </div>
            <div class="notice" v-html="isElectron ? $t('login.noticeElectron') : $t('login.notice')" />
        </div>
    </div>
</template>

<script>
    import { ref, computed } from 'vue'
    import { useStore } from 'vuex'
    import { useRoute, useRouter } from 'vue-router'
    import NProgress from 'nprogress'
    import md5 from 'md5'
    import is_electron from 'is-electron'
    import { useI18n } from 'vue-i18n'

    import { loginWithPhone, loginWithEmail } from '@render/NeteastApi/auth'

    import { setCookies } from '@render/utils/auth'

    import SvgIcon from '@render/components/SvgIcon.vue'

    export default {
        name: 'Login',
        components: {
            SvgIcon,
        },
        setup() {
            const store = useStore()
            const router = useRouter()
            const route = useRoute()
            const { t } = useI18n()

            const processing = ref(false)
            const mode = ref('email')
            const countryCode = ref('+86')
            const phoneNumber = ref('')
            const email = ref('')
            const password = ref('')
            const smsCode = ref('')
            const inputFocus = ref('')

            const updateData = (data) => {
                store.commit('data/updateData', data)
            }

            const showToast = (toast) => {
                store.dispatch('toast/showToast', toast)
            }

            const isElectron = computed(() => {
                return is_electron()
            })

            const validatePhone = () => {
                if (countryCode.value === '' || phone.value === '' || password.value === '') {
                    showToast(t('login.incorrectPhone'))
                    processing.value = false
                    return false
                }
                return true
            }

            const validateEmail = () => {
                const emailReg =
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                if (email.value === '' || password.value === '' || !emailReg.test(email.value)) {
                    showToast(t('login.incorrectEmail'))
                    return false
                }
                return true
            }

            const handleLoginResponse = (res) => {
                if (!res) {
                    processing.value = false
                    return
                }
                if (res.code === 200) {
                    setCookies(res.cookie)
                    updateData({ key: 'user', value: res.profile })
                    updateData({ key: 'loginMode', value: 'account' })
                    store.dispatch('liked/fetchLikedPlaylist').then(() => {
                        router.push({
                            path: '/library',
                        })
                    })
                } else {
                    processing.value = false
                    showToast(res.msg ?? res.message ?? t('login.checkAccountOrPassword'))
                }
            }

            const login = () => {
                if (mode.value === 'phone') {
                    processing.value = validatePhone()
                    if (!processing.value) {
                        return
                    }
                    loginWithPhone({
                        countrycode: countryCode.value.replace('+', '').replace(/\s/g, ''),
                        phone: phoneNumber.value.replace(/\s/g, ''),
                        password: 'fakePassword',
                        md5_password: md5(password.value).toString(),
                    })
                        .then(handleLoginResponse)
                        .catch((error) => {
                            processing.value = false
                            showToast(`${t('login.loginError')}\n${error}`)
                        })
                } else {
                    processing.value = validateEmail()
                    if (!processing.value) {
                        return
                    }
                    loginWithEmail({
                        email: email.value.replace(/\s/g, ''),
                        password: 'fakePassword',
                        md5_password: md5(password.value).toString(),
                    })
                        .then(handleLoginResponse)
                        .catch((error) => {
                            processing.value = false
                            showToast(`${t('login.loginError')}\n${error}`)
                        })
                }
            }

            if (route.query.mode === 'phone') {
                mode.value = 'phone'
            }

            NProgress.done()

            return {
                store,
                router,
                route,
                processing,
                mode,
                countryCode,
                phoneNumber,
                email,
                password,
                smsCode,
                inputFocus,
                updateData,
                isElectron,
                validatePhone,
                validateEmail,
                handleLoginResponse,
                login,
            }
        },
    }
</script>

<style lang="scss" scoped>
    .login {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-top: 32px;
    }

    .login-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .title {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 48px;
        color: var(--color-text);
    }

    .section-1 {
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        img {
            height: 64px;
            margin: 20px;
            user-select: none;
        }
    }

    .section-2 {
        display: flex;
        align-items: center;
        flex-direction: column;
    }

    .input-box {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 16px;
        color: var(--color-text);

        .container {
            display: flex;
            align-items: center;
            height: 46px;
            background: var(--color-secondary-bg);
            border-radius: 8px;
            width: 300px;
        }

        .svg-icon {
            height: 18px;
            width: 18px;
            color: #aaaaaa;
            margin: {
                left: 12px;
                right: 6px;
            }
        }

        .inputs {
            display: flex;
            width: 85%;
        }

        input {
            font-size: 20px;
            border: none;
            background: transparent;
            width: 100%;
            font-weight: 600;
            margin-top: -1px;
            color: var(--color-text);
        }

        input::placeholder {
            color: var(--color-text);
            opacity: 0.38;
        }

        input#countryCode {
            flex: 3;
        }
        input#phoneNumber {
            flex: 12;
        }

        .active {
            background: var(--color-primary-bg);
            input,
            .svg-icon {
                color: var(--color-primary);
            }
        }
    }

    .confirm button {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: 600;
        background-color: var(--color-primary-bg);
        color: var(--color-primary);
        border-radius: 8px;
        margin-top: 24px;
        transition: 0.2s;
        padding: 8px;
        width: 100%;
        width: 300px;
        &:hover {
            transform: scale(1.06);
        }
        &:active {
            transform: scale(0.94);
        }
    }

    .other-login {
        margin-top: 24px;
        a {
            cursor: pointer;
            font-size: 13px;
            color: var(--color-text);
            opacity: 0.68;
        }
    }

    .notice {
        width: 300px;
        border-top: 1px solid rgba(128, 128, 128);
        margin-top: 48px;
        padding-top: 12px;
        font-size: 12px;
        color: var(--color-text);
        opacity: 0.48;
    }

    @keyframes loading {
        0% {
            opacity: 0.2;
        }
        20% {
            opacity: 1;
        }
        100% {
            opacity: 0.2;
        }
    }

    button.loading {
        height: 44px;
        cursor: unset;
        &:hover {
            transform: none;
        }
    }
    .loading span {
        width: 6px;
        height: 6px;
        background-color: var(--color-primary);
        border-radius: 50%;
        margin: 0 2px;
        animation: loading 1.4s infinite both;
    }

    .loading span:nth-child(2) {
        animation-delay: 0.2s;
    }

    .loading span:nth-child(3) {
        animation-delay: 0.4s;
    }
</style>
