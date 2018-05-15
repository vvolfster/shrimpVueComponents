<template>
    <div>
        <div>
            <div class="row wrap nonSelectable">
                <div v-for="(color, name) in colors" 
                    @click.stop="setEditColor(name)"
                    :key="name"
                    class="bordered s-border-border column items-center justify-center cursorPointer"
                    :class="editColor.name === name ? `selected` : ``"
                >
                    <div class="tile" :style="{ background: color }"></div>
                    <div>{{name}}</div>
                </div>
            </div>
            <div v-if="editColor.name">
                <color-picker v-model="editColor.colorPicker"></color-picker>
            </div>
        </div>

        <div class="row">
            <div class="components column" style="flex: 0 0 50%;">
                <div><b>Components</b></div>
                <div class="padding20 column">
                    <div @click.stop="setEditCss('s-btn')">
                        <s-btn>Hello</s-btn>
                    </div>
                </div>
            </div>
            <div class="s-bg-textPlaceholder padding5" v-if="editCss.name">
                <div><b>Css</b></div>
                <div class="padding20">
                    <div v-for="(css, name) in editCss.css" :key="name">
                        <div><b>{{name}}</b></div>
                        <div>{{css}}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import components from "@/components"
import vueColor from "vue-color"
import collapsible from "@/misc/collapsible"
import lodash from "lodash"

function replace(string, find, replacement) {
    const findArr = lodash.isArray(find) ? find : [find]
    return lodash.reduce(findArr, (acc, f) => acc.replace(new RegExp(f, "g"), replacement), string)
}

function getReducerOn(attribute) {
    return (acc, { cssText }) => {
        if(!cssText)
            return acc

        const dividerIdx = cssText.indexOf("{")
        const name = cssText.slice(0, dividerIdx).trim().replace('.s-var-', '')
        let value = cssText.slice(dividerIdx)
        if(attribute)
            value = replace(cssText.slice(dividerIdx), ["{", "}", " ", ";", `${attribute}:`], "")

        acc[name] = value
        return acc
    }
}

export default {
    data() {
        const defaults = this.getDefaults()
        return {
            colors: defaults.colors,
            css: defaults.css,
            editColor: {
                name: null,
                colorPicker: "#fff"
            },
            editCss: {
                name: null,
                css: ""
            }
        }
    },
    components: {
        sBtn: components.sBtn,
        "color-picker": vueColor.Chrome,
        collapsible
    },
    methods: {
        setEditColor(name) {
            if(this.editColor.name === name) {
                this.editColor.name = null
                return
            }

            this.editColor.colorPicker = this.colors[name]
            this.editColor.name = name
        },
        setEditCss(name) {
            console.log(`set-edit css`, name, this.css[name])
            if(this.editCss.name === name) {
                this.editCss.name = null
                return
            }

            this.editCss.css = lodash.pickBy(this.css, (v, k) => k.indexOf(`.${name}`) === 0)
            this.editCss.name = name
        },
        removeColorsCss() {
            const css = document.getElementById("svc-colors")
            if(css) {
                css.parentNode.removeChild(css)
            }
        },
        liveLoadColors() {
            const css = document.createElement("style")
            css.id = "svc-colors"
            css.type = "text/css"
            css.innerHTML = this.sheetText.join('\n')
            // console.log(sheet)
            document.body.appendChild(css)
        },
        reset() {
            this.removeColorsCss()
            const defaults = this.getDefaults()
            this.colors = defaults.colors
            this.css = defaults.css
        },
        getDefaults() {
            const foundSheet = lodash.find(document.styleSheets, (sheet) => {
                const firstRule = lodash.get(sheet, "cssRules[0].selectorText")
                if(!firstRule)
                    return false

                return firstRule.startsWith(".s-identity")
            })

            if(!foundSheet)
                return {}

            // find colors
            const varRules = lodash.filter(foundSheet.cssRules, rule => rule.selectorText && rule.selectorText.indexOf(`.s-var-`) === 0)
            const colorRules = lodash.filter(varRules, rule => rule.cssText && rule.cssText.indexOf('color') !== -1)
            const numRules = lodash.filter(varRules, rule => rule.cssText && rule.cssText.indexOf('padding') !== -1)
            const cssRules = lodash.filter(foundSheet.cssRules, (rule, idx) => {
                if(idx === 0 || colorRules.indexOf(rule) !== -1 || numRules.indexOf(rule) !== -1)
                    return false

                if(!rule.selectorText)
                    return true

                if(rule.selectorText.indexOf(".s-clr") === 0)
                    return false

                if(rule.selectorText.indexOf(".s-bg") === 0)
                    return false

                if(rule.selectorText.indexOf(".s-border") === 0)
                    return false

                return true
            })

            const colors = lodash.reduce(colorRules, getReducerOn('color'), {})
            const numbers = lodash.reduce(numRules, getReducerOn('padding'), {})
            const css = lodash.reduce(cssRules, getReducerOn(), {})

            // console.log('cssRules', cssRules)

            // find rules
            return {
                colors,
                numbers,
                css
            }
        }
    },
    watch: {
        editColor: {
            deep: true,
            handler(v) {
                if(!v.name)
                    return

                const hex = v.colorPicker.hex;
                if(!hex)
                    return

                if(this.colors[v.name] !== hex) {
                    this.colors[v.name] = hex
                    this.liveLoadColors()
                }
            }
        }
    },
    computed: {
        sheetText() {
            const colors = this.colors
            const ruleMap = {
                var: 'color',
                clr: 'color',
                bg: 'background-color',
                border: 'border-color'
            }

            const identity = [`.s-identity { padding: 0; }`]
            const colorRules = lodash.reduce(ruleMap, (acc, ruleProp, ruleName) => {
                lodash.each(colors, (color, name) => {
                    const entryName = `.s-${ruleName}-${name}`
                    const entryValue = `{ ${ruleProp}: ${color}; }`
                    acc.push(`${entryName} ${entryValue}`)
                })
                return acc;
            }, [])

            return [
                ...identity,
                ...colorRules
            ]
        }
    }
}
</script>

<style scoped>

.selected {
    background: gray;
}

.bordered {
    border-style: solid;
    border-width: 1px;
    border-radius: 3px;
    padding: 5px;
    margin: 5px;
}

.tile {
    width: 32px;
    height: 32px;
}

</style>
