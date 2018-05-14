<template>
	<div class="card material-table column no-wrap">
		<div class="table-header" style="flex: 0 0 64px;">
			<span class="table-title">{{title}}</span>
			<div class="actions">
				<button 
                   v-for="(button, key) in customButtons" :key="key"
                   v-if="(typeof button.handler === 'function' || typeof button === 'function') && !button.hide"
				   class="svtbtn"
				   @click="typeof button === 'function' ? button(selection) : button.handler(selection)"
                >
				   <i :class="button.class || 'fa'" :style="button.style || ''">{{ button.icon || key }}</i>
				</button>
                <button class="svtbtn" v-if="enumerable" @click.stop="showIndices = !showIndices"><i class="fa" :class="showIndices ? 'fa-list-ul' : 'fa-list-ol'"/></button>
				<button class="svtbtn" v-if="printable" @click="print"><i class="fa fa-print"/></button>
				<button class="svtbtn" v-if="exportable" @click="exportExcel"><i class="fa fa-file-excel-o"/></button>
				<button class="svtbtn" v-if="searchable" @click="search"><i class="fa fa-search"/></button>
			</div>
		</div>
		<div v-if="searching" style="flex:0 0 64px;">
			<div class="search-input-container">
				<label>
					<input 
                        class="search-input svtbtn"
                        placeholder="Search data"
                        style="width: 100%; border: solid 1px gray !important; padding:5px;"
                        v-model="searchInput"
                    >
				</label>
			</div>
		</div>

        <!-- filters -->
	    <div 
            v-if="filters && Object.keys(filters).length" 
            class="row items-center" style="padding:0 10px;flex:0 0 64px;"
        >
            <i class="fa fa-filter text-grey" style="margin-right:20px;"/>
            <options
                :options="{ choices: filters }"
                v-model="activeFilters"
                placeholder=""
            />
	    </div>

        <virtualList 
            :size="48"
            :remain="20"
            ref='virtualList'
            rtag="div"
            wtag="table"
            wtagClass="table"
            :wtagStyle="{
                width: '100%',
                'border-spacing': 'unset',
                'border-collapse': 'unset',
                position: 'relative',
            }"
            v-if="processedRows.length > 0"
            style="flex: 1 1 auto;border-width:1px 0 0 0;border-color:lightgray;border-style:solid;"
        >
            <tr>
                <th class="bg-grey-9 text-white"
                     @click.stop="allSelectionState < 2 ? selectAll() : deselectAll()"
                     style="width:40px;"
                >
                    <i class="fa text-white" :class="allSelectionState === 0 ? 'fa-square-o' : allSelectionState === 1 ? 'fa-check-square-o text-grey' : 'fa-check-square-o'"/>
                </th>
                <th 
                    v-for="(column, index) in columns"
                    :key="index"
                    @click="sort(index)"
                    class="bg-grey-9 text-white"
                    :width="columnWidths[index] || 'auto'"
                    @mouseover="hoverColumn = index"
                    @mouseleave="hoverColumn = -1"
                >
                    <div class="row items-center no-wrap" :class="sortColumn === index ? 'text-blue-2' : ''">
                        <div>{{ typeof column === 'string' ? column : column.label || (typeof column.field === 'string' ? column.field : '') }}&nbsp</div>
                        <i 
                            v-if="sortable" 
                            class="fa" 
                            :class="sortColumn === index ? (sortType === 'desc' ? 'fa-arrow-down' : 'fa-arrow-up') : hoverColumn === index ? 'fa-arrow-up text-grey' : ''"
                        />
                    </div>
                </th>
                <th v-if="hasSlots.head || hasSlots.body" class="bg-grey-9 text-white">
                    <div v-if="hasSlots.head">
                        <slot name="head"></slot>
                    </div>
                    <div v-else>
                        Custom Column
                    </div>
                </th>
            </tr>

            <tr 
                v-for="(row, index) in paginated"
                :key="index"
                @click="click($event, row)"
                class="text-black"
                :class="(index % 2 === 1 ? 'bg-grey-2' : '') + (clickable ? ' clickable' : '')"
            >
                <td @click.stop="select(row)" style="width:40px;">
                    <div v-if="showIndices" class="column items-center justify-center nonSelectable cursorPointer" :class="selection.has(row) ? 'bg-primary text-white' : ''" style="border:solid 1px lightgray;border-radius:2px;padding:2px;">
                        {{ ((currentPage - 1) * currentPerPage) + index + 1 }}
                    </div>
                    <i v-else class="fa text-black" :class="selection.has(row) ? 'fa-check-square-o' : 'fa-square-o'"/>
                </td>
                <td 
                    v-for="(column, colIdx) in columns"
                    :key="colIdx"
                    :width="columnWidths[colIdx] || 'auto'"
                >
                    <div v-if="!column.html"> {{ collect(row, column.field) }} </div>
                    <div v-if="column.html" v-html="collect(row, column.field)"></div>						
                </td>
                <td v-if="hasSlots.body">
                    <slot name="body" :value="row" :selection="selection" :index="getRealIndex(row)"></slot>
                </td>
            </tr>
        </virtualList>
        <div v-if="processedRows.length <= 0" class="row items-center justify-center" style="flex: 1 1 64px;">
            <div>No records...</div>
        </div>

        <div v-if="paginate" class="table-footer row items-center justify-between"  style="flex: 0 0 64px;">
            <div class="row items-center no-wrap">
                <div v-if="selection && selection.length" class="row items-center">
                    <span>Selection:&nbsp</span>
                    <div>{{ selection.length }} Row(s)</div>
                </div>
            </div>
            <div class="row items-center">
                <div class="datatable-length">
                    <label>
                        <span>Rows per page:</span>
                        <select class="browser-default" @change="onTableLength">
                            <option 
                                v-for="(option, idx) in perPageOptions"
                                :key="idx"
                                :value="option"
                                :selected="option == currentPerPage"
                            >
                            {{ option === -1 ? 'All' : option }}
                        </option>
                        </select>
                    </label>
                </div>
                <div class="datatable-info" v-if="currentPerPage != -1">
                    {{(currentPage - 1) * currentPerPage ? (currentPage - 1) * currentPerPage : 1}}
                        -{{Math.min(processedRows.length, currentPerPage * currentPage)}} of {{processedRows.length}}
                </div>
                <div v-else class="datatable-info">
                    {{processedRows.length}} of {{processedRows.length}}
                </div>

                <div class="material-pagination" v-if="currentPerPage != -1">
                    <button class="svtbtn" @click.stop="previousPage"><i class="fa fa-2x fa-chevron-left margin-right"/></button>
                    <button class="svtbtn" @click.stop="nextPage"><i class="fa fa-2x fa-chevron-right margin-left"/></button>
                </div>
            </div>

			
    	</div>
	</div>
