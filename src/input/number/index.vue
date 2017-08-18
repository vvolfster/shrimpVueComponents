<template>
    <div class="line">
        <input class="line__input"
            ref="input"
            type="number"
            @input="updateValue"  
            :class="error ? 'line__input--error' : ''"
            :style="ui.style"
            :placeholder="placeholder"
        />
        <div v-if="error !== null" class="line__error">
            {{ error }}
        </div>
    </div>
</template>

<script>
import animator from '../../misc/animator'

export default {
    props: {
        validateFn: {
            type: [Function, null],
            default: null
        },
        value: {
            type: [String, Number],
            default: ''
        },
        placeholder: {
            type: String,
            default: "Input..."
        },
        options: {
            type: [Object, null, undefined],
            default: null
        }
    },
    data() {
        return {
            d_value: NaN,
            error: null,
        }
    },
    mounted() {
        this.d_value = Number(this.value);
        this.$refs.input.value = this.value;
    },
    methods: {
        updateValue(val) {
            const vStr = val && val.target ? val.target.value : val;
            const v = Number(vStr);
            if(typeof v !== 'number' || isNaN(v))
                return;

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
        },
        getValue() {
            return this.d_value;
        },
        isInError() {
            return !!this.error
        },
        isEmpty() {
            const ref = this.$refs.input;
            return isNaN(this.d_value) || this.d_value === '' || (ref && ref.value === '');
        },
    },
    watch: {
        value() {
            this.d_value = Number(this.value);
            if(this.$refs.input)
                this.$refs.input.value = this.value;
        },
        error(v, ov) {
            if(v && !ov)
                animator.shake({ element: this.$el });
        }
    },
    computed: {
        ui() {
            const options = this.options;
            const style = options && options.style ? options.style : null;
            const defStyleObj = {
                font: "inherit",
                color: "inherit",
                background: "inherit",
            }
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
    min-height: 32px;
    position: relative;
    width: inherit;
    height: inherit;
}

.line__input {
    border: solid;
    border-width: 0 0 1px 0;
    width: 100%;
    height: 100%;
    text-align: inherit;
    font: inherit;
    color: inherit;
    background: inherit;
    outline: none;
}
.line__input { border-width: 0 0 1px 0; }
.line__input:hover { border-width: 0 0 1px 0; }
.line__input:focus { border-width: 0 0 1px 0; }
.line__input:focus:hover { border-width: 0 0 1px 0; }

.line__input--error { border-color: red; }
.line__input--error:hover { border-color: red; }
.line__input--error:focus { border-color: red; }
.line__input--error:focus:hover { border-color: red; }

.line__error {
    color: red;
    font-size: 12px;
}

</style>