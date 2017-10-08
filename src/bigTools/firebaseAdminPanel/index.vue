<template>
    <div class="fbAdminPanel">
        <div v-if="fbConfig && fbConfig.requiresAuth && !username" class="fbAdminPanelLogin">
            <button @click="configChanged()" class="svtbtn fbAdminPanelLoginBtn">Login</button>
            <br>
            Your Firebase config requires you log in.
        </div>
        <div v-else>
            <div class="row items-center nowrap bg-grey-4">
                <div class="row items-center">
                    <button class="svtbtn self-center margin-left white black-text text-no-transform" @click="login">
                        <i class='svti fa fa-user'/>
                        {{ username || "Login..." }}
                    </button>
                    <button
                        class="svtbtn self-center margin-left white black-text text-no-transform"
                        @click="$refs && $refs.navigation ? $refs.navigation.tableChanged() : null"
                    >
                        <i class="svti fa fa-refresh"/>
                        Refresh
                    </button>
                </div>
                <navigation 
                    ref="navigation"
                    :tables="computedTables"
                    :pageSize="!tableConfig ? 25 : (tableConfig.pageSize || 25)" @pageLoaded="currentPage = $event"
                    class="topBar__navigation"
                    :canAdd="tableConfig && typeof tableConfig.canAdd === 'boolean' ? tableConfig.canAdd : true"
                    :canRemove="tableConfig && typeof tableConfig.canRemove === 'boolean' ? tableConfig.canRemove : true"
                    @add="handleTableAddition()"
                    @remove="handleTableRemoval($event)"
                />
            </div>
            <tableEditor 
                :tableConfig="currentTableConfig"
                :page="currentPage"
                :navFn="$refs.navigation ? $refs.navigation.toTable : null"
                class="tableEditor"
            >
                <div :slot="currentPage ? currentPage.name : 'undefined'">
                    <slot :name="currentPage ? currentPage.name : 'undefined'"/>
                </div>
            </tableEditor>
        </div>
    </div>
</template>

<script>
import lodash from 'lodash'
import fbase from './fbase'
import Dialog from '../../layout/dialog'
import tableEditor from "./components/tableEditor"
import navigation from './components/navigation'
import '../../../cssImporter'