</template>

<script>
import lodash from 'lodash'
import virtualList from '../virtualList'
import svcInput from '../../input'
import '../../css'

function Selection({ getRealIndexFn }) {
    const arr = [];
    Object.defineProperty(arr, "has", {
        value(row) {
            return arr.indexOf(row) !== -1;
        },
        enumerable: false
    })
    Object.defineProperty(arr, "delete", {
        enumerable: false,
        value(row) {
            const idx = arr.indexOf(row);
            if(idx !== -1){
                arr.splice(idx, 1);
                return true;
            }
            return false;
        }
    })
    Object.defineProperty(arr, "set", {
        enumerable: false,
        value(row) {
            const idx = arr.indexOf(row);
            if(idx === -1) {
                arr.push(row);
                return true;
            }
            return false;
        }
    })
    Object.defineProperty(arr, "clear", {
        enumerable: false,
        value(){
            const len = arr.length;
            for(let i = len - 1; i >= 0; i -= 1){
                arr.splice(i, 1);
            }
        }
    })
    Object.defineProperty(arr, "indices", {
        enumerable: false,
        value() {
            const value = [];
            if(typeof getRealIndexFn !== 'function')
                return value;

            for(const row of arr) {
                value.push(getRealIndexFn(row))
            }
            return value;
        }
    })

    return arr;
}

