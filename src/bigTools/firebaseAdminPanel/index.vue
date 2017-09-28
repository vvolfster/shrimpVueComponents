<template>
    <div class="fbAdminPanel">
        <div v-if="fbConfig && fbConfig.requiresAuth && !username" class="fbAdminPanelLogin">
            <button @click="fbConfigChanged()" class="fbAdminPanelLoginBtn">Login</button>
            <br>
            Your Firebase config requires you log in.
        </div>
        <div v-else>
            <div class="flexrow items-center nowrap grey darken-3 white-text">
                <button class="btn self-center margin-left white black-text text-no-transform" @click="login">
                    <i class='fa fa-user'/>
                    {{ username || "Login..." }}
                </button>
                <navigation 
                    ref="navigation"
                    :tables="computedTables"
                    :pageSize="tableConfig.pageSize || 25" @pageLoaded="currentPage = $event"
                    class="topBar__navigation"
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
// import lodash from 'lodash'
import fbase from './fbase'
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
    props: ["fbConfig", "tableConfig", "tables", "defaultTable"],
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
        }
    },
    beforeDestroy() {
        fbase.close();
    },
    mounted() {
        this.urlParams.table = getURLParameter('table')
        this.urlParams.id = getURLParameter('id')
        // console.log(`params`, this.urlParams.table, this.urlParams.id);
        this.fbConfigChanged();
    },
    watch: {
        fbConfig() {
            this.fbConfigChanged();
        }
    },
    computed: {
        currentTableConfig() {
            if(!this.tableConfig || !this.currentPage)
                return null;

            return this.tableConfig[this.currentPage.name];
        },
        computedTables() {
            const fb = this.fb;
            const tables = this.tables;
            if(fb && fb.tables) {
                if(!tables)
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
        fbConfigChanged() {
            const self = this;
            const fb   = this.fb;
            const fbConfig = this.fbConfig;
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
                return new Promise((resolve) => {
                    fb.app = app;
                    fb.database = database;
                    fb.auth = auth;
                    fb.messaging = messaging;
                    fb.storage = storage;
                    fb.tables = tables;
                    fb.auth.onAuthStateChanged((authe) => {
                        self.username = authe ? (authe.displayName || authe.email) : null
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
                if(!fbConfig)
                    return clearData().then(resolve)

                return fbase.initFb(fbConfig).then(initInstance).then(readUrlParams).catch(clearData)
            })
        },
        login() {
            return new Promise((resolve, reject) => {
                fbase.signOut().then(this.fbConfigChanged).then(resolve).catch(reject);
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
