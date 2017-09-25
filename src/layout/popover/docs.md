## Popover (Vue component)

Shows a popover.

#### Usage
```html
<template>
	<div>
		<button @click="$refs.popoverRef.toggle()">
			Show popover
		</button>
		<popover ref="popoverRef">
			<div>
				HELLO WORLD POPOVER
			</div>
		</modal>
	</div>
</template>
```

```javascript
import svt from 'shrimp-vue-components'

export default {
	components: {
		popover: svt.layout.popover
	}
}


```

You can also import **Popover** like so:
```javascript
import popover from 'shrimp-vue-components/src/layout/popover'
```

### Props
**- position (String)** - The position the modal is displayed. One of ["up", "down", "left", "right", "center"]. Default center.


### Events
**- close** - Emitted when the modal is closed.
**- open** - Emitted when the modal is opened.

### Methods
- **open(config)** - Opens the popover
	- config (object) - This is optional, in case you want the modal to overload the props for some reason.
		- animation (string) - same as in the props section.
		- animationDuration (number) - same as in the props section.
		- position (string) - same as in the props section.
- **close** - Closes the popover
- **isOpen()** - Returns **true** if the popoveris open. **false** otherwise.