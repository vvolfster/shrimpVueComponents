/* eslint-disable no-plusplus */

import Firebase from 'firebase'
import lodash from 'lodash';
import axios from 'axios'
import FirebaseUI from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
import GenericSubscriptionWrapper from '../../../misc/genericSubscriptionWrapper'
import Dialog from '../../../layout/dialog'
import Toast from '../../toasts'
import gFuncs from '../../../misc/functions'
import '../css.css'

const references = {

}

const helpers = {
    generateDialogInstance() {
        const instance = {
            d1: null,
            d2: null,
            d1Reject: null,
            callbacks: {
                signInSuccess() {
                    if (instance.d2 && instance.d2.showBusy)
                        instance.d2.showBusy();
                    return false;
                }
            },
            dismiss() {
                if (instance.d1) {
                    instance.d1.dismiss(true);
                }

                if (instance.d2 && instance.d2.parentNode) {
                    instance.d2.parentNode.removeChild(instance.d2);
                }

                const el = document.getElementById('auth-topLevel-container');
                if (el && el.parentNode)
                    el.parentNode.removeChild(el);

                instance.d1 = null;
                instance.d2 = null;
                instance.d1Reject = null;
            },
            reject() {
                if (typeof instance.d1Reject === 'function') {
                    instance.d1Reject();
                    instance.d1Reject = null;
                }
            }
        }
        return instance;
    },
    getUserDisplayName(user) {
        if (!user)
            return 'Unknown'

        const first = lodash.get(user, "firstName") || lodash.get(user, "first") || "";
        const last = lodash.get(user, "lastName") || lodash.get(user, "last") || "";
        const email = lodash.get(user, "email") || "";
        const displayName = lodash.get(user, "displayName") || "";
        if (first.trim() || last.trim())
            return lodash.compact([first, last]).join(' ')
        if (displayName.trim())
            return displayName;
        if (email.trim())
            return email;
        return 'unknown'
    },
    addReference(id, app, authApp) {
        const appId = app.options.projectId;
        if (!references[appId])
            references[appId] = [];

        references[appId].push(id);

        if (app !== authApp) {
            const authId = authApp.options.projectId;
            if (!references[authId])
                references[authId] = [];

            references[authId].push(id);
        }
    },
    destroy(id, app, authApp) {
        return new Promise((resolve, reject) => {
            const appId = app.options.projectId;
            const authId = app.options.projectId;

            function deleteAppReference() {
                return new Promise((resolve) => {
                    const refs = references[appId];
                    if (!refs)
                        return resolve(0);

                    const idx = refs.findIndex(r => r === id);
                    if (idx !== -1)
                        refs.splice(idx, 1);
                    return resolve(refs.length);
                })
            }

            function deleteAuthReference() {
                return new Promise((resolve) => {
                    const refs = references[authId];
                    if (!refs)
                        return resolve();

                    const idx = refs.findIndex(r => r === id);
                    if (idx !== -1)
                        refs.splice(idx, 1);
                    return resolve();
                })
            }

            if (app === authApp) {
                return deleteAppReference().then((remaining) => {
                    return remaining !== 0 ? resolve() : app.delete().then(resolve).catch(reject);
                })
            }

            return Promise.all([deleteAppReference(), deleteAuthReference()]).then((results) => {
                const appRemaining = results[0];
                const authRemaining = results[1];
                Promise.all([
                    appRemaining !== 0 ? Promise.resolve() : app.delete(),
                    authRemaining !== 0 ? Promise.resolve() : authApp.delete()
                ]).then(resolve).catch(reject);
            })
        })
    },
    uidGen: 0,
}


const DEFAULT = {
    signInProviders: ["email", "google"],
    uiConfig: {
        // signInSuccessUrl: '<url-to-redirect-to-on-success>',
        tosUrl: '<your-tos-url>',
        signInFlow: "popup",
    },
    providerMap: {
        // Leave the lines as is for the providers you want to offer your users.
        google: {
            provider: Firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            // scopes: ['https://www.googleapis.com/auth/plus.login'],
            customParameters: {
                // Forces account selection even when one account
                // is available.
                prompt: 'select_account'
            }
        },
        facebook: Firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        twitter: Firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        github: Firebase.auth.GithubAuthProvider.PROVIDER_ID,
        email: Firebase.auth.EmailAuthProvider.PROVIDER_ID,
        phone: Firebase.auth.PhoneAuthProvider.PROVIDER_ID
    }
}

