<template>
    <div style="position:relative;overflow-y:auto;">

        <div v-if="page">
            <!-- if a custom delegate component is provided, we will just use a list of that component instead of the default table view -->
            <tableView v-if="!delegateComponent" class="ztable" style="margin:auto;"
                :columns="columns"
                :page="page"
                :pageData="pageData"
                :actions="actionsTableRoot"
                :hasMenu="hasDetailView"
                :hasDelete="tableConfig ? !tableConfig.noDelete : true"

                @callAction="callTableRootAction($event.name)"
                @openDetailView="openDetailView($event.id, $event.entry, pageFbRefs[$event.id])"
                @delete="remove($event.id)"
                @edit="edit($event.id, $event.field, $event.value)"
            >
            </tableView>
            <div v-else>
                <div class="ztableHeader--custom">
                    <button class="btn btn--tableHeaderCustom" v-for="(action,name) in actionsTableRoot" :key="name" @click="callTableRootAction(name)">
                        {{ name }}
                    </button>
                </div>
                <div style="position:relative;margin-bottom:10px;" v-for="(entry, id, index) in pageData" :key="id">
                    <collapsible :open="header.openMode">
                        <div class="componentHeader" slot="heading">
                            <div class="componentHeader__index">
                                #{{ (page.idx * page.pageSize) + index + 1  }}
                            </div>
                            <div v-if="typeof header.displayFn === 'function'">
                                {{ header.displayFn(entry) }}
                            </div>
                            <div class="componentHeader__actions">
                                <button class="btn btn--detail" @click="openDetailView(id, entry, pageFbRefs[id])" v-if="hasDetailView"><i class='fa fa-ellipsis-h'/></i></button>
                                <button v-if="!tableConfig.noDelete" class="btn btn--delete" @click="remove(id)"><i class='fa fa-trash'/></i></button>
                            </div>
                        </div>
                        <component 
                            :is="delegateComponent" 
                            :id="id" 
                            :value="entry" 
                            :fbRef="pageFbRefs && pageFbRefs[id] ? pageFbRefs[id] : null"
                            :navFn="navFn"
                            slot="content"
                        />
                    </collapsible>
                </div>
            </div>
        </div>
        <div v-else class="emptyDiv">
            Please select a table
        </div>
        
        
        <modal ref="magicModal" position="down">
            <div class="magicModal">
                <!-- actions -->
                <div class="magicModal__actions" v-if="typeof actions === 'object' && Object.keys(actions).length">
                    <h5>Actions</h5>
                    <button v-for="(action, name) in actions" :key="name" @click="performAction(name, selectedItem)" class="magicModal__button shrimpTabView__header">
                        {{ name }}
                    </button>
                </div>

                <!-- tabView -->
                <tabView headerScroll="scroll" headerPosition="left" class="magicModal__tabView">
                    <imageStorage ref="imageStorage" slot="tab" name="Storage"/>
                    <div ref="slotContainer" class="magicModal__slot" slot="tab" name="Custom">
                        <slot :name="page && page.name ? page.name : 'undefined'"/>
                    </div>
                </tabView>
            </div>
        </modal>

        <modal ref="busyModal">
            <div class="busyModal">
                <i class="fa fa-circle-o-notch busyModal__icon"></i>
                {{ busyMessage }}
            </div>
        </modal>

        <adder ref="adder" :steps="addSteps"/>
    </div>
</template>

