
## autoform (Vue component)

Automatically generates forms. Used in Dialog as well as firebaseAdmin's adder component.

**Can now support custom components!!**

#### Usage
```html
<template>
	<div>
		<autoform
			:title="title"
			:description="description"
			:fields="fields"
		/>
	</div>
</template>
```

```javascript
import svt from 'shrimp-vue-components'

const dictonary = {
	standard: { name: "standard", price: 0 },
	gold: { name: "gold", price: 10 },
	premium: { name: "premium", price: 20 },
}

export default {
	components: { autoform: svt.input.autoform },
	data() {
		return {
			title: "Autoform title...",
			description: "Autoform description...",
			fields: {
				// fields object goes here
			}
		}
	}
}


```

You can also import **autoform** like so:
```javascript
import autoform 'shrimp-vue-components/src/input/autoform'
```

### Props
- **title (String)** - The title of the autoform.
- **description(String)** - The description of the autoform.
- **fields(Object)** - The object that has all the fields of the form. See example.

### Events
- **value(object)** - Emitted when the user changes a field in the form. The value of the form is emitted. 

### Methods
- **getFieldName(name)** - Returns the title / label / name of the field denoted by **name**.
- **getFieldValue(name)** - Returns the value of the field denoted by **name**
- **getValue()** - Returns the value of the entire form as an **object**.
- **setValue(name, value)** - Sets the field denoted by **name** to **value**
- **isValid()** - Returns whether the entire form is valid or not.



### More advanced example (illustrating all available types at the moment)
```javascript
import svt from 'shirmp-vue-components'

export default {
	components: {
		autoform: svt.input.autoform
	},
	data() {
		return {
			title: "Some profile creator here...",
			description: "Description...",
			fields: {
				married: Boolean,
				gender: {
					type: combobox,
					when(v) {
						// v is the current form value!
						// This is only shown when the function returns true!
						return v.married
					},
					options: {
						options: ['male', 'female', 'other']
					}
				},
				dateOfBirth: Date,
				avatar: File,
				aboutMe: "markdown",
				age: Number,
				interests: "paragraph",
				accountType: {
					type: "textlineautocomplete",
					options: {
						dictionary,
						matchOn: ['name', 'price'],
						display: ['name']
					}
				}
				username: String,
				password: "password"
			}
		}
	}
}
```

### Using your own vue components with autoform

There are currently 2 ways to use custom components with autoform. Here are examples illustrating both:
#### 1. Register it
```javascript
import svt from shrimp-vue-components
import myCmp from './myCmp '

// register the custom component. 
// After this line, the component will be available every time you create an autoform or a dialog with a form. 
// Please note, that names will be saved in lowercase!
svt.input.customComponents.register("myCmp ", myCmp );
```

#### 2. Include it in the fields prop!

```html
<autoform :fields="fields"/>
```

``` javascript
import svt from shrimp-vue-components
import myCmp from './myCmp '

const fields = { brandNewCmp: myCmp }
// or 
const fields = { 
	brandNewCmp: {
		type: myCmp
	} 
}

export default {
	data() {
		return { fields }
	}
}
```

##### All previous API is supported for custom components so you can do things like:
```javascript

const fields = {
	brandNewCmp = {
		type: myCmp,
		model: "hello world"
	}
}
```

If your custom component is not valid, you will get warnings or error in the console. The component should include the following:

 - props
	 - value (string, any)
	 - placeholder (string)
 - methods
	 - updateValue(val) - updates the value of the component with val
	 - isInError() - returns whether the component's value is considered to be in "error"
	 - isEmpty() - returns whether the component's value is considered to be "empty"
	 - getValue() - returns the value of the component