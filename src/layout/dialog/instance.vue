<template>
    <div class='modalObject column instanceRoot' :style="ui.style">
        <h5>{{ ui.title }}</h5>
        {{ ui.description }}

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
                style
            }
        },
        buttons() {
            const params = this.params;
            return params.buttons || {}
        }
    },
    methods: {
        close(){
            this.$emit('closeMe')
        },
        pressButton(name) {
            const buttons = this.buttons;
            const fn = buttons[name];
            const formVal = null;

            Promise.resolve(typeof fn === 'function' ? fn(formVal) : true).then(this.close);
        }
    }
}
</script>

<style scoped>
.instanceRoot {
    position: relative;
}

.column {
    display: flex;
    flex-flow: column;
    align-items: center;
    max-width: 80vw;
    max-height: 80vh;
    min-width: 25vw;
}

button:hover {
    background: green;
    color: white;
}


</style>
