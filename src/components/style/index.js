import Vue from 'vue';
import lodash from 'lodash';

const SVCStyle = Vue.component('SVCStyleSingleton', {
    name: 'svcStyleSingleton',
    template: `<div style='display:none;'></div>`,
    data() {
        return {
            activeStyleName: 'default',
            styles: {
                default: {
                    name: 'default',
                    colors: {
                        main: `#409EFF`,
                        success: `#67C23A`,
                        warning: `#E6A23C`,
                        danger: `#F56C6C`,
                        info: `#909399`,
                        text: `#303133`,
                        textSecondary: `#909399`,
                        textPlaceholder: `#C0C4CC`,
                        border: `#DCDFE6`,
                        borderLight: `#E4E7ED`,
                        borderLighter: `#EBEEF5`,
                        borderLightest: `#F2F6FC`,
                        white: `#fff`,
                        black: `#000`
                    },
                    typography: {
                        font: `Helvetica`,
                        titleMain: { fontWeight: 'bold', fontSize: `20px` },
                        title: `18px`,
                        titleSmall: `16px`,
                        body: `14px`,
                        bodySmall: `13px`,
                        supplmentary: `12px`,
                    },
                    components: {
                        main: {
                            outline: 'none',
                        },
                        button: {
                            padding: `10px`,
                            minHeight: `40px`,
                            borderWidth: `1px`,
                            borderStyle: 'solid',
                            borderRadius: `3px`
                        }
                    }
                },
            },
        };
    },
    computed: {
        activeStyle() {
            return this.styles[this.activeStyleName];
        },
        main() {
            const style = this.activeStyle;
            const main = style.components.main || {}
            return {
                color: style.colors.text,
                background: style.colors.white,
                fontFamily: style.typography.font,
                fontSize: style.typography.body,
                borderColor: style.colors.border,
                ...main
            };
        },
        button() {
            const button = this.activeStyle.components.button || {}
            const main = this.main
            return { ...main, ...button }
        }
    },
    methods: {
        duplicateStyle(name, newName) {
            const style = this.styles[name];
            if (!style) return;

            const newStyleName = newName || `${name}${lodash.keys(this.styles).length}`;
            this.styles[newStyleName] = lodash.cloneDeep(style);
        },
        configureStyle(name, property, value) {
            const style = this.styles[name];
            if(!style) {
                return console.error(`no such style with name ${name}`)
            }

            if (style[property] === undefined)
                return console.error(`style has no such property ${property}`)

            if (toString.call(value) === '[object Object]') {
                const styleProperty = style[property];
                lodash.each(value, (v, k) => {
                    if (styleProperty[k] !== undefined)
                        Vue.set(styleProperty, k, v);
                    else
                        console.error(`No such property ${property}.${k}`)
                });
                return true
            }

            Vue.set(style, property, value);
            return true
        },
        setActiveStyle(name) {
            if (this.styles[name]) this.activeStyleName = name;
        },
    },
});

const SVCStyleSingleton = new SVCStyle({});
window.style = SVCStyleSingleton

export default SVCStyleSingleton;
