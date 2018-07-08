<template>
    <div>
        <imageGrid
            :hideDropper="hideDropper"
            ref="grid"
            :collection="collection"
            :addFn="addFn"
            :removeFn="removeFn"
            @collection="log"
        >
            <template slot-scope="cell">
                <slot :url="cell.url" :removeFn="cell.removeFn">
                    <div style="display:inline-block; position:relative;">
                        <img :src="cell.url" class="cell">
                        <div v-if="typeof cell.removeFn === 'function'" class="cell__remove" @click.stop.prevent="cell.removeFn">
                            <i class="fa fa-trash cell__removeIcon"></i>
                        </div>
                    </div>
                </slot>
            </template>
        </imageGrid>
        <button @click.stop="$refs.grid.openPicker">Add Click</button>
    </div>
</template>

<script>
import lodash from "lodash"
import imageGrid from '@/image/imageGrid'

export default {
    components: { imageGrid },
    props: {
        hideDropper: {
            type: Boolean,
            default: true
        },
    },
    methods: {
        addFn(i) {
            const arr = lodash.isArray(i) ? i : [i]
            arr.forEach(item => this.collection.push(item))
        },
        removeFn(i) {
            console.log(i)
        },
        openPicker() {
            if(this.$refs.grid)
                this.$refs.grid.openPicker()
        },
        log(c) {
            console.log(c)
        }
    },
    data() {
        return {
            collection: [],
        }
    },
}
</script>

<style scoped>
.cell {
    width: 128px;
    height: 128px;
}
</style>