export default {
    components: { virtualList, options: svcInput.options },
    props: {
        title: '',
        columns: {},
        rows: {},
        clickable: { default: true },
        customButtons: { default: null },
        perPage: { default: null },
        defaultPerPage: { default: null },
        sortable: { default: true },
        searchable: { default: true },
        exactSearch: {
            type: Boolean,
            default: false
        },
        paginate: { default: true },
        enumerable: { default: true },
        exportable: { default: true },
        printable: { default: true },
        filters: { default: null },
        filterMode: { default: "OR" }
    },
    data() {
        return {
            currentPage: 1,
            currentPerPage: 10,
            sortColumn: -1,
            sortType: 'asc',
            searching: false,
            searchInput: '',
            showIndices: false,
            selection: Selection({ getRealIndexFn: this.getRealIndex }),
            activeFilters: [],
            hoverColumn: -1
        }
    },
    methods: {
        nextPage() {
            if (this.processedRows.length > this.currentPerPage * this.currentPage)
                this.currentPage += 1;
        },
        previousPage() {
            if (this.currentPage > 1)
                this.currentPage -= 1;
        },
        onTableLength(e) {
            // console.log('onTableLen Trigger', e.target.value);
            this.currentPerPage = e.target.value;
        },
        sort(index) {
            if (!this.sortable)
                return;

            if (this.sortColumn === index) {
                if(this.sortType === 'asc')
                    this.sortType = 'desc';
                else {
                    this.sortColumn = -1;
                }
            } else {
                this.sortType = 'asc';
                this.sortColumn = index;
            }
        },
        search(/* e */) {
            this.searching = !this.searching;
        },
        click(e, row) {
            if (!this.clickable) {
                return
            }

            if (getSelection().toString()) {
                // Return if some text is selected instead of firing the row-click event.
                return
            }

            this.$emit('click', { row, selection: this.selection, el: e.target })
        },
        exportExcel() {
            const mimeType = 'data:application/vnd.ms-excel';
            const html = this.renderTable().replace(/ /g, '%20');

            const documentPrefix = this.title !== '' ? this.title.replace(/ /g, '-') : 'Sheet'
            const d = new Date();

            const dummy = document.createElement('a');
            dummy.href =  `${mimeType}, ${html}`;
            dummy.download = [
                documentPrefix,
                d.getFullYear(),
                (d.getMonth() + 1),
                d.getDate(),
                d.getHours(),
                d.getMinutes(),
                `${d.getSeconds()}.xls`
            ].join('-')
            dummy.click();
        },

        print() {
            const win = window.open("");
            win.document.write(this.renderTable());
            win.print();
            win.close();
        },

        renderTable() {
            let table = '<table><thead>';
            table += '<tr>';
            for (let i = 0; i < this.columns.length; i += 1) {
                const column = this.columns[i];
                table += '<th>';
                table += typeof column === 'string' ? column : (column.label || (typeof column.field === 'string' ? column.field : ''));
                table += '</th>';
            }
            table += '</tr>';

            table += '</thead><tbody>';

            for (let i = 0; i < this.rows.length; i += 1) {
                const row = this.rows[i];
                table += '<tr>';
                for (let j = 0; j < this.columns.length; j += 1) {
                    const column = this.columns[j];
                    table += '<td>';
                    table += this.collect(row, column.field);
                    table += '</td>';
                }
                table += '</tr>';
            }

            table += '</tbody></table>';

            return table;
        },

        dig(obj, selector) {
            let result = obj;
            const splitter = selector.split('.');

            for (let i = 0; i < splitter.length; i += 1) {
                if (result === undefined)
                    return undefined;

                result = result[splitter[i]];
            }

            return result;
        },

        collect(obj, field) {
            if (typeof field === 'function')
                return field(obj);
            else if (typeof field === 'string')
                return this.dig(obj, field);

            return undefined;
        },

        select(row){
            const selection = this.selection;
            if(selection.has(row)){
                selection.delete(row);
            }
            else{
                selection.set(row, row);
            }
            // console.log("Selection", selection.keys());
        },
        selectAll(){
            const paginated = this.paginated;
            const selection = this.selection;
            paginated.forEach((row) => {
                selection.set(row, row);
            })
        },
        deselectAll(){
            this.selection.clear();
        },

        getRealIndex(row) {
            // console.log(row, row.first, this.rows.length);
            return this.rows ? this.rows.indexOf(row) : -1;
        }
    },
    computed: {
        perPageOptions() {
            const p = lodash.clone(this.perPage) || [10, 20, 30, 40, 50];
            const allIndex = p.indexOf('all');
            const minus1Index = p.indexOf(-1);
            if(allIndex !== -1) {
                if(minus1Index)
                    p.splice(allIndex, 1);
                else
                    p[allIndex] = -1;
            }

            return p.map(v => parseInt(v, 10)).sort((a, b) => a - b);
        },
        processedRows() {
            const filters = this.activeFilters;
            const filterMode = this.filterMode;

            let computedRows = this.rows.filter((row) => {
                if(!filters || !filters.length)
                    return true;

                // console.log(filterMode);
                if(filterMode === 'OR'){
                    for(const filter of filters){
                        if(typeof filter === 'function' && filter(row))
                            return true;
                    }
                    return false;
                }
                // filter mode === "AND"
                for(const filter of filters){
                    if(typeof filter === 'function' && !filter(row))
                        return false;
                }
                return true;
            });

            if (this.sortable){
                computedRows = computedRows.sort((X, Y) => {
                    const column = this.columns[this.sortColumn];
                    if (!column)
                        return 0;

                    const cook = (input) => {
                        let c = input;
                        c = this.collect(c, column.field);
                        if (typeof c === 'string') {
                            c = c.toLowerCase();
                            if (column.sort === 'numeric' || column.sort === Number){
                                c = Number(c);
                                if(isNaN(c))
                                    c = 0;
                            }
                        }
                        return c;
                    }

                    // functional
                    if(typeof column.sort === 'function' && [String, Number].indexOf(column.sort) === -1) {
                        const c1 = this.collect(X, column.field);
                        const c2 = this.collect(Y, column.field);
                        // console.log(c1, c2);
                        const v = column.sort(c1, c2);
                        return v * (this.sortType === 'desc' ? -1 : 1);
                    }

                    // Standard sort
                    const x = cook(X);
                    const y = cook(Y);

                    let v = 0;
                    if(x < y)
                        v = -1;
                    else if(x > y)
                        v = 1;

                    return v * (this.sortType === 'desc' ? -1 : 1);
                })
            }

            if (this.searching && this.searchInput) {
                const columns = this.columns;
                const si = this.searchInput.toLowerCase();
                const exactSearch = this.exactSearch;
                computedRows = computedRows.filter((row) => {
                    const values = columns.map((c) => {
                        const v = typeof c.field === 'function' ? c.field(row) : lodash.get(row, c.field);
                        return v ? v.toString().toLowerCase() : '';
                    })
                    // console.log(si, values);

                    if(exactSearch)
                        return values.indexOf(si) !== -1;
                    return !!lodash.find(values, v => v.indexOf(si) !== -1 || si.indexOf(v) !== -1);
                })
            }

            return computedRows;
        },
        paginated() {
            let paginatedRows = this.processedRows;
            const cp = this.currentPage;
            const cpp = this.currentPerPage;
            if (this.paginate)
                paginatedRows = paginatedRows.slice((cp - 1) * cpp, cpp === -1 ? paginatedRows.length + 1 : cp * cpp);
            return paginatedRows;
        },
        allSelectionState() {
            const paginated = this.paginated;
            const selection = this.selection;

            let count = 0;
            for(const row of paginated) {
                if(selection.has(row))
                    count += 1;
            }

            if(count === 0)
                return 0;
            return count === paginated.length ? 2 : 1;
        },
        hasSlots() {
            return {
                body: this.$scopedSlots && this.$scopedSlots.body,
                head: this.$slots && this.$slots.head
            }
        },
        columnWidths() {
            // find last without width attached
            const arr = [];
            const columns = this.columns || [];
            const hasBodySlot = this.hasSlots.body;

            columns.forEach((v, idx) => {
                const w = v.width || (idx === columns.length - 1 && !hasBodySlot ? "99%" : `${100 / columns.length}%`)
                arr.push(w);
            })
            return arr;
        }
    },
    mounted() {
        // console.log("perPageOptions", v, this.currentPerPage, v.indexOf(this.currentPerPage));
        // console.log(v);
        const self = this;
        function getPerPage() {
            const p = lodash.clone(self.perPage) || [10, 20, 30, 40, 50];
            const allIndex = p.indexOf('all');
            const minus1Index = p.indexOf(-1);
            if(allIndex !== -1) {
                if(minus1Index)
                    p.splice(allIndex, 1);
                else
                    p[allIndex] = -1;
            }

            return p.map(v => parseInt(v, 10)).sort((a, b) => a - b);
        }

        this.selection.clear();
        const defaultPerPage = this.defaultPerPage;
        const perPage = getPerPage();
        if(perPage.indexOf(this.currentPerPage) !== -1)
            return;

        this.currentPage = 1;
        const nonAllPP = perPage[0] === -1 && perPage.length > 1 ? perPage[1] : perPage[0];
        this.currentPerPage = perPage.indexOf(defaultPerPage) !== -1 ? defaultPerPage : nonAllPP;
    },
    watch: {
        perPageOptions(v) {
            // console.log("perPageOptions", v, this.currentPerPage, v.indexOf(this.currentPerPage));
            // console.log(v);
            const defaultPerPage = this.defaultPerPage;
            if(v.indexOf(this.currentPerPage) !== -1)
                return;

            this.currentPage = 1;
            const nonAllPP = v[0] === -1 && v.length > 1 ? v[1] : v[0];
            this.currentPerPage = v.indexOf(defaultPerPage) !== -1 ? defaultPerPage : nonAllPP;
        },
        rows() {
            this.currentPage = 1;
            this.selection.clear();
        },
        selection() {
            this.$emit('selection', this.selection);
        },
        activeFilters() {
            this.currentPage = 1;
            this.selection.clear();
        }
    }
}
</script>

