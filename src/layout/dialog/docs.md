
## Dialog (.js)

This allows you to create Dialogs programmatically. Saves a ton of time. You don't need to worry about the UI, just the dialog object.

#### Usage
```javascript
import svt from 'shrimp-vue-components'

const Dialog = svt.layout.dialog;
let chosenPill = null;
const myDialog = Dialog.create({
	title: "Choose pill",
	buttons: {
		Red() { chosenPill = "red"; }
		Blue() { chosenPill = "blue"; }
	}
})

setTimeout(myDialog.dismiss, 2000); // the dialog will be dismissed after 2 seconds, if the user choses neither Red or Blue.
```

You can also import **Dialog** like so:
```javascript
import Dialog from 'shrimp-vue-components/src/layout/Dialog'
```

#### Configuration
The **Dialog.create** method takes a config object as shown above.

- **style (string | object)** - The style of the dialog object. Optional.
- **attributes (object)** - The attributes to assign to the top level dialog object. Optional.
- **class (string)** - The class to assign to the dialog object. This must be non scoped.
- **onDismiss (function)** - The function to run on dismissal of the dialog. Optional.
- **noDismiss (boolean)** - Cannot dismiss by clicking the background if true. Optional.
- **form (object)** - Autoform configurator object. Auto-generates form into the Dialog and passes it along to buttons.
- **buttons (object)** - The buttons that the dialog presents as options. Children of the buttons key must be functions or objects. The button functions are passed the user inputted **form** as well as a function called **progress** as a second parameter. If the button is performing some determinate async task, it is a good idea to call progress with a value between 0 and 1 to show the user the progress.
    - button as a function (formObject, progressFn)
    - button as an object
	    - handler (formObject, progressFn) 
	    - bypassForm (boolean) - Bypass the form's validation


- returns **DialogObject** - Newly created dialog object. 
	- **dismiss (function)** - Dismisses the dialog programmatically.
	- **isBusy (function)** - Returns true if the user has clicked a button on the dialog and the async task is not yet finished. False, otherwise.

### Examples
#### Basic Form
```javascript
Dialog.create({
	title: "Enter name",
	form: {
		first: String,
		last: String
	},
	buttons: {
		Submit({ first, last }){
			console.log(first, last);
		}
	}
})

```

#### Form with validation and options
``` javascript
Dialog.create({
	title: "Create account",
	form: {
		email: {
			type: String, // "string" also works
			placeholder: "email",
			validator(v) {
				if(v.indexOf("@") === -1)
					return "must contain @ symbol"
				return true;
			},
			options: {
				style: "min-width: 50vw;"
			}
		}
	},
	buttons: {
		/* The dialog will go into busy state until the promise is resolved or
		 rejected. A rejected promise will not close the dialog but a resolved 
		 one will and also trigger the onDismiss function (if provided) */
		Submit({ email }, progress){
			return new Promise((resolve, reject) => {
				/* the emailNotInDb is located elsewhere */
				emailNotInDb(email).then(() => {
					progress(0.5);
					createAccount().then(resolve).catch(reject);
				}) /* The error will be shown as a Toast */
				.catch(() => reject('An account already exists with this email');
			})
		},
		Cancel: {
			bypassForm: true,
			handler() {
				console.log('user cancelled');
			}
		}
	}
})
```

#### Form object 
The form object, as illustrated by the examples is of the following type:

    form: {
    	{property1} : { object | type | string },
    	{property2} : { object | type | string },
    	...
    }


   Valid types so far are:


    1. Boolean or "boolean"
    2. "combobox"
    3. Date or "date"
    4. File or "file"
    5. "markdown"
    6. Number or "number"
    7. String or "textline"
    8. "textlineAutoComplete"
    9. "textParagraph" or "paragraph"
    10. "textPassword" or "password"

**validator** can always be provided to form keys as a function. If it returns a string, it is in error.
**when** optional function that is passed the current value of the form. Truthy values will include the field.
**placeholder** can also always be provided to form keys as a string. This is shown as grey text when the input field is empty.
**options** can also always be provided to form keys, though what is in options is not common among the different valid types of form inputs. The only option they all share in common is **style**. For more about options and valid types, please take a look at autoform and the input components it uses. The Dialog object uses autoform itself.