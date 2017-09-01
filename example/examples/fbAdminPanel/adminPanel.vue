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
import lodash from 'lodash'
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

                // custom keys
                requiresAuth: true,
                createNewUsers: false, // defaults to true. SignUp if user don't exist
                allowedRoles: ["admin"], // defaults to any,
                masterAuthConfig: {
                    apiKey: "AIzaSyBHU-zPRVHBjygG7iG_XwlI_dODF9Rj7Fs",
                    authDomain: "studiiio-9274f.firebaseapp.com",
                    databaseURL: "https://studiiio-9274f.firebaseio.com",
                    projectId: "studiiio-9274f",
                    storageBucket: "studiiio-9274f.appspot.com",
                    messagingSenderId: "866199527356",
                    // custom key
                    remoteRestAuthLinkFunction: 'https://us-central1-studiiio-9274f.cloudfunctions.net/remoteRestAuthLink' // sends params ({ projectId, token, email })
                }
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
                    actionsTableRoot: {
                        incrementAge(tableRef) {
                            tableRef.once('value').then((snap) => {
                                lodash.each(snap.val(), (v, k) => {
                                    const curAge = v.age;
                                    tableRef.child(k).child('age').set(curAge + 1);
                                })
                            })
                        }
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
                            },
                            after(v) {
                                v.first = v.first.charAt(0).toUpperCase() + v.first.slice(1);
                                v.last = v.last.charAt(0).toUpperCase() + v.last.slice(1);
                                return true;
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
