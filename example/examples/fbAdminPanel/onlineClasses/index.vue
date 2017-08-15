<template>
    <div>
        <fbAdminPanel :fbConfig="fbConfig"  :tableConfig="tableConfig">
            <!-- 
                <openHousePosting slot="test"/>
            -->
        </fbAdminPanel>
    </div>
</template>

<script>
// import lodash from 'lodash'
import fbAdminPanel from '@/bigTools/firebaseAdminPanel'

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
                    storageKey: "storage"
                },
                data: {
                    storageKey: "storage"
                }
            }
        }
    }
}
</script>
