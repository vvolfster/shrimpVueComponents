/* eslint-disable max-len */

import Firebase from 'firebase'
import lodash from 'lodash'
import axios from 'axios'
import LoginFlow from '../../vuePlugins/firebaseAuthentication/loginFlow'
// import importedFunctions from '../../misc/functions'
import Toast from '../../vuePlugins/toasts'


const state = {
    app: null,
    fbConfig: null,
    appVars: null,
    loginFlow: null,
    clear() {
        if (!state.loginFlow)
            return Promise.resolve();
        return state.loginFlow.destroy();
    }
}

const functions = {
    dbUrl() {
        const url = state.fbConfig.databaseURL
        return url.charAt(url.length - 1) !== "/" ? `${url}/` : url;
    },
    shallowGet(url) {
        return new Promise((resolve, reject) => {
            const auth = lodash.get(state.appVars, "auth") || (state.app ? state.app.auth() : null)
            if (!auth || !auth.currentUser)
                return axios.get(`${url}.json?shallow=true`).then(res => resolve(res.data)).catch(reject);

            return auth.currentUser.getIdToken().then((token) => {
                // console.log(`received token`, token);
                return axios.get(`${url}.json?shallow=true&auth=${token}`).then(res => resolve(res.data)).catch(reject);
            }).catch(reject);
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
    validateConfigObject(conf) {
        function isObject(o) {
            return toString.call(o) === '[object Object]'
        }

        function reject(msg) {
            return `firebaseAdminPanel::${msg}`
        }

        function missingKeysInAppObject(o) {
            const requiredKeys = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'messagingSenderId']
            const keys = lodash.keys(o);
            return lodash.reduce(requiredKeys, (acc, r) => {
                if (keys.indexOf(r) === -1 || !o[r])
                    acc.push(r);
                return acc;
            }, [])
        }

        if (!isObject(conf))
            return reject(`opts is not an object`);

        const fbConfig = lodash.get(conf, "fbConfig");
        if (!isObject(fbConfig))
            return reject(`fbConfig is not an object!`)

        const fbConfigKeysMissing = missingKeysInAppObject(fbConfig);
        if (fbConfigKeysMissing.length)
            return reject(`The following keys are missing from fbConfig: ${fbConfigKeysMissing.join(',')}`)

        const authConfig = lodash.get(conf, "authConfig") || lodash.get(conf, "masterAuthConfig");
        if (authConfig) {
            const remoteRestAuthLinkFunction = lodash.get(conf, "remoteRestAuthLinkFunction");
            if (!lodash.isString(remoteRestAuthLinkFunction))
                return reject(`remoteRestAuthLinkFunction key is either missing or not a string from opts`)

            const authConfigKeysMissing = missingKeysInAppObject(authConfig);
            if (authConfigKeysMissing.length)
                return reject(`The following keys are missing from fbConfig: ${authConfigKeysMissing.join(',')}`)
        }

        const userRequirement = lodash.get(conf, "requiresAuth") || lodash.get(conf, "authRequired");
        if (userRequirement !== null && (!lodash.isFunction(userRequirement) && !lodash.isBoolean(userRequirement)))
            return reject(`requiresAuth/authRequired should be a function or a boolean!`)

        return true;
    },
    getApp(id) {
        return lodash.find(Firebase.apps, v => v.options.projectId === id)
    },
    signOut() {
        return new Promise((resolve, reject) => {
            if (!state.appVars)
                return resolve('app is not init');

            const promises = [];
            const app = state.appVars.app;
            const authApp = state.appVars.authApp;

            promises.push(app.auth().signOut())
            if (app !== authApp)
                promises.push(authApp.auth().signOut())

            return Promise.all(promises).then(resolve).catch(reject);
        })
    },
    doAuth() {
        return new Promise((resolve, reject) => {
            if(!state.loginFlow)
                return reject(`Cannot doAuth without a loginFlow`)

            const authChgEvent = state.loginFlow.authChgEvent;
            const fn = (e) => {
                if(!e.detail)
                    return;

                document.removeEventListener(authChgEvent, fn);
                resolve();
            }

            const isVisible = state.loginFlow.isVisible();
            return !isVisible ? state.loginFlow.start() : false;
            // return !state.loginFlow.isVisible() ? state.loginFlow.start() : false;
        })
    }
}


const exportObj = {
    signOut: functions.signOut,
    initFb(opts) {
        const self = this;
        return new Promise((resolve, reject) => {
            if (!functions.validateConfigObject(opts))
                return reject("invalid fbConfig Object passed");

            return self.close().then(() => {
                state.loginFlow = new LoginFlow(opts, "firebaseAdminPanel");
                const app = state.loginFlow.state.fbApp;
                const authApp = state.loginFlow.state.fbAppAuth;

                function doInit() {
                    // console.log(`do init`)
                    return new Promise((resolve) => {
                        state.app = app;
                        state.fbConfig = opts.fbConfig;
                        const database = state.app.database();

                        functions.getTableNames(opts.databaseURL).then((tables) => {
                            state.appVars = {
                                app,
                                authApp,
                                database,
                                tables,
                                auth: app.auth(),
                                messaging: app.messaging(),
                                storage: app.storage(),
                            }
                            // console.log(state.appVars);
                            resolve(state.appVars)
                        }).catch((err) => {
                            const msg = `Failed to retrieve tables. <br> This is typically db's read rules require auth. <br>Solution: <br>1) change your config for this plugin to require auth<br>2) change your db rules<br> ${err}`
                            Toast.negative(msg, { duration: 20000, style: { 'text-align': 'left' } })
                        })
                    })
                }

                if (opts.requiresAuth || opts.authRequired) {
                    if (!app.auth().currentUser)
                        return functions.doAuth().then(doInit).then(resolve).catch(reject);

                    state.loginFlow.meetsAuthRequirement()
                        .then(() => doInit().then(resolve).catch(reject))
                        .catch(() => {
                            functions.signOut().then(() => {
                                Toast.negative("Existing user did not meet auth requirment!");
                                functions.doAuth().then(doInit).then(resolve).catch(reject);
                            })
                        })
                }

                return doInit().then(resolve).catch(reject);
            }).catch(reject);
        })
    },
    close() {
        return new Promise((resolve, reject) => {
            state.clear().then(() => {
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
    },
    doAuth: functions.doAuth
}


export default exportObj;
