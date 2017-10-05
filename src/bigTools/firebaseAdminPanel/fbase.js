/* eslint-disable max-len */

import Firebase from 'firebase'
import lodash from 'lodash'
import axios from 'axios'
import Dialog from '../../layout/dialog'
import Toast from '../../vuePlugins/toasts'
import importedFunctions from '../../misc/functions'


const state = {
    app: null,
    fbConfig: null,
    appVars: null,
    dialog: null,
}

const functions = {
    dbUrl() {
        const url = state.fbConfig.databaseURL
        return url.charAt(url.length - 1) !== "/" ? `${url}/` : url;
    },
    shallowGet(url) {
        return new Promise((resolve, reject) => {
            const auth =  lodash.get(state.appVars, "auth") || (state.app ? state.app.auth() : null)
            if(!auth || !auth.currentUser)
                return axios.get(`${url}.json?shallow=true`).then(res =>  resolve(res.data)).catch(reject);

            return auth.currentUser.getIdToken().then((token) => {
                // console.log(`received token`, token);
                return axios.get(`${url}.json?shallow=true&auth=${token}`).then(res =>  resolve(res.data)).catch(reject);
            }).catch(reject);
        })
    },
    genericResolver: importedFunctions.genericResolver,
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

        function isStr(s) {
            const arr = lodash.isArray(s) ? s : [s];
            return lodash.every(arr, v => v && typeof v === 'string')
        }

        function getProps(obj, arr) {
            return lodash.reduce(arr, (acc, v) => {
                acc.push(obj[v]);
                return acc;
            }, [])
        }

        if (!isObj(fbConfig))
            return false;

        const requiredConfigProps = ["apiKey", "authDomain", "databaseURL", "projectId"];
        const masterAuthConfig = fbConfig.masterAuthConfig;

        if (masterAuthConfig) {
            if (!isObj(masterAuthConfig))
                return false;

            return isStr(getProps(fbConfig, requiredConfigProps)) && isStr(getProps(masterAuthConfig, ["remoteRestAuthLinkFunction"].concat(requiredConfigProps)))
        }

        return isStr(getProps(fbConfig, requiredConfigProps))
    },
    getApp(id) {
        return lodash.find(Firebase.apps, v => v.options.projectId === id)
    },
    meetsAuthRequirement(fbConfig, app) {
        return new Promise((resolve, reject) => {
            const userRequirementFn = fbConfig.authRequirementFn || fbConfig.authRequirement || fbConfig.userRequirementFn || fbConfig.userRequirement
            if (typeof userRequirementFn !== 'function')
                resolve();

            const authUser = app.auth().currentUser;
            if (!authUser)
                return functions.genericResolver(userRequirementFn, authUser).then(resolve).catch(reject);

            return app.database().ref(`users/${authUser.uid}`).once('value').then((snap) => {
                return functions.genericResolver(userRequirementFn, snap.val() || authUser).then(resolve).catch(reject);
            })
        })
    },
    signOut() {
        return new Promise((resolve, reject) => {
            if (!state.appVars)
                return reject("app is not init")

            const promises = [];
            const app = state.appVars.app;
            const authApp = state.appVars.authApp;

            promises.push(app.auth().signOut())
            if (app !== authApp)
                promises.push(authApp.auth().signOut())

            return Promise.all(promises).then(resolve).catch(reject);
        })
    },
    doAuth(app, authApp, fbConfig, authConfig) {
        const canCreateNewUsers = typeof fbConfig.createNewUsers !== 'boolean' ? true : fbConfig.createNewUsers;
        const authLinkFnUrl = lodash.get(authConfig, "remoteRestAuthLinkFunction");
        if (app !== authApp && !authLinkFnUrl)
            return Promise.reject(`No remoteRestAuthLinkFunction property in auth config`)

        function signInUp(username, password) {
            return new Promise((resolve, reject) => {
                authApp.auth().signInWithEmailAndPassword(username, password).then(() => {
                    function failUserCheck() {
                        functions.signOut().then(() => reject(`This user does not have permission`))
                    }

                    functions.meetsAuthRequirement(fbConfig, authApp).then(resolve).catch(failUserCheck);
                }).catch((err) => {
                    if (err.message !== "There is no user record corresponding to this identifier. The user may have been deleted.")
                        return reject(err.message);

                    if (!canCreateNewUsers)
                        return reject('User does not exist and we are not allowed to create one!');

                    return authApp.auth().createUserWithEmailAndPassword(username, password).then(resolve).catch(reject);
                })
            })
        }


        function basicAuth({ username, password }) {
            return signInUp(username, password);
        }

        function masterAuth({ username, password }) {
            return new Promise((resolve, reject) => {
                if (!authApp)
                    return reject(`No auth app`);

                function sendAuthTokenToServer() {
                    return new Promise((resolve, reject) => {
                        authApp.auth().currentUser.getIdToken(true)
                            .then((token) => {
                                const sendObj = { token, projectId: fbConfig.projectId }
                                axios.post(authLinkFnUrl, sendObj, { 'Content-Type': 'application/json' })
                                    .then((res) => {
                                        const responseToken = lodash.get(res, "data.token") || lodash.get(res, "token");
                                        if (!responseToken)
                                            return reject(`Master auth server sent no token back!`);

                                        return resolve(responseToken);
                                    })
                                    .catch(err => reject(`${err.response.status}: ${err.response.data}`));
                            })
                            .catch(reject);
                    })
                }

                function signInToLocalApp(token) {
                    // console.log(`signInToLocalApp with token ${token}`)
                    return new Promise((resolve, reject) => {
                        return app.auth().signInWithCustomToken(token).then(resolve).catch(reject);
                    })
                }

                return signInUp(username, password)
                    .then(sendAuthTokenToServer)
                    .then(signInToLocalApp)
                    .then(resolve)
                    .catch(reject);
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
                            const authFn = authApp !== app ? masterAuth : basicAuth;
                            return authFn(params).then(() => {
                                localStorage.setItem("fbAdminPanelUser", params.username);
                                localStorage.setItem("fbAdminPanelPW", params.password);
                                Toast.positive(`Logged in as ${params.username}`);
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


const exportObj = {
    signOut: functions.signOut,
    initFb(opts) {
        const self = this;
        const authConfig = lodash.get(opts, "masterAuthConfig") || lodash.get(opts, "authConfig");

        return new Promise((resolve, reject) => {
            if (!functions.validateConfigObject(opts))
                return reject("invalid fbConfig Object passed");

            return self.close().then(() => {
                const existingApp = functions.getApp(lodash.get(opts, "projectId"))
                const existingAppAuth = functions.getApp(lodash.get(authConfig, "projectId"))

                const app = existingApp || Firebase.initializeApp(opts, "fbAdminPanelApp");
                if (!app)
                    reject("failed to initialize app");

                const authApp = !authConfig ? app : (existingAppAuth || Firebase.initializeApp(authConfig, `masterAuth_${lodash.get(authConfig, `projectId`)}`))
                if (!authApp)
                    reject('bad auth app config provided')

                state.dontDeleteAppOnClear = !!existingApp;
                state.dontDeleteAppAuthOnClear = !!existingAppAuth;

                function doInit() {
                    // console.log(`do init`)
                    return new Promise((resolve) => {
                        state.app = app;
                        state.fbConfig = opts;
                        const database = state.app.database();

                        functions.getTableNames(opts.databaseURL).then((tables) => {
                            state.appVars = {
                                authApp,
                                app: state.app,
                                database,
                                tables,
                                auth: authApp.auth(),
                                messaging: state.app.messaging(),
                                storage: state.app.storage(),
                            }
                            // console.log(state.appVars);
                            resolve(state.appVars)
                        })
                    })
                }

                if (opts.requiresAuth || opts.authRequired) {
                    if (!app.auth().currentUser)
                        return functions.doAuth(app, authApp, opts, authConfig).then(doInit).then(resolve).catch(reject);

                    functions.meetsAuthRequirement(opts, authApp)
                        .then(() => doInit().then(resolve).catch(reject))
                        .catch(() => {
                            functions.signOut().then(() => {
                                Toast.negative("Existing user did not meet auth requirment!");
                                functions.doAuth(app, authApp, opts, authConfig).then(doInit).then(resolve).catch(reject);
                            })
                        })
                }

                return doInit().then(resolve).catch(reject);
            }).catch(reject);
        })
    },
    close() {
        return new Promise((resolve, reject) => {
            const promises = [];
            if (state.appVars && state.appVars.app && state.appVars.authApp) {
                if (state.appVars.app === state.appVars.authApp) {
                    if (!state.dontDeleteAppOnClear)
                        promises.push(state.appVars.app.delete());
                }
                else {
                    if (!state.dontDeleteAppOnClear)
                        promises.push(state.appVars.app.delete())

                    if (state.dontDeleteAppAuthOnClear)
                        promises.push(state.appVars.authApp.delete())
                }
            }

            Promise.all(promises).then(() => {
                state.app = null;
                state.fbConfig = null;
                state.appVars = null;
                resolve();
            }).catch(reject);
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
            if (!state.appVars)
                return reject('app is not initialized');

            const db = state.appVars.database || state.app.database();
            const tableRef = db.ref(name);
            return resolve(tableRef);
        })
    },
    getStorageUrl(path) {
        return new Promise((resolve, reject) => {
            if (!state.appVars)
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
            if (!state.appVars)
                return reject('app is not initialized');

            const storage = state.appVars.storage || state.app.storage();
            return resolve(storage.ref(path));
        })
    },
    updateTableNames() {
        // console.log(`resolving`, state.app.auth().currentUser);
        return new Promise((resolve, reject) => {
            const fbConfig = state.fbConfig;
            if (!fbConfig)
                return reject(`no fbConfig to updateTable names for`);

            return functions.getTableNames(fbConfig.databaseURL).then((tables) => {
                state.appVars.tables = tables
                resolve(state.appVars.tables)
            })
        })
    }
}


export default exportObj;
