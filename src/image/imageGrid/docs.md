## ImageGrid (Vue Component)
Allows the user to display images in a grid. Makes use of fileDropper.vue.

### Usage
``` html
<template>
	<div>
		<!-- if addFn is provided, there will be a fileDropper component available in the grid. If removeFn is provided, there will be a delete button available for each entry -->
		<imageGrid
			:collection="collection"
			cellSize="52px"
			:addFn="addFn"
			:removeFn="removeFn"
		/>
	</div>
</template>
```

```javascript
import svt from 'shrimp-vue-components'

export default {
	components: {
		imageGrid: svt.image.imageGrid
	},
	data() {
		return {
			collection: [ 'imgLink1', 'imgLinke2' ],
			
		}
	}
}
```

### Props
- **collection (object | array) ** - The collection of images to show in the grid.
- **cellSize (string | number)**  - The size of each image cell. If **number** is used, it will be considered **pixels**. Otherwise, a CSS string is acceptable. e.g., "50px", "50vh", etc.
- **addFn (function) ** - Optional. If provided, there will be a fileDropper component visible in the grid and dropping files onto it will call this function.
- **removeFn (function)** - Optional. If provided, there will be delete buttons for each entry.


### Events & Methods
None yet.

