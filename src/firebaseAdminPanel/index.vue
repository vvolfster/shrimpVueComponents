<template>
    <div class="fbAdminPanel" style="height:90vh;">
        <div>
            <button v-if="fbConfig && fbConfig.requiresAuth && !fb.app" @click="fbConfigChanged()">Login</button>
        </div>
        <navigation
            :tables="fb.tables"
            :pageSize="tableConfig.pageSize || 25"
            @pageLoaded="currentPage = $event"
            class="tableSelector"
        />
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
                }).catch(clearData)
            })
        }
    }
}
</script>

<style scoped>
.fbAdminPanel {
    /* overflow-y: hidden; */
}

.tableSelector {
    padding: 0;
    margin: 0;
    height: 5vh;
}

.tableEditor {
    width: 100%;
    padding: 5px;
    /* take the height of the parent & subtract tableSelector's height from it */
    /* height: calc(100% - 5vh); */
}
</style>
