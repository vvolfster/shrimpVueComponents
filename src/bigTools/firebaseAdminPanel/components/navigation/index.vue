<template>
    <div class="navigationBar" style="padding:5px;">
        <div class="row items-center">
            <combobox ref="combobox" :options="tables" @value="input_table = $event"/>
            <button 
                class="btn self-center margin-left white black-text text-no-transform"
                @click="$emit('add')"
            >
                <i class="fa fa-plus"/>
                Add
            </button>
            <button 
                v-if="input_table"
                class="btn self-center margin-left red black-text text-no-transform"
                @click="$emit('remove', input_table)"
            >
                <i class="fa fa-trash"/>
                Delete
            </button>
        </div>

        Firebase Admin Panel
        <pageControls ref="pageControls" :total="totalPages" @value="input_page = $event"/>
    </div>
</template>

<script>
import lodash from 'lodash'
import combobox from '../../../../input/combobox'
import fbase from '../../fbase'
import pageControls from "./pageControls"
import "../../../../../cssImporter"


export default {
    components: { combobox, pageControls },
    props: ["tables", "pageSize"],
    data() {
        return {
            input_table: "",
            input_page: -1,
            ids: null,

            unsubFn: null,
            tableChangeCb: null
        }
    },
    beforeDestroy() {
        this.removeSubscriptions();
    },
    mounted() {
        if(this.input_table)
            this.tableChanged();
    },
    computed: {
        totalPages() {
            const self = this;
            return self.ids && self.ids.length ? Math.ceil(self.ids.length / self.pageSize) : 0
        },
        pages() {
            const self = this;
            const ids = self.ids;
            const pageSize = self.pageSize;
            const totalPages = self.totalPages;
            const pages = [];
            lodash.times(totalPages, (idx) => {
                const startingIdx = Math.floor(idx * pageSize);
                const endingIdx = Math.min(ids.length, startingIdx + pageSize)
                const slice = self.ids.slice(startingIdx, endingIdx);
                pages.push(slice);
            })
            return pages;
        },
        selectedPage() {
            const self = this;
            const pageIdx = self.input_page;
            return self.pages ? self.pages[pageIdx] : null;
        },
    },
    watch: {
        input_table() {
            this.tableChanged();
        },
        pageSize() {
            this.initPages(); // auto gets pg 0
        },
        selectedPage(ids, oldIds) {
            const isEqual =  lodash.isEqualWith(ids, oldIds, (a, b) => { return a === b })
            const idx = this.input_page;
            const pageSize = this.pageSize;
            // console.log('idx', this.input_page);
            if(!isEqual) {
                this.$emit("pageLoaded", { ids, idx, pageSize, name: this.input_table });
            }
        }
    },
    methods: {
        clearData() {
            return new Promise((resolve) => {
                this.input_page = -1
                this.pageData = null
                this.ids = null
                resolve();
            })
        },
        tableChanged(){
            this.removeSubscriptions()
            .then(this.clearData)
            .then(this.getIds)
            .then(this.initPages)
            .then(this.createSubscriptions)
            .then(this.tableChangeCb);
        },

        getIds() {
            const self = this;
            const name = this.input_table;
            return new Promise((resolve, reject) => {
                if(!name) {
                    reject("navigation. No table name to get ids for");
                }
                else {
                    fbase.getTableKeys(name).then((ids) => {
                        self.ids = ids.sort();
                        resolve();
                    }).catch(reject);
                }
            })
        },
        initPages() {
            const self = this;
            const numIds = self.ids ? self.ids.length : 0;
            return new Promise((resolve) => {
                self.input_page = numIds === 0 ? -1 : 0;
                // console.log(`resolve initPages`)
                resolve();
            })
        },
        createSubscriptions() {
            const self = this;
            return new Promise((resolve, reject) => {
                const subscriptions =  {
                    child_added(snap) {
                        // console.log('child_added', snap.key);
                        if(lodash.isArray(self.ids)) {
                            const idx = self.ids.indexOf(snap.key);
                            if(idx === -1)
                                self.ids.push(snap.key);
                            // else
                            //     console.warn(snap.key, "already in data");
                        }
                        else {
                            self.ids = [snap.key];
                        }
                    },
                    child_removed(snap) {
                        if(!lodash.isArray(self.ids))
                            return;

                        const idx = self.ids.indexOf(snap.key);
                        if(idx !== -1) {
                            // console.log(`removed snap.key`, snap.key)
                            self.ids.splice(idx, 1);
                        }
                    }
                }

                return fbase.getTableRef(self.input_table).then((ref) => {
                    ref.limitToLast(1).on('child_added', subscriptions.child_added);
                    ref.on('child_removed', subscriptions.child_removed)
                    this.unsubFn = () => {
                        ref.limitToLast(1).off('child_added', subscriptions.child_added)
                        ref.off('child_removed', subscriptions.child_removed)
                    }
                    resolve();
                }).catch(reject);
            })
        },

        removeSubscriptions() {
            return new Promise((resolve) => {
                if(typeof this.unsubFn === 'function') {
                    this.unsubFn();
                    this.unsubFun = null;
                }
                resolve();
            })
        },

        toTable(table, id) {
            const self = this;
            function setTable() {
                if(self.$refs.combobox)
                    self.$refs.combobox.updateValue(table);
                else
                    self.input_table = table;
            }

            function setPage(idx) {
                if(self.$refs.pageControls)
                    self.$refs.pageControls.setIndex(idx)
                else
                    self.input_page = idx;
            }

            return new Promise((resolve, reject) => {
                // console.log("TABLES", JSON.stringify(self.tables), self.tables.indexOf(table), lodash.find(self.tables, t => t === table));
                if(self.tables.indexOf(table) === -1){
                    reject(`no such table ${table}`)
                    return;
                }

                if(!id) {
                    setTable(table);
                    resolve();
                    return;
                }

                self.tableChangeCb = () => {
                    self.tableChangeCb = null; // unsub self
                    const pg = lodash.findIndex(self.pages, page => page.indexOf(id) !== -1)
                    if(pg !== null && pg !== undefined)
                        setPage(pg);

                    resolve();
                }
                setTable(table);
            })
        }

        // getPage(number) {
        //     const self = this;
        //     const pageIdx = number >= 1 ? number - 1 : 0;
        //     // console.log('getPageIdx', pageIdx);
        //     return new Promise((resolve, reject) => {
        //         fbase.getTableRef(self.input_table).then((ref) => {
        //             if(!self.ids)
        //                 return reject("no ids to load data from");

        //             const startingKey = self.ids[pageIdx * self.pageSize];
        //             const query = ref.orderByKey().limitToFirst(self.pageSize).startAt(startingKey);
        //             return query.once('value').then((snap) => { self.pageData = snap.val(); }).catch(reject);
        //         }).catch(reject);
        //     })
        // },
    },
}
</script>

<style>
.navigationBar {
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: space-between;
    font-size: 20px;
    font-style: bold;
}
</style>
