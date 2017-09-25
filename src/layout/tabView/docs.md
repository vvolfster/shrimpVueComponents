## Tabview (Vue component)

Creates a tab view & allows the user to switch between the tabs. TODO: Allow for styling customization.

#### Usage
```html
<template>
	<div>
		<tabView>
			<!-- The name attribute, if provided, will be shown 
			on the tab header. The slot='tab' is NOT OPTIONAL -->
			<div slot="tab" name="tab1">
				This is tab 1
			</div>
			
			<div slot="tab" name="tab2">
				This is tab 2
			</div>
		</tabView>
	</div>
</template>
```

```javascript
import svt from 'shrimp-vue-components'

export default {
	components: {
		tabView: svt.layout.tabView
	}
}


```

You can also import **TabView** like so:
```javascript
import tabView from 'shrimp-vue-components/src/layout/tabView'
```

### Props
- **index (Number)** - The index of the tab to show.
- **headerScroll (String)** - Determines if the type of the tab headers (and if it scrolls). One of ["fit", "scroll", "wrap"].
- **headerPosition (String)** - The position of the tab headers. One of ["left", "center", "right"].



### Events
- **indexChanged(idx)** - emits the number of the index upon current index change.

### Methods
- **next()** - Advance current tab to next index.
- **prev()** - Advance current tab to previous index.
- **goTo(idx)** - Go to tab **idx**.