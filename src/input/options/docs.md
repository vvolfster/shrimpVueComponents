## options (Vue component)

Used in autoform but can be used on its own.
###### TODO confirm that v-model works as intended.

#### Usage
```html
<template>
	<div>
		<options
			placeholder="some placeholder"
			:options="options"
			v-model="vModel"
		/>
	</div>
</template>
```

```javascript
import svt from 'shrimp-vue-components'

export default {
	components: { number: svt.input.number},
	data() {
		options:{
			style: "min-width:50px;",
			choices: ["hello", "world"],
			value: ["hello"]
		}
	}
}


```

You can also import like this:
```javascript
import options from 'shrimp-vue-components/src/input/options'
```

### Props
- **validateFn (function)** - Optional validator function. If it returns a string, the component is set to be in error.
- **value (String, String[])** - The value of the component.
- **placeholder (String)** - The string to show as the label when there is no value.
- **options (Object)** - Optional options object. 
	- style (string | object) - The style of the object.
	- choices (String[] | Object{}) - In case of object, its keys will be used.
    - multiple (Boolean) - Defaults to true. If true, can choose multiple checkboxes. If false, can choose only one radiobutton.


### Events
- **value(String[])** - Emitted when the value changes.

### Methods
- **updateValue(String[] | Object{} )** - Sets the value of the component programatically.
- **getValue()** - Returns the value of the component. **String[]**
- **isInError()** - Returns **true** if **validateFn** returns a string.
- **isEmpty()** - If nothing is selected, this will return **true**.


