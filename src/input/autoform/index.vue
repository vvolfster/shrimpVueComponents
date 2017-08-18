<template>
    <div class="autoform">
        <div>{{ title }}</div>
        <div>{{ description }}</div>
        <div class="autoComponents" v-if="fields">
            <div v-for="(field, name) in fields" :key="name" style="position:relative;">
                <div class="autoform--input">
                    <component :is="getComponent(field.type || field)" 
                        :validateFn="field && typeof field.validateFn === 'function' ? field.validateFn : 
                                                                                       typeof field.validator === 'function' ? field.validator : null"
                        :value="d_model && d_model[name] ? d_model[name] : null"
                        :placeholder="getFieldName(name)"
                        @value="setValue(name, $event)"
                        :options="field && field.options ? field.options : null"
                        :ref="`formField_${name}`"
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
import combobox from '../combobox'
import date from '../date'
import file from '../file'
import number from '../number'
import textLine from '../textLine'
import textLineAutoComplete from '../textLineAutoComplete'
import textParagraph from '../textParagraph'
import textPassword from '../textPassword'

function getDataModel(m, f){
    const obj = {};
    const seenKeys = {}

    // get the combined keys
    const fKeys = f ? Object.keys(f) : [];
    const mKeys = m ? Object.keys(m) : [];
    const allKeys = fKeys.concat(mKeys);
    allKeys.forEach((key) => {
        if(seenKeys[key])
            return;

        seenKeys[key] = true;
        const val = m && m[key] ? m[key] : "";
        obj[key] = val;
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
        model: {
            type: [Object, null, undefined],
            default: null
        }
    },
    mounted() {
        this.d_model = getDataModel(this.model, this.fields);
    },
    data() {
        return {
            d_model: null,
        }
    },
    components: { combobox, date, file, number, textLine, textLineAutoComplete, textParagraph, textPassword },
    methods: {
        getFieldName(name) {
            const field = this.fields[name]
            if(!field)
                return name;

            if(typeof field.label === 'string')
                return field.label;

            if(typeof field.title === 'string')
                return field.title;

            return name;
        },
        getComponent(fieldType) {
            const f = typeof fieldType === 'string' ? fieldType.toLowerCase() : fieldType;
            switch(f) {
                case "combobox": return "combobox";
                case "combo": return "combobox";
                case "date": return "date";
                case "file": return "file";
                case "number": return "number";
                case "string": return "textLine";
                case "paragraph": return "textParagraph";
                case "password": return "textPassword";
                case "autocomplete": return "textLineAutoComplete";

                case "text": return "textLine";
                case "textLine": return "textLine";
                case "textautocomplete": return "textLineAutoComplete";
                case "textlineautocomplete": return "textLineAutoComplete";
                case "textparagraph": return "textParagraph";
                case "textpassword": return "textPassword";

                case String: return "textLine";
                case Number: return "number";
                case Date: return "date";
                case File: return "file";

                default: return "textLine";
            }
        },
        setValue(name, value) {
            if(!this.d_model)
                return;

            this.d_model[name] = value;
            this.$emit('value', this.d_model);
        },
        getValue() {
            return this.d_model;
        },
        isValid() {
            const self = this;
            return lodash.every(this.fields, (type, name) => {
                // console.log(lodash.keys(self.$refs), `formField__${name}`)
                const component = lodash.get(self.$refs, `formField_${name}[0]`)
                const required = lodash.get(type, 'required', false);
                if(!component)
                    return true;

                if(component.isInError()){
                    // console.log(`${name} is in error`)
                    return false;
                }

                if(required) {
                    if(typeof component.isEmpty === 'function' && component.isEmpty()){
                        // console.log(`${name} is empty`)
                        return false;
                    }
                    return component.getValue();
                }

                return true;
            })
        },
        fieldIsMissing(name, type) {
            if(!type || !type.required)
                return false;

            let cmp = this.$refs[`formField_${name}`];
            if(!cmp)
                return false;

            cmp = cmp[0];
            if(!cmp)
                return false;

            window[name] = cmp;

            return typeof cmp.isEmpty === 'function' ? cmp.isEmpty() : cmp.getValue();
        }
    },
    watch: {
        model() {
            this.d_model = getDataModel(this.model, this.fields);
        },
        fields() {
            this.d_model = getDataModel(this.model, this.fields);
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


</style>