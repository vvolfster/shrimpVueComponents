import Vue from "vue"

const SVCRegisteredComponents = Vue.component('SVCRegisteredComponentsSingleton', {
    name: `SVCRegisteredComponentsSingleton`,
    data() {
        return {
            registeredComponents: {
                button: null
            }
        }
    },
    methods: {
        register(name, vueComponent) {
            this.registeredComponents[name] = vueComponent
        },
        getName(name) {
            return `svc-${name}`
        }
    },
    template: `<div id="SVCRegisteredComponents" style="display:none;"/>`
})

const SVCRegisteredComponentsInstance = new SVCRegisteredComponents()
export default SVCRegisteredComponentsInstance
