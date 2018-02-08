import Firebase from 'firebase'
import lodash from 'lodash'
import MouseTrap from 'mousetrap'
import GenericSubscriptionWrapper from '../../misc/genericSubscriptionWrapper'
import LoginFlow from './loginFlow'
import '../../../cssImporter'
import './css.css'
import gFuncs from '../../misc/functions'

function getApp(id) { return lodash.find(Firebase.apps, v => v.options.projectId === id) }
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
            <button qa="authRequiredBtn" class="svtbtn black-border bg-primary text-white rounded margin-top text-no-transform">
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
    destroy() {
        return new Promise((resolve, reject) => {
            // delete app & auth firebase apps
            const delPromises = [];
            if (state.loginFlow)
                delPromises.push(state.loginFlow.destroy());

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
    handleChangeOnComponent(user, forceRemoveLinkedNode) {
        // console.log(`handleAuthChanged`, this, this.$el, user);
        const self = this;
        self.authUser = user;
        self.authUserId = lodash.get(user, 'uid') || lodash.get(user, 'id') || lodash.get(user, ".key");
        self.dbUser.app = lodash.get(state, "loginFlow.state.currentUser.dbApp");
        self.dbUser.auth = lodash.get(state, "loginFlow.state.currentUser.dbAuth");

        const el = self.$el;
        if (!el)
            return;

        const html = functions.get(self, ["authHtml", "authHTML"]) || functions.get(state, ["opts.authRequiredHtml", "opts.authRequiredHTML"]) || state.defaults.authRequiredHtml;
        const requiresAuth = lodash.get(self, "requiresAuth") || lodash.get(self, "authRequired") || false;

        function findReplacementNode(remove) {
            const linkedNode = self.authReqFailedNode;
            if (remove) {
                if (linkedNode) {
                    linkedNode.parentNode.removeChild(linkedNode);
                    self.authReqFailedNode = null;
                }
                return null;
            }
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
                    loginBtn.addEventListener('click', () => {
                        if (state.loginFlow)
                            state.loginFlow.start()
                    })
                }

                el.parentNode.appendChild(frag);
                self.authReqFailedNode = newNode;
            }

            el.classList.add('hidden');
        }

        function showComponent() {
            if (el && el.classList)
                el.classList.remove('hidden');
            findReplacementNode(true);
        }

        if (forceRemoveLinkedNode) {
            showComponent();
            return;
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
    validateConfigObject(conf) {
        function isObject(o) {
            return toString.call(o) === '[object Object]'
        }

        function reject(msg) {
            return `firebaseAuthenticationPlugin::${msg}`
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

        const userRequirement = lodash.get(conf, "requiresAuth") || lodash.get(conf, "authRequired");
        if (userRequirement !== null && userRequirement !== undefined && (!lodash.isFunction(userRequirement) && !lodash.isBoolean(userRequirement)))
            return reject(`requiresAuth/authRequired should be a function or a boolean!`)

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
    },
    startLoginFlow() {
        if (!state.loginFlow.isVisible()) {
            state.loginFlow.dismiss();
            state.loginFlow.start()
        }
    },
    signOut() {
        if (state.fbAppAuth)
            state.fbAppAuth.auth().signOut();

        if (state.fbApp)
            state.fbApp.auth().signOut();
    }
}

const exportFunctions = {
    install(VuePtr, opts) {
        if (!opts || !lodash.keys(opts).length)
            return false;

        const err = functions.validateConfigObject(opts);
        const otherApps = lodash.get(opts, "otherApps");
        if (typeof err === 'string') {
            if (err !== 'firebaseAuthenticationPlugin::fbConfig is not an object!')
                console.error(err, opts);
            return false;
        }

        if (VuePtr.fbAuthenticationInstalled) {
            console.warn(`tried to install firebaseAuthention when it is already installed`);
            return false
        }

        if (!VuePtr.fbApps)
            VuePtr.fbApps = {}

        state.opts = opts;
        state.loginFlow = new LoginFlow(opts, `firebaseAuthentication`);
        const authChangedEventName = state.loginFlow.authChgEvent;

        state.fbApp = state.loginFlow.state.fbApp;
        state.fbAppAuth = state.loginFlow.state.fbAppAuth;
        VuePtr.fbApps.app = state.loginFlow.state.fbApp;
        VuePtr.fbApps.auth = state.loginFlow.state.fbAppAuth;
        if (otherApps) {
            lodash.each(otherApps, (v, k) => {
                if (!k || !v)
                    return;

                state.otherApps[k] = getApp(v.projectId) || Firebase.initializeApp(v, k);
                VuePtr.fbApps[k] = state.otherApps[k];
            })
        }

        // 1.2.17 - So that we can call this without needing a component! Currently the only way to do so.
        VuePtr.fbAuthenticationMethods = {
            startLoginFlow: functions.startLoginFlow,
            signOut: functions.signOut,
            getState: () => lodash.cloneDeep(state) // so the user cannot directly muck about with this.
        }

        VuePtr.fbAuthenticationUser = {
            authId: null,
            authUser: null,
            dbUser: null,
        }

        subMgr.subscribe(document, authChangedEventName, ({ detail }) => {
            state.currentUser = detail;
            state.dbUser.app = lodash.get(state, "loginFlow.state.currentUser.dbApp");
            state.dbUser.auth = lodash.get(state, "loginFlow.state.currentUser.dbAuth");

            VuePtr.fbAuthenticationUser.authId = lodash.get(detail, 'uid') || lodash.get(detail, 'id') || lodash.get(detail, ".key");
            VuePtr.fbAuthenticationUser.authUser = detail;
            VuePtr.fbAuthenticationUser.dbUser =  {
                app: state.dbUser.app,
                auth: state.dbUser.auth
            }
        }, VuePtr)


        // now add mixin
        VuePtr.mixin({
            beforeDestroy() {
                const self = this;
                subMgr.unsubscribe({ id: self });
                functions.handleChangeOnComponent.apply(self, [state.currentUser, true]);
            },
            mounted() { // we are using the element itself as its id. This makes us not \have to keep track of this thing.
                const self = this;
                functions.handleChangeOnComponent.apply(self, [state.currentUser]);
                subMgr.subscribe(document, authChangedEventName, e => functions.handleChangeOnComponent.apply(self, [e.detail]), self);
            },
            data() {
                return {
                    authUser: null,
                    authUserId: null,
                    dbUser: {
                        app: null,
                        auth: null
                    }
                }
            },
            methods: {
                startLoginFlow: functions.startLoginFlow,
                signOut: functions.signOut
            }
        })

        // add login logout shortcut key
        MouseTrap.bind('f7', () => {
            const loginFlowUser = lodash.get(state, "loginFlow.state.currentUser.auth");
            if (loginFlowUser) {
                functions.signOut();
            }
            else if (!state.loginFlow.isVisible()) {
                state.loginFlow.dismiss();
                state.loginFlow.start()
            }
        })

        // add listeners
        document.addEventListener('fbAuthenticationClear', () => { VuePtr.fbApps = {} })

        // mark the plugin as installed
        VuePtr.fbAuthenticationInstalled = true;
        VuePtr.fbAuthenticationEventName = authChangedEventName;

        // dispatch the name of the authChg event
        const customEvent = new CustomEvent('fbAuthenticationInstalled', { detail: { opts, authChangedEventName } })
        document.dispatchEvent(customEvent);

        return true;
    },
    getState() {
        return state;
    }
}

export default exportFunctions;
