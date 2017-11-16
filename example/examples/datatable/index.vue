<template>
    <div class="column items-center justify-center">
        <dataTable
            :title="table.title"
            :rows="tableData || []"
            :columns="table.columns"
            :filters="table.filters"
            :customButtons="table.customButtons"
            :paginate="table.pagination"
            filterMode="OR"
            :perPage="[20,50,100,200,400]"
            :defaultPerPage="-1"
            class="dataTable"
        >
            <div slot="body" slot-scope="entry">
                <button class="svtbtn bg-red text-white">Delete {{ entry.value.first }}</button>
            </div>

        </dataTable>
    </div>
</template>

<script>
import dataTable from '@/layout/dataTable'
import Chance from 'chance'
import moment from 'moment'

const chance = new Chance();
function person() {
    return {
        first: chance.first(),
        last: chance.last(),
        age: chance.age(),
        gender: chance.gender(),
        birthday: moment(chance.birthday()).format("YYYY/MM/DD")
    }
}

export default {
    components: { dataTable },
    data(){
        const self = this;
        return {
            tableData: null,
            table: {
                title: "People",
                columns: [
                    {
                        field: "first",
                        sort(a, b) {
                            // console.log(a, b);
                            const aStart = a.toLowerCase().startsWith('m');
                            const bStart = b.toLowerCase().startsWith('m');
                            if(aStart && !bStart)
                                return -1;
                            if(bStart && aStart)
                                return 1;
                            return 0;
                        }
                    },
                    { field: "last" },
                    { field: "age", sort: Number },
                    { field: "gender" },
                    { field: "birthday" },
                ],
                filters: {
                    male(row) { return row.gender === 'Male' },
                    female(row) { return row.gender === 'Female' },
                    children(row) { return +row.age < 18 },
                    adults(row) { return +row.age >= 18 }
                },
                customButtons: {
                    add50: {
                        class: 'fa fa-plus',
                        icon: '50',
                        handler() {
                            const d = chance.n(person, 50);
                            if(self.tableData){
                                const t = self.tableData.concat(d);
                                self.tableData = t;
                            }
                            else
                                self.tableData = d;
                        }
                    },
                    rem50: {
                        class: 'fa fa-minus',
                        icon: '50',
                        handler() {
                            const remaining = self.tableData.length - 50;
                            if(remaining >= 0) {
                                self.tableData.splice(0, 50);
                            }
                            else {
                                self.tableData.splice(0, Math.abs(remaining));
                            }
                        }
                    },
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
    },
    mounted() {
        this.tableData = chance.n(person, 1000);
    }
}
</script>

<style scoped>

.dataTable {
    width: 90%;
    height: 90%;
}

</style>
