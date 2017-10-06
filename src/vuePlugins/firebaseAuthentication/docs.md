## firebaseAdminPanel (Vue Component)
This is a powerful tool that allows for great control over a firebase database and is continually being improved. Now supports **auth providers** & forwards idToken on REST requests (so firebase db rules are followed)!


#### Usage
``` html
<template>
	<div>
		<firebaseAdminPanel :config="config"/>
	</div>
</template>
```

```javascript
import svt from 'shrimp-vue-components';
import fbConfig from './path/to/my/fbConfig';
import authConfig from './path/to/my/authConfig';
import myTable1VueComponent from './path/to/table/1/vue/component'

export default {
	components: {
		firebaseAdminPanel: svt.bigTools.firebaseAdminPanel
	},
	data() {
		return {
			config: { 
				fbConfig,
				authConfig,
				remoteRestAuthLinkFunction: 'https://myRestFunction',
				createNewUsers: false,
				authRequired: true,
				tableConfig: {
					pageSize: 25,
					canAdd: true,
					canRemove: true,
					table1Name: {
						delegateComponent: myTable1VueComponent
					}
					table2Name: {
						storageKey: "myStorage",
						actions: {
							changeGender(id, value, ref){
								return value.gender === 'male' ? ref.set('female') : ref.set('male')
							}
						},
						actionsTableRoot: {
							incrementAge(tableRef){
								tableRef.once('value').then((snap) => {
                                    lodash.each(snap.val(), ({ age }, k) => {
                                        tableRef.child(k).child('age').set(age + 1);
                                    })
                                })
							}
						},
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
                                },
                                after(v) {
                                    v.first = v.first.ToUpperCase();
                                    return true;
                                }
                            },
                        ],
					}
				}
			}
		}
	}
}
```

### The Config Object
This object has quite a lot of properties and features. You will need to retrieve the webAPI config object from the firebase console for each firebase project you are using. It looks something like this:

	Firebase Config Object: {
		apiKey: "AIzaSyC97H_XXXXXXXXXXXXXXXXXXXXXXX",
		authDomain: "wolf-XXXXXXXXXXXXX",
		databaseURL: "https://wolf-XXXXXXXXXXXX",
		projectId: "wolf-XXXXXXXXXXXX",
		storageBucket: "wolf-XXXXXXXXXXXX",
		messagingSenderId: "4487XXXXXXXXXXX"
	}
 
- **fbConfig** - Config for the main firebase app. Copy paste from firebase console. See above.

- **authConfig | masterAuthConfig (optional)** - Config for the firebase app that acts as an auth provider. Same option as the adminPanel. The remoteRestAuthLink function **must** be provided in the properties! Copy paste this from the firebase console. See above.

- **remoteRestAuthLinkFunction** - This URL must point to a REST function that accepts *{ projectId, token, email }* as request params. It must send back as response:  *{ token: someToken }* or *{ data: { token: someToken }}*.

- **requiresAuth (user, authUser) (optional Function | Boolean)** - Tells Vue to require auth no matter what. The log in dialog will not be cancellable.
	- If boolean, any auth user will work fine.
	- If function, the plugin will pass the user & authUser (if different), to this function. If it returns undefined or a promise that resolves, the plugin will consider the userRequirement to be met. All other falsy values or rejected promise will be considered as failure to meet the requirement.

- **createNewUsers (optional Boolean)** - Tells the plugin that it can create new users if none exists. Only works with *emailAndPassword* auth method. 

- **signInOptions (optional Array | Object)** - Defaults to ["email", "google"]. Options are ["email", "google", "twitter", "github" ]

- tableConfig
	- **pageSize (number)** - Amount of entries to show per page.
    - **canAdd (boolean)** - Allows the user to add tables. Defaults to true.
    - **canRemove (boolean)** - Allows the user to remove tables. Defaults to true.

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

-----	 