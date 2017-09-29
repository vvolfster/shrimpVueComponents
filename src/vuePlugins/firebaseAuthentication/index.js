import Firebase from 'firebase'
import FirebaseUI from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

import lodash from 'lodash'
import MouseTrap from 'mousetrap'
import axios from 'axios'
import GenericSubscriptionWrapper from '../../misc/genericSubscriptionWrapper'
import Toast from '../toasts'
import '../../../cssImporter'
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
            if (state.dialogs.d1)
                state.dialogs.d1.dismiss();

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
        start() {
            // console.log(`start login flow pls`)
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
                topLevelNode.addEventListener('click', () => {
                    if(!topLevelNode.busy)
                        topLevelNode.parentNode.removeChild(topLevelNode);
                })

                const backgroundNode = document.createElement('div');
                backgroundNode.className = 'bg-white shadow-1 column justify-center items-center'
                backgroundNode.style.borderRadius = '2px';

                const formNode = document.createElement('div');
                formNode.className = 'column justify-center items-center'
                formNode.innerHTML = `<h5 style='margin-bottom:10px'>LOG IN</h5>`
                formNode.style.padding = '5px';

                const busyNode = document.createElement('div');
                busyNode.className = 'fa fa-circle-o-notch spin text-blue'
                busyNode.style.visibility = 'hidden';
                busyNode.style.width = '0px';
                busyNode.style.height = '0px';


                const emailNode = document.createElement('div');
                emailNode.innerHTML = [
                    `<i class='fa fa-envelope' style='margin-left:20px;'></i>`,
                    `<div class='firebaseui-idp-text'>Sign in with Email</div>`
                ].join();

                emailNode.className = 'bg-red text-white text-no-transform h40 row justify-start items-center shadow-2'
                emailNode.style.width = '203px';
                emailNode.style.cursor = 'pointer';
                emailNode.addEventListener('click', functions.loginFlow.showEmailAndPasswordDialog)

                const authUIContainerNode = document.createElement('div');
                authUIContainerNode.id = 'firebaseui-auth-container';
                // const x = new MutationObserver((e) => {
                //     if(e[0].removedNodes)
                //         console.log(e[0].removedNodes);
                // })
                // x.observe(authUIContainerNode, { childList: true })

                formNode.appendChild(emailNode);
                formNode.appendChild(authUIContainerNode);
                backgroundNode.appendChild(formNode);
                backgroundNode.appendChild(busyNode);
                topLevelNode.appendChild(backgroundNode);

                topLevelNode.showBusy = () => {
                    topLevelNode.busy = true;

                    formNode.style.visibility = 'hidden';
                    formNode.style.width = '0px';
                    formNode.style.height = '0px';

                    busyNode.style.visibility = 'visible';
                    busyNode.style.width = 'auto';
                    busyNode.style.height = 'auto';

                    backgroundNode.style.padding = "20px";
                }

                state.dialogs.d2 = topLevelNode;

                frag.appendChild(topLevelNode);
                document.body.appendChild(frag);
            }

            state.ui.start('#firebaseui-auth-container', state.uiConfig);

            // state.dialogs.d1 = Dialog.create({
            //     title: "Login",
            //     style: 'width: 19.5vw; height: 20vh;',
            //     buttons: {
            //         Google() {
            //             return functions.loginFlow.google();
            //         },
            //         Facebook() {
            //             return functions.loginFlow.facebook();
            //         },
            //         EmailAndPassword() {
            //             state.dialogs.d2 = Dialog.create({
            //                 title: "Login",
            //                 form: {
            //                     email: {
            //                         type: String,
            //                         required: true,
            //                         model: localStorage.getItem('firebaseAuthPluginUser')
            //                     },
            //                     password: {
            //                         type: "password",
            //                         required: true,
            //                         model: localStorage.getItem('firebaseAuthPluginPw')
            //                     }
            //                 },
            //                 buttons: {
            //                     Submit(form, progress) {
            //                         return functions.loginFlow.emailAndPassword(form, progress)
            //                     }
            //                 },
            //                 onDismiss() {
            //                     state.dialog2 = null;
            //                 }
            //             })
            //         },
            //     },
            //     onDismiss() {
            //         state.dialogs.d1 = null;
            //     }
            // })
        },
        showEmailAndPasswordDialog() {
            const fbAppAuth = state.fbAppAuth;
            const createNewUsers = lodash.get(state, "createNewUsers", true);

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
                style: `width:268px;`,
                buttons: {
                    Submit({ email, password }) {
                        return new Promise((resolve, reject) => {
                            // indirect resolve here
                            subMgr.subscribe(document, 'authStateChanged', () => {
                                localStorage.setItem('firebaseAuthPluginUser', email)
                                localStorage.setItem('firebaseAuthPluginPw', password)
                                resolve();
                            }, `state.dialogs.d1`);

                            fbAppAuth.auth().signInWithEmailAndPassword(email, password).catch((err) => {
                                if (err.message !== "There is no user record corresponding to this identifier. The user may have been deleted.")
                                    return reject(err.message);

                                if (createNewUsers)
                                    return fbAppAuth.auth().createUserWithEmailAndPassword(email, password).catch(reject);

                                return reject(err.message);
                            })
                        })
                    }
                },
                onDismiss() {
                    subMgr.unsubscribe({ id: `state.dialogs.d1` });
                    state.dialogs.d1 = null;
                }
            })
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
    components: {
        handleAuthChg(user) {
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
                        loginBtn.addEventListener('click', functions.loginFlow.start)
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
        }
    }
}

