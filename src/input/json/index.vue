<template>
    <div>
        <div ref='jsoneditor' class="jsoneditor" :style="ui.style">
        </div>
        <div v-if="error !== null" class="line__error">
            {{ error }}
        </div>
    </div>
</template>

<script>
import JsonEditor from 'jsoneditor'
import lodash from 'lodash'
import "jsoneditor/dist/jsoneditor.min.css"
import animator from '../../misc/animator'
import '../../../cssImporter'
import './css.css'

function getMode(options) {
    if (!options)
        return 'tree'

    return ['tree', 'form', 'view', 'code'].indexOf(options.mode) !== -1 ? options.mode : 'tree'
}

const helpers = {
    conditions: {
        isObject(o) {
            return o ? o.toString.call('[object Object]') : false;
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


export default {
    props: {
        validateFn: {
            type: [Function, null],
            default: null
        },
        value: {
            type: [String, Object],
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
            error: null
        }
    },
    mounted() {
        const self = this;
        const options = self.options;
        this.d_mode = getMode(options);
        self.editor = new JsonEditor(self.$refs.jsoneditor, {
            mode: self.d_mode,
            modes: helpers.get(options, "modes", ['tree', 'form', 'view', 'code'], lodash.isArray),
            onModeChange(v, ov) {
                self.d_mode = v;
                const fn = helpers.get(options, "onModeChange", null, lodash.isFunction)
                if(fn)
                    fn(v, ov)
            },
            onChange() {
                try {
                    const v = self.editor.get()
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

                    // console.log(`mutex`, self.mutex);
                    if(self.mutex)
                        return;

                    self.$emit('input', self.d_value);
                    self.$emit('value', self.d_value);
                    const fn = helpers.get(options, "onChange", null, lodash.isFunction)
                    if(fn)
                        fn(v)
                }
                catch(e) {
                    // do nothing. this will only get triggered if self.editor.get() fails
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
        });
        // window.jsoneditor = self.editor;

        if (lodash.isObject(self.value)) {
            self.d_value = self.value;
            self.editor.set(self.value);
        }
    },
    methods: {
        updateValue(v, force) {
            if(!lodash.isObject(v)){
                return;
            }

            if (typeof this.validateFn === 'function') {
                const err = this.validateFn(v);
                this.error = typeof err === 'string' ? err : null;
            }
            else
                this.error = null;

            if (this.error){
                return;
            }

            this.d_value = v;
            if(this.editor){
                if(!force || lodash.get(this.options, "alwaysForceOnUpdate")) {
                    try {
                        if(JSON.stringify(this.editor.get()) === JSON.stringify(v)){
                            return
                        }
                    } catch(e) { /* do nothing */ }
                }
                this.mutex = true;
                this.editor.set(v);
                this.mutex = false;
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
            this.updateValue(v);
        },
        placeholder(v) {
            this.editor.setName(v);
        },
        error(v, ov) {
            if (v && !ov)
                animator.shake({ element: this.$el });
        },
        options: {
            deep: true,
            handler(v, ov) {
                if(!this.editor)
                    return;

                const mode = lodash.get(v, 'mode')
                const oldMode = lodash.get(ov, 'mode')
                if(mode !== oldMode)
                    this.editor.setMode(mode);
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

