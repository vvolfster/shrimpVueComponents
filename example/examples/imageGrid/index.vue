<template>
    <div>
        <imageGrid
            :hideDropper="hideDropper"
            ref="grid"
            :collection="collection"
            :addFn="addFn"
        >
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
        uploadFn: {
            type: Function,
            default() {
                return () => {
                    return new Promise((resolve) => {
                        setTimeout(resolve, 3000)
                    })
                }
            }
        }
    },
    methods: {
        addFn(i) {
            const arr = lodash.isArray(i) ? i : [i]
            arr.forEach(item => this.collection.push(item))
        },
        openPicker() {
            if(this.$refs.grid)
                this.$refs.grid.openPicker()
        }
    },
    data() {
        return {
            collection: [],
            uploadProgress: []
        }
    },
    computed: {
        uploading() {
            const { uploadProgress } = this
            uploadProgress.filter(u => u.working).length
        }
    }
}
</script>

<style scoped>

</style>
