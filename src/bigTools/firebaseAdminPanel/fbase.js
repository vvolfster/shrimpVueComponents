import Firebase from 'firebase'
import lodash from 'lodash'
import axios from 'axios'
import Chance from 'chance'
import { Dialog, Toast } from 'quasar-framework'
// import Vue from 'vue'
// import VueTable from 'vuetable-2'
// const fbConfig = {
//     apiKey: "AIzaSyBHU-zPRVHBjygG7iG_XwlI_dODF9Rj7Fs",
//     authDomain: "studiiio-9274f.firebaseapp.com",
//     databaseURL: "https://studiiio-9274f.firebaseio.com",
//     projectId: "studiiio-9274f",
//     storageBucket: "studiiio-9274f.appspot.com",
//     messagingSenderId: "866199527356"
// }
// global.iii.openHouse
// init vue stuffs


const state = {
    app: null,
    fbConfig: null,
    appVars: null,
    dialog: null,
    token: null
}

const functions = {
    dbUrl() {
        const url = state.fbConfig.databaseURL
        return url.charAt(url.length - 1) !== "/" ? `${url}/` : url;
    },
    shallowGet(url) {
        return new Promise((resolve, reject) => {
            axios.get(`${url}.json?shallow=true`).then(res =>  resolve(res.data)).catch(reject);
            // const auth =  lodash.get(state.appVars, "auth") || (state.app ? state.app.auth() : null)
            // if(!auth || !auth.currentUser)
            //     return axios.get(`${url}.json?shallow=true`).then(res =>  resolve(res.data)).catch(reject);

            // if(state.token) {
            //     return axios.get(`${url}.json?access_token=${state.token}&shallow=true`).then(res =>  resolve(res.data)).catch(reject);
            // }
            // return auth.currentUser.getIdToken().then((token) => {
            //     console.log(`received token`, token);
            //     state.token = token;
            //     return axios.get(`${url}.json?access_token=${state.token}&shallow=true`).then(res =>  resolve(res.data)).catch(reject);
            // }).catch(reject);
        })
    },
    /**
     * @function getTableNames
     * @param  {type} databaseURL {The url of the database}
     * @return {type} {Promise. Resolves with the root child names of the database}
     */
    getTableNames() {
        return new Promise((resolve, reject) => {
            const databaseURL = functions.dbUrl();
            return functions.shallowGet(databaseURL).then(data => resolve(lodash.keys(data))).catch(reject);
        })
    },
    validateConfigObject(fbConfig) {
        return typeof fbConfig === 'object' && fbConfig.apiKey && fbConfig.authDomain && fbConfig.databaseURL && fbConfig.projectId
    },
    getApp(appName) {
        return lodash.find(Firebase.apps, (v) => { return v.name === appName; })
    },
    populateDummyData(db, n) {
        const ref = db.ref('/test');
        const chance = new Chance();
        lodash.times(n, () => {
            const person = {
                first: chance.first(),
                last: chance.last(),
                age: chance.age(),
                gender: chance.gender(),
                address: chance.address(),
                city: chance.city(),
                state: chance.state(),
                zip: chance.zip()
            }
            ref.push(person);
        })
    },
    doAuth(app) {
        if(state.dialog) {
            state.dialog.close();
        }

        return new Promise((resolve, reject) => {
            state.dialog = Dialog.create({
                title: "Sign In",
                form: {
                    username: {
                        model: localStorage ? localStorage.getItem("fbAdminPanelUser") : "",
                        type: "textbox"
                    },
                    password: {
                        model: localStorage ? localStorage.getItem("fbAdminPanelPW") : "",
                        type: "password"
                    }
                },
                buttons: [
                    {
                        label: "Submit",
                        preventClose: true,
                        handler({ username, password }){
                            function success() {
                                localStorage.setItem("fbAdminPanelUser", username);
                                localStorage.setItem("fbAdminPanelPW", password);
                                Toast.create.positive(`Logged in as ${username}`);
                                resolve();
                                state.dialog.close();
                            }

                            app.auth().signInWithEmailAndPassword(username, password).then(success).catch((err) => {
                                if (err.message !== "There is no user record corresponding to this identifier. The user may have been deleted."){
                                    Toast.create.negative(err.message);
                                    return;
                                }

                                app.auth().createUserWithEmailAndPassword(username, password)
                                .then(success)
                                .catch(error => Toast.create.negative(error.message));
                            })
                        }
                    },
                    "Cancel",
                ],
                onDimiss() {
                    reject()
                    state.dialog = null;
                }
            })
        })
    }
}


export default {
    initFb(fbConfig) {
        const self = this;
        const name = "fbAdminPanelApp"

        return new Promise((resolve, reject) => {
            if(!functions.validateConfigObject(fbConfig))
                return reject("invalid fbConfig Object passed");

            return self.close().then(() => {
                const app = functions.getApp(name) || Firebase.initializeApp(fbConfig, name);
                if(!app)
                    reject("failed to initialize app");

                function doInit() {
                    // console.log(`do init`)
                    return new Promise((resolve) => {
                        state.app = app;
                        state.fbConfig = fbConfig;
                        const database = state.app.database();
                        // functions.populateDummyData(database, 100);

                        // console.log(`resolving`, state.app.auth().currentUser);
                        functions.getTableNames(fbConfig.databaseURL).then((tables) => {
                            state.appVars = {
                                app: state.app,
                                database,
                                tables,
                                auth: state.app.auth(),
                                messaging: state.app.messaging(),
                                storage: state.app.storage(),
                            }
                            resolve(state.appVars)
                        })
                    })
                }

                if(fbConfig.requiresAuth && !app.auth().currentUser)
                    return functions.doAuth(app).then(doInit).then(resolve).catch(reject);

                return doInit().then(resolve).catch(reject);
            }).catch(reject);
        })
    },
    close() {
        return new Promise((resolve, reject) => {
            function cleanup() {
                state.app = null;
                state.fbConfig = null;
                state.appVars = null;
                resolve();
            }

            return !state.app ? cleanup() : state.app.delete().then(cleanup).catch(reject);
        })
    },
    getTableKeys(name) {
        return new Promise((resolve, reject) => {
            const url = `${functions.dbUrl()}${name}`
            return functions.shallowGet(url).then(data => resolve(lodash.keys(data))).catch(reject);
        })
    },
    getTableRef(name) {
        return new Promise((resolve, reject) => {
            if(!state.appVars)
                return reject('app is not initialized');

            const db = state.appVars.database || state.app.database();
            const tableRef = db.ref(name);
            return resolve(tableRef);
        })
    },
    getStorageUrl(path) {
        return new Promise((resolve, reject) => {
            if(!state.appVars)
                return reject('app is not initialized');

            const storage = state.appVars.storage || state.app.storage();
            const pathRef = storage.ref(path);
            // console.log(`resolve the path`)
            return pathRef.getDownloadURL().then((url) => {
                // console.log(`resolved ${path} to ${url}`)
                resolve(url);
            }).catch(reject);
        })
    },
    getStorageRef(path) {
        return new Promise((resolve, reject) => {
            if(!state.appVars)
                return reject('app is not initialized');

            const storage = state.appVars.storage || state.app.storage();
            return resolve(storage.ref(path));
        })
    },
    signOut() {
        return new Promise((resolve, reject) => {
            if(!state.appVars)
                return reject("app is not init")

            const auth = state.appVars.auth || state.app.auth();
            return auth.signOut().then(resolve).catch(reject);
        })
    }
}
