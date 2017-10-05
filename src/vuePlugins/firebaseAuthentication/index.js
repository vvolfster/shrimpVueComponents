import Firebase from 'firebase'
import FirebaseUI from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

import lodash from 'lodash'
import MouseTrap from 'mousetrap'
import axios from 'axios'
import GenericSubscriptionWrapper from '../../misc/genericSubscriptionWrapper'
import Toast from '../toasts'
import '../../../cssImporter'
import gFuncs from '../../misc/functions'

import Dialog from '../../layout/dialog'
import './css.css'


const subMgr = new GenericSubscriptionWrapper({ listen: "addEventListener", unlisten: "removeEventListener" });
const providerMap = {
    // Leave the lines as is for the providers you want to offer your users.
    google: Firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    facebook: Firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    twitter: Firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    github: Firebase.auth.GithubAuthProvider.PROVIDER_ID,
    email: Firebase.auth.EmailAuthProvider.PROVIDER_ID,
    phone: Firebase.auth.PhoneAuthProvider.PROVIDER_ID
}

const state = {
    defaults: {
        authRequiredHtml: `<div class='column items-center justify-center fill'>
            <div class="row items-center">
                You must be &nbsp<b>logged in</b>&nbsp to view this page.
            </div>
            <button qa="authRequiredBtn" class="black-border bg-primary text-white rounded margin-top text-no-transform">
                Log in
            </button>
        </div>`,
        signInProviders: ["email", "google"]
    },
    opts: null,
    currentUser: null,
    fbApp: null,
    fbAppAuth: null,
    fbConfig: null,
    dialogs: {
        d1: null,
        d2: null,
        dismiss() {
            if (state.dialogs.d1) {
                state.dialogs.d1.dismiss(true);
            }

            if (state.dialogs.d2)
                state.dialogs.d2.parentNode.removeChild(state.dialogs.d2);

            state.dialogs.d1 = null;
            state.dialogs.d2 = null;

            const el = document.getElementById('auth-topLevel-container');
            if (el)
                el.parentNode.removeChild(el);
        },
    },
    uiConfig: {
        // signInSuccessUrl: '<url-to-redirect-to-on-success>',
        tosUrl: '<your-tos-url>',
        signInFlow: "popup",
        // signInOptions: [
        //     // Leave the lines as is for the providers you want to offer your users.
        //     Firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        //     // Firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        //     // Firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        //     // Firebase.auth.GithubAuthProvider.PROVIDER_ID,
        //     // Firebase.auth.EmailAuthProvider.PROVIDER_ID,
        //     // Firebase.auth.PhoneAuthProvider.PROVIDER_ID
        // ],
        callbacks: {
            signInSuccess() {
                // console.log(`signInSuccess allegedly`)
                state.dialogs.d2.showBusy();
                return false;
            }
        }
    },
    dbUser: {
        app: null,
        auth: null
    },
    authUnsubFunctions: {
        app: null,
        auth: null
    },
    otherApps: {},
}


