<template>
    <svg-icon icon-name="explicit" :style="svgStyle" />
</template>

<script>
    import { ref } from 'vue'

    import SvgIcon from '@render/components/SvgIcon.vue'

    export default {
        name: 'ExplicitSymbol',
        components: {
            SvgIcon,
        },
        props: {
            size: {
                type: Number,
                default: 16,
            },
        },
        setup(props) {
            const svgStyle = ref({})

            svgStyle.value = {
                width: `${props.size}px`,
                height: `${props.size}px`,
            }

            return {
                svgStyle,
            }
        },
    }
</script>

<style lang="scss" scoped></style>
