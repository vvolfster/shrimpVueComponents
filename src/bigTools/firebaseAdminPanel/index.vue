<template>
    <div class="fbAdminPanel">
        <div v-if="fbConfig && fbConfig.requiresAuth && !username" class="fbAdminPanelLogin">
            <button @click="fbConfigChanged()" class="fbAdminPanelLoginBtn">Login</button>
            <br>
            Your Firebase config requires you log in.
        </div>
        <div v-else>
            <div class="fbAdminPanel__topBar">
                <button class="topBar__user" @click="login">
                    {{ username || "Login..." }}
                </button>
                <navigation :tables="fb.tables" :pageSize="tableConfig.pageSize || 25" @pageLoaded="currentPage = $event" class="topBar__navigation"/>
            </div>
            <tableEditor 
                :tableConfig="currentTableConfig"
                :page="currentPage"
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

export default {
    components: { navigation, tableEditor },
    props: ["fbConfig", "tableConfig"],
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
            username: null,
            currentPage: null
        }
    },
    beforeDestroy() {
        fbase.close();
    },
    mounted() {
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
    },
    methods: {
        fbConfigChanged() {
            const self = this;
            const fb   = this.fb;
            const fbConfig = this.fbConfig;
            function clearData(err) {
                return new Promise((resolve) => {
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

            return new Promise((resolve) => {
                if(!fbConfig)
                    return clearData().then(resolve)

                return fbase.initFb(fbConfig).then(({ app, database, auth, messaging, storage, tables }) => {
                    // console.log(`app initialized`)
                    fb.app = app;
                    fb.database = database;
                    fb.auth = auth;
                    fb.messaging = messaging;
                    fb.storage = storage;
                    fb.tables = tables;
                    fb.auth.onAuthStateChanged((authe) => {
                        self.username = authe ? (authe.displayName || authe.email) : null
                    })
                }).catch(clearData)
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
