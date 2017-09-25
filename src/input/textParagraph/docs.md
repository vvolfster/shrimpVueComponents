## textParagraph (Vue component)

Used in autoform but can be used on its own.
###### TODO confirm that v-model works as intended.

#### Usage
```html
<template>
	<div>
		<textParagraph 
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
	components: { textParagraph : svt.input.textParagraph },
	data() {
		options:{
			style: "min-width:50px;",
		}
	}
}


```

You can also import like this:
```javascript
import textParagraph from 'shrimp-vue-components/src/input/textParagraph'
```

### Props
- **validateFn (function)** - Optional validator function. If it returns a string, the component is set to be in error.
- **value (String)** - The value of the component.
- **placeholder (String)** - The string to show as the label when there is no value.
- **options (Object)** - Optional options object. 
	- style (string | object) - The style of the object.

### Events
- **value(string)** - Emitted when the value changes.

### Methods
- **updateValue(string)** - Sets the value of the component programatically.
- **getValue()** - Returns the value of the component. **string**
- **isInError()** - Returns **true** if **validateFn** returns a string.
- **isEmpty()** - If nothing is selected, this will return **true**.


