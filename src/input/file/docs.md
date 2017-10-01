## file (Vue component)

Used in autoform but can be used on its own.

#### Usage
```html
<template>
	<div>
		<fileComponent
			placeholder="some placeholder"
			:options="options"
		/>
	</div>
</template>
```

```javascript
import svt from 'shrimp-vue-components'

export default {
	components: { fileComponent: svt.input.file },
	data() {
        return {
            options:{
                style: "min-width:50px;",
                limit: 3 // only 3 files may be selected at once.
            }
        }
	}
}


```

You can also import like this:
```javascript
import fileComponent from 'shrimp-vue-components/src/input/file'
```

### Props
- **validateFn (function)** - Optional validator function. If it returns a string, the component is set to be in error.
- **value (N/A)** - Unused at the moment. Included to make the API consistent.
- **placeholder (String)** - The string to show as the label when there is no value.
- **options (Object)** - Optional options object. 
	- style (string | object) - The style of the object.
	- limit (number) - 0 or less means limitless. Anything greater is the limit of files that can be dropped at once. More files must be removed.

### Events
- **value(File[])** - Emitted when the value changes.

### Methods
- **updateValue(File | FileList | File[])** - Sets the value of the component programatically.
- **getValue()** - Returns the value of the component. **Array of File**
- **isInError()** - Returns **true** if **validateFn** returns a string.
- **isEmpty()** - If nothing is selected, this will return **true**.


