## number (Vue component)

Used in autoform but can be used on its own.
###### TODO confirm that v-model works as intended.

#### Usage
```html
<template>
	<div>
		<number
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
		}
	}
}


```

You can also import like this:
```javascript
import number from 'shrimp-vue-components/src/input/number'
```

### Props
- **validateFn (function)** - Optional validator function. If it returns a string, the component is set to be in error.
- **value (String | number | Infinity)** - The value of the component.
- **placeholder (String)** - The string to show as the label when there is no value.
- **options (Object)** - Optional options object. 
	- style (string | object) - The style of the object.
	- allowInfinity (boolean) - Allows user to choose infinity


### Events
- **value(number)** - Emitted when the value changes.

### Methods
- **updateValue(number)** - Sets the value of the component programatically.
- **getValue()** - Returns the value of the component. **number**
- **isInError()** - Returns **true** if **validateFn** returns a string.
- **isEmpty()** - If nothing is selected, this will return **true**.