export default {
    install(VuePtr, opts) {
        const config = lodash.get(opts, "fbConfig")
        const authConfig = lodash.get(opts, "authConfig") || lodash.get(opts, "masterAuthConfig") || config;
        const authNeeded = !!(lodash.get(config, "authRequired") || lodash.get(config, "requiresAuth"))
        const authHtml = lodash.get(config, "authRequiredHtml") || lodash.get(opts, "authRequiredHtml")

        if (typeof authHtml === 'string')
            state.authRequiredHtml = authHtml;

        // const authRequirementFn = lodash.get(config, "userRequirement") || lodash.get(config, "authRequirement");

        if (!config)
            return;

        const fbApp = Firebase.initializeApp(config);
        const fbAppAuth = config !== authConfig ? Firebase.initializeApp(authConfig, "auth") : fbApp;
        VuePtr.fbApp = fbApp;
        VuePtr.fbAppAuth = fbAppAuth;
        state.fbApp = fbApp;
        state.fbAppAuth = fbAppAuth;
        state.fbConfig = config;
        state.authConfig = authConfig;
        window.fbAppAuth = fbAppAuth;

        // even though we log in thru fbApPAuth first, We must log into fbApp as well (using a token).
        function authChgFn(u) {
            const user = fbApp.auth().currentUser || u;
            if (fbApp === fbAppAuth)
                return; // they are both the same.

            if (user) {
                functions.loginFlow.authenticateWithChildFirebase().catch(() => {
                    fbAppAuth.auth().signOut();
                    fbApp.auth().signOut();
                })
            }
            else {
                fbApp.auth().signOut();
            }
        }

        fbAppAuth.auth().onAuthStateChanged(authChgFn)

        fbApp.auth().onAuthStateChanged((u) => {
            function greet(user) {
                Toast.positive(`Welcome ${functions.getDisplayName(user)}`)
                state.dialogs.dismiss();
            }

            function finishUp(user) {
                state.currentUser = user;
                if (document) {
                    const event = new CustomEvent('authStateChanged', { detail: user });
                    document.dispatchEvent(event);
                }
            }

            if(u) {
                // on reload of pages, sometimes the fbAppAuth logs in after.
                // so the userName you get at first is incorrect. It is best to
                // wait I guess for fbAppAuth.auth().currentUser
                let appAuthUser = fbAppAuth.auth().currentUser;
                if(appAuthUser){
                    greet(appAuthUser);
                    finishUp(appAuthUser);
                }
                else {
                    const intId = setInterval(() => {
                        appAuthUser = fbAppAuth.auth().currentUser;
                        if(!appAuthUser)
                            return;

                        greet(appAuthUser);
                        finishUp(appAuthUser);
                        clearInterval(intId);
                    }, 250);
                }
            }
            else {
                if (state.currentUser)
                    Toast("Logged out");

                if (authNeeded) {
                    functions.loginFlow.start();
                }

                finishUp(null)
            }
        })

        VuePtr.mixin({
            beforeDestroy() {
                subMgr.unsubscribe({ id: this });
            },
            mounted() {
                // we are using the element itself as its id. This makes us not have to keep track of this thing.
                const self = this;
                functions.components.handleAuthChg.apply(self, [state.currentUser]);
                subMgr.subscribe(document, "authStateChanged", e => functions.components.handleAuthChg.apply(self, [e.detail]), self);
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
                functions.loginFlow.start();
            }
        })

        // if (fbAppAuth.auth().currentUser)
        //     authChgFn();
    }
}
