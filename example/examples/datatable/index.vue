<template>
    <div class="column items-center justify-center">
        <dataTable
            :title="table.title"
            :rows="tableData || []"
            :columns="table.columns"
            :filters="table.filters"
            filterMode="OR"
            :perPage="[20,50,100,200,400]"
            :defaultPerPage="-1"
            class="dataTable"
        >
            <div slot="body" slot-scope="row">
                Hello friend
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
        return {
            tableData: null,
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
                    male(row) { return row.gender === 'Male' },
                    female(row) { return row.gender === 'Female' },
                    children(row) { return +row.age < 18 },
                    adults(row) { return +row.age >= 18 }
                }
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
