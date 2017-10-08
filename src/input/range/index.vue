<template>
    <div>
        <div class="line row items-center justify-between">
            <div class="margin-right self-stretch column justify-center">
                {{ placeholder }}
            </div>
            <!-- <div class="relative self-grow-shrink items-center">
                <div class="absolute fill row items-center pointereventsnone" ref="tickList">
                    <div class="relative fillH" style="width:calc(100% - 16px)">
                        <button v-for="(v,k) in optionsList" :key="k" 
                            class="tickbtn absolute pointereventsauto"
                            :style="`left:calc(${ (v/max) * 100}%)`"
                            @click.stop="updateValue(v)"
                        />
                    </div>
                </div>
                <input 
                    class="line__input fill"
                    ref="input"
                    type="range"
                    :min="min"
                    :max="max"
                    :step="step"
                    :list="`rangeList_${generatedId}`"
                    :class="error ? 'line__input--error' : ''" :style="ui.style" @input="updateValue"
                    v-resize="updateSize"
                >
            </div> -->
            <input 
                    class="svtrange"
                    ref="input"
                    type="range"
                    :min="min"
                    :max="max"
                    :step="step"
                    :list="`rangeList_${generatedId}`"
                    :class="error ? 'line__input--error' : ''" :style="ui.style" @input="updateValue"
                    v-resize="updateSize"
                >
            <datalist ref="list">
                <option v-for="(v,k) in optionsList" :key="k">
                    {{ v }}
                </option>
            </datalist>
            <div class="margin-left self-stretch column justify-center">{{ d_value }}</div>
        </div>

        <div v-if="error !== null" class="line__error">
            {{ error }}
        </div>
    </div>
</template>

<script>
import lodash from 'lodash'
// import vueResize from 'vue-resize';
import animator from '../../misc/animator'
import idGen from './idGen'
import '../../../cssImporter'

