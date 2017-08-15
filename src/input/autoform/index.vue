<template>
    <div class="autoform">
        <div>{{ title }}</div>
        <div>{{ description }}</div>
        <div class="autoComponents" v-if="fields">
            <div v-for="(field, name) in fields" :key="name">
                <div class="autoform--input">
                    <component :is="getComponent(field.type || field)" 
                        :validateFn="field && field.validateFn ? field.validateFn : null"
                        :value="d_model && d_model[name] ? d_model[name] : null"
                        :placeholder="getFieldName(name)"
                        @value="setValue(name, $event)"
                        :options="field && field.options ? field.options : null"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// import lodash from 'lodash'
import combobox from '../combobox'
import date from '../date'
import file from '../file'
import fileMulti from '../fileMulti'
import number from '../number'
import textLine from '../textLine'
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
    components: { combobox, date, file, fileMulti, number, textLine, textParagraph, textPassword },
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
                case "fileMutli" : return "fileMutli";
                case "number": return "number";
                case "string": return "textLine";
                case "paragraph": return "textParagraph";
                case "password": return "textPassword";

                case "text": return "textLine";
                case "textLine": return "textLine";
                case "textParagraph": return "textParagraph";
                case "textPassword": return "textPassword";

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

</style>