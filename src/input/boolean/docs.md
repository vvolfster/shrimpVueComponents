## boolean (Vue component)

Used in autoform but can be used on its own.

#### Usage
```html
<template>
	<div>
		<boolean
        placeholder="myBoolean"
        v-model="switch"
        />
	</div>
</template>
```

```javascript
import svt from 'shrimp-vue-components'

export default {
	components: { boolean: svt.input.boolean },
    data() {
        return {
            switch: true,
        }
    }
}


```

You can also import **boolean** like so:
```javascript
import boolean from 'shrimp-vue-components/src/input/boolean'
```

### Props
- **validateFn (function)** - Optional validator function. If it returns a string, the component is set to be in error.
- **value (boolean)** - The value of the component.
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