<script>
    // import moment from 'moment'
    import lodash from 'lodash'
    import fbase from '../../fbase'
    import imageStorage from '../imageStorage'
    import tabView from '../../../../layout/tabView'
    import tableView from './tableView'
    import adder from './adder'
    import modal from '../../../../layout/modal'
    import Dialog from '../../../../layout/dialog'
    import collapsible from '../../../../misc/collapsible'
    

    const functions = {
        getColumns(data, storageKey) {
            if(!data)
                return [];

            const firstKey = lodash.keys(data)[0];
            if(!firstKey)
                return [];

            // prune deep data
            return lodash.reduce(data[firstKey], (a, v, k) => {
                if(k === storageKey)
                    return a;

                if(typeof v === 'object') {
                    a.push(`@${k}`);
                    return a;
                }

                a.push(k);
                return a;
            }, ["★"])
        },
        orderColumns(cols, colOrder) {
            if(!colOrder || toString.call(colOrder) !== '[object Array]')
                return cols;

            // otherwise, figure out indices of col
            const order = ["★"].concat(colOrder);
            return cols.sort((a, b) => {
                const aIdx = order.indexOf(a);
                const bIdx = order.indexOf(b);
                const aVal = aIdx !== -1 ? aIdx : colOrder.length;
                const bVal = bIdx !== -1 ? bIdx : colOrder.length;

                return aVal - bVal;
            })
        },
    }

    export default {
        components: { imageStorage, tabView, adder, tableView, modal, collapsible },
        props: ["page", "tableConfig", "navFn"],
        computed: {
            actions() {
                return this.tableConfig && this.tableConfig.actions ? this.tableConfig.actions : {}
            },
            actionsTableRoot() {
                if(!this.tableConfig)
                    return {};

                const obj = this.tableConfig.add ? { new: this.add } : {}
                return Object.assign(obj, this.tableConfig.actionsTableRoot || {});
            },
            columns() {
                const self = this;
                const tableConfig = self.tableConfig;
                const storageKey = tableConfig ? tableConfig.storageKey : false;
                const columnOrder = tableConfig ? tableConfig.columnOrder : false;

                const cols = functions.getColumns(self.pageData, storageKey);
                return typeof columnOrder === 'function' ? columnOrder(cols) : functions.orderColumns(cols, columnOrder);
            },
            addSteps() {
                return this.tableConfig ? this.tableConfig.add : null;
            },
            hasDetailView() {
                const self = this;
                const hasActions = (self.actions && Object.keys(self.actions).length > 0);
                const hasSlot = self.$slots && self.$slots.length > 0;
                const hasStorage = self.tableConfig && typeof self.tableConfig.storageKey === 'string' && self.tableConfig.storageKey !== ""
                return hasActions || hasSlot || hasStorage || false;
            },
            delegateComponent() {
                const self = this;
                if(!self.tableConfig)
                    return false;

                return self.tableConfig.delegateComponent || self.tableConfig.component || self.tableConfig.delegate || false;
            },
            header() {
                const tableConfig = this.tableConfig;
                let displayFn = null;
                let openMode = true;
                if(!tableConfig || !tableConfig.header)
                    return { displayFn, openMode }

                const header = tableConfig.header;
                if(typeof header === 'function'){
                    displayFn = tableConfig.header;
                    return { displayFn, openMode }
                }

                if(toString.call(header) === '[object Object]') {
                    const fn = header.fn || header.displayFn || header.handler || header.display
                    if(typeof fn === 'function')
                        displayFn = fn;
                    else if(typeof fn === 'string')
                        displayFn = v => v[fn] || 'N/A'

                    if(header.open !== undefined || header.openMode !== undefined || header.defaultOpen !== undefined)
                        openMode = header.open || header.defaultOpen || header.openMode

                    return { displayFn, openMode }
                }

                if(toString.call(header) === '[object Array]'){
                    const fn = header[0];
                    if(typeof fn === 'function')
                        displayFn = fn;
                    else if(typeof fn === 'string')
                        displayFn = v => v[fn] || 'N/A'

                    if(header[1] !== undefined)
                        openMode = header[1]

                    return { displayFn, openMode }
                }

                return { displayFn, openMode }
            }
        },
        data() {
            return {
                unsubFn: null,
                selectedItem: null,
                busyMessage: "",
                pageData: null,
                pageFbRefs: null,

                scrollInfo: {
                    listen: false,
                    object: null
                },
            }
        },
        watch: {
            page() {
                // console.log(`hey i got a new page`, this.page.ids);
                this.removeSubscriptions()
                .then(this.clearData)
                .then(this.getPageFbRefs)
                .then(this.createSubscriptions)
                .then(this.restoreScroll)
            }
        },
        beforeDestroy() {
            this.removeSubscriptions();
            document.removeEventListener('scroll', this.scrollHandler, true);
        },
        mounted() {
            document.addEventListener('scroll', this.scrollHandler, true);
            if(!this.page)
                return;

            this.removeSubscriptions()
            .then(this.getPageFbRefs)
            .then(this.createSubscriptions)
            .then(this.restoreScroll)
            .then(this.turnInitFlagOn);
        },
        methods: {
            // initiation flow
            clearData() {
                const self = this;
                return new Promise((resolve) => {
                    self.scrollInfo.listen = false;
                    self.pageData = null;
                    self.pageFbRefs = null;
                    resolve();
                })
            },
            getPageFbRefs(idArray) {
                const self = this;
                return new Promise((resolve, reject) => {
                    if(!self.page)
                        return reject("tableEditor::getRefs : page input is missing");

                    const ids = idArray || self.page.ids;
                    const name = self.page.name;
                    return fbase.getTableRef(name).then((ref) => {
                        if(!self.pageFbRefs)
                            self.pageFbRefs = {};

                        lodash.each(ids, (id) => {
                            self.$set(self.pageFbRefs, id, ref.child(id));
                        })

                        resolve();
                    }).catch(reject);
                })
            },
            createSubscriptions() {
                const self = this;
                return new Promise((resolve, reject) => {
                    if(!self.page)
                        return reject("tableEditor::createSubscriptions : page input is missing to create subcriptions on")

                    const ids = self.page.ids;
                    const name = self.page.name;
                    const subscribedFunctionList = {}

                    function setValue(id, value) {
                        if(!self.pageData)
                            self.pageData = {}

                        self.$set(self.pageData, id, value);
                        // self.getRefs([id])
                    }

                    return fbase.getTableRef(name).then((ref) => {
                        lodash.each(ids, (id) => {
                            const fn = snap => setValue(id, snap.val());
                            ref.child(id).on("value", fn);
                            subscribedFunctionList[id] = fn;
                        })

                        // after we have made all the subcriptions. we must create a remove subscription fn
                        self.unsubFn = () => {
                            lodash.each(subscribedFunctionList, (fn, id) => {
                                ref.child(id).off('value', fn);
                            })
                        }

                        resolve();
                    }).catch(reject);
                })
            },
            removeSubscriptions() {
                return new Promise((resolve) => {
                    const self = this;
                    if(typeof self.unsubFn === 'function'){
                        self.unsubFn();
                        self.unsubFn = null;
                    }
                    resolve();
                })
            },

            // detail modal related
            openDetailView(id, value, fbRef) {
                const self = this;
                const name = this.page.name;
                const storageKey = lodash.get(this.tableConfig, "storageKey");
                const magicModal = lodash.get(self.$refs, "magicModal");
                const slot = lodash.get(self.$refs, "slotContainer.firstChild.firstChild"); // we added a child from index.vue
                const customSlotVue = lodash.get(slot, "__vue__");
                if(!magicModal)
                    return;

                self.selectedItem = { id, value, name, storageKey, fbRef }
                if(customSlotVue && typeof customSlotVue.init === 'function')
                    customSlotVue.init(self.selectedItem);

                magicModal.open();
                if(self.$refs.imageStorage)
                    self.$refs.imageStorage.init({ name, id, storageKey });
            },
            performAction(name, selectedItem) {
                const action = this.actions[name];
                const id = selectedItem.id;
                const value = selectedItem.value;

                this.busyMessage = `Peforming ${name}. Please wait...`
                this.$refs.busyModal.open();

                Promise.resolve(action(id, value, this.navFn)).then((msg) => {
                    console.warn(msg);
                    this.$refs.busyModal.close();
                }).catch((err) => {
                    console.error(err);
                    this.$refs.busyModal.close();
                })
            },

            // db opts
            edit(id, field, currentValue) {
                const self = this;
                return new Promise((resolve, reject) => {
                    if(!self.page.name)
                        return reject("no table name set to set value on");

                    if(!id || !field)
                        return reject("ID or Field missing on edit");

                    if(field.charAt(0) === '@')
                        return resolve();

                    return fbase.getTableRef(self.page.name).then((ref) => {
                        Dialog.create({
                            title: `Change ${field}`,
                            form: {
                                value: {
                                    model: currentValue,
                                    type: String,
                                    label: field
                                }
                            },
                            buttons: {
                                Submit({ value }) {
                                    ref.child(id).child(field).set(value)
                                    .then(() => {
                                        resolve();
                                    })
                                    .catch(reject);
                                }
                            },
                            style: "min-width: 50vw;"
                        })
                    }).catch(reject);
                })
            },
            remove(id) {
                const self = this;
                return new Promise((resolve, reject) => {
                    const name = lodash.get(self, "page.name");
                    if(!name)
                        return reject("no page.name when deleting")

                    return fbase.getTableRef(self.page.name).then((ref) => {
                        ref.child(id).remove().then(resolve).catch(reject);
                    }).catch(reject);
                })
            },

            // db opts table root
            add() {
                const self = this;
                return new Promise((resolve, reject) => {
                    const adderRef = self.$refs.adder;
                    const tblName = lodash.get(self, "page.name");
                    if(!adderRef || !tblName || typeof adderRef.start !== 'function')
                        return reject("no pageName or adderRef or adderRef.start is not a function");

                    return adderRef.start().then((val) => {
                        // console.log(val);
                        fbase.getTableRef(tblName).then((ref) => {
                            ref.push(val);
                        }).catch(reject);
                    }).catch(reject);
                })
            },
            // call table root action. add() is added to the computed property actionsTableRoot
            callTableRootAction(name) {
                const self = this;
                const pageName = lodash.get(self, "page.name");
                return new Promise((resolve, reject) => {
                    const action = lodash.get(self.actionsTableRoot, name);
                    if(!pageName)
                        return reject(`no table. Cannot call action`)

                    if(!lodash.isFunction(action))
                        return reject(`no such action to call: ${name}`);

                    return fbase.getTableRef(pageName).then((ref) => {
                        Promise.resolve(action(ref)).then(resolve).catch(reject);
                    }).catch(reject);
                })
            },

            // scroll related
            scrollHandler(e) {
                const self = this;
                if(!self.scrollInfo.listen)
                    return;

                const pageName = self.page && self.page.name ? self.page.name : null;
                const pageIdx = self.page && self.page.idx >= 0 ? self.page.idx : 0;

                // console.log(`update`, e.srcElement.scrollTop)
                self.$set(self.scrollInfo, "object", {
                    pageName,
                    pageIdx,
                    srcElement: e.srcElement,
                    scrollTop: e.srcElement.scrollTop,
                })
            },
            restoreScroll() {
                const self = this;
                return new Promise((resolve) => {
                    // console.log(`scrollinfo is`, self.scrollInfo);
                    const pageName = lodash.get(self, "page.name");
                    const pageIdx = lodash.get(self, "page.idx");
                    const scrollObject = self.scrollInfo.object;
                    if(!scrollObject) {
                        self.scrollInfo.listen = true;
                        return resolve();
                    }

                    // console.log(pageName, scrollObject.pageName, "-----", pageIdx, scrollObject.pageIdx, scrollObject.scrollTop);
                    if(pageName === scrollObject.pageName && pageIdx === scrollObject.pageIdx) {
                        // we must restore!
                        const srcEl = scrollObject.srcElement;
                        if(srcEl) {
                            srcEl.scrollTop = scrollObject.scrollTop;
                        }
                    }

                    self.scrollInfo.listen = true;
                    return resolve();
                })
            },

            // useful function if we need it later
            // loadStorage(value) {
            //     const self = this;
            //     const tableConfig = self.tableConfig;
            //     return new Promise((resolve, reject) => {
            //         if(!tableConfig)
            //             return reject("no tableconfig")

            //         if(!tableConfig.storageKey)
            //             return resolve({})

            //         const storage = value[tableConfig.storageKey];
            //         if(!storage)
            //             return resolve({});

            //         if(typeof storage === 'string') {
            //             return fbase.getStorageUrl(storage).then((url) => {
            //                 resolve({ default: url })
            //             })
            //         }

            //         // generate an array of promises to fetch all the urls in this thing's storage
            //         const promises = lodash.reduce(storage, (a, path) => {
            //             const p = new Promise((resolve, reject) => {
            //                 return fbase.getStorageUrl(path).then((url) => {
            //                     resolve({ path, url })
            //                 }).catch(reject);
            //             })
            //             a.push(p);
            //             return a;
            //         }, []);

            //         // wait till all promises are done
            //         return Promise.all(promises).then((results) => {
            //             const data = lodash.reduce(results, (a, resultItem) => {
            //                 a[resultItem.path] = resultItem.url;
            //                 return a;
            //             }, {})
            //             // call the big resolve
            //             resolve(data);
            //         }).catch(reject);
            //     })
            // },
        }
    }
