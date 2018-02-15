<template>
    <div 
        class="combobox"
        @keyup.enter="togglePopover"
        @keyup.space="togglePopover"
        @keydown.space="preventDefault"
        tabindex="0"
    >
        <div 
            ref="select" 
            @click="togglePopover" 
            class="select" 
            :style="ui.style"
        >
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
        <popover 
            ref="popover"
            :position="position"
            :noStyle="false"
            @open="open = true"
            @close="open = false, $el.focus()"
        >
            <div 
                ref="popoverMain"
                class="popoverz shadow-4" :style="ui.styleList"
                @keydown.space="preventDefault"
                @keydown.up="setCurrentIndex(-1, $event)"
                @keydown.down="setCurrentIndex(1, $event)"
                @keyup.enter="updateValue(cOptions[currentIndex])"
                @keyup.space="updateValue(cOptions[currentIndex])"
                @keyup="popoverKeyHandler"
            >
                <div v-for="(option, idx) in cOptions"
                    :key="option"
                    :value="option"
                    class="option"
                    :class="idx === currentIndex ? 'option--hover' : d_value === option ? 'option--selected' : ''"
                    @mouseenter="currentIndex = idx"
                    :style="ui.styleListItem"
                    @click.stop="updateValue(option)"
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
            currentIndex: 0,
            error: null,
            open: false,
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
            return !options || typeof options.position !== 'string' ? 'bottomRight' : (options.position || 'bottomRight')
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
        popoverKeyHandler(e) {
            if(e.keyCode === 27){
                try {
                    this.$refs.popover.close();
                } catch(err) {
                    console.error(err);
                }
            }
        },
        preventDefault(e) {
            if(e && e.preventDefault)
                e.preventDefault();
        },
        setCurrentIndex(v, e) {
            if(e && e.preventDefault)
                e.preventDefault();

            const opts = this.cOptions;
            const newIdx = this.currentIndex + v;
            if(newIdx < 0){
                this.currentIndex = opts.length - 1;
            }
            else if(newIdx >= opts.length){
                this.currentIndex = 0;
            }
            else {
                this.currentIndex = newIdx;
            }
        },
        togglePopover() {
            try {
                const popoverInstance = this.$refs.popover;
                popoverInstance.toggle();
            } catch(e) {
                console.error(e);
            }
        },
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

    .combobox:focus {
        border-width: 0 0 2px 0;
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

    .option--hover {
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
