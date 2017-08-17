<template>
    <div class='modalObject column instanceRoot' :style="ui.style" @click.stop.prevent="doNothing">
        <div class="dialog__title">{{ ui.title }}</div>
        <div class="dialog__description">{{ ui.description }}</div>
        <autoform v-if="form.fields"
            ref="form"
            :fields="form.fields"
            :model="form.model"
            @value="formVal = $event"
            class='form'
        />
        <div class='buttonRow'>
            <button v-for="(button, name) in buttons" :key="name" @click="pressButton(name)">
                {{ name }}
            </button>
        </div>
    </div>
</template>

<script>
import '../modal/modal.css'
import autoform from '../../input/autoform'
import animator from '../../misc/animator'
import Toast from '../../vuePlugins/toasts'

export default {
    components: { autoform },
    props: {
        params: {
            type: [Object, null, undefined],
            default: null,
        }
    },
    computed: {
        ui() {
            const params = this.params;
            const title = params && params.title ? params.title : ''
            const description = params && params.description ? params.description : ''
            const style = params && params.style ? params.style : ''
            return {
                title,
                description,
                style,
            }
        },
        form() {
            const params = this.params;
            let fields = null;
            let model = null;
            if(!params || !params.form)
                return { model, fields }

            if(toString.call(params.form) === '[object Array]'){
                fields = params.form[0] || null;
                model = params.form[1] || null;
                return { model, fields }
            }

            // the model might be embedded in the fields. so we better
            // go thru it.
            if(toString.call(params.form) === '[object Object]'){
                fields = params.form;
                Object.keys(fields).forEach((key) => {
                    const f = fields[key];
                    if('model' in f) {
                        const modelValue =  f.model;
                        if(!model)
                            model = { [key]: modelValue }
                        else
                            model[key] = modelValue;
                    }
                })
            }

            return { fields, model }
        },
        buttons() {
            const params = this.params;
            return params.buttons || {}
        }
    },
    methods: {
        close(){
            this.$emit('close')
        },
        pressButton(name) {
            const buttons = this.buttons;
            const fn = buttons[name];
            const form = this.$refs.form;
            const formVal = form ? form.getValue() : null;
            const formIsValid = form ? form.isValid() : true;
            if(typeof fn === 'function'){
                if(formIsValid)
                    Promise.resolve(fn(formVal)).then(this.close).catch((err) => {
                        if(typeof err === 'string' || typeof err === 'number')
                            Toast.negative(err);
                    })
                else
                    animator.shake({ element: this.$el });
            }
            else {
                this.close();
            }
        },
        doNothing(){ /* this is just so we absorb the click */ }
    }
}
</script>

<style scoped>
.dialog__title {
    font-size: 24px;
}

.dialog__description {
    margin-top: 20px;
}

.instanceRoot {
    position: relative;
    cursor: auto;
}

.column {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: space-between;
    max-width: 80vw;
    max-height: 80vh;
    min-width: 10vw;
}

.buttonRow {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    width: 100%;
    height: 50px;
}

button:hover {
    background: green;
    color: white;
}

.form {
    width: 95%;
}


</style>
