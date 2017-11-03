<template>
    <div class="combobox">
        <div class="select" ref="select" @click="$refs.popover.toggle()" :style="ui.style">
            <div class="row items-center justify-between">
                <div :style="!d_value ? 'color:gray;display:inline-block;' : 'display:inline-block;'">
                    {{ d_value ? d_value : placeholder }}
                </div>
                <i class="margin-left fa fa-caret-down" v-if="ui.icon"></i>
            </div>
        </div>
        <div v-if="error !== null" class="error">
            {{ error }}
        </div>
        <popover ref="popover" :position="position" :noStyle="false">
            <div class="popoverz shadow-4" :style="ui.styleList">
                <div v-for="option in cOptions"
                    :key="option"
                    :value="option"
                    class="option" :class="d_value === option ? 'option--selected' : ''"
                    
                    :style="ui.styleListItem"
                    @click="updateValue(option)"
                >
                    {{ option }}
                </div>
            </div>
        </popover>
    </div>
</template>

<script>
import animator from '../../misc/animator'
import popover from '../../layout/popover'
import '../../../cssImporter'

export default {
    components: {
        popover
    },
    props: {
        options: {
            type: [Array, Object, null, undefined],
            default: null
        },
        placeholder: {
            type: String,
            default: "Select..."
        },
        validateFn: {
            type: [Function, null],
            default: null
        },
        value: String,
    },
    data() {
        return {
            d_value: '',
            error: null
        }
    },
    mounted() {
        this.d_value = this.value;
        this.$refs.select.value = this.value;
    },
    computed: {
        cOptions() {
            if(toString.call(this.options) === '[object Array]')
                return this.options;
            if(toString.call(this.options) === '[object Object]') {
                const opts = this.options.choices || this.options.list || this.options.options;
                return opts || [];
            }
            return [];
        },
        position() {
            const options = this.options;
            return !options || typeof options.position !== 'string' ? 'bottom' : (options.position || 'bottom')
        },
        ui() {
            const options = this.options;
            const style = options && options.style ? options.style : null;
            const icon = options && options.icon ? options.icon : true;
            let styleObj = { width: "inherit", height: "inherit" }
            if(typeof style === 'string')
                styleObj = style;
            else if(typeof style === 'object')
                styleObj = Object.assign(styleObj, style)

            const styleList = options && options.styleList ? options.styleList : '';
            const styleListItem = options && options.styleListItem ? options.styleListItem : '';

            return {
                style: styleObj,
                styleList,
                styleListItem,
                icon
            };
        }
    },
    methods: {
        updateValue(v) {
            if(typeof this.validateFn === 'function') {
                const err = this.validateFn(v);
                this.error = typeof err === 'string' ? err : null;
            }
            else
                this.error = null;

            if(this.error)
                return;

            this.d_value = v;
            this.$emit('input', this.d_value);
            this.$emit('value', this.d_value);

            if(this.$refs.popover)
                this.$refs.popover.close();
        },
        getValue() {
            return this.d_value;
        },
        isInError() {
            return !!this.error
        },
        isEmpty() {
            return !this.d_value;
        },
    },
    watch: {
        value() {
            this.d_value = this.value;
            if(this.$refs.select)
                this.$refs.select.value = this.value;
        },
        error(v, ov) {
            if(v && !ov)
                animator.shake({ element: this.$el });
        }
    }
}
</script>

<style lang="scss">
    .combobox {
        position:relative;
        width: inherit;
        height: inherit;
        min-height: 32px;
        min-width: 32px;
    }

    .select {
        width: inherit;
        height: inherit;
        min-width: inherit;
        min-height: inherit;
        background: white;
        color: black;
        font: inherit;

        border: solid;
        border-width: 0 0 1px 0;
        text-align: inherit;

        display: flex;
        flex-flow: column;
        justify-content: center;
        align-content: center;
        text-align: left;
        padding-left: 5px;
        padding-right: 5px;
        cursor: pointer;
    }

    .option {
        cursor: pointer;
    }

    .option--selected {
        background: rgba(0, 200, 100, 1);
        color: white;
    }

    .option:hover {
        background: rgba(0, 100, 100, 1);
        color: white;
    }

    .container {
        height: 100%;
        display: table;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        pointer-events: none;
    }

    .icon {
        vertical-align: middle;
        display: table-cell;
        text-align: right;
        pointer-events: none;
        padding-right: 10px;
    }

    .icon i {
        padding-left: 5px;
        font-size: 20pt;
    }

    .placeholder {
        vertical-align: middle;
        display: table-cell;
        text-align: left;
        pointer-events: none;
        padding-left: 10px;
        color: gray;
    }

    .error {
        color: red;
        font-size: 12px;
    }

    .popoverz {
        padding: 5px;
        background: white;
    }

    // .popoverContainer{
    //     &__popoverObjectWrapper{
    //         &__popoverObject{
    //             background: white;
    //             padding: 0;
    //         }
    //     }
    // }


</style>
