<template>
    <div class="autoform">
        <div v-if="title">{{ title }}</div>
        <pre v-if="description" class="pre">{{ description }}</pre>
        <table class="autoComponents" v-if="orderedFields" style="margin-bottom:20px;">
            <tr v-for="entry in orderedFields" :key="entry.name" class="relative">
                <td v-if="labelLayout" style="text-transform:capitalize; padding:0 0 10px 0;">
                    {{ getFieldName(entry.name) }}
                </td>
                <td class="autoform--input relative" style="padding:0 0 20px 0;">
                    <component 
                        :is="entry.field ? getComponent(entry.field.type || entry.field, getFieldName(entry.name)) : null" 
                        :options="getOptions(entry.field)"
                        :ref="`formField_${entry.name}`" 
                        :value="getFieldValue(entry.name)" 
                        :placeholder="!labelLayout ? getFieldName(entry.name) : ''"
                        @value="setValue(entry.name, $event)" 
                        :validateFn="validateFns[entry.name] || null"
                    />
                    <div class='requireOverlay' v-if="fieldIsMissing(entry.name, entry.field)">
                        <i class='fa fa-asterisk'></i>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
import lodash from 'lodash'
import boolean from '../boolean'
import combobox from '../combobox'
import date from '../date'
import file from '../file'
import number from '../number'
import json from '../json'
import textLine from '../textLine'
import markdown from '../markdown'
import textLineAutoComplete from '../textLineAutoComplete'
import textParagraph from '../textParagraph'
import textPassword from '../textPassword'
import range from '../range'
import options from '../options'
import readOnly from '../readOnly'
import customComponents from '../customComponents'
import '../../css'

function getDataModel(f, subset) {
    const obj = {};
    if (!f || toString.call(f) !== '[object Object]')
        return obj;

    const set = subset || lodash.keys(subset);
    lodash.each(set, (k) => {
        const v = f[k];
        lodash.set(obj, k, lodash.get(v, 'model', ''))
    })
    return obj;
}

