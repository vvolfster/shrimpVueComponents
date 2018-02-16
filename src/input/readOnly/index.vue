<template>
    <div class="boolean">
        <div class="boolean__input" 
            :style="ui.style"
        >
            <div>{{ placeholder }}</div>
            <div>{{ value }}</div>
        </div>
        <div v-if="error !== null" class="boolean__error">
            {{ error }}
        </div>
    </div>
</template>

<script>
/* eslint-disable no-unneeded-ternary */
import animator from '../../misc/animator'
import '../../../cssImporter'

export default {
    props: {
        validateFn: {
            type: [Function, null],
            default: null
        },
        value: {
            type: [String, Boolean],
            default: ''
        },
        placeholder: {
            type: String,
            default: "Input..."
        },
        options: {
            type: [Object, null, undefined],
            default: null,
        }
    },
    data() {
        return {
            d_value: "",
            error: null,
        }
    },
    mounted() {
        this.d_value = this.value ? true : false;
    },
    methods: {
        updateValue(val) {
            const v = val ? true : false;
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
            // console.log(`am i in error`, !!this.error);
            return !!this.error
        },
        isEmpty() {
            return false;
        },
    },
    watch: {
        value() {
            this.d_value = this.value ? true : false;
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
.boolean {
    position: relative;
}

.boolean__input {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.boolean__error {
    color: red;
    font-size: 12px;
}

.boolean__icon {
    margin-left: 10px;
    font-size: 20px;
    cursor: pointer;
}

</style>