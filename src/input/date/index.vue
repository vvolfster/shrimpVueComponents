<template>
    <div class="datetimeRoot" :style="ui.style">
        <input ref="flatPicker" 
            class="datetime flatpickr flatpickr-input" 
            :placeholder="placeholder" @click="openDatePicker" 
            style="border-bottom-style:solid;"
            @input="updateValue"
            readonly='readonly'
        />
        <div v-if="error !== null" class="datetime__error">
            {{ error }}
        </div>
    </div>
</template>

<script>
import 'flatpickr/dist/flatpickr.css';
import moment from 'moment'
import lodash from 'lodash'
import flatpickr from 'flatpickr'
import animator from '../../misc/animator'

export default {
    props: {
        validateFn: {
            type: [Function, null],
            default: null
        },
        value: {
            type: [Date, String],
            default: ''
        },
        placeholder: {
            type: String,
            default: "Input..."
        },
        options: {
            type: [String, Object, null, undefined],
            default: "date",
            validator(v) {
                return ['date', 'datetime'].indexOf(v.toLowerCase()) !== '-1'
            }
        }
    },
    mounted() {
        this.d_value = new Date(this.value);
        this.$refs.flatPicker.value = moment(this.d_value).format("MMMM D, YYYY, h:mm A")
    },
    data() {
        return {
            d_value: "",
            error: null,
            instance: null
        }
    },
    methods: {
        openDatePicker() {
            if(!this.instance) {
                this.initFlatPickr();
            }
            this.instance.open();
        },
        getValue() {
            return this.d_value;
        },
        initFlatPickr() {
            const self = this;
            const date = this.value ? new Date(this.value) : new Date();
            this.destroyFlatPickr();
            self.instance = flatpickr(self.$refs.flatPicker, {
                defaultDate: date,
                enableTime: self.type === 'datetime',
                altInput: true,
            })
            this.d_value = date;
            this.$emit('input', this.d_value);
            this.$emit('value', this.d_value);

            const flatPickrHtml = lodash.find(this.$el.childNodes, child => child.className === "datetime flatpickr flatpickr-input form-control input")
            if(flatPickrHtml){
                flatPickrHtml.style.width = `100%`;
                flatPickrHtml.style.border = `solid`;
                flatPickrHtml.style.borderWidth = '0 0 1px 0';
                flatPickrHtml.style.paddingLeft = '5px';
                flatPickrHtml.style.cursor = "pointer !important";
                // flatPickrHtml.setAttribute('readonly', "none")
            }
        },
        destroyFlatPickr() {
            if(this.instance) {
                this.instance.destroy();
                this.instance = null;
            }
        },
        updateValue(val) {
            // console.log(`this happened`);
            const v = new Date(lodash.get(val, "target.value") || val);
            if(isNaN(v.getTime()))
                return; // invalid date

            if(typeof this.validateFn === 'function') {
                const err = this.validateFn(v);
                this.error = typeof err === 'string' ? err : null;
            }
            else
                this.error = null;

            this.d_value = this.error === null ? v : '';
            this.$emit('input', this.d_value);
            this.$emit('value', this.d_value);
        },
    },
    watch: {
        value() {
            this.d_value = new Date(this.value);
            if(this.$refs.flatPicker)
                this.$refs.flatPicker.value = moment(this.d_value).format("MMMM D, YYYY, h:mm A")
        },
        error(v, ov) {
            if(v && !ov)
                animator.shake({ element: this.$el });
        },
    },
    beforeDestroy() {
        this.destroyFlatPickr();
    },
    computed: {
        ui() {
            const options = this.options;
            const style = options && options.style ? options.style : null;
            const defStyleObj = { width: "inherit", height: "inherit" }
            if(typeof style === 'string')
                return { style }
            if(typeof style === 'object')
                return { style: Object.assign(defStyleObj, style) }

            return { style: defStyleObj };
        },
        type() {
            const options = this.options;
            if(typeof options === 'string') {
                return options.toLowerCase() === 'datetime' ? 'datetime' : 'date'
            }

            if(typeof options === 'object') {
                const type = options.type || 'date'
                return type;
            }

            return 'date'
        }
    }
}
</script>

<style scoped>
.datetimeRoot {
    min-height: 32px;
    width: inherit;
    height: inherit;
    position: relative;
}

.datetime {
    min-height: inherit;
    height: inherit;
    border: solid;
    text-align: inherit;
    border-width: 0 0 1px 0;
    padding-left: 5px;
    cursor: pointer;
    width: 100%;
}

</style>