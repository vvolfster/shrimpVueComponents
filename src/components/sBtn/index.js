import Vue from "vue"
import rc from "../_registeredComponents"

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
        }
    },
    template: [
        `<div>`,
            `<button v-if="!customComponent" :class="classes">`,
                `<slot/>`,
            `</button>`,
            `<component v-else :is="customComponent"/>`,
        `</div>`
    ].join("")
    /* eslint-enable indent */
})

export default sBtn
