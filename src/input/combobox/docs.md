## combobox (Vue component)

Used in autoform but can be used on its own.

#### Usage
```html
<template>
	<div>
		<combobox 
			placeholder="some placeholder"
			:options="options"
			v-model="choice"
		/>
	</div>
</template>
```

```javascript
import svt from 'shrimp-vue-components'

export default {
	components: { combobox : svt.input.combobox },
	data() {
		choice: "heroic",
		options: ["villanous", "heroic"]
	}
}


```

You can also import like this:
```javascript
import combobox from 'shrimp-vue-components/src/input/combobox'
```

### Props
- **validateFn (function)** - Optional validator function. If it returns a string, the component is set to be in error.
- **value (String)** - The value of the component.
- **placeholder (String)** - The string to show as the label.
- **options (Object | Array)** - Optional options object. If it is an array, it will be treated as the choices of the combobox.
	- style (string | object) - The style of the object.
	- options (string[]) - The choices of the combobox

### Events
- **value(string)** - Emitted when the value changes.

### Methods
- **updateValue(string)** - Sets the value of the component programatically.
- **getValue()** - Returns the value of the component.
- **isInError()** - Returns **true** if **validateFn** returns a string.
- **isEmpty()** - If no choice is selected, this will return **true**.


