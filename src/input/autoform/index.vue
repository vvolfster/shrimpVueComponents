<template>
    <div class="autoform">
        <div>{{ title }}</div>
        <pre class="pre">{{ description }}</pre>
        <div class="autoComponents" v-if="fields">
            <div v-for="(field, name) in fields" :key="name" style="position:relative;">
                <div class="autoform--input">
                    <component 
                        :is="field ? getComponent(field.type || field, getFieldName(name)) : null" 
                        :options="field && field.options ? field.options : null"
                        :ref="`formField_${name}`" 
                        :value="getFieldValue(name)" 
                        :placeholder="getFieldName(name)"
                        @value="setValue(name, $event)" 
                        :validateFn="field && (typeof field.validateFn === 'function' || typeof field.validator === 'function') ? (field.validateFn || field.validator) : null"
                    />
                    <div class='requireOverlay' v-if="fieldIsMissing(name, field)">
                        <i class='fa fa-asterisk'></i>
                    </div>
                </div>
            </div>
        </div>
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
import customComponents from '../customComponents'
import '../../../cssImporter'

function getDataModel(f) {
    const obj = {};
    if (!f || toString.call(f) !== '[object Object]')
        return obj;

    lodash.each(f, (v, k) => {
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
    },
    mounted() {
        this.d_model = getDataModel(this.fields);
    },
    data() {
        return {
            d_model: null,
        }
    },
    components: {
        boolean, options, combobox, range, date, file, json, number, textLine, textLineAutoComplete, textParagraph, textPassword, markdown
    },
    methods: {
        getFieldName(name) {
            const field = this.fields[name]
            if (!field)
                return name;

            if (typeof field.label === 'string')
                return field.label;

            if (typeof field.title === 'string')
                return field.title;

            return name;
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
                case "markdown": return "markdown"
                case "range": return "range"
                case "slider": return "range"
                case "options": return "options"
                case "choices": return "options"

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

            lodash.set(this.d_model, name, value);
            this.$emit('value', this.d_model);
        },
        getValue() {
            return this.d_model;
        },
        isValid() {
            const self = this;
            return lodash.every(this.fields, (type, name) => {
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
        }
    },
    watch: {
        model() {
            this.d_model = getDataModel(this.fields);
        },
        fields() {
            this.d_model = getDataModel(this.fields);
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