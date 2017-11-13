## VirtualList (Vue component)

Optimizes large lists by rendering only items that are visible & a few extra. Is a fork from https://www.npmjs.com/package/vue-virtual-scroll-list (I fixed some issues & added some small features).

#### Usage
```html
<template>
	<div>
		<virtualList
			:size="40"
			:remain="5"
			:scrollMapperFn="scrollMapperFn"
		>
			<div v-for="(v, k) in bigData"
				:key="k"
				style='height:40px;'
			>
				{{ v }}	
			</div>
			
		</virtualList>
	</div>
</template>
```

```javascript
import svt from 'shrimp-vue-components'

const virtualList = svt.layout.virtualList;
export default {
	components: {
		virtualList
	},
	data() {
		return {
			bigData: null
		}
	},
	mounted() {
		const len = 10000;
		const out = [];
		for(let i = 0; i < len; i += 1){
			out.push(Math.random() * 100);
		}
	},
	methods: {
		// attr is all the attributes of the element
		// key / idx
		scrollMapper(key, attr){
			// makes a jump point every 100 items.
			return Math.floor(key/ 100).toString();
		}
	}
}


```

You can also import **TabView** like so:
```javascript
import virtualList from 'shrimp-vue-components/src/layout/virtualList'
```

### Props
- **size (Number) REQUIRED** - The size of each tile in the list (in pixels).

- **remain (Number) REQUIRED** - size * remain are the number of tiles to render at once. 

- **rtag (String)** - The HTML element created at the root of the list. 
*OriginalDocs: Default value is div, the virtual-list root element tag name, in all cases it's style is set to display: block;*

- **wtag (String)** - The HTML element created around each entry in the list (the wrapper) . 
*OriginalDocs: Default value is div, the virtual-list item wrapper element tag name, in all cases it's style is set to display: block;*

- **scrollMapperFn (function(key, attr)) ** - A function that generates a map of scrollable points. The function must return a String or null. The map is useful for calling the **scrollTo** function.
	- **key** is the idx or key of an entry
	- **attr** is the attributes that HTML list element has.

- **wtagClass (String)** - Class to assign to wrapper element
- **wtagStyle (Object)** - Style object ot assign to wrapper element.
- **rtagClass (String)** - Class to assign to root element
- **rtagStyle (Object)** - Style object ot assign to root element.
- **permamentFn (Function(slot, idx))** - Function determining elements that are always rendered no matter what. Sticky elements like headers would fit this.

### Events
- **toTop()** - Emitted when reaching the top of the list.
- **toBottom()** - Emitted when reaching the end of the list.

### Methods
- **scrollTo(string || number)** - Make the list scroll to the parameter. 
	- If input is *number*, it will be used as index;
	- If input is *string*, it will be used to discern a mapped location using **scrollMapperFn** (if provided).
