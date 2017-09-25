## firebaseAdminPanel (Vue Component)
This is a powerful tool that allows for great control over a firebase database and is continually being improved. 

**Caveats at the moment**
- Only supports emailAndPassword authentication. 
- Does not support database read rules other than "true" at the moment. 

#### Usage
``` html
<template>
	<div>
		<firebaseAdminPanel
			:fbConfig="fbConfig"
			:tableConfig="tableConfig"
		/>
	</div>
</template>
```

```javascript
import svt from 'shrimp-vue-components';
import fbConfig from './path/to/my/fbConfig';
import tableConfig from './path/to/my/tableConfig';

export default {
	components: {
		firebaseAdminPanel: svt.bigTools.firebaseAdminPanel
	},
	data() {
		return {
			fbConfig, tableConfig
		}
	}
}
```

### fbConfig object
This object has quite a lot of properties and features. Go to your firebase console and get the use on web json. It will look something like this:

    apiKey: "AIzaSyC97H_XXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "wolf-XXXXXXXXXXXXX",
    databaseURL: "https://wolf-XXXXXXXXXXXX",
    projectId: "wolf-XXXXXXXXXXXX",
    storageBucket: "wolf-XXXXXXXXXXXX",
    messagingSenderId: "4487XXXXXXXXXXX"

You need all those keys to be present int he fbConfig object. The storageBucket is optional & only needed if you want to upload to storage using this tool.

On top of these properties, the fbConfig object has some extra properties that can be included to customize the tool.
- **requiresAuth (boolean) ** - Optional. Determines whether user must be logged in to use the tool.
- **createNewUsers (boolean)** - Optional. Determines whether to create new users if account does not exist.
- **userRequirement (function)** - Optional. The user object is passed to this function and it must either return truthy or a promise that resolves. Exception is that if the function returns undefined, it is considered okay.
- **masterAuthConfig (object)** - Optional. Allows this tool to use another firebase db as the auth for this db. Has the same keys as above (apiKey, authDomain, databaseURL, projectId, storageBucket, messagingSenderId). **Note: This cannot work without somehow getting an IdToken from the masterAuthDb. To do this, a REST function url must be provided.** 
- **masterAuthConfig.remoteRestAuthLinkFunction** - This URL must point to a REST function that accepts { projectId, token, email } as request params. It must send back as response:  { token: someToken } or { data: { token: someToken }}.

-----

So all in all, the fbConfig object might look like this:
```javascript
// in fbCongig.js file
const fbConfig = {
	apiKey: "AIzaSyC97H_XXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "wolf-XXXXXXXXXXXXX",
    databaseURL: "https://wolf-XXXXXXXXXXXX",
    projectId: "wolf-XXXXXXXXXXXX",
    storageBucket: "wolf-XXXXXXXXXXXX",
    messagingSenderId: "4487XXXXXXXXXXX",
    requiresAuth: true,
    createNewUsers: false,
    authRequirement(user) {
	    return new Promise((resolve, reject) => {
		    return user && user.email === 'wolf@howl.com' ? resolve() : reject();
	    })
    },
    masterAuthConfig: {
    	apiKey: "AIzaSyC97H_XXXXXXXXXXXXXXXXXXXXXXX",
		authDomain: "master-XXXXXXXXXXXXX",
		databaseURL: "https://master-XXXXXXXXXXXX",
		projectId: "master-XXXXXXXXXXXX",
		storageBucket: "master-XXXXXXXXXXXX",
		messagingSenderId: "6667XXXXXXXXXXX",
		
		// Will be sent { projectId, token, email }. 
		// Expect to receive as a response as:
		// { token: someToken } or { data: { token: someToken }}
		remoteRestAuthLinkFunction: 'https://XXXX.cloudfunctions.net/getToken' 
    }
}
export default fbConfig;
```

### tableConfig object
Optional. This object allows us to configure each individual top level key in firebase ("table").

- tableConfig
	- **pageSize (number)** - Amount of entries to show per page.
	- **{ tableName } (object)** - 
		- **columnOrder (String[])** - Optional. Allows ordering of the columns in the tableView.
		- **noDelete (boolean)** - Optional. Allows us to specify that entries can't be deleted from this table.
		- **delegateComponent (VueComponent)** - Optional. If provided, this component will be created for each entry in this table. The component is passed the following properties (so it should have them as props):
			- id: String,
			- value: Object, // do not change directly. Will be updated automatically on firebase data change.
			- fbRef: Object (this is the firebaseRef of entry. Useful if the component wants access to make changes to the entry)
			- navFn(tableName, id): Function, allows navigation to other tables. Useful if the component wants the ability to navigate the adminPanel to another table and id.
		- **actions (object)** - Optional. Collection of functions that can be performed on each entry in the table. Each function is passed the following (in this order) when the user calls it:
			1. id: String
			2. value: Object
			3. fbRef: Object (this is the firebaseRef of the entry)
			4. navFn(tableName, id): function, allows navigation to other table & id.
		- **actionsTableRoot (object)** - Optional. Collection of functions that can be performed on the entire table. Each function is passed the ref to the table as first argument.
		- **storageKey (string)** - Optional. If provided, the tool will automatically create an action that allows the user to upload files to storage and store a reference path in the entry at the key dentoed by **storageKey**
		- **add (Object[])** - Optional. If provided, the tool will have a "Create New" button that will follow the flow of the adder steps. Each entry in this array is an autoform descriptor pretty much. So refer to the docs for autoform if you want to know more.

------
So all in all, a tableConfig object might look like this:
```javascript
// in tableConfig.js file
import lodash from 'lodash'
import userDelegate from './path/to/my/userDelegateComponent'

const tableConfig = {
	randomDump: {
		storageKey: "storage"
	},
	users: {
		storageKey: "images",
		noDelete: true,
		actions: {
			incrementAge(id, value, ref){
				const curAge = value.age;
				return ref.child('age').set(curAge + 1);
			},
			decrementAge(id, value, ref){
				const curAge = value.age;
				return ref.child('age').set(curAge - 1);
			}
		},
		actionsTableRoot: {
			incrementAgeAllUsers(ref){
				return new Promise((resolve, reject) => {
					ref.once('val').then((snap) => {
						if(!snap.exists())
							return reject();
						
						const promises = lodash.reduce(snap.val(), (acc, v, id) => {
							const curAge = v.age;
							acc.push(ref.child(`${id}/age`).set(curAge + 1));
							return acc;
						}, [])
						Promise.all(promises).then(resolve).catch(reject);
					})
				})
			}
		},
		delegateComponent: userDelegate,
        add: [
            {
                description: "First and Last",
                fields: {
                    first: "String",
                    last: "String"
                }
            },
            {
                title: "Age and Gender",
                fields: {
                    age: "Number",
                    gender: ["Male", "Female", "Other"]
                }
            },
            {
                title: "Address",
                fields: {
                    address: "String",
                    city: "String",
                    state: "String",
                    zip: "Number"
                },
                after(v) {
                    v.first = v.first.charAt(0).toUpperCase() + v.first.slice(1);
                    v.last = v.last.charAt(0).toUpperCase() + v.last.slice(1);
                    return true;
                }
            }
        ],
	}
}

export default tableConfig;
```
	 