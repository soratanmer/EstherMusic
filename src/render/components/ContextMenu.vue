<template>
    <div ref="contextMenu" class="context-menu">
        <div
            v-if="showMenu"
            ref="menu"
            class="menu"
            tabindex="-1"
            :style="{ top: top, left: left }"
            @blur="closeMenu()"
            @click="closeMenu()"
        >
            <slot></slot>
        </div>
    </div>
</template>

<script>
    import { ref, getCurrentInstance, nextTick } from 'vue'
    import { useStore } from 'vuex'

    export default {
        name: 'ContextMenu',
        setup() {
            const { proxy } = getCurrentInstance()
            const store = useStore()

            const showMenu = ref(false)
            const top = ref('0px')
            const left = ref('0px')

            const setMenu = (t, l) => {
                let largestHeight = window.innerHeight - proxy.$refs.menu.offsetHeight - 25
                let largestWidth = window.innerWidth - proxy.$refs.menu.offsetWidth - 25
                if (t > largestHeight) {
                    t = largestHeight
                }
                if (l > largestWidth) {
                    l = largestWidth
                }
                top.value = t + 'px'
                left.value = l + 'px'
            }

            const closeMenu = () => {
                showMenu.value = false
                if (proxy.$parent.closeMenu !== undefined) {
                    proxy.$parent.closeMenu()
                }
                store.commit('enableScrolling', true)
            }

            const openMenu = (e) => {
                showMenu.value = true
                nextTick(() => {
                    proxy.$refs.menu.focus()
                    setMenu(e.y, e.x)
                })
                e.preventDefault()
                store.commit('enableScrolling', false)
            }

            return {
                proxy,
                store,
                showMenu,
                top,
                left,
                setMenu,
                closeMenu,
                openMenu,
            }
        },
    }
</script>

<style lang="scss">
    .context-menu {
        width: 100%;
        height: 100%;
        user-select: none;
    }

    .menu {
        position: fixed;
        min-width: 136px;
        max-width: 240px;
        list-style: none;
        background: rgba(255, 255, 255, 0.88);
        box-shadow: 0 6px 12px -4px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(0, 0, 0, 0.06);
        backdrop-filter: blur(12px);
        border-radius: 8px;
        box-sizing: border-box;
        padding: 6px;
        z-index: 1000;
        -webkit-app-region: no-drag;

        &:focus {
            outline: none;
        }
    }

    [data-theme='dark'] {
        .menu {
            background: rgba(36, 36, 36, 0.78);
            backdrop-filter: blur(16px) contrast(120%);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .menu .item:hover {
            color: var(--color-text);
        }
    }

    @supports (-moz-appearance: none) {
        .menu {
            background-color: var(--color-body-bg) !important;
        }
    }

    .menu .item {
        font-weight: 600;
        font-size: 14px;
        padding: 10px 14px;
        border-radius: 7px;
        cursor: default;
        color: var(--color-text);
        display: flex;
        align-items: center;
        &:hover {
            color: var(--color-primary);
            background: var(--color-primary-bg-for-transparent);
        }

        .svg-icon {
            height: 16px;
            width: 16px;
            margin-right: 5px;
        }
    }

    hr {
        margin: 4px 10px;
        background: rgba(128, 128, 128, 0.18);
        height: 1px;
        box-shadow: none;
        border: none;
    }

    .item-info {
        padding: 10px 10px;
        display: flex;
        align-items: center;
        color: var(--color-text);
        cursor: default;
        img {
            height: 38px;
            width: 38px;
            border-radius: 4px;
        }
        .info {
            margin-left: 8px;
        }
        .title {
            font-size: 16px;
            font-weight: 600;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            overflow: hidden;
            word-break: break-all;
        }
        .subtitle {
            font-size: 12px;
            opacity: 0.68;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            overflow: hidden;
            word-break: break-all;
        }
    }
</style>
