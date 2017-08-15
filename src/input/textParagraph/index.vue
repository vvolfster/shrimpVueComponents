<template>
    <div :style="ui.style">
        <div class="paragraph" :class="error ? 'paragraph--error' : ''">
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
    },
    methods: {
        updateValue() {
            const v = this.$refs.input.value;

            const lines = 1 + (v.match(/\n/g) || []).length;
            this.$refs.input.rows = lines;

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
            if(!options)
                return {
                    style: {
                        width: "inherit",
                        height: "inherit"
                    }
                };

            let maxHeight = options.maxHeight || options['max-height']
            if(typeof maxHeight === 'number')
                maxHeight = `${maxHeight}px`

            return {
                style: {
                    width: "inherit",
                    height: "inherit",
                    'max-height': maxHeight
                }
            }
        }
    }
}
</script>

<style scoped>
.paragraph {
    position: relative;
    border: solid 1px;
    width: 100%;
    min-height: 100%;
    max-height: inherit;
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
    padding: 5px;
    max-height: inherit;
}
.paragraph__input:hover { border: none; }
.paragraph__input:focus { border: none; }
.paragraph__input:focus:hover { border:none; }



</style>