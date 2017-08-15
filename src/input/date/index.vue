<template>
    <div class="datetimeRoot" >
        <div class="datetime">
            <input class="datetime__input"
                ref="input"
                type="date"
                @input="updateValue"  
                :class="error ? 'datetime__input--error' : ''"
                :placeholder="placeholder"
            />
            <div class="datetime__time">
                <combobox class='time__box' :options="timeOptions.hrs" placeholder="h" :uiStyle="timeboxStyle" :uiIcon="false"/>
                <combobox class='time__box' :options="timeOptions.mins" placeholder="m" :uiStyle="timeboxStyle" :uiIcon="false"/>
                <combobox class='time__box' :options="timeOptions.secs" placeholder="s" :uiStyle="timeboxStyle" :uiIcon="false"/>
                <combobox class='time__box' :options="timeOptions.ap" placeholder="a" :uiStyle="timeboxStyle"   :uiIcon="false"/>
            </div>
        </div>
        <div v-if="error !== null" class="datetime__error">
            {{ error }}
        </div>
    </div>
</template>

<script>
import lodash from 'lodash'
import animator from '../../misc/animator'
import combobox from '../combobox'

export default {
    components: {
        combobox
    },
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
            type: String,
            default: "date",
            validator(v) {
                return ['date', 'datetime', 'time'].indexOf(v.toLowerCase()) !== '-1'
            }
        }
    },
    data() {
        return {
            d_value: "",
            error: null,
            timeOptions: {
                hrs: [],
                mins: [],
                secs: [],
                ap: ["AM", "PM"]
            },
            timeboxStyle: {
                border: "solid 1px",
                'border-radius': 0,
                'font-size': '12px',
                'padding-left': 0,
                'text-align': 'center'
            }
        }
    },
    created() {
        lodash.times(12, (idx) => {
            this.timeOptions.hrs.push(`${idx + 1 < 10 ? '0' : ''}${idx + 1}`)
        })

        lodash.times(60, (idx) => {
            const v = `${idx < 10 ? '0' : ''}${idx}`
            this.timeOptions.mins.push(v);
            this.timeOptions.secs.push(v);
        })
    },
    mounted() {
        const date = new Date(this.value);
        this.d_value = date;
        this.$refs.input.value = date;
    },
    methods: {
        updateValue() {
            const v = new Date(this.$refs.input.value);
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
        error(v, ov) {
            if(v && !ov)
                animator.shake({ element: this.$el });
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
    display: flex;
}

.datetime__input {
    border-color: inherit;
    height: 100%;
    outline: none;
}

.datetime__time {
    display: flex;
}

.datetime__input--error { border-color: red; }
.datetime__input--error:hover { border-color: red; }
.datetime__input--error:focus { border-color: red; }
.datetime__input--error:focus:hover { border-color: red; }
.datetime__error {
    color: red;
    font-size: 12px;
}

.time__box {
    width: 32px;
    height: 100%;
}

</style>