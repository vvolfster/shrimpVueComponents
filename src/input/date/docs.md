## date (Vue component)

Used in autoform but can be used on its own. Uses flatpickr.js
###### TODO: confirm if v-model works as intended with this.

#### Usage
```html
<template>
	<div>
		<date
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
	components: { date: svt.input.date},
	data() {
		vModel: new Date(),
		options:{
			type: "datetime" // One of ['date', 'datetime'],
			style: "min-width:50vw;"
		}
	}
}


```

You can also import like this:
```javascript
import date from 'shrimp-vue-components/src/input/date'
```

### Props
- **validateFn (function)** - Optional validator function. If it returns a string, the component is set to be in error.
- **value (String | Date)** - The value of the component.
- **placeholder (String)** - The string to show as the label when there is no value.
- **options (Object | Array)** - Optional options object. 
	- style (string | object) - The style of the object.
	- type (string) - One of ['datetime', 'date']

### Events
- **value(date)** - Emitted when the value changes.

### Methods
- **updateValue(string | date)** - Sets the value of the component programatically.
- **getValue()** - Returns the value of the component.
- **isInError()** - Returns **true** if **validateFn** returns a string.
- **isEmpty()** - If no date is selected, this will return **true**.