</script>

<style scoped>
/* customComponent css */
.emptyDiv {
    font-size: 20px;
    color: gray;
    flex-flow: column;
}

.componentHeader {
    display: flex;
    background-color: #42b983;
    text-transform: uppercase;
    color: white;
    height: 50px;
    position: relative;
    align-items: center;
    justify-content: space-between;
    padding-left: 5px;
    padding-right: 5px;
    border: solid 1px black;
    margin-top: 5px;
}

.componentHeader__index {
    font-size: 20px;
}

.componentHeader__actions {
    border-width: 0 0 0 1px;
    padding-left: 5px;
    border-style: solid;
    border-color: white;
}

/* button css */
.btn {
    border: solid 1px;
}

.btn--delete {
    background-color: red;
    color: white;
    border-color: black;
}

.btn--deleteCustom {
    background-color: rgba(255, 0, 0, 0.5);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    
    font-size: 15px;
    
    text-align: center;
   
    position: absolute;
    bottom: 2px;
    right: 2px;
}

.btn--tableHeader {
    border-style: solid;
    border-width: 0 0 0 1px;
    height: 100%;
}

.btn--tableHeaderCustom {
    border: solid 1px black;
    height: 100%;
    display: flex;
    align-items: center;
    background-color: #42b983;
}

.idx {
    min-width: unset;
}