function getApp(id) {
    return lodash.find(Firebase.apps, v => v.options.projectId === id)
}

function builder(conf, id) {
    const self = this;
    const opts = conf;
    const fbConfig = lodash.get(opts, "fbConfig")
    const authConfig = lodash.get(opts, "authConfig") || lodash.get(opts, "masterAuthConfig");

    const projectId = lodash.get(fbConfig, "projectId", undefined);
    const authProjectId = lodash.get(authConfig, "projectId", undefined);

    // console.log(`init fbApp with`, fbConfig)
    const fbApp = getApp(projectId) || Firebase.initializeApp(fbConfig, projectId)
    const fbAppAuth = !authConfig ? fbApp : getApp(authProjectId) || Firebase.initializeApp(authConfig, authProjectId)
    const dialogs = helpers.generateDialogInstance()
    const subMgr = new GenericSubscriptionWrapper({ listen: "addEventListener", unlisten: "removeEventListener" });
    self.uid = lodash.compact([++helpers.uidGen, projectId, authProjectId]).join('_');

    const existingUI = FirebaseUI.auth.AuthUI.getInstance(fbAppAuth.options.projectId);
    const ui = existingUI || new FirebaseUI.auth.AuthUI(fbAppAuth.auth(), fbAppAuth.options.projectId);

    const authChgEvent = `${self.uid}_authStateChanged`


    const state = {
        opts,
        fbApp,
        fbAppAuth,
        dialogs,
        subMgr,
        ui,
        authUnsubFunctions: { auth: null, app: null },
        currentUser: {
            auth: null,
            app: null,
            dbApp: null,
            dbAuth: null
        },
        isVisible: false
    }

    const loginFlow = {
        start() {
            // console.log(`start ${authChgEvent}`, state.isVisible)
            if(state.isVisible){
                console.warn(`start called when ui was already open`);
                return false;
            }

            state.isVisible = true;
            const signInProviders = lodash.get(opts, "signInOptions") || DEFAULT.signInProviders;
            const federatedIDProviders = lodash.filter(signInProviders, s => s !== 'email');
            if (signInProviders.indexOf('email') !== -1)
                return loginFlow.showEmailAndPasswordDialog({ fbApp, fbAppAuth, opts });
            else if (federatedIDProviders.length)
                return loginFlow.showFirebaseAuth({ fbApp, fbAppAuth, opts });

            state.isVisible = false;
            throw new Error(`firebaseAuthentication/loginUI::No sign in options provided!`);
        },
        showEmailAndPasswordDialog() {
            const createNewUsers = lodash.get(opts, "createNewUsers", true);
            const authNeeded = !!(lodash.get(opts, "authRequired") || lodash.get(opts, "requiresAuth"));
            const signInProviders = lodash.get(opts, "signInOptions") || DEFAULT.signInProviders;
            const otherSignInProviders = lodash.filter(signInProviders, s => s !== 'email');
            const buttons = {
                Submit({ email, password }) {
                    return new Promise((resolve, reject) => {
                        // indirect resolve here
                        dialogs.reject();
                        dialogs.d1Reject = reject;
                        subMgr.subscribe(document, authChgEvent, (e) => {
                            if (e.detail) {
                                localStorage.setItem('firebaseAuthPluginUser', email);
                                localStorage.setItem('firebaseAuthPluginPw', password);
                                resolve();
                            }
                        }, `state.dialogs.d1`);

                        fbAppAuth.auth().signInWithEmailAndPassword(email, password).catch((err) => {
                            const errCode = lodash.get(err, "code");
                            if (errCode !== `auth/user-not-found`)
                                return reject(err.message);

                            if (createNewUsers)
                                return fbAppAuth.auth().createUserWithEmailAndPassword(email, password).catch(reject);

                            return reject(err.message);
                        })
                    })
                }
            }

            if (otherSignInProviders.length)
                buttons["Log In With Auth Providers"] = {
                    bypassForm: true,
                    handler() { loginFlow.showFirebaseAuth(fbApp, fbAppAuth, opts) }
                }

            dialogs.dismiss();
            dialogs.d1 = Dialog.create({
                title: "LOG IN WITH EMAIL",
                form: {
                    email: {
                        type: String,
                        required: true,
                        model: localStorage.getItem('firebaseAuthPluginUser')
                    },
                    password: {
                        type: 'password',
                        required: true,
                        model: localStorage.getItem('firebaseAuthPluginPw')
                    }
                },
                noDismiss: authNeeded,
                buttons,
                onDismiss() {
                    if (subMgr.has(`state.dialogs.d1`))
                        subMgr.unsubscribe({ id: `state.dialogs.d1` });

                    if (!authNeeded)
                        state.isVisible = false;

                    // console.log(`here1`)
                    dialogs.d1 = null;
                    dialogs.d1Reject = null;
                }
            })
        },
        showFirebaseAuth() {
            if (!fbAppAuth || !opts)
                throw new Error(`firebaseAuthentication/loginUI::showFirebaseAuth missing params!`)

            const authNeeded = !!(lodash.get(opts, "authRequired") || lodash.get(opts, "requiresAuth"));
            const signInProviders = lodash.get(opts, "signInOptions") || DEFAULT.signInProviders;
            const signInOptions = lodash.reduce(signInProviders, (acc, v) => {
                if (v === 'email')
                    return acc;

                acc.push(DEFAULT.providerMap[v])
                return acc;
            }, [])

            let uiContainerId = `firebaseui-auth-container`
            if (!document.getElementById(uiContainerId)) {
                const frag = document.createDocumentFragment();
                const topLevelNode = document.createElement('div');
                topLevelNode.className = 'absolute fill column justify-center items-center'
                topLevelNode.id = `auth-topLevel-container_${fbAppAuth.options.projectId}`
                topLevelNode.style.backgroundColor = 'rgba(0,0,0, 0.5)'
                topLevelNode.style.zIndex = 99999;
                topLevelNode.style.top = 0;
                topLevelNode.style.left = 0;
                topLevelNode.addEventListener('click', (e) => {
                    if (e.stopPropagation)
                        e.stopPropagation();

                    if (!topLevelNode.busy) {
                        if (authNeeded) {
                            if (signInProviders.indexOf('email') !== -1) {
                                loginFlow.showEmailAndPasswordDialog(fbApp, fbAppAuth, opts);
                                if(topLevelNode.parentNode)
                                    topLevelNode.parentNode.removeChild(topLevelNode);
                            }
                            // else case, too bad. You can't kill this since authIsNeeded :)
                        }
                        else if(topLevelNode.parentNode){
                            topLevelNode.parentNode.removeChild(topLevelNode);
                            dialogs.d2 = null;
                            state.isVisible = false;
                        }
                    }
                })

                const backgroundNode = document.createElement('div');
                backgroundNode.className = 'bg-white shadow-2 column justify-center items-center'
                backgroundNode.style.borderRadius = '2px';

                const busyNode = document.createElement('div');
                busyNode.className = 'fa fa-circle-o-notch spin text-black'
                busyNode.style.visibility = 'hidden';
                busyNode.style.width = '0px';
                busyNode.style.height = '0px';

                const authUIContainerNode = document.createElement('div');
                authUIContainerNode.id = `firebaseui-auth-container_${fbAppAuth.options.projectId}`;
                uiContainerId = authUIContainerNode.id
                authUIContainerNode.style.paddingTop = "15px";

                backgroundNode.appendChild(authUIContainerNode);
                backgroundNode.appendChild(busyNode);
                topLevelNode.appendChild(backgroundNode);

                topLevelNode.showBusy = () => {
                    topLevelNode.busy = true;

                    if (authUIContainerNode) {
                        authUIContainerNode.style.visibility = 'hidden';
                        authUIContainerNode.style.width = '0px';
                        authUIContainerNode.style.height = '0px';
                    }

                    busyNode.style.visibility = 'visible';
                    busyNode.style.width = '50pt';
                    busyNode.style.height = '50pt';
                    backgroundNode.style.padding = "20px";
                }

                dialogs.d2 = topLevelNode;
                frag.appendChild(topLevelNode);
                document.body.appendChild(frag);
            }

            const callbacks = dialogs.callbacks;
            ui.start(`#${uiContainerId}`, lodash.assign({ signInOptions, callbacks }, DEFAULT.uiConfig));
        }
    }

    const authFunctions = {
        unsubAuthFn: null,
        unsubAppFn: null,
        subscribeToAuthChangeOnMaster() {
            authFunctions.unsubAuthFn = fbAppAuth.auth().onAuthStateChanged((u) => {
                const user = fbApp.auth().currentUser || u;
                function catcher() {
                    fbAppAuth.auth().signOut();
                    fbApp.auth().signOut();
                    dialogs.reject();
                }

                if (user) {
                    if(fbApp === fbAppAuth){
                        authFunctions.addUserToAuthDb(user)
                    }
                    else {
                        authFunctions.addUserToAuthDb(user).then(authFunctions.authenticateWithChildFirebase).catch(catcher);
                    }
                }
                else if(fbApp !== fbAppAuth){
                    fbApp.auth().signOut(); // also sign out of child app
                }
            });
        },
        subscribeToAuthChangeOnChild() {
            const authNeeded = !!(lodash.get(opts, "authRequired") || lodash.get(opts, "requiresAuth"))

            function greet() {
                dialogs.dismiss();
                state.isVisible = false;
            }

            function finishUp(user, authUser) {
                state.currentUser.app = user;
                state.currentUser.auth = authUser;
                if (document)
                    document.dispatchEvent(new CustomEvent(authChgEvent, { detail: authUser }));
            }

            authFunctions.unsubAppFn = fbApp.auth().onAuthStateChanged((u) => {
                let appAuthUser = fbAppAuth.auth().currentUser;
                if (u) {
                    // on reload of pages, sometimes the fbAppAuth logs in after.
                    // so the userName you get at first is incorrect. It is best to
                    // wait I guess for fbAppAuth.auth().currentUser
                    const flow = () => {
                        authFunctions.addUserToChildDb(appAuthUser).then((dbUser) => {
                            const doRequirementCheckAndContinue = (appAuthDbUser) => {
                                authFunctions.meetsAuthRequirement().then(() => {
                                    state.currentUser.dbApp = dbUser;
                                    state.currentUser.dbAuth = appAuthDbUser

                                    greet(appAuthUser);
                                    finishUp(u, appAuthUser);
                                }).catch(() => {
                                    // Toast.dismissAll();
                                    const err = `${id}: The User does not meet the requirements`
                                    fbApp.auth().signOut();
                                    fbAppAuth.auth().signOut();

                                    if (typeof dialogs.d1Reject === 'function')
                                        dialogs.d1Reject(err);
                                    else
                                        Toast.negative(err);
                                })
                            }

                            if (fbApp !== fbAppAuth) {
                                fbAppAuth.database().ref(`users/${appAuthUser.uid}`).once('value').then(snap => doRequirementCheckAndContinue(snap.val()))
                            }
                            else {
                                doRequirementCheckAndContinue();
                            }
                        })
                    }

                    if (appAuthUser) {
                        flow();
                    }
                    else {
                        const intId = setInterval(() => {
                            appAuthUser = fbAppAuth.auth().currentUser;
                            if (!appAuthUser)
                                return;

                            clearInterval(intId);
                            flow();
                        }, 250);
                    }
                }
                else {
                    if (authNeeded) {
                        // console.log("AUTH IS NEEDED START THE LOGIN FLOW", opts)
                        loginFlow.start()
                    }

                    if (appAuthUser) { // just to make this baby airtight. This should not happen in 99% of the cases
                        fbAppAuth.auth().signOut();
                    }

                    state.currentUser.dbApp = null;
                    state.currentUser.dbAuth = null;
                    finishUp(null, null);
                }
            })
        },
        addUserToAuthDb(user) {
            return new Promise((resolve) => {
                const userRef = fbAppAuth.database().ref(`users/${user.uid}`)
                userRef.once('value', (snap) => {
                    if (snap.exists())
                        return resolve(snap.val());

                    function find(key) {
                        if (user[key])
                            return user[key];

                        const provider = lodash.find(user.providerData, p => p[key])
                        if (provider)
                            return provider[key];

                        return null;
                    }

                    const userRecord = {
                        dateCreated: new Date().toISOString(),
                        id: user.uid,
                        email: find('email'),
                        photoURL: find('photoURL'),
                        displayName: find('displayName'),
                        firstName: find('firstName') || find('first'),
                        lastName: find('lastName') || find('last')
                    }

                    if (userRecord.displayName) {
                        const dArr = userRecord.displayName.split(' ');
                        if (dArr.length > 1) {
                            userRecord.firstName = dArr[0];
                            userRecord.lastName = lodash.last(dArr);
                        }
                    }

                    return userRef.set(userRecord).then(() => resolve(userRecord));
                })
            })
        },
        addUserToChildDb(user) {
            return new Promise((resolve, reject) => {
                const userRef = fbApp.database().ref(`users/${user.uid}`)
                const refs = {
                    id: userRef.child('id'),
                    dateCreated: userRef.child('dateCreated'),
                }

                const promises = [refs.id.once('value'), refs.dateCreated.once('value')]
                Promise.all(promises).then((results) => {
                    const idRes = results[0].val();
                    const dateCreatedResult = results[1].val();

                    const outPromises = []

                    if (!idRes)
                        outPromises.push(refs.id.set(user.uid))

                    if (!dateCreatedResult)
                        outPromises.push(refs.dateCreated.set(new Date().toISOString()))

                    Promise.all(outPromises).then(() => {
                        userRef.once('value').then(snap => resolve(snap.val()))
                    }).catch(reject);
                }).catch(reject);
            })
        },
        getUser() {
            return new Promise((resolve, reject) => {
                const authUser = fbAppAuth.auth().currentUser;
                if(!authUser)
                    return reject(`No user`);

                const uid = authUser.uid;
                return Promise.all([
                    fbApp.database().ref(`users/${uid}`).once('value'),
                    fbAppAuth.database().ref(`users/${uid}`).once('value')
                ]).then((results) => {
                    const dbApp = results[0].val();
                    const dbAuth = results[1].val();
                    resolve({ dbApp, dbAuth });
                })
            })
        },
        meetsAuthRequirement() {
            return new Promise((resolve, reject) => {
                const requirementFn = lodash.get(opts, "requiresAuth") || lodash.get(opts, "authRequired")
                if(typeof requirementFn !== 'function')
                    return resolve();

                return authFunctions.getUser().then(({ dbApp, dbAuth }) => {
                    gFuncs.genericResolver(requirementFn, dbApp, dbAuth).then(resolve).catch(reject);
                }).catch(reject);
            })
        },
        authenticateWithChildFirebase() {
            const remoteRestAuthLinkFn = lodash.get(opts, "remoteRestAuthLinkFunction")

            function sendAuthTokenToServer() {
                return new Promise((resolve, reject) => {
                    if (!remoteRestAuthLinkFn)
                        return reject(`no removeRestAuthLinkFn provided in authConfig`);

                    if (!projectId)
                        return reject(`no projectId provided in fbConfig`);

                    return fbAppAuth.auth().currentUser.getIdToken(true)
                        .then((token) => {
                            const sendObj = { token, projectId }
                            axios.post(remoteRestAuthLinkFn, sendObj, { 'Content-Type': 'application/json' })
                                .then((res) => {
                                    const responseToken = lodash.get(res, "data.token") || lodash.get(res, "token");
                                    if (!responseToken)
                                        return reject(`Master auth server sent no token back!`);

                                    return resolve(responseToken);
                                }).catch(reject);
                        })
                })
            }

            function fbAppSignInWithToken(token) {
                return fbApp.auth().signInWithCustomToken(token);
            }

            return new Promise((resolve, reject) => {
                sendAuthTokenToServer().then(fbAppSignInWithToken).then(resolve).catch(reject);
            })
        }
    }

    if (id) {
        helpers.addReference(id, fbApp, fbAppAuth);
    }

    self.start = loginFlow.start
    self.state = state;
    self.dismiss = dialogs.dismiss;
    self.authChgEvent = authChgEvent
    self.meetsAuthRequirement = authFunctions.meetsAuthRequirement
    self.destroy = () => {
        return new Promise((resolve, reject) => {
            // unsub authChange functions
            if (authFunctions.unsubAppFn) {
                authFunctions.unsubAppFn();
                authFunctions.unsubAppFn = null;
            }

            if (authFunctions.unsubAuthFn) {
                authFunctions.unsubAuthFn();
                authFunctions.unsubAuthFn = null;
            }

            dialogs.dismiss();

            state.isVisible = false;
            return helpers.destroy(id, fbApp, fbAppAuth).then(resolve).catch(reject);
        })
    }
    self.isVisible = () => {
        return state.isVisible;
    }

    state.currentUser.auth = fbAppAuth.auth().currentUser;
    state.currentUser.app = fbApp.auth().currentUser;

    authFunctions.subscribeToAuthChangeOnMaster();
    authFunctions.subscribeToAuthChangeOnChild();
}

export default builder;
