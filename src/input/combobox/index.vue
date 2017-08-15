<template>
    <div class="combobox">
        <div class="select" ref="select" @click="$refs.popover.open()" :style="ui.style">
            <div>
                {{ d_value ? d_value : placeholder }}
                <i class="fa fa-caret-down" v-if="ui.icon"></i>
            </div>
        </div>
        <div v-if="error !== null" class="error">
            {{ error }}
        </div>
        <popover ref="popover" position="top">
            <div>
                <div v-for="option in cOptions" :key="option" :value="option" @click="updateValue(option)" class="option" :class="d_value === option ? 'option--selected' : ''">
                    {{ option }}
                </div>
            </div>
        </popover>
        <!--
            <select name="select" @input="updateValue" class="select" ref="select" :style="ui.style">
            <option v-for="option in cOptions" :key="option" :value="option">
                {{ option }}
            </option>
            </select>
            <div class="container">
                <div v-if="!d_value" class="placeholder">{{ placeholder }}</div>
                <div class="icon" v-if="ui.icon">
                    <i class="fa fa-caret-down"></i>
                </div>
            </div>        
        -->
    </div>
</template>

<script>
import animator from '../../misc/animator'
import popover from '../../layout/popover'

export default {
    components: {
        popover
    },
    props: {
        options: {
            type: [Array, null],
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
        uiStyle: {
            type: [Object, String, null],
            default: null
        },
        uiIcon: {
            type: [Boolean, null, undefined],
            default: true,
        },
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
            return this.options || [];
        },
        ui() {
            const style = this.uiStyle || {}
            const icon = this.uiIcon
            return {
                style,
                icon
            }
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

            this.d_value = this.error === null ? v : '';
            this.$emit('input', this.d_value);
            this.$emit('value', this.d_value);

            if(this.$refs.popover)
                this.$refs.popover.close();
        },
    },
    watch: {
        error(v, ov) {
            if(v && !ov)
                animator.shake({ element: this.$el });
        }
    }
}
</script>

<style scoped>
    .combobox {
        position:relative;
        width: inherit;
        height: inherit;
    }

    .select {
        border: solid 1px;
        min-height: 32px;
        min-width: 32px;
        height: inherit;
        width: inherit;
        color: black;
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-content: center;
        text-align: left;
        padding-left: 5px;
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


</style>