/* modal css */
.magicModal {
    display: flex;
    width: 100vw;
    height: 50vh;
    overflow-y: hidden;
}

.magicModal__actions {
    border-top: solid 1px lightgray;
    display: flex;
    flex-flow: column;
    align-items: left;
    flex: 0 0 10vw;
    padding-left: 10px;
    margin-right: 10px;
    overflow-y: auto;
}

.magicModal__actions::-webkit-scrollbar{
    width: 14px;
    height: 10px;
}

.magicModal__actions::-webkit-scrollbar-thumb {
    height: 6px;
    border: 4px solid rgba(0, 0, 0, 0);
    background-clip: padding-box;
    border-radius: 7px;
    -webkit-border-radius: 7px;
    background-color: rgba(0, 0, 0, 0.5);
}

.magicModal__button {
    width: 8vw;
    text-align: left;
}

.magicModal__tabView {
    flex: 1 1 auto;
    border-width: 0 0 0 1px;
    border-style: solid;
    border-color: gray;
}

/* busy modal when performing some action css */
.busyModal {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20pt;
}
.busyModal__icon {
    -webkit-animation:spin 1s linear infinite;
    -moz-animation:spin 1s linear infinite;
    animation:spin 1s linear infinite;
    color: lightskyblue;
    font-size: 50pt;
    margin-bottom: 10px;
}

.ztableHeader--custom {
    align-items: center;
    justify-content: start;
    background: transparent;    
    text-transform: uppercase;
    color: white;
    height: 40px;
    position: relative;
    display: flex;
}

@-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
@-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
@keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }

</style>
