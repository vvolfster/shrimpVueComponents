<template>
    
    <table>
        <thead class="zthead">
            <th class="ztableHeader" :colspan="columns.length ? columns.length + 1 : 1">
                {{ page ? page.name : "" }}
                <div class="ztableWideActions" v-if="actions">
                    <button class="btn btn--tableWide" v-for="(action,name) in actions" :key="name" @click="$emit('callAction', { name })">
                        {{ name }}
                    </button>
                </div>
            </th>
            <tr class="ztr">
                <th class='zth idx'>#</th>
                <th v-for="field in columns" :key="field" class="zth" :style="getFieldStyle(field)">
                    {{ field }}
                </th>
            </tr>
        </thead>
        <tbody class="ztbody" v-if="pageData && columns">
            <tr v-for="(entry, id, index) in pageData" :key="id" class="ztr">
                <td class="ztd idx">
                    #{{ (page.idx * page.pageSize) + index + 1  }}
                </tv>
                <td v-for="field in columns" :key="field" class="ztd" @click="field !== '★' ? $emit('edit', { id, field, value: entry[field] }) : null">
                    <div v-if="field !== '★'">
                        {{ entry ? entry[field] : '?' }}
                    </div>
                    <div v-else class="specialActionsColumn">
                        <button v-if="hasMenu" @click="$emit('openDetailView', { id, entry  })" class="btn btn--detail">
                            <i class='fa fa-ellipsis-h'/>
                        </button>
                        <button class="btn btn--delete" @click="$emit('delete', { id } )">
                            <i class='fa fa-trash'/>
                        </button>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
    
</template>

<script>

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
        }
    },
    data(){
        return {

        }
    },
    methods: {
        // ui
        getFieldStyle(fieldName) {
            if(fieldName !== "★")
                return {};

            return {
                'background-color': 'orange'
            }
        },
    },
    computed: {
    }

}
</script>

<style scoped>
.ztableHeader {
    align-items: center;
    justify-content: center;
    background-color: #42b983;
    text-transform: uppercase;
    color: white;
    height: 40px;
    position: relative;
}

.ztableHeader--custom {
    align-items: center;
    justify-content: start;
    background: transparent;    
    text-transform: uppercase;
    color: white;
    height: 40px;
    position: relative;
}

.ztableWideActions {
    height: 100%;
    display: flex;
    justify-content: flex-end;
    position: absolute;
    top: 0;
    right: 0;
}


.specialActionsColumn {
    text-align: center;
    vertical-align: center;
}

.ztable {
    border: 2px solid #42b983;
    border-radius: 3px;
    background-color: #fff;
}

.zth {
    background-color: #42b983;
    color: #fff;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.ztd {
    background-color: #f9f9f9;
    cursor: pointer;
}


.zth, .ztd {
    min-width: 120px;
    padding: 10px 20px;
}

.btn {
    border: solid 1px;
}

.btn--delete {
    background-color: red;
    color: white;
    border-color: black;
}

.btn--tableWide {
    border-width: 0 0 0 1px;
}

</style>
