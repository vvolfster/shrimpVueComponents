<template>
    <div>
        <button @click.stop="getConfig">Set Firebase Config</button>
    </div>
</template>

<script>
import fbAuthPlugin from '@/vuePlugins/firebaseAuthentication'
import fbConfig from '../fbAdminPanel/fbConfig'
import Vue from 'vue'

export default {
    data() {
        return {
            requiresAuth: true,
            config: {
                fbConfig: null
            }
        }
    },
    mounted() {
        this.getConfig();
    },
    methods: {
        getConfig(){
            const self = this;
            fbConfig.getConf().then((conf) => {
                self.config.fbConfig = conf;
            })
        },
        loadPlugin() {
            Vue.use(fbAuthPlugin, {
                fbConfig: this.config.fbConfig,
                // masterAuthConfig: fbconf.master,
                createNewUsers: true, // defaults to true. SignUp if user don't exist
                // authRequired(user) {
                //     return new Promise((resolve, reject) => {
                //         setTimeout(() => {
                //             return typeof user.email === 'string' && user.email.toLowerCase().endsWith('@iii.global') ? resolve() : reject(`User's email must be from iii.global`)
                //         }, 1000)
                //     })
                // },
                signInOptions: ['email', "google"],
                remoteRestAuthLinkFunction: 'https://us-central1-studiiio-9274f.cloudfunctions.net/remoteRestAuthLink' // sends params ({ projectId, token, email })
            })
        }
    },

}
</script>

<style scoped>

</style>