<style scoped>
.card { 
    position: relative;
    border: solid 1px lightgray;
}

clickable { cursor: pointer; }
.material-table { padding: 0; }

/* search input */
.search-input-container {
  padding: 5px 5px;
  border-bottom: solid 1px #dddddd;
  position: relative;
}
.search-input {
  margin: 0;
  border: transparent 0 !important;
  height: 48px;
  color: rgba(0, 0, 0, 0.84);
}
/* search input END */

.table-header {
  height: 64px;
  padding-left: 24px;
  padding-right: 14px;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  display: flex;
  -webkit-display: flex;
  border-bottom: solid 1px #dddddd;
}

.table-header .actions {
  display: -webkit-flex;
  margin-left: auto;
}

.table-header .btn-flat {
  min-width: 36px;
  padding: 0 8px;
}

.table-header input {
  margin: 0;
  height: auto;
}

.table-header i {
  color: rgba(0, 0, 0, 0.54);
  font-size: 24px;
}

.table-footer {
  height: 56px;
  padding-left: 24px;
  padding-right: 14px;
  font-size: 12px !important;
  color: rgba(0, 0, 0, 0.54);
  border-width: 1px 0 0 0;
  border-color: lightgray;
  border-style:solid;
}

.table-footer .datatable-length {
  display: -webkit-flex;
  display: flex;
}

