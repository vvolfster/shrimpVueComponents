<template>
    <div>
        HELLO BOYZ
    </div>
</template>

<script>
import fbAuthPlugin from '@/vuePlugins/firebaseAuthentication'
import Vue from 'vue'
import lodash from 'lodash'
import fbconf from '../fbAdminPanel/fbconf'

Vue.use(fbAuthPlugin, {
    fbConfig: lodash.assign({
        // requiresAuth: true,
        createNewUsers: true, // defaults to true. SignUp if user don't exist
        userRequirement(user) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    return typeof user.email === 'string' && user.email.toLowerCase().endsWith('@iii.global') ? resolve() : reject(`User's email must be from iii.global`)
                }, 1000)
            })
        },
    }, fbconf.db),
    masterAuthConfig: lodash.assign({
        remoteRestAuthLinkFunction: 'https://us-central1-studiiio-9274f.cloudfunctions.net/remoteRestAuthLink' // sends params ({ projectId, token, email })
    }, fbconf.master),
})

export default {
    data() {
        return {
            requiresAuth: true
        }
    }
}
</script>

<style scoped>

</style>
