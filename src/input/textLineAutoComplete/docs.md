## textLineAutoComplete (Vue component)

Used in autoform but can be used on its own.


#### Usage
```html
<template>
	<div>
		<textLineAutoComplete 
			placeholder="some placeholder"
			:options="options"
		/>
	</div>
</template>
```

```javascript
import svt from 'shrimp-vue-components'

export default {
	components: { textLineAutoComplete  : svt.input.textLineAutoComplete },
	data() {
		options:{
			style: "min-width:50px;",
			dictionary: {
				0: { name: "wolf" },
				1: { name: "squid" }
			},
			matchOn: ['name'], // match on these fields of dictionary
			display: ['name'] // show these fields
		}
	}
}


```

You can also import like this:
```javascript
import textLineAutoComplete from 'shrimp-vue-components/src/input/textLineAutoComplete '
```

### Props
- **validateFn (function)** - Optional validator function. If it returns a string, the component is set to be in error.
- **value (object)** - The value of the component. Does nothing at the moment. Will be added soon.
- **placeholder (String)** - The string to show as the label when there is no value.
- **options (Object)** - Optional options object. 
	- style (string | object) - The style of the object.
	- dictionary (object) - The dictionary object to choose from (see usage)
	- matchOn (String[]) - The keys to match on from the dictionary.
	- display (String[]) - The keys to display from the dictionary

### Events
- **value(object)** - Emitted when the value changes.
 	- key - The key of the selected object from the dictionary
	- data - The value of the selected object from the dictionary

### Methods
- **updateValue(object)** - Sets the value of the component programatically.
- **getValue()** - Returns the value of the component. **object**
- **isInError()** - Returns **true** if **validateFn** returns a string.
- **isEmpty()** - If nothing is selected, this will return **true**.


