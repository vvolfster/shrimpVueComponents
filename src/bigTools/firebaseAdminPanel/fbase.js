import Firebase from 'firebase'
import lodash from 'lodash'
import axios from 'axios'
// import Chance from 'chance'
import Dialog from '../../layout/dialog'
import Toast from '../../vuePlugins/toasts'

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
        function isObj(o) {
            const arr = lodash.isArray(o) ? o : [o];
            return lodash.every(arr, v => toString.call(v) === '[object Object]')
        }

        function isStr(s){
            const arr = lodash.isArray(s) ? s : [s];
            return lodash.every(arr, v => v && typeof v === 'string')
        }

        function getProps(obj, arr) {
            return lodash.reduce(arr, (acc, v) => {
                acc.push(obj[v]);
                return acc;
            }, [])
        }

        if(!isObj(fbConfig))
            return false;

        const requiredConfigProps = ["apiKey", "authDomain", "databaseURL", "projectId"];
        const masterAuthConfig = fbConfig.masterAuthConfig;

        if(masterAuthConfig) {
            if(!isObj(masterAuthConfig))
                return false;

            return isStr(getProps(fbConfig, requiredConfigProps)) && isStr(getProps(masterAuthConfig, ["remoteRestAuthLinkFunction"].concat(requiredConfigProps)))
        }

        return isStr(getProps(fbConfig, requiredConfigProps))
    },
    getApp(appName) {
        return lodash.find(Firebase.apps, v => v.name === appName)
    },
    doAuth(app, fbConfig) {
        // fbConfig.masterAuthConfig, fbConfig.createNewUsers, fbConfig.allowedRoles
        const canCreateNewUsers = typeof fbConfig.createNewUsers !== 'boolean' ? true : fbConfig.createNewUsers;
        const masterAuthConfig = fbConfig.masterAuthConfig;
        // console.warn(fbConfig.allowedRoles, "allowed roles not yet implemented. This is part of making the adminPanel more secure");

        function signInUp(authApp, username, password) {
            return new Promise((resolve, reject) => {
                function success() {
                    localStorage.setItem("fbAdminPanelUser", username);
                    localStorage.setItem("fbAdminPanelPW", password);
                    Toast.positive(`Logged in as ${username}`);
                    resolve();
                }

                authApp.auth().signInWithEmailAndPassword(username, password).then(success).catch((err) => {
                    if (err.message !== "There is no user record corresponding to this identifier. The user may have been deleted.")
                        return reject(err.message);

                    if (!canCreateNewUsers)
                        return reject('User does not exist and we are not allowed to create one!');

                    return authApp.auth().createUserWithEmailAndPassword(username, password).then(success).catch(reject);
                })
            })
        }


        function basicAuth({ username, password }){
            return signInUp(app, username, password);
        }

        function masterAuth({ username, password }) {
            const authAppName = `masterAuth_${masterAuthConfig.projectId}`
            const authApp = functions.getApp(authAppName) || Firebase.initializeApp(masterAuthConfig, authAppName)
            return new Promise((resolve, reject) => {
                if(!authApp)
                    return reject(`failed to initialize masterAuthApp: ${authAppName}`);

                function sendAuthTokenToServer() {
                    return new Promise((resolve, reject) => {
                        authApp.auth().currentUser.getIdToken(true)
                        .then((token) => {
                            axios.post(masterAuthConfig.remoteRestAuthLinkFunction, { token, projectId: fbConfig.projectId })
                            .then((res) => {
                                console.log(`response came back with`, res);
                            })
                            .catch(reject);
                        })
                        .catch(reject);
                    })
                }

                function signInToLocalApp(token) {
                    return authApp.auth().signInWithCustomToken(token); // returns a promise
                }

                return signInUp(authApp, username, password).then(sendAuthTokenToServer).then(signInToLocalApp).catch(reject);
            })
        }

        Dialog.dismissAll();
        return new Promise((rootResolve) => {
            Dialog.create({
                title: "Sign In",
                noDismiss: true,
                form: {
                    username: {
                        model: localStorage ? localStorage.getItem("fbAdminPanelUser") : "",
                        type: String
                    },
                    password: {
                        model: localStorage ? localStorage.getItem("fbAdminPanelPW") : "",
                        type: "password"
                    }
                },
                buttons: {
                    Submit(params) {
                        return new Promise((resolve, reject) => {
                            const authFn = masterAuthConfig ? masterAuth : basicAuth;
                            return authFn(params).then(() => {
                                resolve();
                                rootResolve();
                            }).catch(reject);
                        })
                    }
                },
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
                    return functions.doAuth(app, fbConfig).then(doInit)
                        .then(resolve)
                        .catch(reject);

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
    getState() {
        return state;
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
