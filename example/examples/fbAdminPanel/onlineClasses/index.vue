<template>
    <div>
        <fbAdminPanel :fbConfig="fbConfig"  :tableConfig="tableConfig" :tables="tables" :defaultTable="defaultTable">
            <!-- 
                <openHousePosting slot="test"/>
            -->
        </fbAdminPanel>
    </div>
</template>

<script>
// import lodash from 'lodash'
import fbAdminPanel from '@/bigTools/firebaseAdminPanel'
import courseDelegate from './delegates/course'

export default {
    components: { fbAdminPanel },
    data() {
        return {
            fbConfig: {
                apiKey: "AIzaSyDmVAb3NHQVZTbwUt6ZniHqUEkazhmyouQ",
                authDomain: "online-classes.firebaseapp.com",
                databaseURL: "https://online-classes.firebaseio.com",
                projectId: "online-classes",
                storageBucket: "online-classes.appspot.com",
                messagingSenderId: "876864205295",
                // custom key
                requiresAuth: true,
            },
            tables: ['courses'],
            defaultTable: 'courses',
            tableConfig: {
                pageSize: 25,
                courses: {
                    storageKey: "storage",
                    delegateComponent: courseDelegate,
                },
            }
        }
    }
}
</script>
