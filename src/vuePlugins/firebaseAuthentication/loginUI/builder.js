import Firebase from 'firebase'
import lodash from 'lodash';
import FirebaseUI from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
import GenericSubscriptionWrapper from '../../../misc/genericSubscriptionWrapper'
import Dialog from '../../../layout/dialog'
import '../css.css'

const helpers = {
    generateDialogInstance() {
        const instance = {
            d1: null,
            d2: null,
            d1Reject: null,
            callbacks: {
                signInSuccess() {
                    if (instance.d2)
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
    }
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
            scopes: ['https://www.googleapis.com/auth/plus.login'],
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

function builder(opts) {
    const self = this;
    const fbConfig = lodash.get(opts, "fbConfig")
    const authConfig = lodash.get(opts, "authConfig") || lodash.get(opts, "masterAuthConfig");

    const fbApp = getApp(lodash.get(fbConfig, "projectId")) || Firebase.initializeApp(opts.fbConfig, fbConfig.projectId)
    const fbAppAuth = !authConfig ? fbApp : getApp(lodash.get(authConfig, "projectId")) || Firebase.initializeApp(opts.authConfig, authConfig.projectId)
    const dialogs = helpers.generateDialogInstance()
    const subMgr = new GenericSubscriptionWrapper({ listen: "addEventListener", unlisten: "removeEventListener" });
    const ui = new FirebaseUI.auth.AuthUI(fbAppAuth.auth());

    const state = {
        opts,
        fbApp,
        fbAppAuth,
        dialogs,
        subMgr,
        ui
    }

    const loginFlow = {
        start() {
            const signInProviders = lodash.get(opts, "signInOptions") || DEFAULT.signInProviders;
            const federatedIDProviders = lodash.filter(signInProviders, s => s !== 'email');
            if (signInProviders.indexOf('email') !== -1)
                return loginFlow.showEmailAndPasswordDialog({ fbApp, fbAppAuth, opts });
            else if (federatedIDProviders.length)
                return loginFlow.showFirebaseAuth({ fbApp, fbAppAuth, opts });

            throw new Error(`firebaseAuthentication/loginUI::No sign in options provided!`)
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

            if (otherSignInProviders.length)
                buttons["Log In With Auth Providers"] = () => loginFlow.showFirebaseAuth(fbApp, fbAppAuth, opts);

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
                                loginFlow.showEmailAndPasswordDialog(fbApp, fbAppAuth, opts);
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

                dialogs.d2 = topLevelNode;
                frag.appendChild(topLevelNode);
                document.body.appendChild(frag);
            }

            const callbacks = dialogs[fbAppAuth.options.projectId].callbacks;
            ui.start('#firebaseui-auth-container', lodash.assign({ signInOptions, callbacks }, DEFAULT.uiConfig));
        }
    }


    self.uiStart = loginFlow.start
    self.state = state;
}

export default builder;
