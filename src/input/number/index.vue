<template>
    <div class="line" :style="ui.style">
        <input class="line__input"
            ref="input"
            type="number"
            @input="updateValue"  
            :class="error ? 'line__input--error' : ''"
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
        updateValue() {
            const v = Number(this.$refs.input.value);
            if(typeof this.validateFn === 'function') {
                const err = this.validateFn(v);
                this.error = typeof err === 'string' ? err : null;
            }
            else
                this.error = null;

            this.d_value = this.error === null ? v : '';
            this.$emit('input', this.d_value);
            this.$emit('value', this.d_value);
        },
    },
    watch: {
        error(v, ov) {
            if(v && !ov)
                animator.shake({ element: this.$el });
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
    min-height: 32px;
    position: relative;
    width: inherit;
    height: inherit;
}

.line__input {
    border-color: inherit;
    width: 100%;
    height: 100%;
    outline: none;
}

.line__input--error { border-color: red; }
.line__input--error:hover { border-color: red; }
.line__input--error:focus { border-color: red; }
.line__input--error:focus:hover { border-color: red; }

.line__error {
    color: red;
    font-size: 12px;
}

</style>