function getURLParameter(name) {
    /* eslint-disable prefer-template */
    /* eslint-disable no-useless-concat */
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

export default {
    components: { navigation, tableEditor },
    // props: ["fbConfig", "tableConfig", "tables", "defaultTable"],
    props: {
        config: {
            type: [Object, null],
            default() {
                return null;
            },
        }
    },
    data() {
        return {
            fb: {
                app: null,
                database: null,
                auth: null,
                messaging: null,
                storage: null,
                tables: null,
            },
            urlParams: {
                table: null,
                id: null
            },
            username: null,
            currentPage: null,
            isReady: false,
            unsubberFn: null
        }
    },
    beforeDestroy() {
        if(typeof this.unsubberFn === 'function')
            this.unsubberFn();

        fbase.close();
    },
    mounted() {
        this.urlParams.table = getURLParameter('table')
        this.urlParams.id = getURLParameter('id')
        // console.log(`params`, this.urlParams.table, this.urlParams.id);
        this.configChanged();
    },
    watch: {
        config: "configChanged"
    },
    computed: {
        fbConfig() {
            const conf = this.config;
            if(conf && toString.call(conf.fbConfig) === '[object Object]')
                return conf.fbConfig;
            return null;
        },
        authConfig() {
            const conf = this.config;
            const authConf = !conf ? null : (conf.authConfig || conf.masterAuthConfig)
            if(toString.call(authConf) === '[object Object]')
                return authConf;
            return null;
        },
        tableConfig() {
            const conf = this.config;
            return conf ? (conf.tableConfig || null) : null;
        },
        tables() {
            const conf = this.config;
            return conf ? (conf.tables || null) : null;
        },
        defaultTable() {
            const conf = this.config;
            return conf ? (conf.defaultTable || null) : null;
        },
        currentTableConfig() {
            if(!this.tableConfig || !this.currentPage)
                return null;

            return this.tableConfig[this.currentPage.name];
        },
        computedTables() {
            const fb = this.fb;
            const tables = this.tables;
            if(fb && fb.tables) {
                if(toString.call(tables) !== '[object Array]')
                    return fb.tables;

                // only return the tables present in the tables property
                const ret = [];
                fb.tables.forEach((table) => {
                    if(tables.indexOf(table) !== -1)
                        ret.push(table)
                })
                return ret;
            }
            return null;
        }
    },
    methods: {
        configChanged() {
            const self = this;
            const fb   = this.fb;

            if(typeof this.unsubberFn === 'function'){
                this.unsubberFn();
                this.unsubberFn = null;
            }

            function clearData(err) {
                return new Promise((resolve) => {
                    self.isReady = false;
                    if(err)
                        console.error("Error when initializing fb app", err);

                    fb.app = null;
                    fb.database = null;
                    fb.auth = null;
                    fb.messaging = null;
                    fb.storage = null;
                    fb.tables = null;
                    resolve();
                })
            }

            function initInstance({ app, database, auth, messaging, storage, tables }) {
                // console.log(`init fb resolved`)
                return new Promise((resolve) => {
                    fb.app = app;
                    fb.database = database;
                    fb.auth = auth;
                    fb.messaging = messaging;
                    fb.storage = storage;
                    fb.tables = tables;
                    self.unsubberFn = fb.auth.onAuthStateChanged((authe) => {
                        if(self){
                            if(!authe){
                                self.username = null;
                            }
                            else {
                                const uid = authe.uid;
                                const username = authe ? (authe.displayName || authe.email) : null
                                if(username){
                                    self.username = username;
                                }
                                else {
                                    fb.database.ref(`users/${uid}`).once('value').then((snap) => {
                                        const dbUser = snap.val();
                                        if(!dbUser)
                                            self.username = uid;
                                        else {
                                            const f = dbUser.firstName || dbUser.first;
                                            const l = dbUser.lastName || dbUser.last;
                                            const e = dbUser.email;
                                            const d = dbUser.displayName;

                                            if(f || l)  self.username = `${f} ${l}`
                                            else if(d)  self.username = d
                                            else if(e)  self.username = e;
                                            else        self.username = uid;
                                        }
                                    })
                                }
                            }
                        }
                    })

                    resolve();
                })
            }

            function readUrlParams() {
                return new Promise((resolve) => {
                    if(self.urlParams.table && self.$refs.navigation) {
                        self.$refs.navigation.toTable(self.urlParams.table, self.urlParams.id);
                    }
                    else if(self.defaultTable && self.$refs.navigation) {
                        self.$refs.navigation.toTable(self.defaultTable);
                    }

                    return resolve();
                })
            }

            return new Promise((resolve) => {
                if(!self.config)
                    return clearData().then(resolve)

                const tableKeys = ['tableConfig', 'tables', 'defaultTable'];
                const conf = lodash.pickBy(self.config, (v, k) => tableKeys.indexOf(k) === -1)
                // console.log(`passing this to fbase.js`, conf)
                return fbase.initFb(conf).then(initInstance).then(readUrlParams).catch(clearData)
            })
        },
        handleTableRemoval(name){
            const self = this;
            Dialog.create({
                title: `Delete ${name}`,
                description: `Are you sure?`,
                buttons: {
                    Yes() {
                        return new Promise((resolve, reject) => {
                            fbase.getTableRef(name).then((ref) => {
                                ref.remove()
                                .then(fbase.updateTableNames)
                                .then((tables) => {
                                    self.fb.tables = tables;
                                    resolve();
                                })
                                .catch(reject);
                            }).catch(reject);
                        })
                    },
                    No() {},
                }
            })
        },
        handleTableAddition() {
            const self = this;
            Dialog.create({
                title: "Create New Table",
                form: {
                    title: {
                        type: String,
                        required: true
                    },
                    firstKeyOptional: String,
                    isEntireTable: Boolean,
                    firstObject: {
                        type: JSON,
                        required: true,
                        options: {
                            style: "min-width: 40vw;",
                            mode: "code"
                        }
                    },
                },
                buttons: {
                    Submit({ title, firstKeyOptional, isEntireTable, firstObject }){
                        return new Promise((resolve, reject) => {
                            function updateTables() {
                                fbase.updateTableNames().then((tables) => {
                                    self.fb.tables = tables;
                                    resolve();
                                })
                            }

                            fbase.getTableRef(title).then((ref) => {
                                ref.once('value').then((snap) => {
                                    if(snap.exists())
                                        return reject(`${title} already exists.`)

                                    if(isEntireTable)
                                        return ref.set(firstObject).then(updateTables).catch(reject);

                                    if(firstKeyOptional)
                                        return ref.set({ [firstKeyOptional]: firstObject }).then(updateTables).catch(reject);

                                    return ref.push(firstObject).then(updateTables).catch(reject);
                                })
                            })
                        })
                    }
                }
            })
        },
        login() {
            return new Promise((resolve, reject) => {
                fbase.signOut().then(this.configChanged).then(resolve).catch(reject);
            })
        }
    }
}
</script>

<style scoped>
.fbAdminPanel {
    /* overflow-y: hidden; */
    height: 100vh;
}

.fbAdminPanel__topBar {
    display: flex;
    background: #945;
}

.topBar__user {
    background: transparent;
    color: white;
    font-size: 20px;
    text-transform: none;
}

.topBar__navigation {
    flex: 1 1 auto;
    border-width: 0 0 0 1px;
    border-style: solid;
    margin-left: 10px;
}

.fbAdminPanelLogin {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.fbAdminPanelLoginBtn {
    font-size: 40px;
    border: solid 1px;
    padding: 10px;
    border-radius: 10px;
    color: white;
    border-color: gray;
    background: #fa0;
}

.fbAdminPanelLoginBtn:hover {
    background: #5a0;
}



.tableEditor {
    width: 100%;
    padding: 5px;
    /* take the height of the parent & subtract tableSelector's height from it */
    /* height: calc(100% - 5vh); */
}
</style>
