<template>
    <div class="datetimeRoot" :style="ui.style">
        <input ref="flatPicker" 
            class="datetime flatpickr flatpickr-input" 
            :placeholder="placeholder" 
            @keydown="openIfNotTabKey"
            @click="openDatePicker"
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
import '../../../cssImporter'

export default {
    props: {
        validateFn: {
            type: [Function, null],
            default: null
        },
        value: {
            type: [Date, String, null],
            default: null
        },
        placeholder: {
            type: String,
            default: "Input..."
        },
        options: {
            type: [String, Object, null, undefined],
            default: "date",
            validator(opt) {
                const validTypes = ['date', 'datetime']
                if(typeof opt === 'string')
                    return validTypes.indexOf(opt) !== '-1'

                if(typeof opt === 'object') {
                    const v = opt.type || 'date'
                    return validTypes.indexOf(v) !== '-1'
                }

                return true;
            }
        }
    },
    mounted() {
        const v = new Date(this.value);
        if(!isNaN(v.getTime())){
            this.d_value = v;
            this.$refs.flatPicker.value = moment(v).format("MMMM D, YYYY, h:mm A")
        }
        this.hasMounted = true;
    },
    data() {
        return {
            d_value: "",
            error: null,
            instance: null,
            hasMounted: false,
        }
    },
    methods: {
        openIfNotTabKey(keyEvent) {
            if(keyEvent.keyCode === 7 || keyEvent.code === "Tab" || keyEvent.key === "Tab")
                return;

            if(keyEvent.preventDefault)
                keyEvent.preventDefault();

            this.openDatePicker();
        },
        openDatePicker() {
            if(!this.instance) {
                this.initFlatPickr();
            }
            this.instance.open();
        },
        getValue() {
            return this.d_value;
        },
        isInError() {
            return !!this.error
        },
        isEmpty() {
            return !this.d_value;
        },
        initFlatPickr() {
            const self = this;
            const date = this.value ? new Date(this.value) : new Date();
            const type = this.getType(this.options)
            const enableTime = type.toLowerCase() === 'datetime'
            this.destroyFlatPickr();
            // console.log('init flatpickr with', date, enableTime);
            self.instance = flatpickr(self.$refs.flatPicker, {
                defaultDate: date,
                enableTime,
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
                flatPickrHtml.style.setProperty("cursor", "pointer", "important");
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
            const v = val && val.target ? new Date(val.target.value) : val;
            if(!v || !v.getTime || isNaN(v.getTime()))
                return; // invalid date

            if(typeof this.validateFn === 'function') {
                const err = this.validateFn(v);
                this.error = typeof err === 'string' ? err : null;
            }
            else
                this.error = null;

            if(this.error)
                return;

            this.d_value = v;
            this.$emit('input', this.d_value);
            this.$emit('value', this.d_value);
        },
        getType(options) {
            if(!options)
                return "date";

            if(typeof options === 'string') {
                return options.toLowerCase() === 'datetime' ? 'datetime' : 'date'
            }

            if(typeof options === 'object') {
                const type = options.type || 'date'
                return type;
            }

            return 'date'
        }
    },
    watch: {
        value() {
            const v = new Date(this.value);
            if(!isNaN(v.getTime())){
                this.d_value = v;
                if(this.$refs.flatPicker)
                    this.$refs.flatPicker.value = moment(v).format("MMMM D, YYYY, h:mm A")
            }
        },
        error(v, ov) {
            if(v && !ov)
                animator.shake({ element: this.$el });
        },
        type() {
            if(this.hasMounted && this.instance)
                this.initFlatPickr();
        }
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
            return this.getType(this.options);
        }
    }
}
</script>

<style scoped>
.datetimeRoot {
    width: inherit;
    height: inherit;
    position: relative;
    text-align: left;
}

.datetime {
    min-height: inherit;
    height: inherit;
    border: solid;
    text-align: inherit;
    border-width: 0 0 1px 0;
    cursor: pointer !important;
    width: 100%;

    font-style: inherit;
    font-variant: inherit;
    font-weight: inherit;
    font-stretch: inherit;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
    background: inherit;
}

.datetime:focus {
    outline: 1px dotted #212121;
    outline: 5px auto -webkit-focus-ring-color;
}

.datetime__error {
    color: red;
    font-size: 12px;
}

</style>