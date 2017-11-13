<template>
    <div>
        <virtualList
            :size="40"
            :remain="10"
            :permanentFn="permanentFn"
            rtag="div"
            :rtagStyle="{
                'border':'solid 1px purple',
            }"
            wtag="table"
            :wtagStyle="{
                'border-collapse':'none',
                'outline': 'none',
                'border': 'none',
                'padding': 0,
                'margin': 0,
                'border-spacing': 'unset',
                'border-collapse': 'unset',
            }"
            style='height:400px'
        >
            <!-- header -->
            <tr class="permanent">
                <td v-for="(value, fieldName) in first" :key="fieldName">
                    {{ fieldName }}
                </td>
            </tr>

            <tr v-for="(row, rowIndex) in tableContents" :key="rowIndex">
                <td v-for="(value, fieldName) in row" :key="fieldName">
                    {{ value }}
                </td>
            </tr>
        </virtualList>
    </div>
</template>

<script>
import virtualList from '@/layout/virtualList'
import Chance from 'chance'
import moment from 'moment'

const chance = new Chance();

function randomPerson() {
    return {
        first: chance.first(),
        last: chance.last(),
        age: chance.age(),
        birthday: moment(chance.birthday()).format("YYYY/MM/DD")
    }
}

export default {
    components: { virtualList },
    data() {
        return {
            tableContents: []
        }
    },
    mounted() {
        this.tableContents = chance.n(randomPerson, 50);
    },
    computed: {
        first() {
            return this.tableContents[0] || {};
        }
    },
    methods: {
        permanentFn(slot, idx) {
            return idx === 0;
        }
    }
}
</script>

<style scoped>
    .permanent {
        border: solid 2px red;
        background: yellow;
        height: 40px;
    }

    tr {
        height: 40px;
    }

    .permanent td {
        background: black;
        color: white;
        min-width: 128px;
        height: 32px;
        text-align: center;
    }

    td {
        text-align: center;
        border: solid 1px;
    }


</style>
