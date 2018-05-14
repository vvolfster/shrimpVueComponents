import "./components.css"

const components = {
    typography: null,
}

export default {
    components,
    setDefaultComponent(name, vueComponent) {
        components[name] = vueComponent
    },
}
