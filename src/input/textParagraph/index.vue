<template>
    <div>
        <div class="paragraph" :class="error ? 'paragraph--error' : ''" :style="ui.style">
            <textarea class="paragraph__input"
                ref="input"
                @input="updateValue"  
                :placeholder="placeholder"
                rows="1"
            ></textarea>
        </div>
        <div v-if="error !== null" class="paragraph--error">
            {{ error }}
        </div>
    </div>
</template>

<script>
import animator from '../../misc/animator'
import '../../../cssImporter'

export default {
    props: {
        validateFn: {
            type: [Function, null],
            default: null
        },
        value: {
            type: String,
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
            d_value: "",
            error: null,
        }
    },
    mounted() {
        this.d_value = this.value;
        this.$refs.input.value = this.value;
        if(this.value) {
            const lines = 1 + (this.value.match(/\n/g) || []).length;
            this.$refs.input.rows = lines;
            // console.log(`rows ${lines}`)
        }
    },
    methods: {
        updateValue(val) {
            const v = val && val.target ? val.target.value : val;
            if(typeof v !== 'string')
                return;

            const lines = 1 + (v.match(/\n/g) || []).length;
            this.$refs.input.rows = lines;

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
        isEmpty() {
            return !this.d_value;
        },
        getValue() {
            return this.d_value;
        },
        isInError() {
            return !!this.error
        }
    },
    watch: {
        value() {
            this.d_value = this.value;
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
                'min-width': "inherit",
                'min-height': "inherit",
                width: "inherit",
                height: "inherit",
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
.paragraph {
    position: relative;
    border: solid 1px;
    text-align: left;
}
.paragraph--error {
    color: red;
    font-size: 12px;
}

.paragraph__input {
    border-color: inherit;
    width: 100%;
    resize: none;
    outline: none;
    border: none;
    text-align: inherit;
    padding: 5px;
    min-height: inherit;
    max-height: inherit;
}
.paragraph__input:hover { border: none; }
.paragraph__input:focus { border: none; }
.paragraph__input:focus:hover { border:none; }



</style>