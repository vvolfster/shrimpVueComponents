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
                    {{ showResult(result, key) }}
                </button>
            </div>
        </popover>
    </div>
</template>

<script>
import lodash from 'lodash'
import animator from '../../misc/animator'
import popover from '../../layout/popover'

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
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: "Input..."
        },
        options: {
            type: [Object, null, undefined],
            default: null,
        },
        dictionary: {
            type: [Object, Array, null, undefined],
            default() {
                return {}
            }
        },
        matchOn: {
            type: [String, Array],
            default() {
                return {}
            }
        },
        display: {
            type: [Function, Array, String, null, undefined],
            default: null
        }
    },
    data() {
        return {
            d_value: "",
            d_search: "",
            results: {},
            error: null,
            popoverAutoOpen: true,
        }
    },
    methods: {
        updateSearchTerm(val) {
            const v = lodash.get(val, "target.value") || val;
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
            this.d_value = val;
            this.$emit('input', this.d_value);
            this.$emit('value', this.d_value);
        },
        updateResults() {
            // console.log(`update results`)
            const searchTerm = this.d_search.toLowerCase()
            const searchArr = lodash.isArray(this.matchOn) ? this.matchOn : [this.matchOn]
            if(!searchTerm) {
                // console.log(`finish results`);
                this.results = {};
                return;
            }

            this.results = lodash.reduce(this.dictionary, (a, v, k) => {
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
        showResult(v, k) {
            if(typeof this.display === 'function'){
                return this.display(v, k) || k;
            }
            if(typeof this.display === 'string'){
                const val = lodash.get(v, this.display);
                return val || k;
            }
            let searchTerms = null;
            if(lodash.isArray(this.display)) {
                searchTerms = this.display;
            }
            else {
                searchTerms = lodash.isArray(this.matchOn) ? this.matchOn : [this.matchOn];
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
            this.popoverAutoOpen = false;
            this.d_search = this.showResult(v, k);
            if(this.$refs.input)
                this.$refs.input.value = this.d_search;

            this.d_value = { key: k, data: v }
            this.$emit('value', this.d_value);
            if(this.$refs.popover){
                this.$refs.popover.close();
            }

            // weak sauce
            const self = this;
            this.$nextTick(() => {
                self.popoverAutoOpen = true;
            })
        }
    },
    watch: {
        value() {
            this.d_search = this.value;
            if(this.$refs.input)
                this.$refs.input.value = this.value;
        },
        error(v, ov) {
            if(v && !ov)
                animator.shake({ element: this.$el });
        },
        d_search() {
            this.updateResults();
        },
        dictionary() {
            this.updateResults();
        },
        results(v) {
            // when results change. we should just show the popover
            if(this.$refs.popover && !this.$refs.popover.isOpen() && lodash.keys(v).length && this.popoverAutoOpen){
                console.log(`opened`)
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