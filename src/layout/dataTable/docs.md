## dataTable (Vue component)

Easy visualization of large data sets. Very performant. Forked from [vue-materialize-datatable](https://github.com/MicroDroid/vue-materialize-datatable). Has a lot of extra features & performance optimizations.

#### Usage
```html
<template>
	<div>
		<dataTable
		    :title="table.title"
            :rows="tableData || []"
            :columns="table.columns"
            :customButtons="table.customButtons"
            :paginate="table.pagination"
            :filters="table.filters"
            filterMode="OR"
            :perPage="[20,50,100,200,400]"
            :defaultPerPage="-1"
            style="height:90%;"
		>
			<!-- uses scoped-slots for customization! -->
			<div slot="body" slot-scope="entry">
				{{ entry.index }} {{ entry.value.first }}
			</div>
		</dataTable>
	</div>
</template>
```

```javascript
import svt from 'shrimp-vue-components'
import tableData from 'path/to/my/table/data'

export default {
	components: {
		dataTable: svt.layout.dataTable
	},
	data() {
		const self = this;
		return {
			tableData,
			table: {
                title: "People",
                columns: [
                    { field: "first" },
                    { field: "last" },
                    { field: "age" },
                    { field: "gender" },
                    { field: "birthday" },
                ],
                filters: {
                    male: row => row.gender === 'Male',
                    female: row => row.gender === 'Female',
                },
                customButtons: {
                    clear() {
                        self.tableData = [];
                    },
                    togglePagination() {
                        self.table.pagination = !self.table.pagination;
                    }
                },
                pagination: true
            }
		}
	}
}


```


### Props
**- title (String)** - Optional. The title of the table. Appears @ topleft.

**- rows (Object[])** - The model or data source of the table.

**- columns (Object[])** - Required. The columns to display from the rows property.
  
  - column Object:
	  - field (String | Function) - Required.
		  - String - The property to read from a row. Use dots for nested properties.
		  - Function(row) - Must return a string | number given a row.
	  - label (String) - The text to show as the column header.
	  - sort (One of [String, Number, function]) - Defaults to String. Affects sorting.
		  - Function(a,b) - The function must return
			  - -1 if a < b
			  - 0 if a === b
			  - 1 if a > b 
      - html (Boolean) - Defaults to false. Escapes output if false.

**- perPage (Array)** - Per page options. Defaults to  [10, 20, 30, 40, 50]
**- defaultPerPage(Number)** - Defaults to first perPage option. Set to -1 to show all.

**- filters (Object)** - Key Function pair.

- FilterFunction(row) - Must return truthy value to pass the filter.

**- searchable (Boolean)** - Defaults to true. Can the table be searched?
**- clickable (Boolean)** - Defaults to true. Are rows clickable?
**- sortable (Boolean)** - Defaults to true. Can the table be sorted?
**- paginate (Boolean)** - Defaults to true. Can the table be paginated?
**- exportable (Boolean)** - Defaults to true. Can the table be exported as a csv
**- printable(Boolean)** - Defaults to true. Can the table be printed?
**- exactSearch (Boolean)** - Defaults to false. Uses contains by default.
**- filterMode (One of ["OR", "AND"])** - Defaults to "OR".

  - "OR" - Result is the union of all the filters.
  - "AND" - Result is the intersection of all the filters.
  
### Events
**-  click({ row, selection, el })** - Emitted when a row is clicked & clickable is true.
**-  selection(selection)** - Emitted when the selection changes.

### Methods
- **nextPage()** - Go to next page.
- **previous Page()** - Go to previous page.
- **exportExcel()** - Tell the browser to download the table as a csv.
- **print()** - Tell the browser to print the table.
- **selectAll()** - select every row.
- **deselectAll()** - deselect every row.
- **select(row)** - select the param: row.