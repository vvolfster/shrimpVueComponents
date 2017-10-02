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
const state = {
    authRequiredHtml: `<div class='column items-center justify-center fill'>
        <div class="row items-center">
            You must be &nbsp<b>logged in</b>&nbsp to view this page.
        </div>
        <button qa="authRequiredBtn" class="black-border bg-primary text-white rounded margin-top text-no-transform">
            Log in
        </button>
    </div>`,
    currentUser: null,
    fbApp: null,
    fbAppAuth: null,
    fbConfig: null,
    dialogs: {
        d1: null,
        d2: null,
        dismiss() {
            if (state.dialogs.d1){
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
        signInOptions: [
            // Leave the lines as is for the providers you want to offer your users.
            Firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            Firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            // Firebase.auth.TwitterAuthProvider.PROVIDER_ID,
            // Firebase.auth.GithubAuthProvider.PROVIDER_ID,
            // Firebase.auth.EmailAuthProvider.PROVIDER_ID,
            // Firebase.auth.PhoneAuthProvider.PROVIDER_ID
        ],
        callbacks: {
            signInSuccess() {
                // console.log(`signInSuccess allegedly`)
                state.dialogs.d2.showBusy();
                return false;
            }
        }
    }
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
    loginFlow: {
        showEmailAndPasswordDialog() {
            const fbAppAuth = state.fbAppAuth;
            const createNewUsers = lodash.get(state, "createNewUsers", true);
            const authNeeded = !!(lodash.get(state, "fbConfig.authRequired") || lodash.get(state, "fbConfig.requiresAuth"))

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
                buttons: {
                    "Log In With Auth Providers": functions.loginFlow.showFirebaseAuth,
                    Submit({ email, password }) {
                        return new Promise((resolve, reject) => {
                            // indirect resolve here
                            state.dialogs.d1Reject = reject;
                            subMgr.subscribe(document, 'authStateChanged', (e) => {
                                if(e.detail) {
                                    localStorage.setItem('firebaseAuthPluginUser', email);
                                    localStorage.setItem('firebaseAuthPluginPw', password);
                                    resolve();
                                }
                            }, `state.dialogs.d1`);

                            fbAppAuth.auth().signInWithEmailAndPassword(email, password).catch((err) => {
                                const errCode = lodash.get(err, "code");
                                if(errCode !== `auth/user-not-found`)
                                    return reject(err.message);

                                if (createNewUsers)
                                    return fbAppAuth.auth().createUserWithEmailAndPassword(email, password).catch(reject);

                                return reject(err.message);
                            })
                        })
                    }
                },
                onDismiss() {
                    if(subMgr.has(`state.dialogs.d1`))
                        subMgr.unsubscribe({ id: `state.dialogs.d1` });

                    state.dialogs.d1 = null;
                    state.dialogs.d1Reject = null;
                }
            })
        },
        showFirebaseAuth() {
            const authNeeded = !!(lodash.get(state, "fbConfig.authRequired") || lodash.get(state, "fbConfig.requiresAuth"))
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
                    if(e.stopPropagation)
                        e.stopPropagation();

                    if (!topLevelNode.busy){
                        if(authNeeded)
                            functions.loginFlow.showEmailAndPasswordDialog();

                        topLevelNode.parentNode.removeChild(topLevelNode);
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

                    if(authUIContainerNode) {
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

            state.ui.start('#firebaseui-auth-container', state.uiConfig);
        },
        authenticateWithChildFirebase() {
            const fbAppAuth = state.fbAppAuth;
            const fbApp = state.fbApp;
            const projectId = lodash.get(state, "fbConfig.projectId");
            const remoteRestAuthLinkFn = lodash.get(state, "authConfig.remoteRestAuthLinkFunction")

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
            fbAppAuth.auth().onAuthStateChanged((u) => {
                const user = fbApp.auth().currentUser || u;
                if (fbApp === fbAppAuth)
                    return; // they are both the same.

                function catcher() {
                    fbAppAuth.auth().signOut();
                    fbApp.auth().signOut();

                    if(typeof state.dialogs.d1Reject === 'function')
                        state.dialogs.d1Reject();
                }

                if (user) {
                    functions.authChange.addUserToAuthDb({ fbAppAuth, user }).then((dbUserRecord) => {
                        // at this point we know that fbApp and fbAuthApp are not the same. So let's look in authConfig for requirementFn here
                        const requirementFn = lodash.get(state, "authConfig.userRequirement") || lodash.get(state, "authConfig.authRequirement")
                        functions.authChange.meetsAuthRequirement({ requirementFn, user: dbUserRecord }).then(() => {
                            functions.loginFlow.authenticateWithChildFirebase().catch(catcher)
                        }).catch(catcher);
                    })
                }
                else {
                    fbApp.auth().signOut();
                }
            });
        },
        subscribeToAuthChangeOnChild({ fbApp, fbAppAuth }) {
            const authNeeded = !!(lodash.get(state, "fbConfig.authRequired") || lodash.get(state, "fbConfig.requiresAuth"))

            function greet(user) {
                Toast.positive(`Welcome ${functions.getDisplayName(user)}`)
                state.dialogs.dismiss();
            }

            function finishUp(user) {
                state.currentUser = user;
                if (document)
                    document.dispatchEvent(new CustomEvent('authStateChanged', { detail: user }));
            }

            fbApp.auth().onAuthStateChanged((u) => {
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
                                    requirementFn: lodash.get(state, "fbConfig.userRequirement") || lodash.get(state, "fbConfig.authRequirement"),
                                    authUser: appAuthDbUser
                                }).then(() => {
                                    greet(appAuthUser);
                                    finishUp(appAuthUser);
                                }).catch((err) => {
                                    fbApp.auth().signOut();
                                    fbAppAuth.auth().signOut();

                                    if(typeof state.dialogs.d1Reject === 'function')
                                        state.dialogs.d1Reject(err);
                                    else
                                        Toast.negative(err);
                                })
                            }

                            if(fbApp !== fbAppAuth){
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
                        functions.loginFlow.showEmailAndPasswordDialog();
                    }

                    finishUp(null)
                }
            })
        },
        addUserToAuthDb({ fbAppAuth, user }) {
            return new Promise((resolve) => {
                const userRef = fbAppAuth.database().ref(`users/${user.uid}`)
                userRef.once('value', (snap) => {
                    if(snap.exists())
                        return resolve(snap.val());

                    function find(key) {
                        if(user[key])
                            return user[key];

                        const provider = lodash.find(user.providerData, p => p[key])
                        if(provider)
                            return provider[key];

                        return null;
                    }

                    const userRecord =  {
                        dateCreated: new Date().toISOString(),
                        id: user.uid,
                        email: find('email'),
                        photoURL: find('photoURL'),
                        displayName: find('displayName'),
                        firstName: find('firstName') || find('first'),
                        lastName: find('lastName') || find('last')
                    }

                    if(userRecord.displayName){
                        const dArr = userRecord.displayName.split(' ');
                        if(dArr.length > 1){
                            userRecord.firstName = dArr[0];
                            userRecord.lastName = lodash.last(dArr);
                        }
                    }

                    return userRef.set(userRecord).then(() => resolve(userRecord));
                })
            })
        },
        addUserToChildDb({ fbApp, user }){
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

                    if(!idRes)
                        outPromises.push(refs.id.set(user.uid))

                    if(!dateCreatedResult)
                        outPromises.push(refs.dateCreated.set(new Date().toISOString()))

                    Promise.all(outPromises).then(() => {
                        userRef.once('value').then(snap => resolve(snap.val()))
                    }).catch(reject);
                }).catch(reject);
            })
        },
        handleChangeOnComponent(user) {
            // console.log(`handleAuthChanged`, this, this.$el, user);
            this.authUser = user;
            this.authUserId = lodash.get(user, 'uid') || lodash.get(user, 'id') || lodash.get(user, ".key");

            const el = this.$el;
            if (!el)
                return;

            const requiresAuth = lodash.get(this, "requiresAuth") || lodash.get(this, "authRequired") || false;
            if (!user) {
                if (requiresAuth) {
                    const frag = document.createDocumentFragment();
                    const newNode = document.createElement("div");

                    newNode.innerHTML = state.authRequiredHtml;
                    newNode.linkedVueComponent = this;
                    newNode.className = 'fill'
                    frag.appendChild(newNode);

                    const loginBtn = lodash.get(newNode.querySelectorAll(`[qa='authRequiredBtn']`), '0');
                    if (loginBtn) {
                        loginBtn.addEventListener('click', functions.loginFlow.showEmailAndPasswordDialog)
                    }

                    el.parentNode.appendChild(frag);
                    el.classList.add('hidden');
                }
            }
            else {
                // derp
                // find the node. remove it.
                el.classList.remove('hidden');

                const siblings = el.parentNode.childNodes;
                const linkedNode = lodash.find(siblings, s => s.linkedVueComponent === this);
                if (linkedNode) {
                    // console.log(`removing node`, linkedNode)
                    el.parentNode.removeChild(linkedNode);
                }
            }
        },
        meetsAuthRequirement({ user, authUser, requirementFn }) {
            return new Promise((resolve, reject) => {
                if(typeof requirementFn !== 'function')
                    return resolve();

                return gFuncs.genericResolver(requirementFn, user, authUser).then(resolve).catch(reject);
            })
        }
    }
}

