<template>
    <div class="row justify-between">
        <q-select :options="uitables" v-model="input_table" placeholder="Select a table" style="margin-right:1vw;"/>
        <q-pagination v-model="input_page" :max="totalPages" v-show="totalPages > 0" style="margin-left:1vw;"/>
    </div>
</template>

<script>
import lodash from 'lodash'
import fbase from '../fbase'

export default {
    props: ["tables", "pageSize"],
    data() {
        return {
            input_table: "",
            input_page: -1,
            ids: null,

            unsubFn: null
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
                const endingIdx = Math.min(ids.length - 1, startingIdx + pageSize)
                const slice = self.ids.slice(startingIdx, endingIdx);
                pages.push(slice);
            })
            return pages;
        },
        selectedPage() {
            const self = this;
            const pageIdx = self.input_page >= 1 ? self.input_page - 1 : 0;
            return self.pages ? self.pages[pageIdx] : null;
        },
        uitables() {
            return lodash.reduce(this.tables, (a, v) => {
                a.push({ label: v, value: v })
                return a;
            }, [])
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
            const idx = self.input_page >= 1 ? self.input_page - 1 : 0;
            if(!isEqual) {
                this.$emit("pageLoaded", { ids, idx, name: this.input_table });
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
            .then(this.createSubscriptions);
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
                self.input_page = numIds === 0 ? -1 : 1;
                // console.log(`resolve initPages`)
                resolve();
            })
        },
        createSubscriptions() {
            const self = this;
            return new Promise((resolve, reject) => {
                const subscriptions =  {
                    child_added(snap) {
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
