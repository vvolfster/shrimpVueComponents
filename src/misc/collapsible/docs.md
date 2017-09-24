## Collapsible
The collapsible is an object that contains a header and content. They are both slots and must be passed in.
They can styled however you want.

### Props
**open**(Boolean) - Controls the expand / collapse state
**duration** (Number) - The duration of the open / close animation in ms
**animated** (Boolean) - Turns animation on or off on open / close
**direction** (String) - One of ['down', 'up'] . 

### Events
**opened** - Emitted on collapsible opening.
**closed ** - Emitted on collapsible closing.

### Methods
**isOpen** - Returns the state of the collapsible.

### Usage
There is no need to supply a @click handler. The collapsible will auto provide that on the heading.
``` html
<template>
	<collapsible ref="collapsible">
		<div slot="heading">
			Heading...
		</div>
		<div slot="content">
			Content goes here...
		</div>
	</collapsible>
</template>
```

```javascript
<script>
import svt from 'shrimp-vue-components'

export default {
	components: {
		collapsible: svt.misc.collapsible
	},
	methods: {
		isOpen() {
			const refs = this.$refs
			if(refs && refs.collapsible)
				return refs.isOpen();
			return false;
		}
	}
</script>
```