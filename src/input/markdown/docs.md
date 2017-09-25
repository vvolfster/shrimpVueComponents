## markdown (Vue component)

Used in autoform but can be used on its own.

#### Usage
```html
<template>
	<div>
		<markdown
			placeholder="some placeholder"
			:options="options"
		/>
	</div>
</template>
```

```javascript
import svt from 'shrimp-vue-components'

export default {
	components: { markdown: svt.input.markdown},
	data() {
		options:{
			style: "min-width:50px;",
		}
	}
}


```

You can also import like this:
```javascript
import markdown from 'shrimp-vue-components/src/input/markdown'
```

### Props
- **validateFn (function)** - Optional validator function. If it returns a string, the component is set to be in error.
- **value (String)** - The value of the component.
- **placeholder (String)** - The string to show as the label when there is no value.
- **options (Object)** - Optional options object. 
	- style (string | object) - The style of the object.
	

### Events
- **value(String)** - Emitted when the value changes.

### Methods
- **updateValue(String)** - Sets the value of the component programatically.
- **getValue()** - Returns the value of the component. **String**
- **isInError()** - Returns **true** if **validateFn** returns a string.
- **isEmpty()** - If nothing is selected, this will return **true**.


