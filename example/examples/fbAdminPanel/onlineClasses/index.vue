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
import segmentDelegate from './delegates/segment'
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
                users: {
                    columnOrder: ["first", "last", "age", "address"],
                    add: [
                        {
                            description: "First and Last",
                            fields: {
                                first: "String",
                                last: "String"
                            }
                        },
                        {
                            title: "Age and Gender",
                            fields: {
                                age: "Number",
                                gender: {
                                    type: "combo",
                                    options: ["Male", "Female", "Other"]
                                }
                            }
                        },
                        {
                            title: "Address",
                            fields: {
                                address: "String",
                                city: "String",
                                state: "String",
                                zip: "Number"
                            }
                        }
                    ],
                    // fields: {
                    //     siblings: {
                    //         linksTo: 'data',
                    //         render(v) {
                    //             return v.name;
                    //         }
                    //     }
                    // },
                    noDelete: true,
                },
                courses: {
                    storageKey: "storage",
                    delegateComponent: courseDelegate,
                },
                segments: {
                    storageKey: "storage",
                    delegateComponent: segmentDelegate,
                    noDelete: true,
                },
            }
        }
    }
}
</script>
