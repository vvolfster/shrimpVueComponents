## readOnly (Vue component)

Used in autoform but can be used on its own.
A very simple component that just displays a value.
It is useful in the context of an autoform when: 
    1) User/Form should have a non-editable value
    2) The non-editable value must be seen by the user

#### Usage
```html
<template>
	<div>
		<readOnly
            placeholder="myReadOnly"
            v-model="myReadOnlyVar"
        />
	</div>
</template>
```

```javascript
import svt from 'shrimp-vue-components'

export default {
	components: { readOnly: svt.input.readOnly },
    data() {
        return {
            myReadOnlyVar: "I AM A READ ONLY VAR",
        }
    }
}


```

You can also import **readOnly** like so:
```javascript
import readOnly from 'shrimp-vue-components/src/input/readOnly'
```

### Props
- **validateFn (function)** - Optional validator function. If it returns a string, the component is set to be in error.
- **value (String)** - The value of the component.
- **placeholder (String)** - The string to show as the label.
- **options (Object)** - Optional options object.
	- style (string | object) - The style of the object.

### Events
- **value(boolean)** - Emitted when the value changes.

### Methods
- **updateValue(boolean)** - Sets the value of the component programatically.
- **getValue()** - Returns the value of the component.
- **isInError()** - Returns **true** if **validateFn** returns a string.
- **isEmpty()** - Returns false always. This is just to match the API of the rest of the autoform components.


