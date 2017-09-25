## modal (Vue component)

Shows a modal.

#### Usage
```html
<template>
	<div>
		<modal ref="modalRef">
			<div>
				HELLO WORLD MODAL
			</div>
		</modal>
	</div>
</template>
```

```javascript
import svt from 'shrimp-vue-components'

export default {
	components: {
		modal: svt.layout.modal
	},
	mounted() {
		this.$refs.modalRef.open();
	}
}


```

You can also import **Modal** like so:
```javascript
import Modal from 'shrimp-vue-components/src/layout/modal'
```

### Props
**- containerStyle (Object | String)** - CSS style of the modal.
**- position (String)** - The position the modal is displayed. One of ["up", "down", "left", "right", "center"]. Default center.
**- animation (String)** - Defines the animation to **position**. One of ["up", "down", "left", "right", "none"]. Default up.
**- animationDuration (Number)** - The animation time in milliseconds. Default 300.

### Events
**- close** - Emitted when the modal is closed.
**- open** - Emitted when the modal is opened.

### Methods
- **open(config)** - Opens the modal
	- config (object) - This is optional, in case you want the modal to overload the props for some reason.
		- animation (string) - same as in the props section.
		- animationDuration (number) - same as in the props section.
		- position (string) - same as in the props section.
- **close** - Closes the modal
- **isOpen()** - Returns **true** if the modal is open. **false** otherwise.