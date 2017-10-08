## number (Vue component)

Used in autoform but can be used on its own.
###### TODO confirm that v-model works as intended.

#### Usage
```html
<template>
	<div>
		<range
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
	components: { number: svt.input.range },
	data() {
		options:{
			style: "min-width:50px;",
		}
	}
}


```

You can also import like this:
```javascript
import number from 'shrimp-vue-components/src/input/range'
```

### Props
- **validateFn (function)** - Optional validator function. If it returns a string, the component is set to be in error.
- **value (String | number)** - The value of the component.
- **placeholder (String)** - The string to show as the label when there is no value.
- **options (Object)** - Optional options object. 
	- style (string | object) - The style of the object.
	- min (number) - The minimum value of the component
    - max (number) - The maximum value of the component
    - step (number) - The value to jump by when dragging the range
    - list (number[] | number) - If given a list of numbers, those will be used to as *notches*.
    If given number, it will be used as the *step* between each notch.


### Events
- **value(number)** - Emitted when the value changes.

### Methods
- **updateValue(number)** - Sets the value of the component programatically.
- **getValue()** - Returns the value of the component. **number**
- **isInError()** - Returns **true** if **validateFn** returns a string.
- **isEmpty()** - Will always return false


