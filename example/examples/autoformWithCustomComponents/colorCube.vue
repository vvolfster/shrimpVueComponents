<template>
    <div class="row justify-between items-center">
        <div>{{ placeholder }}</div>
        <div class="cube" :style="`background:${d_color};`" @click="randomize"/>
    </div>
</template>

<script>

export default {
    props: {
        placeholder: {
            type: String,
            default: ""
        },
        value: {
            type: String,
            default: "red"
        }
    },
    data() {
        return {
            d_color: this.color
        }
    },
    mounted() {
        this.d_color = this.value;
    },
    methods: {
        randomize() {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            this.updateValue(`rgba(${r},${g},${b},1)`);
        },
        updateValue(v){
            if(this.d_color !== v){
                this.d_color = v;
                this.$emit('value', v);
                this.$emit('input', v);
            }
        },
        getValue() {
            return this.d_color;
        }
    },
    watch: {
        value(v) {
            this.d_color = v;
        }
    }
}
</script>

<style scoped>
.cube {
    width: 48px;
    height: 48px;
    cursor: pointer;
}

</style>
