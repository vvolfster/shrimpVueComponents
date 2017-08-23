<template>
    <div class="line">
        <input class="line__input"
            ref="input"
            type="number"
            @input="updateValue"  
            :class="error ? 'line__input--error' : ''"
            :style="ui.style"
            :placeholder="d_value === Infinity ? 'Infinity' : placeholder"
        />
        <div class="buttons">
            <div v-if="ui.allowInfinity" class="btn" :class="d_value === Infinity ? 'btn--infinity' : ''" @click.stop="updateValue(Infinity)">∞</div>
            <div class="buttons__updown">
                <div class="fa fa-caret-up btn" @click.stop="increment"></div>
                <div class="fa fa-caret-down btn" @click.stop="decrement"></div>
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

export default {
    props: {
        validateFn: {
            type: [Function, null],
            default: null
        },
        value: {
            type: [String, Number, Infinity],
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
            // console.log("VALUE", val);
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
            if(this.d_value === Infinity)
                return false;

            return isNaN(this.d_value) || this.d_value === '' || (ref && ref.value === '');
        },
        increment(v){
            const val = typeof v === 'number' ?  v : lodash.get(this.options, "stepSize", 1);
            const currentVal = this.getValue();
            if(isNaN(currentVal))
                this.updateValue(0);
            else
                this.updateValue(currentVal + val);
        },
        decrement(v) {
            const val = typeof v === 'number' ?  v : lodash.get(this.options, "stepSize", 1);
            const currentVal = this.getValue();
            if(isNaN(currentVal))
                this.updateValue(0);
            else
                this.updateValue(currentVal - val);
        }
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
            const allowInfinity = options && options.allowInfinity ? options.allowInfinity : false;
            const defStyleObj = {
                font: "inherit",
                color: "inherit",
                background: "inherit",
            }

            if(typeof style === 'string')
                return { style, allowInfinity }
            if(typeof style === 'object' && style !== null)
                return { style: Object.assign(defStyleObj, style), allowInfinity }

            return { style: defStyleObj, allowInfinity };
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

.buttons {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
}

.buttons__updown {
    display: flex;
    flex-flow: column;
}

.btn {
    border: solid 1px black;
    padding-left: 5px;
    padding-right: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.btn--infinity {
    -webkit-animation:infinity 2s linear infinite alternate;
    -moz-animation:infinity 2s linear infinite alternate;
    animation:infinity 2s linear infinite alternate;
}

@keyframes infinity {
    from {color: black;}
    to {color: lightBlue;}
}


</style>