export default {
    // directives: { resize: vueResize },
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

            generatedId: -1,
        }
    },
    mounted() {
        const v = Number(this.value);
        this.d_value = v;
        if (!isNaN(v))
            this.$refs.input.value = v;

        this.generatedId = idGen.getId();

        const inputId = `range_${this.generatedId}`;
        const listId = `rangeList_${this.generatedId}`;

        this.$refs.input.id = inputId;
        this.updateSize();
        this.$refs.list.id = listId;
    },
    methods: {
        updateValue(val) {
            // console.log("VALUE", val);
            const vStr = val && val.target ? val.target.value : val;
            const v = Number(vStr);
            if (typeof v !== 'number' || isNaN(v))
                return;

            if (typeof this.validateFn === 'function') {
                const err = this.validateFn(v);
                this.error = typeof err === 'string' ? err : null;
            }
            else
                this.error = null;

            if (this.error)
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
            if (this.d_value === Infinity)
                return false;

            return isNaN(this.d_value) || this.d_value === '' || (ref && ref.value === '');
        },
        increment(v) {
            const val = typeof v === 'number' ? v : lodash.get(this.options, "stepSize", 1);
            const currentVal = this.getValue();
            if (isNaN(currentVal))
                this.updateValue(0);
            else
                this.updateValue(currentVal + val);
        },
        decrement(v) {
            const val = typeof v === 'number' ? v : lodash.get(this.options, "stepSize", 1);
            const currentVal = this.getValue();
            if (isNaN(currentVal))
                this.updateValue(0);
            else
                this.updateValue(currentVal - val);
        }
    },
    watch: {
        value() {
            this.d_value = Number(this.value);
            if (this.$refs.input)
                this.$refs.input.value = this.value;
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
            const allowInfinity = options && options.allowInfinity ? options.allowInfinity : false;
            const defStyleObj = {
                font: "inherit",
                color: "inherit",
                background: "inherit",
            }

            if (typeof style === 'string')
                return { style, allowInfinity }
            if (typeof style === 'object' && style !== null)
                return { style: Object.assign(defStyleObj, style), allowInfinity }

            return { style: defStyleObj, allowInfinity };
        },
        min() {
            const options = this.options;
            return options && typeof options.min === 'number' ? options.min : 0;
        },
        max() {
            const options = this.options;
            const min = this.min;
            return options && typeof options.max === 'number' && options.max >= min ? options.max : min;
        },
        step() {
            const options = this.options;
            const step = options && typeof options.step === 'number' && options.step > 0 ? options.step : 0;
            return step;
        },
        // smallestDiff() {
        //     const ol = this.optionsList;
        //     if(!ol || !ol.length)
        //         return null;

        //     let min = null;
        //     ol.forEach((v, idx) => {
        //         const next = ol[idx + 1];
        //         if(next){
        //             const diff = next - v;
        //             if(min === null)
        //                 min = diff;
        //             else
        //                 min = Math.min(min, diff);
        //         }
        //     })
        //     return min;
        // },
        optionsList() {
            const options = this.options;
            const list = options && options.list ? options.list : null;
            const min = this.min;
            const max = this.max;
            const diff = max - min;

            const type = toString.call(list);
            if (type === '[object Array]') {
                return lodash.uniq([min].concat(list)).concat([max]);
            }

            if (type === '[object Number]') {
                if (list <= 0 || list > diff)
                    return [];

                const numSteps = Math.floor(diff / list); // these are the number of steps...
                const arr = [min];
                lodash.times(numSteps, (i) => {
                    arr.push(min + (i * list))
                })
                arr.push(max);
                return arr;
            }

            return [];
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
    display: flex;
    align-items: flex-end;
    text-align: left;
}

.line__input {
    border: none;
    width: 100%;
    height: 100%;
    text-align: inherit;
    font: inherit;
    color: inherit;
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

.buttons {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 2px;
    display: flex;
}

.buttons__updown {
    position: relative;
    height: 100%;
    width: 21.16px;
}

.buttons__updown__up {
    position: absolute;
    top: 0;
    bottom: 50%;
    margin: 0;
}

.buttons__updown__down {
    position: absolute;
    top: 50%;
    bottom: 0;
    margin: 0;
}

.btn {
    border: solid 1px black;
    padding-left: 5px;
    padding-right: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
}



input[type=range].svtrange {
    -webkit-appearance: none;
    width: 100%;
    margin: 6px 0;
}

input[type=range].svtrange:focus {
    outline: none;
}

input[type=range].svtrange::-webkit-slider-runnable-track {
    width: 100%;
    height: 6px;
    cursor: pointer;
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    background: rgba(113, 113, 113, 0.78);
    border-radius: 1.3px;
    border: 0.2px solid #010101;
}

input[type=range].svtrange::-webkit-slider-thumb {
    box-shadow: 2px 2px 1px rgba(0, 0, 0, 0.5), 0px 0px 2px rgba(13, 13, 13, 0.5);
    border: 0px solid rgba(0, 0, 0, 0);
    height: 26px;
    width: 26px;
    
    border-radius: 14px;
    background: #ffffff;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -10.2px;
}

input[type=range].svtrange:focus::-webkit-slider-runnable-track {
    background: rgba(126, 126, 126, 0.78);
}

input[type=range].svtrange::-moz-range-track {
    width: 100%;
    height: 6px;
    cursor: pointer;
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    background: rgba(113, 113, 113, 0.78);
    border-radius: 1.3px;
    border: 0.2px solid #010101;
}

input[type=range].svtrange::-moz-range-thumb {
    box-shadow: 2px 2px 1px rgba(0, 0, 0, 0.5), 0px 0px 2px rgba(13, 13, 13, 0.5);
    border: 0px solid rgba(0, 0, 0, 0);
    height: 26px;
    width: 26px;
    border-radius: 14px;
    background: #ffffff;
    cursor: pointer;
}

input[type=range].svtrange::-ms-track {
    width: 100%;
    height: 6px;
    cursor: pointer;
    background: transparent;
    border-color: transparent;
    color: transparent;
}


input[type=range].svtrange::-ms-thumb {
    box-shadow: 2px 2px 1px rgba(0, 0, 0, 0.5), 0px 0px 2px rgba(13, 13, 13, 0.5);
    border: none;
    height: 26px;
    width: 26px;
    border-radius: 14px;
    padding: 0;
    margin:0;
    background: #ffffff;
    cursor: pointer;
    height: 6px;
}

.tickbtn {
    height: 15px;
    width: 15px;
    border-radius: 8px;
    background: rgba(0,0,0, 0.2);
    padding: 0;
    margin:0;
    border: none;
    outline: none;
    margin-top: 3px;
    
    cursor: pointer;    
}


</style>