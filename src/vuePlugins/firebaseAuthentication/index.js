import Firebase from 'firebase'
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
                state.dialogs.d2.dismiss();

            state.dialogs.d1 = null;
            state.dialogs.d2 = null;
        },
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
            state.dialogs.d1 = Dialog.create({
                title: "Login",
                style: 'width: 19.5vw; height: 20vh;',
                buttons: {
                    Google() {
                        return functions.loginFlow.google();
                    },
                    Facebook() {
                        return functions.loginFlow.facebook();
                    },
                    EmailAndPassword() {
                        state.dialogs.d2 = Dialog.create({
                            title: "Login",
                            form: {
                                email: {
                                    type: String,
                                    required: true,
                                    model: localStorage.getItem('firebaseAuthPluginUser')
                                },
                                password: {
                                    type: "password",
                                    required: true,
                                    model: localStorage.getItem('firebaseAuthPluginPw')
                                }
                            },
                            buttons: {
                                Submit(form, progress) {
                                    return functions.loginFlow.emailAndPassword(form, progress)
                                }
                            },
                            onDismiss() {
                                state.dialog2 = null;
                            }
                        })
                    },
                },
                onDismiss() {
                    state.dialogs.d1 = null;
                }
            })
        },
        emailAndPassword({ email, password }, progress) {
            const fbAppAuth = state.fbAppAuth;
            const fbApp = state.fbApp;
            const projectId = lodash.get(state, "fbConfig.projectId");
            const remoteRestAuthLinkFn = lodash.get(state, "authConfig.remoteRestAuthLinkFunction")
            const createNewUsers = lodash.get(state, "createNewUsers", true);

            return new Promise((resolve, reject) => {
                function signInUp() {
                    return new Promise((resolve, reject) => {
                        fbAppAuth.auth().signInWithEmailAndPassword(email, password).then(resolve).catch((err) => {
                            if (err.message !== "There is no user record corresponding to this identifier. The user may have been deleted.")
                                return reject(err.message);

                            if (createNewUsers)
                                return fbAppAuth.auth().createUserWithEmailAndPassword(email, password).then(resolve).catch(reject);

                            return reject(err.message);
                        })
                    })
                }

                function sendAuthTokenToServer() {
                    if(progress)
                        progress(0.5);

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
                    if(progress)
                        progress(0.75);

                    return fbApp.auth().signInWithCustomToken(token);
                }

                function saveUserPwLocally() {
                    if(progress)
                        progress(0.99);

                    return new Promise((resolve) => {
                        localStorage.setItem('firebaseAuthPluginUser', email)
                        localStorage.setItem('firebaseAuthPluginPw', password)
                        resolve();
                    })
                }

                signInUp().then(() => {
                    if(progress)
                        progress(0.25);

                    if (fbApp === fbAppAuth)
                        return resolve();

                    return sendAuthTokenToServer()
                        .then(fbAppSignInWithToken)
                        .then(saveUserPwLocally)
                        .then(resolve)
                        .catch(reject);
                }).catch(reject);
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
                    console.log(`removing node`, linkedNode)
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

        // even though we log in thru fbApPAuth first, We must log into fbApp as well (using a token).
        fbApp.auth().onAuthStateChanged((u) => {
            const user = fbAppAuth.auth().currentUser || u;
            if (user) {
                Toast.positive(`Welcome ${functions.getDisplayName(user)}`)
                state.dialogs.dismiss();
            }
            else {
                if (state.currentUser)
                    Toast("Logged out");

                if (authNeeded) {
                    functions.loginFlow.start();
                }
            }

            state.currentUser = user;
            if (document) {
                const event = new CustomEvent('authStateChanged', { detail: user });
                document.dispatchEvent(event);
            }
        })

        VuePtr.fbApp = fbApp;
        VuePtr.fbAppAuth = fbAppAuth;
        state.fbApp = fbApp;
        state.fbAppAuth = fbAppAuth;
        state.fbConfig = config;
        state.authConfig = authConfig;

        window.fbAppAuth = fbAppAuth;

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
    }
}
