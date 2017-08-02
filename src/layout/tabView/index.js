import Vue from 'vue'
import lodash from 'lodash'
import "./tabView.css"

/* eslint-disable prefer-spread */
const renderFactory = {
    headers(createElement, names, vm) {
        const centeringStyle =  {
            tbl: {
                display: "table",
                "text-align": "center",
                width: "100%",
                height: "100%"
            },
            tblCell: {
                display: "table-cell",
                "vertical-align": "middle",
            }
        }

        const containerClass = {
            shrimpTabView__headerContainer: true,
            "shrimpTabView__headerContainer--scrolling": vm.headerScroll === 'scroll',
            "shrimpTabView__headerContainer--fit": vm.headerScroll === 'fit',
            "shrimpTabView__headerContainer--wrap": vm.headerScroll === 'wrap',
            "shrimpTabView__headerContainer--left": vm.headerPosition === 'left',
            "shrimpTabView__headerContainer--center": vm.headerPosition === 'center',
            "shrimpTabView__headerContainer--right": vm.headerPosition === 'right',
        }

        return createElement('div', { class: containerClass },
            Array.apply(null, { length: names.length }).map((v, idx) => {
                const name = names[idx];
                const hClass = {
                    shrimpTabView__header: true,
                    'shrimpTabView__header--active': vm.idx === idx,
                    "shrimpTabView__header--fixedSize": vm.headerScroll !== 'fit',
                }
                const hStyle = vm.headerStyle || {}

                return createElement('div', { class: hClass, style: hStyle, on: { click() { vm.idx = idx; } } }, [
                    createElement('div', { style: centeringStyle.tbl }, [
                        createElement('div', { style: centeringStyle.tblCell }, name)
                    ])
                ])
            })
        )
    },
    tab(createElement, tabs, activeTab) {
        // we are only changing display to none of non active tabs. this will retain state information
        // of the tab. it wont destroy it?
        return createElement("div", { class: { shrimpTabView__tab: true } }, [
            Array.apply(null, { length: tabs.length }).map((v, idx) => {
                const tab = tabs[idx];
                const style = activeTab === tab ? {} : { display: "none" }
                return createElement('div', { style }, [tab]);
            })
        ]);
    }
}


export default Vue.component('tabview',  {
    props: {
        index: {
            type: Number,
            default: 0,
        },
        headerScroll: {
            type: String,
            default: "fit",
            validator(v) {
                return ["fit", "scroll", "wrap"].indexOf(v) !== -1
            }
        },
        headerPosition: {
            type: String,
            default: "center",
            validator(v) {
                return ["left", "center", "right"].indexOf(v) !== -1
            }
        },
    },
    data() {
        return {
            idx: 0,
        }
    },
    mounted() {
        this.idx = this.index;
    },
    watch: {
        index() {
            this.idx = this.index;
        },
        idx() {
            this.$emit('indexChanged', this.idx);
        }
    },
    methods: {
        next() {
            this.goTo(this.idx + 1);
        },
        prev() {
            this.goTo(this.idx - 1);
        },
        goTo(idx) {
            const tabSlots = this.$slots.tab;
            if(idx >= 0 && idx < tabSlots.length) {
                this.idx = idx;
            }
        }
    },
    render(createElement) {
        // const self = this;
        const vm = this;
        const tabSlots = vm.$slots.tab;
        const activeTab = tabSlots && tabSlots.length ? tabSlots[vm.idx] || tabSlots[0] : null;
        const tabNames = lodash.reduce(tabSlots, (a, v) => {
            const name = lodash.get(v, "data.attrs.name", "Tab");
            a.push(name);
            return a;
        }, []);

        // console.log(activeTab, tabSlots);
        if(!activeTab) {
            return createElement("div", { class: { shrimpTabView: true } }, [])
        }

        return createElement("div", {
            class: {
                shrimpTabView: true
            },
        }, [
            renderFactory.headers(createElement, tabNames, vm),
            renderFactory.tab(createElement, tabSlots, activeTab),
        ]);
    }
})
