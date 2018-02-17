<template>
    <div>
        <div ref='jsoneditor' class="jsoneditorRoot">
        </div>
        <div v-if="error !== null" class="line__error">
            {{ error }}
        </div>
    </div>
</template>

<script>
/* eslint-disable no-plusplus */

import JsonEditor from 'jsoneditor'
import lodash from 'lodash'
import "jsoneditor/dist/jsoneditor.min.css"
import animator from '../../misc/animator'
import '../../../cssImporter'
import './css.css'

function getMode(options) {
    if (!options || !options.mode)
        return 'tree'

    return ['tree', 'form', 'view', 'code'].indexOf(options.mode) !== -1 ? options.mode : 'tree'
}

function setMenu(showMenu) {
    const menuEl = lodash.get(this, "editor.menu")
    const outerEl = lodash.first(this.$el.querySelectorAll('.jsoneditor-outer'))
    // console.log("outerEl", outerEl);
    if(!menuEl)
        return;

    // console.log(menuEl);
    if(showMenu) {
        menuEl.classList.remove('hidden');
        menuEl.removeAttribute('style')

        if(outerEl) {
            outerEl.removeAttribute('style')
        }
    }
    else {
        menuEl.classList.add('hidden')
        menuEl.style.height = 0;

        if(outerEl) {
            outerEl.style.padding = 0;
            outerEl.style.margin = 0;
        }
    }
}

function setStyle(style) {
    const tableEl = lodash.first(this.$el.querySelectorAll('.jsoneditor'))
    if(!tableEl)
        return false;

    if(!style)
        return tableEl.removeAttribute('style')

    if(typeof style === 'string')
        return lodash.set(tableEl, "style", style);

    return lodash.each(style, (v, k) => lodash.set(tableEl.style, k, v))
}


const helpers = {
    conditions: {
        isObject(o) {
            return o && typeof o.toString === 'function' ? toString.call(o) === '[object Object]' : false;
        },
    },
    get(options, path, defaultVal, condition) {
        if(!options)
            return defaultVal || null;

        const v = lodash.get(options, path);
        if(v === undefined)
            return defaultVal;

        const conditionFn = typeof condition === 'function' ? condition :  helpers.conditions[condition];
        if(!conditionFn)
            return v;

        return conditionFn(v) ? v : defaultVal;
    }
}

const uidFieldName = '___jsonGeneratedUID___';

