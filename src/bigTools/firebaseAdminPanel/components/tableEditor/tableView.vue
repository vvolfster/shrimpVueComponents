<template>
    <table>
        <thead>
            <th :colspan="columns.length ? columns.length + 1 : 1" class="bg-grey text-white">
                <div class="row justify-between items-center">
                    <div>{{ page ? page.name : "" }}</div>
                    <button class="bg-white text-black" @click="$emit('switchView', 'json')">JSON</button>
                </div>
                <div v-if="actions">
                    <button class="btn btn--tableWide" v-for="(action,name) in actions" :key="name" @click="$emit('callAction', { name })">
                        {{ name }}
                    </button>
                </div>
            </th>
            <tr>
                <th class="smallCol bg-grey text-white">#</th>
                <th v-for="field in columns" :key="field" :class="field === '★' ? 'smallCol' : ''" class="bg-grey text-white">
                    {{ field }}
                </th>
            </tr>
        </thead>
        <tbody v-if="pageData && columns">
            <tr v-for="(entry, id, index) in pageData" :key="id" :class="index % 2 !== 0 ? 'grey lighten-4' : ''">
                <td class="smallCol">
                    #{{ (page.idx * page.pageSize) + index + 1  }}
                </tv>
                <td v-for="field in columns" :key="field"
                    :class="getFieldClass(field)"
                    @click="field !== '★' ? $emit('edit', { id, field, value: entry[field] }) : null"
                >
                    <div v-if="field !== '★'">
                        {{ entry ? entry[field] : '?' }}
                    </div>
                    <div v-else class="specialActionsColumn">
                        <button v-if="hasMenu" @click="$emit('openDetailView', { id, entry  })" class="green btn">
                            <i class='fa fa-ellipsis-h'/>
                        </button>
                        <button class="yellow btn" @click="$emit('clone', { entry } )">
                            <i class='fa fa-clone'/>
                        </button>
                        <button v-if="hasDelete" class="btn btn--delete" @click="$emit('delete', { id } )">
                            <i class='fa fa-trash'/>
                        </button>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script>
import '../../../../../cssImporter'

export default {
    props: {
        columns: {
            type: [Array, null],
            default: null
        },
        page: {
            type: [Object, null],
            default: null
        },
        pageData: {
            type: [Object, null],
            default: null
        },
        actions: {
            type: [Object, null],
            default: null
        },
        hasMenu: {
            type: Boolean,
            default: true
        },
        hasDelete: {
            type: Boolean,
            default: true
        }
    },
    data(){
        return {

        }
    },
    methods: {
        // ui
        getFieldClass(fieldName) {
            if(fieldName !== "★")
                return '';

            return 'smallCol'
        },
    },
    computed: {
    }

}
</script>

<style scoped>
.smallCol {
    width: 96px;
}

button {
    padding: 0 5px 0 5px;
}

td {
    border: solid 1px lightgray;
    cursor: pointer;
    text-align: center;
}

th {
    border: solid 1px lightgray;
    cursor: pointer;
    text-align: center;
}

td, th {
    padding: 5px;
}

.btn--delete {
    background-color: red;
    color: white;
}

.btn--tableWide {
    border-width: 0 0 0 1px;
}

</style>
