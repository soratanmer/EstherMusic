<template>
    <div class="login">
        <div class="section-1">
            <img src="/logos/EstherMusic.png" >
            <svg-icon icon-name="x" />
            <img src="/logos/netease-music.png" >
        </div>
        <div class="section-2">
            <div class="card" @mouseover="activeCard = 1" @mouseleave="activeCard = 0" @click="goTo('account')">
                <div class="container" :class="{ active: activeCard === 1 }">
                    <div class="title-info">
                        <div class="title">{{ $t('login.loginText') }}</div>
                        <div class="info">{{ $t('login.accessToAll') }}</div>
                    </div>
                    <svg-icon icon-name="arrow-right" />
                </div>
            </div>
            <div class="card" @mouseover="activeCard = 2" @mouseleave="activeCard = 0" @click="goTo('username')"/>
                <div class="container" :class="{ active: activeCard === 2 }">
                    <div class="title-info">
                        <div class="title">{{ $t('login.search') }}</div>
                        <div class="info">{{ $t('login.readonly') }}</div>
                    </div>
                    <svg-icon icon-name="arrow-right" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    import NProgress from 'nprogress'

    import SvgIcon from '@render/components/SvgIcon.vue'

    export default {
        name: 'Login',
        components: {
            SvgIcon,
        },
        setup() {
            const router = useRouter()

            const activeCard = ref(0)

            const goTo = (path) => {
                router.push({
                    path: `/login/${path}`,
                })
            }

            NProgress.done()

            return {
                activeCard,
                goTo,
            }
        },
    }
</script>

<style lang="scss" scoped>
    .login {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: calc(100vh - 192px);
    }

    .section-1 {
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        img {
            height: 64px;
            margin: 20px;
        }
        .svg-icon {
            height: 24px;
            width: 24px;
            color: rgba(82, 82, 82, 0.28);
        }
    }

    .section-2 {
        display: flex;
        align-items: center;
        flex-direction: column;
    }
    .card {
        cursor: pointer;
        margin-top: 14px;
        margin-bottom: 14px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #eaeffd;
        border-radius: 8px;
        height: 128px;
        width: 300px;
        transition: all 0.3s;
        padding-left: 22px;
        box-sizing: border-box;

        .active {
            .title-info {
                transform: translateX(-8px);
            }
            .svg-icon {
                opacity: 1;
                visibility: visible;
                transform: translateX(8px);
            }
        }

        .container {
            display: flex;
            // justify-content: space-around;
            align-items: center;

            color: #335eea;
        }

        .title-info {
            transition: all 0.3s;
        }

        .title {
            font-size: 24px;
            font-weight: 600;
        }
        .info {
            margin-top: 2px;
            font-size: 14px;
            color: rgba(51, 94, 234, 0.78);
        }
        .svg-icon {
            opacity: 0;
            height: 24px;
            width: 24px;
            margin-left: 16px;
            transition: all 0.3s;
        }
    }
</style>
