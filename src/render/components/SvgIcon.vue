<template>
    <svg :class="svgClass" aria-hidden="true">
        <use :xlink:href="symbolId" />
    </svg>
</template>

<script>
    import { computed } from 'vue'
    export default {
        name: 'SvgIcon',
        props: {
            prefix: {
                type: String,
                default: 'icon',
            },
            iconName: {
                type: String,
                required: true,
            },
            className: {
                type: String,
                default: '',
            },
        },
        setup(props) {
            const symbolId = computed(() => {
                return `#${props.prefix}-${props.iconName}`
            })

            const svgClass = computed(() => {
                if (props.className) {
                    return `svg-icon ${props.className}`
                } else {
                    return 'svg-icon'
                }
            })

            return {
                symbolId,
                svgClass,
            }
        },
    }
</script>

<style lang="scss" scoped>
    .svg-icon {
        fill: currentColor;
        width: 16px;
        height: 16px;
    }
</style>