.table-footer .datatable-length select {
  outline: none;
}

.table-footer label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.54);
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: row;
  /* works with row or column */

  flex-direction: row;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
}

.table-footer .select-wrapper {
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: row;
  /* works with row or column */

  flex-direction: row;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
}

.table-footer .datatable-info,
.table-footer .datatable-length {
  margin-right: 32px;
}

.table-footer .material-pagination {
  display: flex;
  -webkit-display: flex;
  margin: 0;
}

.table-footer .material-pagination a {
  color: rgba(0, 0, 0, 0.54);
  padding: 0 8px;
  font-size: 24px;
}

.table-footer .select-wrapper input.select-dropdown {
  margin: 0;
  border-bottom: none;
  height: auto;
  line-height: normal;
  font-size: 12px;
  width: 40px;
  text-align: right;
}

.table-footer select {
  background-color: transparent;
  width: auto;
  padding: 0;
  border: 0;
  border-radius: 0;
  height: auto;
  margin-left: 20px;
}

.table-title {
  font-size: 20px;
  color: #000;
}

.checkbox:after {
  font-family: "Material Icons";
  font-weight: normal;
  font-style: normal;
  font-size: 20px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  word-wrap: normal;
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
  vertical-align: middle;
  content: "check_box_outline_blank";
}

.checkbox--semi:after {
  font-family: "Material Icons";
  font-weight: normal;
  font-style: normal;
  font-size: 20px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  word-wrap: normal;
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
  vertical-align: middle;
  content: "indeterminate_check_box";
}

.checkbox--checked:after {
    font-family: "Material Icons";
    font-weight: normal;
    font-style: normal;
    font-size: 20px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    word-wrap: normal;
    -webkit-font-feature-settings: "liga";
    -webkit-font-smoothing: antialiased;
    vertical-align: middle;
    content: "check_box";
}

/* table related */
.table {
    width: 100%;
    border-spacing: unset;
    border-collapse: unset;
    position: relative;
    table-layout: fixed;
}

.table tr td a {
  color: inherit;
}

.table tr td a i {
  font-size: 18px;
  color: rgba(0, 0, 0, 0.54);
}

.table th:hover { overflow: visible; text-overflow: initial; }
.table th, .table td {
    padding: 0 10px 0 10px;
    border-radius: 0;
    text-align: left;
}

.table th {
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  
  height: 56px;
  /* padding-left: 56px; */
  vertical-align: middle;
  outline: none !important;

  overflow: hidden;
  text-overflow: ellipsis;
}

.table tr {
    width: 100%;
    position: relative;
}

.table td {
  /* padding: 0 0 0 56px; */
  height: 48px;
  font-size: 13px;
  
  border-bottom: solid 1px #dddddd;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  border-radius: 0;
  vertical-align: middle;
}

.table th:last-child { width: 99%; margin-right: 10px; }
.table td:last-child { width: 99%; margin-right: 10px; }


</style>