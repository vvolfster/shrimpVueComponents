<template>
    <div ref="root" class="imageGridRoot">
        <fileDropper
            ref="fileDropper"
            v-if="typeof addFn === 'function'" 
            :fn="addFn"
            class="cell cell--add" 
            :style="ui.cellStyle"
            v-show="!hideDropper"
        />
        <div v-for="(entry, key) in uiCollection" :key="key">
            <slot :url="entry.url" :removeFn="entry.removeFn">
                <div style="display:inline-block; position:relative;">
                    <img :src="entry.url" class="cell" :style="ui.cellStyle">
                    <div v-if="typeof removeFn === 'function'" class="cell__remove" :style="ui.removeStyle" @click.stop.prevent="entry.removeFn">
                        <i class="fa fa-trash cell__removeIcon"></i>
                    </div>
                </div>
            </slot>
        </div>
    </div>
</template>

<script>
    import fileDropper from '../../misc/fileDropper'

    function getCellStyle(sz) {
        const size = isNaN(sz) ? sz : `${sz}px`
        return { width: size, height: size }
    }

    function getRemoveStyle(sz) {
        const size = isNaN(sz) ? sz : `${sz}px`
        return {
            width: `calc(${size} / 5)`,
            height: `calc(${size} / 5)`
        }
    }

    export default {
        components: { fileDropper },
        props: {
            collection: {
                type: [Object, Array],
                default() {
                    return {}
                }
            },
            cellSize: {
                type: [Number, String],
                default: '5vh'
            },
            addFn: {
                type: [Function, null],
                default: null
            },
            removeFn: {
                type: [Function, null],
                default: null
            },
            hideDropper: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            uiCollection() {
                const { collection } = this
                if(!collection)
                    return []

                const blankFn = ({ url, key, index }) => console.error(`Does not have a removeFn: ${url} ${key} ${index}`)
                const removeFn = this.removeFn ? this.removeFn : blankFn
                return Object.keys(collection).map((k, i) => {
                    const val = collection[k]
                    const isBlob = val instanceof Blob
                    const isFile = val instanceof File
                    const url = (isBlob || isFile) ? URL.createObjectURL(val) : val
                    return {
                        url,
                        removeFn: () => removeFn({ url, key: k, index: i })
                    }
                })
            },
            ui() {
                const cellStyle = getCellStyle(this.cellSize);
                const removeStyle = getRemoveStyle(this.cellSize);
                return { cellStyle, removeStyle }
            }
        },
        watch: {
            uiCollection(v) {
                this.$emit('collection', v)
            }
        },
        methods: {
            openPicker() {
                if(this.addFn && this.$refs.fileDropper)
                    this.$refs.fileDropper.openPicker()
            }
        }
    }
</script>

<style scoped>
.cell {
    margin: 5px;
    border: solid 1px gray;
    border-radius: 5%;
    object-fit: contain;
    background-color: lightgray;
}

.cell--add {
    background-color: lightyellow;
    display:inline-block;
}

.cell__remove {
    background: rgba(225, 50, 0, 0.8);
    position: absolute;
    right: 8px;
    bottom: 12px;
    color: white;
    font-size: 12pt;
    border-radius: 50%;
    padding: 1pt;
    margin: 0;
    text-align: center;
    display: table;
}

.cell__removeIcon {
    display: table-cell;
    vertical-align: middle;
    cursor: pointer;
}

.imageGridRoot {
    display: flex;
    flex-wrap: wrap;
}

</style>
