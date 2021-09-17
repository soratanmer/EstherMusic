<template>
    <div>
        <transition name="fade">
            <div v-show="show" id="scrollbar" :class="{ 'on-drag': isOnDrag }" @click="handleClick">
                <div
                    id="thumbContainer"
                    :class="{ active }"
                    :style="thumbStyle"
                    @mouseenter="handleMouseenter"
                    @mouseleave="handleMouseleave"
                    @mousedown="handleDragStart"
                    @click.stop
                >
                    <div></div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    import { ref, computed, getCurrentInstance } from 'vue'
    import { useRoute, useRouter } from 'vue-router'

    export default {
        name: 'Scrollbar',
        setup() {
            const { proxy } = getCurrentInstance()
            const route = useRoute()
            const router = useRouter()

            const top = ref(0)
            const thumbHeight = ref(0)
            const active = ref(false)
            const show = ref(false)
            const hideTimer = ref()
            const isOnDrag = ref(false)
            const onDragClientY = ref(0)
            const positions = ref({
                home: {
                    scrollTop: 0,
                    params: {},
                },
            })

            const thumbStyle = computed(() => {
                return {
                    transform: `translateY(${top.value}px)`,
                    height: `${thumbHeight.value}px`,
                }
            })

            const main = computed(() => {
                return proxy.$parent.$refs.main
            })

            const setScrollbarHideTimeout = () => {
                if (hideTimer.value !== null) clearTimeout(hideTimer.value)
                hideTimer.value = setTimeout(() => {
                    if (!active.value) {
                        show.value = false
                    }
                    hideTimer.value = null
                }, 4000)
            }

            const restorePosition = () => {
                if (!route.meta.savePosition || positions.value[route.name] === undefined || main.value === undefined) {
                    return
                }
                main.value.scrollTo({ top: positions.value[route.name].scrollTop })
            }

            const handleMouseenter = () => {
                active.value = true
            }

            const handleMouseleave = () => {
                active.value = false
                setScrollbarHideTimeout()
            }

            const handleClick = (e) => {
                let scrollTop
                if (e.clientY < top.value + 84) {
                    scrollTop = -256
                } else {
                    scrollTop = 256
                }
                main.value.scrollBy({
                    top: scrollTop,
                    behavior: 'smooth',
                })
            }

            const handleDragMove = (e) => {
                if (!isOnDrag.value) {
                    return
                }
                const clintHeight = main.value.clientHeight - 128
                const scrollHeight = main.value.scrollHeight - 128
                const clientY = e.clientY
                const scrollTop = main.value.scrollTop
                const offset = ~~(((clientY - onDragClientY.value) / clintHeight) * scrollHeight)
                top.value = ~~((scrollTop / scrollHeight) * clintHeight)
                main.value.scrollBy(0, offset)
                onDragClientY.value = clientY
            }

            const handleDragEnd = () => {
                isOnDrag.value = false
                proxy.$parent.userSelectNone = false
                document.removeEventListener('mousemove', handleDragMove)
                document.removeEventListener('mouseup', handleDragEnd)
            }

            const handleDragStart = (e) => {
                onDragClientY.value = e.clientY
                isOnDrag.value = true
                proxy.$parent.userSelectNone = true
                document.addEventListener('mousemove', handleDragMove)
                document.addEventListener('mouseup', handleDragEnd)
            }

            const handleScroll = () => {
                const clintHeight = main.value.clientHeight - 128
                const scrollHeight = main.value.scrollHeight - 128
                const scrollTop = main.value.scrollTop
                let tops = ~~((scrollTop / scrollHeight) * clintHeight)
                let thumbHeights = ~~((clintHeight / scrollHeight) * clintHeight)

                if (thumbHeights < 24) thumbHeights = 24
                if (tops > clintHeight - thumbHeights) {
                    tops = clintHeight - thumbHeights
                }
                top.value = tops
                thumbHeight.value = thumbHeights

                if (!show.value && clintHeight !== thumbHeights) show.value = true
                setScrollbarHideTimeout()

                if (route.meta.savePosition) {
                    positions.value[route.name] = { scrollTop, params: route.params }
                }
            }

            router.beforeEach((to, from, next) => {
                show.value = false
                next()
            })

            return {
                proxy,
                route,
                router,
                top,
                thumbHeight,
                active,
                show,
                hideTimer,
                isOnDrag,
                onDragClientY,
                positions,
                thumbStyle,
                main,
                setScrollbarHideTimeout,
                restorePosition,
                handleMouseenter,
                handleMouseleave,
                handleClick,
                handleDragMove,
                handleDragEnd,
                handleDragStart,
                handleScroll,
            }
        },
    }
</script>

<style lang="scss" scoped>
    #scrollbar {
        position: fixed;
        right: 0;
        top: 0;
        bottom: 0;
        width: 16px;
        z-index: 1000;

        #thumbContainer {
            margin-top: 64px;
            div {
                transition: background 0.4s;
                position: absolute;
                right: 2px;
                width: 8px;
                height: 100%;
                border-radius: 4px;
                background: rgba(128, 128, 128, 0.38);
            }
        }
        #thumbContainer.active div {
            background: rgba(128, 128, 128, 0.58);
        }
    }

    [data-theme='dark'] {
        #thumbContainer div {
            background: var(--color-secondary-bg);
        }
    }

    #scrollbar.on-drag {
        left: 0;
        width: auto;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.2s;
    }
    .fade-enter,
    .fade-leave-to {
        opacity: 0;
    }
</style>