export default {
    props: {
        validateFn: {
            type: [Function, null],
            default: null
        },
        value: {
            type: [String, Object, Array, Number, Date, null],
            default() {
                return null;
            }
        },
        placeholder: {
            type: [String, Object],
            default() {
                return null;
            }
        },
        options: {
            type: [Object, null, undefined],
            default: null,
        }
    },
    data() {
        return {
            d_value: null,
            d_mode: 'tree',
            mutex: false,

            editor: null,
            error: null,
            uidRand: null,
            uidGen: -1,
        }
    },
    mounted() {
        const self = this;
        const options = self.options;
        self.d_mode = getMode(options);
        self.uidRand = +new Date();

        self.d_value = self.value //  helpers.conditions.isObject(self.value) || lodash.isArray(self.value) ? self.value : null;
        self.editor = new JsonEditor(self.$refs.jsoneditor, {
            mode: self.d_mode,
            modes: helpers.get(options, "modes", ['tree', 'form', 'view', 'code'], lodash.isArray),
            onModeChange(v, ov) {
                self.d_mode = v;
                setMenu.apply(self, [lodash.get(options, "menu", true)])
                setStyle.apply(self, [lodash.get(options, "style")])
                const fn = helpers.get(options, "onModeChange", null, lodash.isFunction)
                if(fn)
                    fn(v, ov)
            },
            onChange() {
                // this thing always gets triggured even if nothing is passed to the editor??
                try {
                    const v = self.editor.get();
                    if(typeof v === 'object'){
                        Object.defineProperty(v, uidFieldName, {
                            enumerable: false,
                            value: `${self.uidRand}_${++self.uidGen}`
                        })
                    }

                    // self.updateValue()
                    if (typeof self.validateFn === 'function') {
                        const err = self.validateFn(v);
                        self.error = typeof err === 'string' ? err : null;
                    }
                    else
                        self.error = null;

                    if (self.error)
                        return;

                    self.d_value = v;

                    if(self.mutex)
                        return;

                    self.$emit('input', self.d_value);
                    self.$emit('value', self.d_value);
                    const fn = helpers.get(options, "onChange", null, lodash.isFunction)
                    if(fn)
                        fn(v)
                }
                catch(e) {
                    /* console.error(e); */
                }
            },
            name: lodash.get(options, "name") || lodash.get(self, 'placeholder'),
            onError: helpers.get(options, "onError", false, lodash.isFunction),
            search: helpers.get(options, "search", true, lodash.isBoolean),
            escapeUnicode: helpers.get(options, "sortObjectKeys", false, lodash.isBoolean),
            sortObjectKeys: helpers.get(options, "sortObjectKeys", true, lodash.isBoolean),
            history: helpers.get(options, "history", true, lodash.isBoolean),
            schema: helpers.get(options, "options.schema", null, "isObject"),
            schemaRefs: helpers.get(options, "options.schemaRefs", null, "isObject"),
            ace: helpers.get(options, "ace", null, "isObject"),
            ajv: helpers.get(options, "ajv", null, "isObject"),
            indentation: helpers.get(options, "indentation", 4, lodash.isNumber),
            templates: helpers.get(options, "templates", [], lodash.isArray)
        }, self.d_value);
        // window.jsoneditor = self.editor;
        // console.log(self.editor);
        setMenu.apply(self, [lodash.get(options, "menu", true)])
        setStyle.apply(self, [lodash.get(options, "style")])
    },
    methods: {
        updateValue(v, force) {
            // console.log(`called updateValue with`, v);
            const self = this;

            function failedValidation() {
                if (typeof self.validateFn === 'function') {
                    const err = self.validateFn(v);
                    self.error = typeof err === 'string' ? err : null;
                }
                else {
                    self.error = null;
                }
                return self.error;
            }


            // If it's a js object. We should use the generated field for it that timestamps the changes. Otherwise, its ok. we can overwrite it!
            if(lodash.isObject(v)) {
                if (failedValidation()){
                    return;
                }

                this.d_value = v;
                if(this.editor){
                    if(!force) {
                        if(!lodash.get(this.options, "deepCheckOnUpdate")){
                            // console.log(v[uidFieldName], `${this.uidRand}_${this.uidGen}`)
                            if(v[uidFieldName] === `${this.uidRand}_${this.uidGen}`)
                                return;
                        }
                        else {
                            try {
                                if(lodash.isEqual(this.editor.get(), v))
                                    return
                            } catch(e) { /* do nothing */ }
                        }
                    }
                    this.mutex = true;
                    this.editor.set(v);
                    this.mutex = false;
                }
            }
            else {
                if(failedValidation())
                    return;

                if(this.editor) {
                    this.d_value = v;
                    this.mutex = true;
                    this.editor.set(v);
                    this.mutex = false;
                }
            }
        },
        getValue() {
            return this.d_value;
        },
        isInError() {
            return !!this.error
        },
        isEmpty() {
            return this.d_value === null || this.d_value === undefined;
        },
        getEditor() {
            return this.editor
        },
        collapseAll() {
            if(this.editor)
                this.editor.collapseAll();
        },
        expandAll() {
            if(this.editor)
                this.editor.expandAll();
        },
        focus() {
            if(this.editor)
                this.editor.focus();
        },
        setSchema(...params) {
            if(this.editor)
                this.editor.setSchema(...params);
        }
    },
    watch: {
        value(v) {
            // console.log(`called updateValue`)
            this.updateValue(v);
        },
        placeholder(v) {
            this.editor.setName(v);
        },
        error(v, ov) {
            if (v && !ov)
                animator.shake({ element: this.$el });
        },
        ui(v) {
            setStyle.apply(this, [v.style]);
        },
        options: {
            deep: true,
            handler(v) {
                if(!this.editor)
                    return;

                const mode = lodash.get(v, 'mode')
                if(mode)
                    this.editor.setMode(mode);

                const menu = lodash.get(v, "menu", true);
                setMenu.apply(this, [menu]);
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
            if (typeof style === 'string')
                return { style }
            if (typeof style === 'object')
                return { style: Object.assign(defStyleObj, style) }

            return { style: defStyleObj };
        },
    }
}
</script>

<style scoped>
.line__error {
    color: red;
    font-size: 12px;
}
</style>

