<template>
    <div class="line">
        <div class="column" :style="ui.style">
            <div class="margin-bottom">{{ placeholder }}</div>
            <div class="row wrap justify-even items-even nuggetContainer">
                <div v-for="(v, k) in computedOptions" 
                    :key="k" 
                    class="row nugget margin-bottom" 
                    @click="toString.call(rawOptions) === '[object Object]' ? updateValue(null, { k: rawOptions[k], v: !v }) : updateValue(null, { k, v: !v })"
                >
                    <i class="svti margin-right fa" :class="!v ? icon.default : icon.selected"></i>
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

function extractValue(v, options) {
    const choices = lodash.get(options, "options") || lodash.get(options, "choices") || [];
    const multiple = lodash.get(options, "multiple", true);
    if (!v)
        return [];

    function isAChoice(ch){
        if(lodash.isArray(choices))
            return choices.indexOf(ch) !== -1;

        // it's an object
        return lodash.values(choices).indexOf(ch) !== -1;
    }

    // console.log(v, JSON.stringify(choices));
    if (typeof v !== 'object'){
        if(isAChoice(v)){
            return multiple ? [v] : v;
        }
        return multiple ? [] : "";
    }

    const t = toString.call(v);
    if (t === '[object Object]') {
        // console.log('1')
        if(multiple) {
            return lodash.reduce(v, (acc, val, key) => {
                if(val && isAChoice(key) !== -1)
                    acc.push(key);
                return acc;
            }, []);
        }

        // singular case
        return lodash.findKey(v, (val, key) => val && isAChoice(key) !== -1) || "";
    }
    else if (t === '[object Array]') {
        // console.log('2')
        if(multiple) {
            return lodash.reduce(v, (acc, val) => {
                if(isAChoice(val) !== -1)
                    acc.push(val)
                return acc;
            }, []);
        }

        // singular case
        return lodash.find(v, val => isAChoice(val) !== -1) || "";
    }

    // console.log('3')
    return multiple ? [] : "";
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
        this.d_value = extractValue(this.value, this.options);
    },
    methods: {
        updateValue(value, { k, v }) {
            // console.log('updateValue', value, k, v);
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

            function setAndEmit(val){
                // console.log('SETANDEMIT', val);
                self.d_value = val;
                self.$emit('input', self.d_value);
                self.$emit('value', self.d_value);
            }

            const multiple = lodash.get(this, "options.multiple", true);
            if(multiple) {
                if (k !== undefined && v !== undefined) {
                    console.log(k, v);
                    const curVal = lodash.cloneDeep(this.d_value);
                    const idx = curVal.indexOf(k);
                    if (v && idx === -1) {
                        curVal.push(k);
                        if(validation(curVal)){
                            setAndEmit(curVal);
                        }
                    }
                    else if (!v && idx !== -1) {
                        curVal.splice(idx, 1);
                        if(validation(curVal)){
                            setAndEmit(curVal);
                        }
                    }
                }
                else {
                    const xv = extractValue(value, this.options);
                    if (!lodash.isEqual(xv, this.d_value) && validation(xv)) {
                        setAndEmit(xv);
                    }
                }
            }
            // singlular case
            else if(k !== undefined && v !== undefined) {
                const out = this.d_value === k ? "" : k;
                if(!out || validation(out))
                    setAndEmit(out);
            }
            else if (!lodash.isEqual(value, this.d_value) && validation(value)) {
                setAndEmit(value);
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
            this.d_value = extractValue(this.value, this.options);
        },
        options: {
            deep: true,
            handler() {
                this.d_value = extractValue(this.value, this.options);
            }
        },
        error(v, ov) {
            if (v && !ov)
                animator.shake({ element: this.$el });
        },
        multiple() {
            this.updateValue("");
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
        rawOptions() {
            try {
                const o = this.options;
                const choices = o.choices || o.options;
                return choices;
            } catch(e) {
                return [];
            }
        },
        computedOptions() {
            const o = this.options;
            if (!o)
                return [];

            const choices = o.choices || o.options;
            if (typeof choices !== 'object')
                return [];

            const type = toString.call(choices);
            const isObject = type === '[object Object]'
            const keys = isObject ? Object.keys(choices) : choices;

            const value = this.d_value;

            const obj = {};
            keys.forEach((k) => {
                const v = isObject ? choices[k] : k;
                if(toString.call(value) === '[object Array]'){
                    obj[k] = value.indexOf(v) !== -1
                }
                else {
                    obj[k] = value === v
                }
            })
            return obj;
        },
        multiple() {
            const o = this.options;
            return o && typeof o.multiple === 'boolean' ? o.multiple : true;
        },
        icon() {
            if(this.multiple) {
                return { default: 'fa-square-o', selected: 'fa-check-square-o' }
            }
            return { default: 'fa-circle-thin', selected: 'fa-circle' }
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