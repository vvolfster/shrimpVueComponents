## firebaseAuthentication (Vue Plugin)
This is a powerful tool that allows the user to easily configure firebase authentication & manage firebase instances all in place. It is recommended that you install this plugin **before Vuex**. After installation, you can access the initiated firebase Apps through **Vue.fbApps.{appName}** (app & auth are always provided).

### TODO
Allow for configuration of sign In providers. Not terribly hard but not needed atm.

### Usage
There are a few ways to use this:
```javascript
import svt from 'shrimp-vue-components'
import Vue from 'vue'
import configObj from './localConfigObj'

// Inits all plugins. Passes the respective config object to each plugin.
// In this case, the value denoted by "firebaseAuthentication" shall be passed in
Vue.use(svt, {
	firebaseAuthentication: configObj
})

// OR
import svt from 'shrimp-vue-components'
import Vue from 'vue'

Vue.use(svt.plugins.firebaseAuthentication, configObj)

// OR
import Vue from 'vue'
import firebaseAuthentication from 'shrimp-vue-components/src/vuePlugins/firebaseAuthentication'

Vue.use(firebaseAuthentication, configObj);
```

### Effect on Components (Mixin)
Every component will have these in its **data:**

 - **authUserId** - Id of the authUser
 - **authUser** - The authUser object

If the component has **requiresAuth** as a truthy value in its **data** or **properties**, the component will be hidden until there is an authenticated user (and you will see a login button by default instead).

If the component has **requiresAuth** as a function in its **data** or **properties**, the user & authUser will be passed into the function. If the function returns a promise, it will be considered passed on resolve. If the function returns falsy values other  than undefined, it will be considered as failed. In the case of fail, the login button will be shown (by default).

If the component has a **authHtml** property as a string or HTML. It will be shown instead of the default one. If it is set to a falsy value, nothing will be shown if the **requiresAuth** conditions are not met.

An example of a vue component will be:
```javascript
import lodash from 'lodash'

export default {
	data() {
		return {
			requiresAuth: true,
			authHtml: "<h2>boo hoo</h2>"
			// or
			requiresAuth(user, authUser) {
				const role = lodash.get(user, "role") || lodash.get(authUser, "role");
				return role === 'owner'
			},
			authHtml: "<h2>boo hoo</h2>"
		}
	}
}
```



### The config object
This object has quite a lot of properties and features. It is divided into 4 main sections. You will need to retrieve the webAPI config object from the firebase console for each firebase project you are using. It looks something like this:

	Firebase Config Object: {
		apiKey: "AIzaSyC97H_XXXXXXXXXXXXXXXXXXXXXXX",
		authDomain: "wolf-XXXXXXXXXXXXX",
		databaseURL: "https://wolf-XXXXXXXXXXXX",
		projectId: "wolf-XXXXXXXXXXXX",
		storageBucket: "wolf-XXXXXXXXXXXX",
		messagingSenderId: "4487XXXXXXXXXXX"
	}
 
Properties

- **fbConfig** - Config for the main firebase app. Copy paste from firebase console. See above.

- **authConfig | masterAuthConfig (optional)** - Config for the firebase app that acts as an auth provider. Same option as the adminPanel. The remoteRestAuthLink function **must** be provided in the properties! Copy paste this from the firebase console. See above.

- **remoteRestAuthLinkFunction** - This URL must point to a REST function that accepts *{ projectId, token, email }* as request params. It must send back as response:  *{ token: someToken }* or *{ data: { token: someToken }}*.

- **otherApps (optional Object)** - Key Value pair dictionary of all other firebase apps you want to use.
	- **{key}** - What to name the firebase app.
	- **{value}** - *Firebase Config Object*. See above.

- **requiresAuth (user, authUser) (optional Function | Boolean)** - Tells Vue to require auth no matter what. The log in dialog will not be cancellable.
	- If boolean, any auth user will work fine.
	- If function, the plugin will pass the user & authUser (if different), to this function. If it returns undefined or a promise that resolves, the plugin will consider the userRequirement to be met. All other falsy values or rejected promise will be considered as failure to meet the requirement.

- **createNewUsers (optional Boolean)** - Tells the plugin that it can create new users if none exists. Only works with *emailAndPassword* auth method.


- **authRequiredHtml (optional Html | String)** - This html will be embedded into all Vue Components if they require the user to be authenticated & the user isn't. By default, this is a login button.

- **signInOptions (optional Array | Object)** - Defaults to ["email", "google"]. Options are ["email", "google", "twitter", "github" ]

-----

So all in all, the fbConfig object might look like this:
```javascript
import lodash from 'lodash'
// in localConfigObj.js file
export default {
	// This app will be accessible thru Vue.fbApps.app. If no authConfig is provided,
	// this app will act as the authApp as well, so Vue.fbApps.auth will also access 
	// this app
	fbConfig: { 
		apiKey: "AIzaSyC97H_XXXXXXXXXXXXXXXXXXXXXXX",
	    authDomain: "wolf-XXXXXXXXXXXXX",
	    databaseURL: "https://wolf-XXXXXXXXXXXX",
	    projectId: "wolf-XXXXXXXXXXXX",
	    storageBucket: "wolf-XXXXXXXXXXXX",
	    messagingSenderId: "4487XXXXXXXXXXX",
	},
	// This app will be accessible thru Vue.fbApps.auth
    authConfig: { 
	    // optional. Only use when you don't want your fb app to be the 
	    // main authennticator. Most people will not use this.
    	apiKey: "AIzaSyC97H_XXXXXXXXXXXXXXXXXXXXXXX",
		authDomain: "master-XXXXXXXXXXXXX",
		databaseURL: "https://master-XXXXXXXXXXXX",
		projectId: "master-XXXXXXXXXXXX",
		storageBucket: "master-XXXXXXXXXXXX",
		messagingSenderId: "6667XXXXXXXXXXX",
    },
    otherApps: {
	    // this app will be accessible thru Vue.fbApps.messaging
	    messaging: {
		    apiKey: "aeAIzaSyC97H_XXXXXXXXXXXXXXXXXXXXXXX",
			authDomain: "mess-XXXXXXXXXXXXX",
			databaseURL: "https://master-XXXXXXXXXXXX",
			projectId: "mess-XXXXXXXXXXXX",
			storageBucket: "mess-XXXXXXXXXXXX",
			messagingSenderId: "5557XXXXXXXXXXX",
	    },
	    // this app will be accessible thru Vue.fbApps.achievements
  	    achievements: {
		    apiKey: "aeAIzaSyC97H_XXXXXXXXXXXXXXXXXXXXXXX",
			authDomain: "achiev-XXXXXXXXXXXXX",
			databaseURL: "https://achiev-XXXXXXXXXXXX",
			projectId: "achiev-XXXXXXXXXXXX",
			storageBucket: "achiev-XXXXXXXXXXXX",
			messagingSenderId: "5557XXXXXXXXXXX",
	    },
    },
    // Will be sent { projectId, token, email }. 
	// Expect to receive as a response as:
	// { token: someToken } or { data: { token: someToken }}
	remoteRestAuthLinkFunction: 'https://XXXX.cloudfunctions.net/getToken' 
   	requiresAuth: true,
	createNewUsers: false,
	authRequirement(user, authUser) {
	    return new Promise((resolve, reject) => {
			const email = lodash.get(authuser, "email", "");
			if(email.toLowerCase().endsWith("@howl.com"))
				return resolve();
			return reject(`only howl.com users are allowed`);
	    })
    },
    signInOptions: ["google"],
}
```


	 