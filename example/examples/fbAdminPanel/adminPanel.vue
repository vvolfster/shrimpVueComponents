<template>
    <div>
        <fbAdminPanel :config="config">
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
import fbconf from './fbConf'

export default {
    components: { fbAdminPanel, person },
    data() {
        return {
            config: {
                fbConfig: fbconf.db,
                // authConfig: fbconf.master,
                remoteRestAuthLinkFunction: 'https://us-central1-studiiio-9274f.cloudfunctions.net/remoteRestAuthLink',
                createNewUsers: false, // defaults to true. SignUp if user don't exist
                authRequired: true,
                // authRequired(user) {
                //     return new Promise((resolve, reject) => {
                //         setTimeout(() => {
                //             return user.email !== 'shahan@iii.global' ? reject() : resolve()
                //         }, 1000)
                //     })
                // },
                tableConfig: {
                    pageSize: 25,
                    canAdd: true,
                    canRemove: true,
                    test: {
                        columnOrder: ["first", "last", "age", "address"],
                        actions: {
                            images() {
                                return new Promise((resolve) => {
                                    setTimeout(resolve, 1000);
                                })
                            },
                            herp(id, value, ref) {
                                console.warn("herp", ref);
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
                        // delegateComponent: person,
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
}
</script>
