import Vue from "vue"
import rc from "../_registeredComponents"

const template = `
    <div>
        <button @click.stop="$emit('click', $event)" v-if="!customComponent" :class="classes" :style="customStyle">
            <slot/>
        </button>
        <component v-else :is="customComponent" :style="customStyle"/>
    </div>
`

const sBtn = Vue.component(`sBtn`, {
    /* eslint-disable indent */
    name: `sBtn`,
    computed: {
        customComponent() {
            return rc.$data.registeredComponents[this.name]
        }
    },
    props: {
        classes: {
            type: String,
            default: `s-btn`
        },
        customStyle: {
            type: [String, Object, null, undefined],
            default() { return `` }
        }
    },
    template
})

export default sBtn
