## autoform (Vue component)

Automatically generates forms. Used in Dialog as well as firebaseAdmin's adder component.

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