<template>
    <div class='line' :style="ui.style">
        sdklfjs;dlfkjsa
    </div>
</template>

<script>
export default {
    props: {
        validateFn: {
            type: [Function, null],
            default: null
        },
        options: {
            type: [Object, null, undefined],
            default: null
        }
    },
    computed: {
        ui() {
            const options = this.options;
            const style = options && options.style ? options.style : null;
            const defStyleObj = { width: "inherit", height: "inherit" }
            if(typeof style === 'string')
                return { style }
            if(typeof style === 'object')
                return { style: Object.assign(defStyleObj, style) }

            return { style: defStyleObj };
        }
    }
}
</script>

<style scoped>
.line {
    border: solid 1px;
}
</style>