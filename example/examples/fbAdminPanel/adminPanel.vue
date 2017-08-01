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
import fbAdminPanel from '@/bigTools/firebaseAdminPanel'
import person from './person'

export default {
    components: { fbAdminPanel, person },
    data() {
        return {
            fbConfig: {
                apiKey: "AIzaSyC97H_bXdMzXbg2DHv9NwvDn2KatyAGdWY",
                authDomain: "wolf-2d385.firebaseio.com",
                databaseURL: "https://wolf-2d385.firebaseio.com",
                projectId: "wolf-2d385",
                storageBucket: "gs://wolf-2d385.appspot.com",
                messagingSenderId: "866199527356",

                // custom key
                requiresAuth: true,
            },
            tableConfig: {
                pageSize: 25,
                test: {
                    columnOrder: ["first", "last", "age", "address"],
                    actions: {
                        images() {
                            return new Promise((resolve) => {
                                setTimeout(resolve, 1000);
                            })
                        },
                        herp(id, value) {
                            console.warn("herp", id, value);
                        },
                    },
                    delegateComponent: person,
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
                                gender: ["Male", "Female", "Other"]
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
