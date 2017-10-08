<template>
    <div class="line">
        <div class="column" :style="ui.style">
            <div class="margin-bottom">{{ placeholder }}</div>
            <div class="row wrap justify-even items-even nuggetContainer">
                <div v-for="(v, k) in computedOptions" :key="k" class="row nugget margin-bottom" @click="updateValue(null, { k, v: !v })">
                    <i class="svti margin-right fa" :class="!v ? 'fa-square-o' : 'fa-check-square-o'"></i>
                    <div>{{ k }}</div>
                </div>
            </div>
        </div>
        <div v-if="error !== null" class="line__error">
            {{ error }}
        </div>
    </div>
</template>

<script>
import lodash from 'lodash'
import animator from '../../misc/animator'
import '../../../cssImporter'

function extractValue(v) {
    if (!v)
        return [];

    if (typeof v !== 'object')
        return [v];

    const t = toString.call(v);
    if (t === '[object Object]') {
        const val = [];
        Object.keys(v).forEach((key) => {
            if (v[key])
                val.push(key);
        })
        return val;
    }
    else if (t === '[object Array]') {
        const val = [];
        v.forEach(vEntry => val.push(vEntry))
        return val;
    }
    return [];
}

export default {
    props: {
        validateFn: {
            type: [Function, null],
            default: null
        },
        value: {
            type: [String, Object, Array],
            default() { return '' }
        },
        placeholder: {
            type: String,
            default: "Choices..."
        },
        options: {
            type: [Object, null, undefined],
            default: null,
        }
    },
    data() {
        return {
            d_value: [],
            error: null,
        }
    },
    mounted() {
        this.d_value = extractValue(this.value);
    },
    methods: {
        updateValue(value, { k, v }) {
            const self = this;
            function validation(validateVal) {
                if (typeof self.validateFn === 'function') {
                    const err = self.validateFn(validateVal);
                    self.error = typeof err === 'string' ? err : null;
                }
                else
                    self.error = null;

                return !self.error
            }

            if (k !== undefined && v !== undefined) {
                const curVal = lodash.cloneDeep(this.d_value);
                const idx = curVal.indexOf(k);
                if (v && idx === -1) {
                    curVal.push(k);
                    if(validation(curVal)){
                        this.d_value = curVal;
                        this.$emit('input', this.d_value);
                        this.$emit('value', this.d_value);
                    }
                }
                else if (!v && idx !== -1) {
                    curVal.splice(idx, 1);
                    if(validation(curVal)){
                        this.d_value = curVal;
                        this.$emit('input', this.d_value);
                        this.$emit('value', this.d_value);
                    }
                }
            }
            else {
                const xv = extractValue(value);
                if (!lodash.isEqual(xv, this.d_value) && validation(xv)) {
                    this.d_value = xv;
                    this.$emit('input', this.d_value);
                    this.$emit('value', this.d_value);
                }
            }
        },
        getValue() { return this.d_value; },
        isInError() { return !!this.error },
        isEmpty() {
            return !this.d_value || !this.d_value.length;
        },
    },
    watch: {
        value() {
            this.d_value = this.value;
        },
        error(v, ov) {
            if (v && !ov)
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
            if (typeof style === 'string')
                return { style }
            if (typeof style === 'object')
                return { style: Object.assign(defStyleObj, style) }

            return { style: defStyleObj };
        },
        computedOptions() {
            const o = this.options;
            if (!o)
                return [];

            const choices = o.choices || o.options;
            if (typeof choices !== 'object')
                return [];

            const type = toString.call(choices);
            const keys = type === '[object Object]' ? Object.keys(choices) : choices;

            const value = this.d_value;

            const obj = {};
            keys.forEach((k) => { obj[k] = value.indexOf(k) !== -1 })
            return obj;
        }
    }
}
</script>

<style scoped>
.line {
    position: relative;
    text-align: left;
}


.nugget {
    border: solid 1px lightgray;
    font-size: inherit;
    margin-right: 10px;
    padding: 10px;
    cursor: pointer;
    user-select: none;
    flex: 1 0 auto;
    
    display: flex;
    align-items: center;
}

.nugget:hover {
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12);
}


.line__input {
    border: solid;
    width: 100%;
    height: 100%;
    font: inherit;
    color: inherit;
    text-align: inherit;
    background: inherit;
    outline: none;
}

.line__input--error {
    border-color: red;
}

.line__input--error:hover {
    border-color: red;
}

.line__input--error:focus {
    border-color: red;
}

.line__input--error:focus:hover {
    border-color: red;
}

.line__error {
    color: red;
    font-size: 12px;
}
</style>