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
import Dialog from '@/layout/dialog'
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
                    delegateComponent: courseDelegate,
                    header: {
                        fn(v) {
                            return v && v.meta && v.meta.title ? v.meta.title : 'untitled'
                        },
                        open: false,
                    },
                    actions: {
                        CreateClassroom(courseId, courseValue) {
                            console.log(courseId, courseValue);
                            Dialog.create({
                                title: `Create a classroom for ${courseValue.meta.title}`,
                                form: {
                                    startDate: { type: Date, required: true },
                                    endDate: { type: Date, required: true },
                                    moderator: { type: String, required: true },
                                },
                                buttons: {
                                    Submit({ startDate, endDate, moderator }) {
                                        console.log(startDate, endDate, moderator);
                                        // find moderator in users. if not, create a bad toast.

                                        // create a master classroom object
                                    }
                                }
                            })
                        }
                    },
                    add: [
                        {
                            description: "Create new Course",
                            fields: {
                                'meta.title': {
                                    label: "Title",
                                    type: String,
                                    required: true,
                                },
                                'meta.description': {
                                    label: "Description",
                                    type: "paragraph",
                                    required: true,
                                }
                            }
                        },
                    ],
                },
            }
        }
    }
}
</script>
