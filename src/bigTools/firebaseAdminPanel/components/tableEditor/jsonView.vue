<template>
    <div>
        <div class="row justify-between items-center bg-grey text-white" style="padding:5px;">
            <div>{{ page ? page.name : "" }}</div>
            <button class="bg-white text-black" @click="$emit('switchView', 'table')">Table</button>
        </div>
        <div v-if="actions">
            <button class="btn btn--tableWide btn--mini fa fa-plus" @click.stop="setExpansion(true)" />
            <button class="btn btn--tableWide btn--mini fa fa-minus" @click.stop="setExpansion(false)" />
            <button class="btn btn--tableWide" v-for="(action,name) in actions" :key="name" @click="$emit('callAction', { name })">
                {{ name }}
            </button>
        </div>
        <div v-for="(obj, key, idx) in pageData" :key="key" class="jsonCell">
            <json :value="obj" :placeholder="key" :options="editorOptions" :ref="`json_${idx}`" @input="$emit('edit', { id: key, value: $event })" />
            <div class="overlayControls row items-center">
                <button 
                    class="btn btn--mini btn--overlay"  
                    @click="$refs[`json_${idx}`][0].d_mode === 'tree' ? $refs[`json_${idx}`][0].getEditor().setMode('code') : $refs[`json_${idx}`][0].getEditor().setMode('tree')"
                >
                    {{ $refs[`json_${idx}`][0].d_mode === 'tree' ? 'code' : 'tree' }}
                </button>
                <button v-if="hasDelete" class="btn btn--delete btn--mini btn--overlay fa fa-trash" @click="$emit('delete', { id } )"/>
            </div>
        </div>
    </div>
</template>

<script>
import lodash from 'lodash'
import json from '../../../../input/json'
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
    components: { json },
    data() {
        return {
            editorOptions: {
                menu: false,
                style: 'border: none;',
                deepCheckOnUpdate: true,
            }
        }
    },
    mounted() {
        this.setExpansion(false);
    },
    methods: {
        setExpansion(val) {
            const self = this;
            lodash.times(lodash.keys(this.pageData).length, (idx) => {
                const ref = lodash.first(self.$refs[`json_${idx}`])
                if (!ref)
                    return false;

                // console.log(ref);
                // if(!ref.expandAll || !ref.collapseAll)
                //     return false;

                return val ? ref.expandAll() : ref.collapseAll();
            })
        },
    }
}
</script>

<style scoped>
.jsonCell {
    margin-bottom: 10px;
    position: relative;
}

.btn--delete {
    background-color: red;
    color: white;
}

.btn--tableWide {
    border-width: 0 0 0 1px;
    border: solid lightgray;
}

.btn--mini {
    min-width: 20px;
    min-height: 20px;
    padding: 0;
}

.btn--overlay {
    
}

.overlayControls {
    position: absolute;
    top: 0;
    right: 0;
    height: 30px;
    z-index: 999999999999;
    background-color: white;
    border: solid 1px black;
}

.btn {
    margin-left: 20px;
}

</style>