const functions = {
    getDisplayName(user) {
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
    reset() {
        return new Promise((resolve, reject) => {
            // unsub authChange functions
            if (state.authUnsubFunctions.app) {
                state.authUnsubFunctions.app();
                state.authUnsubFunctions.app = null;
            }

            if (state.authUnsubFunctions.auth) {
                state.authUnsubFunctions.auth();
                state.authUnsubFunctions.auth = null;
            }

            // delete app & auth firebase apps
            const delPromises = [];
            if (state.fbApp !== state.fbAppAuth) {
                if (state.fbApp)
                    delPromises.push(state.fbApp.delete())

                if (state.fbAppAuth)
                    delPromises.push(state.fbAppAuth.delete())
            }
            else if (state.fbApp) { // they are both the same in this case, so we can delete one and be done with it.
                delPromises.push(state.fbApp.delete())
            }

            // delete other apps
            lodash.each(state.otherApps, v => delPromises.push(v.delete()))

            Promise.all(delPromises).then(() => {
                state.fbApp = null;
                state.fbAppAuth = null;
                lodash.each(state.otherApps, (v, k) => delete state.otherApps[k])

                // emit!
                if (document)
                    document.dispatchEvent(new CustomEvent('fbAuthenticationClear'));

                resolve();
            }).catch(reject);
        })
    },
    loginFlow: {
        start() {
            const signInProviders = lodash.get(state, "opts.signInOptions") || state.defaults.signInProviders;
            const federatedIDProviders = lodash.filter(signInProviders, s => s !== 'email')
            if(signInProviders.indexOf('email') !== -1)
                return functions.loginFlow.showEmailAndPasswordDialog();
            else if(federatedIDProviders.length)
                return functions.loginFlow.showFirebaseAuth();

            throw new Error(`firebaseAuthentication::No sign in options provided!`)
        },
        showEmailAndPasswordDialog() {
            const fbAppAuth = state.fbAppAuth;
            const createNewUsers = lodash.get(state, "opts.createNewUsers", true);
            const authNeeded = !!(lodash.get(state, "opts.authRequired") || lodash.get(state, "opts.requiresAuth"));
            const signInProviders = lodash.get(state, "opts.signInOptions") || state.defaults.signInProviders;
            const otherSignInProviders = lodash.filter(signInProviders, s => s !== 'email');

            const buttons = {
                Submit({ email, password }) {
                    return new Promise((resolve, reject) => {
                        // indirect resolve here
                        state.dialogs.d1Reject = reject;
                        subMgr.subscribe(document, 'authStateChanged', (e) => {
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

            if(otherSignInProviders.length)
                buttons["Log In With Auth Providers"] = functions.loginFlow.showFirebaseAuth

            state.dialogs.dismiss();

            state.dialogs.d1 = Dialog.create({
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

                    state.dialogs.d1 = null;
                    state.dialogs.d1Reject = null;
                }
            })
        },
        showFirebaseAuth() {
            const authNeeded = !!(lodash.get(state, "opts.authRequired") || lodash.get(state, "opts.requiresAuth"));
            const signInProviders = lodash.get(state, "opts.signInOptions") || state.defaults.signInProviders;
            const signInOptions = lodash.reduce(signInProviders, (acc, v) => {
                if(v === 'email')
                    return acc;

                acc.push(providerMap[v])
                return acc;
            }, [])

            if (!state.ui)
                state.ui = new FirebaseUI.auth.AuthUI(state.fbAppAuth.auth());

            if (!document.getElementById('firebaseui-auth-container')) {
                const frag = document.createDocumentFragment();
                const topLevelNode = document.createElement('div');
                topLevelNode.className = 'absolute fill column justify-center items-center'
                topLevelNode.id = "auth-topLevel-container"
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
                                functions.loginFlow.showEmailAndPasswordDialog();
                                topLevelNode.parentNode.removeChild(topLevelNode);
                            }
                            // else case, too bad. You can't kill this since authIsNeeded :)
                        }
                        else {
                            topLevelNode.parentNode.removeChild(topLevelNode);
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
                authUIContainerNode.id = 'firebaseui-auth-container';
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

                state.dialogs.d2 = topLevelNode;
                frag.appendChild(topLevelNode);
                document.body.appendChild(frag);
            }

            state.ui.start('#firebaseui-auth-container', lodash.assign({ signInOptions }, state.uiConfig));
        },
        authenticateWithChildFirebase() {
            const fbAppAuth = state.fbAppAuth;
            const fbApp = state.fbApp;
            const projectId = lodash.get(state, "fbConfig.projectId");
            const remoteRestAuthLinkFn = lodash.get(state, "opts.remoteRestAuthLinkFunction")

            function sendAuthTokenToServer() {
                return new Promise((resolve, reject) => {
                    if (!remoteRestAuthLinkFn)
                        return reject(`no removeRestAuthLinkFn provided in authConfig`);

                    if (!projectId)
                        return reject(`no projectId provided in fbConfig`);

                    // console.log('getIdToken', fbAppAuth.auth().currentUser.getIdToken, 'currentUser', fbAppAuth.auth().currentUser)
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
    },
    authChange: {
        subscribeToAuthChangeOnMaster({ fbApp, fbAppAuth }) {
            state.authUnsubFunctions.auth = fbAppAuth.auth().onAuthStateChanged((u) => {
                const user = fbApp.auth().currentUser || u;
                if (fbApp === fbAppAuth)
                    return; // they are both the same.

                function catcher() {
                    fbAppAuth.auth().signOut();
                    fbApp.auth().signOut();

                    if (typeof state.dialogs.d1Reject === 'function'){
                        state.dialogs.d1Reject();
                        state.dialogs.d1Reject = null;
                    }
                }

                if (user) {
                    functions.authChange.addUserToAuthDb({ fbAppAuth, user }).then(functions.loginFlow.authenticateWithChildFirebase).catch(catcher);
                }
                else {
                    fbApp.auth().signOut();
                }
            });
        },
        subscribeToAuthChangeOnChild({ fbApp, fbAppAuth }) {
            const authNeeded = !!(lodash.get(state, "opts.authRequired") || lodash.get(state, "opts.requiresAuth"))

            function greet(user) {
                Toast.positive(`Welcome ${functions.getDisplayName(user)}`)
                state.dialogs.dismiss();
            }

            function finishUp(user) {
                state.currentUser = user;
                if (document)
                    document.dispatchEvent(new CustomEvent('authStateChanged', { detail: user }));
            }

            state.authUnsubFunctions.app = fbApp.auth().onAuthStateChanged((u) => {
                if (u) {
                    // on reload of pages, sometimes the fbAppAuth logs in after.
                    // so the userName you get at first is incorrect. It is best to
                    // wait I guess for fbAppAuth.auth().currentUser
                    let appAuthUser = fbAppAuth.auth().currentUser;
                    const flow = () => {
                        functions.authChange.addUserToChildDb({ fbApp, user: appAuthUser }).then((dbUser) => {
                            const doRequirementCheckAndContinue = (appAuthDbUser) => {
                                functions.authChange.meetsAuthRequirement({
                                    user: dbUser,
                                    authUser: appAuthDbUser,
                                    requirementFn: lodash.get(state, "opts.userRequirement") || lodash.get(state, "opts.authRequirement"),
                                }).then(() => {
                                    state.dbUser.app = dbUser;
                                    state.dbUser.auth = appAuthDbUser;

                                    greet(appAuthUser);
                                    finishUp(appAuthUser);
                                }).catch((err) => {
                                    fbApp.auth().signOut();
                                    fbAppAuth.auth().signOut();

                                    if (typeof state.dialogs.d1Reject === 'function'){
                                        state.dialogs.d1Reject(err);
                                        state.dialogs.d1Reject = null;
                                    }
                                    else
                                        Toast.negative(err);
                                })
                            }

                            if (fbApp !== fbAppAuth) {
                                fbAppAuth.database().ref(`users/${appAuthUser.uid}`).once('value').then(snap => doRequirementCheckAndContinue(snap.val()))
                            }
                            else
                                doRequirementCheckAndContinue();
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
                    // if there was a user in our state, that means we logged out here.
                    if (state.currentUser)
                        Toast("Logged out");

                    if (authNeeded) {
                        functions.loginFlow.start();
                    }

                    state.dbUser.app = null;
                    state.dbUser.auth = null;
                    finishUp(null)
                }
            })
        },
        addUserToAuthDb({ fbAppAuth, user }) {
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
        addUserToChildDb({ fbApp, user }) {
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
        handleChangeOnComponent(user) {
            // console.log(`handleAuthChanged`, this, this.$el, user);
            const self = this;
            self.authUser = user;
            self.authUserId = lodash.get(user, 'uid') || lodash.get(user, 'id') || lodash.get(user, ".key");

            const el = self.$el;
            if (!el)
                return;

            const html = functions.get(self, ["authHtml", "authHTML"]) || functions.get(state, ["opts.authRequiredHtml", "opts.authRequiredHTML"]) || state.defaults.authRequiredHtml;
            const requiresAuth = lodash.get(self, "requiresAuth") || lodash.get(self, "authRequired") || false;

            function findReplacementNode() {
                const siblings = el.parentNode.childNodes;
                const linkedNode = lodash.find(siblings, s => s.linkedVueComponent === self);
                return linkedNode;
            }

            function hideComponent() {
                if (html && !findReplacementNode()) {
                    const frag = document.createDocumentFragment();
                    const newNode = document.createElement("div");

                    newNode.innerHTML = html;
                    newNode.linkedVueComponent = self;
                    newNode.className = 'fill'
                    frag.appendChild(newNode);

                    const loginBtn = lodash.get(newNode.querySelectorAll(`[qa='authRequiredBtn']`), '0');
                    if (loginBtn) {
                        loginBtn.addEventListener('click', functions.loginFlow.start)
                    }

                    el.parentNode.appendChild(frag);
                }

                el.classList.add('hidden');
            }

            function showComponent() {
                el.classList.remove('hidden');
                const linkedNode = findReplacementNode();
                if (linkedNode) {
                    // console.log(`removing node`, linkedNode)
                    el.parentNode.removeChild(linkedNode);
                }
            }


            if (!user) {
                if (requiresAuth)
                    hideComponent();
            }
            else if (requiresAuth && typeof requiresAuth === 'function') {
                gFuncs.genericResolver(requiresAuth, state.dbUser.app, state.dbUser.auth).then(showComponent).catch(hideComponent);
            }
            else {
                showComponent();
            }
        },
        meetsAuthRequirement({ user, authUser, requirementFn }) {
            return new Promise((resolve, reject) => {
                if (typeof requirementFn !== 'function')
                    return resolve();

                return gFuncs.genericResolver(requirementFn, user, authUser).then(resolve).catch(reject);
            })
        }
    },
    validateConfigObject(conf) {
        function isObject(o) {
            return toString.call(o) === '[object Object]'
        }

        function reject(msg) {
            return `firebaseAuthenticationPlugin::${msg}`
        }

        function missingKeysInAppObject(o) {
            const requiredKeys = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'storageBucket', 'messagingSenderId']
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

        const otherApps = lodash.get(conf, "otherApps");
        if (otherApps) {
            const badApps = lodash.reduce(otherApps, (acc, v, k) => {
                const missingKeysInApp = missingKeysInAppObject(v);
                if (missingKeysInApp.length)
                    acc.push(k);
                return acc;
            }, []);

            if (badApps.length)
                return reject(`The following apps in otherApps have keys missing: ${badApps.join(',')}`)
        }

        const userRequirement = lodash.get(conf, "userRequirement") || lodash.get(conf, "authRequirement");
        if (userRequirement && !lodash.isFunction(userRequirement))
            return reject(`The requirement function should be a function!`)

        const signInOptions = lodash.get(conf, "signInOptions");
        if (signInOptions) {
            if (!lodash.isArray(signInOptions))
                return reject(`Sign in options must be an array`);

            const badKeys = lodash.reduce(signInOptions, (acc, v) => {
                if (!providerMap[v])
                    acc.push(v);
                return acc;
            }, [])

            if (badKeys.length)
                return reject(`Invalid sign options: ${badKeys.join(',')}`)
        }

        return true;
    },
    get(obj, paths, defaultVal) {
        let val;
        lodash.some(paths, (p) => {
            val = lodash.get(obj, p, undefined)
            return val !== undefined;
        })
        return val !== undefined ? val : (defaultVal || null);
    }
}

const exportFunctions = {
    install(VuePtr, opts) {
        function copyAppsIntoVue() {
            if (!VuePtr.fbApps)
                VuePtr.fbApps = {}

            VuePtr.fbApps.app = state.fbApp;
            VuePtr.fbApps.auth = state.fbAppAuth;
            lodash.each(state.otherApps, (v, k) => {
                VuePtr.fbApps[k] = v;
            })
        }

        if (!VuePtr.fbAuthenticationInstalled) {
            document.addEventListener('fbAuthenticationInitialized', copyAppsIntoVue)
            document.addEventListener('fbAuthenticationClear', () => { VuePtr.fbApps = {} })
            VuePtr.mixin({
                beforeDestroy() {
                    subMgr.unsubscribe({ id: this });
                },
                mounted() {
                    // we are using the element itself as its id. This makes us not \have to keep track of this thing.
                    const self = this;
                    functions.authChange.handleChangeOnComponent.apply(self, [state.currentUser]);
                    subMgr.subscribe(document, "authStateChanged", e => functions.authChange.handleChangeOnComponent.apply(self, [e.detail]), self);
                },
                data() {
                    return { authUser: null, authUserId: null }
                },
            })

            MouseTrap.bind('f7', () => {
                if (state.currentUser) {
                    if (state.fbAppAuth)
                        state.fbAppAuth.auth().signOut();

                    if (state.fbApp)
                        state.fbApp.auth().signOut();
                }
                else if (!state.dialogs.d1) {
                    state.dialogs.dismiss();
                    functions.loginFlow.start();
                }
            })

            copyAppsIntoVue();
            VuePtr.fbAuthenticationInstalled = true;
        }

        exportFunctions.initFb(opts).catch((err) => {
            if (err !== 'firebaseAuthenticationPlugin::fbConfig is not an object!')
                console.error(err);
        });
    },
    initFb(opts) {
        return new Promise((resolve, reject) => {
            if (lodash.isEqual(state.opts, opts)) {
                // console.log(`initFb -> hello`)
                return resolve();
            }

            const validateResult = functions.validateConfigObject(opts);
            if (typeof validateResult === 'string')
                return reject(validateResult);

            state.opts = opts;
            return functions.reset().then(() => {
                const config = lodash.get(opts, "fbConfig")
                const authConfig = lodash.get(opts, "authConfig") || lodash.get(opts, "masterAuthConfig") || config;
                const otherApps = lodash.get(opts, "otherApps");
                const signInOptions = lodash.get(opts, "signInOptions");
                if (signInOptions)
                    state.signInProviders = signInOptions;

                if (!config)
                    return reject(`No Config in opts. ${JSON.stringify(opts, null, 2)}`);

                const fbApp = Firebase.initializeApp(config);
                const fbAppAuth = config !== authConfig ? Firebase.initializeApp(authConfig, "auth") : fbApp;

                if (otherApps) {
                    lodash.each(otherApps, (v, k) => {
                        if (!k || !v)
                            return;

                        state.otherApps[k] = Firebase.initializeApp(v, k);
                    })
                }

                // console.log(`initFb -> hello`)
                state.fbApp = fbApp;
                state.fbAppAuth = fbAppAuth;
                state.fbConfig = config;
                state.authConfig = authConfig;

                functions.authChange.subscribeToAuthChangeOnMaster({ fbAppAuth, fbApp });
                functions.authChange.subscribeToAuthChangeOnChild({ fbApp, fbAppAuth })

                document.dispatchEvent(new CustomEvent('fbAuthenticationInitialized'));
                return resolve();
            }).catch(reject)
        })
    },
    getState() {
        return state;
    }
}

export default exportFunctions;
