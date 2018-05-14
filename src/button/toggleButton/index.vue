// EMITS on,off or stateChange
<template>
    <button class="svtbtn" :class="pushed ? 'bg-purple text-white' : ''" @click="pushed = !pushed">
        <slot></slot>
    </button>
</template>

<script>
import '../../css'

export default {
    props: {
        isPushed: {
            type: Boolean,
            default: false,
        }
    },
    data() {
        return {
            pushed: false
        }
    },
    mounted() {
        this.pushed = this.isPushed;
    },
    watch: {
        pushed(v) {
            if(v){
                this.$emit(`on`)
            }
            else {
                this.$emit(`off`)
            }
        },
        isPushed(v) {
            this.pushed = v;
        }
    }
}
</script>

<style scoped>
.tbtn {
    min-width: 24px;
    min-height: 24px;
}



</style>

