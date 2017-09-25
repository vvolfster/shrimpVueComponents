## FileDropper (Vue component)
A very basic file dropper component. It supports one or more files being dropped on it. Or it will open a native file dialog once clicked. If you want more built-in controls (to limit number of files, etc), you should look at [input/file]

### Props
**fn**(Functional | Optional) - If provided, the component will call this function with the selected files instead of emitting the **files** event.
**extensions** (String) - The extension filter for files. Defaults to "image/*"


### Events
**files** - Emitted on files being dropped/added.

### Usage
There is no need to supply a @click handler. The collapsible will auto provide that on the heading.
``` html
<template>
	<div>
		<fileDropper @files="handleFiles"/>
	</div>
</template>
```

```javascript
<script>
import svt from 'shrimp-vue-components'

export default {
	components: {
		fileDropper: svt.misc.fileDropper
	},
	methods: {
		handleFiles(files) {
			files.forEach(file => console.log(file))
		}
	}
</script>
```

[input/file]: ../../input/file/docs.md