export default {
    install(VuePtr, opts) {
        const config = lodash.get(opts, "fbConfig")
        const authConfig = lodash.get(opts, "authConfig") || lodash.get(opts, "masterAuthConfig") || config;
        const authHtml = lodash.get(config, "authRequiredHtml") || lodash.get(opts, "authRequiredHtml")

        if (typeof authHtml === 'string')
            state.authRequiredHtml = authHtml;

        if (!config)
            return;

        const fbApp = Firebase.initializeApp(config);
        const fbAppAuth = config !== authConfig ? Firebase.initializeApp(authConfig, "auth") : fbApp;

        // assign to state & vuePtr
        VuePtr.fbApp = fbApp;
        VuePtr.fbAppAuth = fbAppAuth;

        state.fbApp = fbApp;
        state.fbAppAuth = fbAppAuth;
        state.fbConfig = config;
        state.authConfig = authConfig;

        // debugging only.
        window.fbAppAuth = fbAppAuth;

        // even though we log in thru fbApPAuth first, We must log into fbApp as well (using a token).
        functions.authChange.subscribeToAuthChangeOnMaster({ fbAppAuth, fbApp });
        functions.authChange.subscribeToAuthChangeOnChild({ fbApp, fbAppAuth })

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
                fbAppAuth.auth().signOut();
                fbApp.auth().signOut();
            }
            else if (!state.dialogs.d1) {
                state.dialogs.dismiss();
                functions.loginFlow.showEmailAndPasswordDialog();
            }
        })
    }
}
