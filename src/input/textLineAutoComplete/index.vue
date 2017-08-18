<template>
    <div class="line">
        <input class="line__input"
            ref="input"
            @input="updateSearchTerm"
            :class="error ? 'line__input--error' : ''"
            :style="ui.style"
            :placeholder="placeholder"
        />
        <div v-if="error !== null" class="line__error">
            {{ error }}
        </div>
        <popover ref='popover'>
            <div class="results">
                <div>
                    Results...
                </div>
                <button v-for="(result, key) in results" :key="key" @click="chooseResult(result, key)">
                    <!-- show the search things -->
                    {{ getDisplayValue(result, key) }}
                </button>
            </div>
        </popover>
    </div>
</template>

<script>
import lodash from 'lodash'
import animator from '../../misc/animator'
import popover from '../../layout/popover'

// dictionary: {
//     type: [Object, Array, null, undefined],
//     default: null
// },
// matchOn: {
//     type: [String, Array],
//     default() {
//         return []
//     }
// },
// display: {
//     type: [Function, Array, String, null, undefined],
//     default: null
// }
function assureString(v) {
    if(typeof v === 'string')
        return v;
    if(typeof v.toString === 'function'){
        const vStr = v.toString();
        if(typeof vStr === 'string')
            return vStr;
    }

    try {
        const stringified = JSON.stringify(v);
        return stringified;
    } catch(e) {
        return 'Invalid String'
    }
}


export default {
    components: {
        popover
    },
    props: {
        validateFn: {
            type: [Function, null],
            default: null
        },
        value: {
            type: [String, Object],
            default: '',
            validator(v) {
                if(typeof v === 'object'){
                    if(toString.call(v) !== '[object Object]'){
                        console.error('textLineAutoComplete.vue :: validation failed', v);
                        return false;
                    }

                    const hasKey = 'key' in v;
                    const hasData = 'data' in v;
                    if(!hasKey || !hasData){
                        console.error('textLineAutoComplete.vue :: validation failed', v);
                        return false;
                    }
                }
                return true;
            }
        },
        placeholder: {
            type: String,
            default: "Input..."
        },
        options: {
            type: [Object, null, undefined],
            default: null,
        },
    },
    data() {
        return {
            d_search: "",
            results: {},
            error: null,
            popoverAutoOpen: true,
        }
    },
    methods: {
        updateSearchTerm(val) {
            const v = val && val.target ? val.target.value : val;
            if(typeof v !== 'string')
                return;

            if(typeof this.validateFn === 'function') {
                const err = this.validateFn(v);
                this.error = typeof err === 'string' ? err : null;
            }
            else
                this.error = null;

            this.d_search = this.error === null ? v : '';
        },
        updateValue(val) {
            this.$emit('input', val);
            this.$emit('value', val);
        },
        updateResults() {
            // console.log(`update results`)
            const searchTerm = this.d_search.toLowerCase()
            const options = this.options;
            const matchOn = lodash.get(options, "matchOn");
            if(!matchOn) {
                this.results = {};
                return;
            }

            const searchArr = lodash.isArray(matchOn) ? matchOn : [matchOn];
            const dictionary = lodash.get(options, "dictionary");
            if(!searchTerm || !dictionary) {
                // console.log(`finish results`);
                this.results = {};
                return;
            }

            this.results = lodash.reduce(dictionary, (a, v, k) => {
                lodash.some(searchArr, (searchKey) => {
                    const val = lodash.get(v, searchKey);
                    if(typeof val === 'string' && val.toLowerCase().startsWith(searchTerm)) {
                        a[k] = v;
                        return true;
                    }
                    else if(val === searchTerm) {
                        a[k] = v;
                        return true;
                    }
                    return false;
                })

                return a;
            }, {})
            // console.log(`finish results`);
            // console.log(lodash.keys(this.results).length, this.results);
        },
        getDisplayValue(v, k) {
            const display = lodash.get(this, 'options.display');

            if(typeof display === 'function'){
                return assureString(display(v, k)) || k;
            }
            if(typeof display === 'string'){
                const val = lodash.get(v, display);
                return assureString(val) || k;
            }
            let searchTerms = null;
            if(lodash.isArray(display)) {
                searchTerms = display;
            }
            else {
                const matchOn = lodash.get(this, 'options.matchOn');
                if(!matchOn)
                    return k;

                searchTerms = lodash.isArray(matchOn) ? matchOn : [matchOn];
            }

            let str = '';
            lodash.each(searchTerms, (key) => {
                const val = lodash.get(v, key);
                if(val)
                    str += `${val} `
            })
            return str || k;
        },
        chooseResult(v, k) {
            const self = this;
            self.popoverAutoOpen = false;
            self.$emit('value', { key: k, data: v });
            if(self.$refs.popover){
                self.$refs.popover.close();
            }

            // weak sauce
            self.$nextTick(() => {
                self.popoverAutoOpen = true;
            })
        },
        getValue() {
            return this.value;
        },
        isInError() {
            return !!this.error
        },
        isEmpty() {
            return !this.value;
        },
    },
    mounted() {
        const v = this.value;
        const d  = toString.call(v) === '[object Object]' ? this.getDisplayValue(v.data, v.key) : v;
        this.d_search = d || '';
        if(this.$refs.input)
            this.$refs.input.value = this.d_search;
    },
    watch: {
        value(v) {
            const d = toString.call(v) === '[object Object]' ? this.getDisplayValue(v.data, v.key) : v;
            this.d_search = d || '';
            if(this.$refs.input)
                this.$refs.input.value = this.d_search;
        },
        error(v, ov) {
            if(v && !ov)
                animator.shake({ element: this.$el });
        },
        d_search() {
            this.updateResults();
        },
        options: {
            deep: true,
            handler(v, ov) {
                if(v.dictionary !== ov.dictionary)
                    this.updateResults();
            }
        },
        results(v) {
            // when results change. we should just show the popover
            if(this.$refs.popover && !this.$refs.popover.isOpen() && lodash.keys(v).length && this.popoverAutoOpen){
                // console.log(`opened`)
                this.$refs.popover.open();
            }
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
    position: relative;
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

.results {
    display: flex;
    flex-flow: column;
}

button:hover {
    color: white;
    background: green;
}

</style>