export default {
    props: {
        title: String,
        description: String,
        fields: {
            type: [Object, null, undefined],
            default: null
        },
        fieldSort: {
            type: [Array, Function, null, undefined],
            default: null,
        },
        labelLayout: {
            type: Boolean,
            default: false,
        },
        fullyReactive: {
            type: Boolean,
            default: true
        }
    },
    mounted() {
        this.computeFields();
        this.computeValidateFns();
        // this.d_model = getDataModel(this.computedFields);
    },
    data() {
        return {
            d_model: null,
            computedFields: null,
            validateFns: {}
        }
    },
    components: {
        boolean, options, combobox, range, date, file, json, number, textLine, textLineAutoComplete, textParagraph, textPassword, markdown, readOnly
    },
    methods: {
        computeFields() {
            // const self = this;
            const fields = this.fields;
            const model = this.d_model;

            function shouldBeIncluded(f) {
                if(typeof f.when !== 'function')
                    return true;

                try {
                    const val = f.when(model);
                    return val;
                } catch(e) {
                    return false;
                }
            }

            function isNative(f) {
                const native = [Boolean, Array, Object, String, Number, Date, File, JSON, Range];
                return native.indexOf(f) !== -1;
            }

            if(typeof fields !== "object"){
                this.computedFields = this.fields;
            }
            else {
                this.computedFields = lodash.reduce(fields, (acc, field, name) => {
                    if(typeof field !== 'function' || isNative(field)){
                        if(shouldBeIncluded(field))
                            acc[name] = field;
                        return acc;
                    }

                    try {
                        const fieldObj = field(model);
                        if(fieldObj && shouldBeIncluded(fieldObj))
                            acc[name] = fieldObj;
                    } catch(e) {
                        console.error("Error on", name, field);
                    }
                    return acc;
                }, {})
            }
            return this.computedFields;
        },
        computeValidateFns() {
            const self = this;
            function getFn(field, key) {
                const fn = field[key];
                if(typeof fn === 'function'){
                    return v => fn(v, self.d_model)
                }
                return false;
            }

            self.validateFns = lodash.reduce(self.computedFields, (acc, field, name) => {
                acc[name] = getFn(field, 'validateFn') || getFn(field, 'validator') || null;
                return acc;
            }, {})
        },
        getOptions(field) {
            const self = this;
            const fieldOptions = field && field.options ? field.options : null;
            try {
                if(typeof fieldOptions === 'function'){
                    return fieldOptions(self.d_model)
                }
                return fieldOptions || null;
            }
            catch(e) {
                console.error(e);
                return null;
            }
        },
        getFieldName(name) {
            const self = this;
            const field = self.computedFields ? self.computedFields[name] : null;
            if (!field)
                return name;

            function getLabel(key) {
                const title = field[key];
                if(typeof title === 'string' || typeof title === 'number')
                    return title.toString()
                else if(typeof title === 'function')
                    return title(self.d_model, self.getFieldValue(name));
                return false;
            }

            return getLabel('label') || getLabel('title') || name;
        },
        getFieldValue(name) {
            return lodash.get(this.d_model, name, '');
        },
        getComponent(fieldType, fieldName) {
            const f = typeof fieldType === 'string' ? fieldType.toLowerCase() : fieldType;
            const custom = customComponents.get(f);
            if(custom)
                return custom;

            switch (f) {
                case "boolean": return "boolean";
                case "combobox": return "combobox";
                case "combo": return "combobox";
                case "date": return "date";
                case "file": return "file";
                case "number": return "number";
                case "string": return "textLine";
                case "paragraph": return "textParagraph";
                case "password": return "textPassword";
                case "autocomplete": return "textLineAutoComplete";
                case "markdown": return "markdown";
                case "range": return "range";
                case "slider": return "range";
                case "options": return "options";
                case "choices": return "options";
                case "readonly": return "readOnly";

                case "text": return "textLine";
                case "textLine": return "textLine";
                case "textautocomplete": return "textLineAutoComplete";
                case "textlineautocomplete": return "textLineAutoComplete";
                case "textparagraph": return "textParagraph";
                case "textpassword": return "textPassword";
                case "json": return "json";

                case Boolean: return "boolean";
                case Array: return "options";
                case Object: return "options";
                case String: return "textLine";
                case Number: return "number";
                case Date: return "date";
                case File: return "file";
                case JSON: return 'json';
                case Range: return "range"

                default:
                    if(toString.call(fieldType) === '[object Object]'){
                        const validatedObj = customComponents.validate(fieldType, `autoform.customComponent::${fieldName} `, true);
                        if(validatedObj)
                            return validatedObj;
                    }
                    return "textLine";
            }
        },
        setValue(name, value) {
            if (!this.d_model)
                return;

            if(name)
                lodash.set(this.d_model, name, value);

            this.$emit('value', this.d_model);
            this.computeFields();   // recompute fields!
            // console.log('SUP', JSON.stringify(this.d_model, null, 2));
        },
        getValue() {
            return this.d_model;
        },
        isValid() {
            const self = this;
            const computedFields = this.computedFields || null;
            return lodash.every(computedFields, (type, name) => {
                let component = lodash.get(self.$refs, `formField_${name}`)
                if (lodash.isArray(component))
                    component = component[0];

                const required = lodash.get(type, 'required', false);
                // console.log('hello', name, component, required);
                if (!component)
                    return true;

                if (component.isInError()) {
                    // console.log(`${name} is in error`)
                    return false;
                }

                // console.log(name, 'is required:', required);
                if (required) {
                    // console.log(name, required, component.isEmpty());
                    // console.warn(name, typeof component.isEmpty === 'function', component.isEmpty());
                    if (typeof component.isEmpty === 'function') {
                        // console.log(`${name} is empty`)
                        // console.log(name, required, component.isEmpty(), "RETURNING FALSE");
                        if (component.isEmpty())
                            return false;
                    }
                    else {
                        // otherwise, the best we can do is hope for a truthy value. we dont know what constitutes as the component being empty.
                        // all components currently have isEmpty
                        return component.getValue();
                    }
                }

                return true;
            })
        },
        fieldIsMissing(name, type) {
            if (!type || !type.required)
                return false;

            let cmp = this.$refs[`formField_${name}`];
            if (!cmp)
                return false;

            cmp = cmp[0];
            if (!cmp)
                return false;

            return typeof cmp.isEmpty === 'function' ? cmp.isEmpty() : cmp.getValue();
        },
        giveFocus(){
            function canFocus(el) {
                try {
                    const style = window.getComputedStyle(el);
                    const isHidden = (style.display === 'none') || style.visibility === 'hidden'
                    return el.tabIndex !== -1 && !isHidden;
                } catch(e) {
                    console.error(el, e);
                    return false;
                }
            }

            function findFocusableElementWithin(el){
                let focusableEl = null;
                lodash.some(el.children, (child) => {
                    if(canFocus(child)){
                        focusableEl = child;
                        return true;
                    }

                    if(child.children && child.children.length){
                        const r = findFocusableElementWithin(child);
                        if(r){
                            focusableEl = r;
                            return true;
                        }
                    }

                    return false;
                })
                return focusableEl;
            }

            function setFocusTo(el) {
                el.focus();
                if(lodash.isFunction(el.select)){
                    el.select();
                }
            }

            return lodash.some(this.$refs, (ref, name) => {
                if(!name.startsWith('formField'))
                    return false;

                const entry = ref[0];
                if(!entry)
                    return false;

                // look in this item and try to give focus!!
                const el = entry.$el || entry;
                if(!el)
                    return false;

                if(canFocus(el)){
                    setFocusTo(el)
                    return true;
                }

                const focusableEl = findFocusableElementWithin(el);
                if(!focusableEl)
                    return false;

                setFocusTo(focusableEl);
                return true;
            })
        }
    },
    watch: {
        fields() {
            this.computeFields();
        },
        model() {
            this.d_model = getDataModel(this.computedFields);
        },
        computedFields(v, ov) {
            this.computeValidateFns();
            if(!this.fullyReactive)
                return;

            const keys = lodash.keys(v);
            const oldKeys = lodash.keys(ov);

            // Let's find the keys whose type changed! Or whose model changed.
            const typeOrModelChangeKeys = lodash.reduce(keys, (acc, key) => {
                const newVal = lodash.get(v, key);
                const oldVal = lodash.get(ov, key);
                const newType = typeof newVal === 'function' ? newVal : lodash.get(newVal, "type", newVal);
                const oldType = typeof oldVal === 'function' ? oldVal : lodash.get(oldVal, "type", oldVal);
                const newModel = typeof newVal === 'function' ? null : lodash.get(newVal, "model", null);
                const oldModel = typeof oldVal === 'function' ? null : lodash.get(oldVal, "model", null);

                if(newType && (newType !== oldType || newModel !== oldModel))
                    acc.push(key);
                return acc;
            }, []);

            // find new Keys. typeOrModelChangeKeys + Genuinely New Keys
            const newKeys = lodash.uniq(typeOrModelChangeKeys.concat(lodash.difference(keys, oldKeys)));
            const obsoleteKeys = lodash.difference(oldKeys, keys);

            const model = this.d_model || {};

            if(!newKeys.length && !obsoleteKeys.length)
                return;

            if(newKeys.length) {
                const newStuff = getDataModel(this.computedFields, newKeys);
                lodash.each(newStuff, (val, k) => {
                    model[k] = val;
                })
            }

            if(obsoleteKeys.length) {
                lodash.each(obsoleteKeys, key => delete model[key])
            }

            this.d_model = model;
            this.setValue();
        },
    },
    computed: {
        orderedFields() {
            const fieldSort = this.fieldSort;
            const fields = this.computedFields;
            if(toString.call(fields) !== '[object Object]'){
                return [];
            }

            if(typeof fieldSort !== 'function' && toString.call(fieldSort) !== '[object Array]'){
                return lodash.reduce(fields, (acc, field, name) => {
                    acc.push({ name, field })
                    return acc;
                }, []);
            }

            const keys = lodash.keys(fields);
            if(typeof fieldSort === 'function'){
                const sortedKeys = keys.sort(fieldSort);
                return lodash.reduce(sortedKeys, (acc, name) => {
                    acc.push({ name, field: fields[name] })
                    return acc;
                }, []);
            }

            const out = lodash.reduce(fieldSort, (acc, name) => {
                const field = fields[name];
                if(field)
                    acc.push({ name, field })
                return acc;
            }, []);
            const out2 = lodash.reduce(fields, (acc, field, name) => {
                if(!lodash.find(out, o => o.name === name))
                    acc.push({ name, field })
                return acc;
            }, [])
            return [...out, ...out2];
        }
    }
}
</script>

<style scoped>
.autoform {
    padding: 10px;
}

.autoComponents {
    padding-top: 10px;
    width: 100%;
}

.autoform--input {
    margin-bottom: 20px;
}

.requireOverlay {
    position: absolute;
    pointer-events: none;
    top: 5px;
    right: 0px;
    font-size: 8px;
    color: red;
}

.pre {
    white-space: pre-wrap;
    white-space: -moz-pre-wrap;
    white-space: -o-pre-wrap;
    word-wrap: break-word;
    font-family: inherit;
}
</style>