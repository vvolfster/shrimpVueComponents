<template>
    <div>
        <div class="row justify-between items-center bg-grey text-white" style="padding:5px;">
            <div class="row items-center">
                <div>{{ page ? page.name : "" }}</div>
                <button 
                    class="svtbtn bg-white text-black btn--mini"
                    @click="editorOptions.mode = editorOptions.mode === 'tree' ? 'code' : 'tree'"
                >
                    <i class="fa" :class="`fa-${editorOptions.mode}`"></i>
                </button>
                <button class="svtbtn btn--mini fa fa-plus" @click.stop="setExpansion(true)" />
                <button class="svtbtn btn--mini fa fa-minus" @click.stop="setExpansion(false)" />
                <button class="svtbtn btn--mini fa fa-file" @click.stop="createNew" v-if="page && page.name"/>
                <div v-if="actions" style="border:solid 1px white; border-width: 0 0 0 1px;">
                    <button class="svtbtn" v-for="(action,name) in actions" :key="name" @click="$emit('callAction', { name })">
                        {{ name }}
                    </button>
                </div>
            </div>
            <!-- <button class="svtbtn bg-white text-black" @click="$emit('switchView', 'table')">Table</button> THis has been discontinued! -->
        </div>
        
        <div v-for="(obj, key, idx) in pageData" :key="key" class="jsonCell">
            <div v-if="editorOptions.mode !== 'tree'" class="header row items-center">{{ key }}</div>
            <json :value="obj" :placeholder="key" :options="editorOptions" :ref="`json_${idx}`" @input="$emit('edit', { id: key, value: $event })" />
            <div class="overlayControls row items-center">
                <button v-if="hasMenu" @click="$emit('openDetailView', { id: key, entry: obj })" class="svtbtn fa fa-ellipsis-h bg-green text-white btn btn--mini "/>
                <button class="svtbtn bg-green btn--mini  text-white" @click="$emit('cloneAs', { entry: obj } )" title="Clone As. You define where this needs to be copied!">
                    <i class='fa fa-clone'/>
                </button>
                <button class="svtbtn bg-orange btn--mini  text-white" @click="$emit('clone', { entry: obj } )" title="clone">
                    <i class='fa fa-clone'/>
                </button>
                <button v-if="hasDelete" class="svtbtn btn--delete btn--mini  fa fa-trash" @click="$emit('delete', { id: key } )"/>
            </div>
        </div>
    </div>
</template>

<script>
import lodash from 'lodash'
import json from '../../../../input/json'
import Toast from '../../../../vuePlugins/toasts'
import Dialog from '../../../../layout/dialog'
import fbase from '../../fbase'
import '../../../../css'


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
                mode: "tree",
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

                return val ? ref.expandAll() : ref.collapseAll();
            })
        },
        createNew() {
            const self = this;
            const name = lodash.get(self, "page.name");
            const form = {
                value: {
                    type: JSON,
                    options: {
                        style: "min-width: 40vw;",
                        mode: "code"
                    }
                },
                key: {
                    type: String,
                    label: "Key (optional)"
                }
            }

            Dialog.create({
                title: `Create New ${name}`,
                form,
                buttons: {
                    Submit({ key, value }){
                        return new Promise((resolve, reject) => {
                            if(!name)
                                return reject(`no name for table: ${name}`);

                            return fbase.getTableRef(name).then((ref) => {
                                function success() {
                                    Toast.positive(`Successfully created new entry in ${name}. Refresh if it doesn't appear`);
                                    resolve();
                                }

                                if(key) {
                                    ref.child(key).once('value').then((snap) => {
                                        function doTheSet() {
                                            ref.child(key).set(value).then(success).catch(reject);
                                        }

                                        if(!snap.val())
                                            doTheSet()
                                        else {
                                            Dialog.create({
                                                title: "Overwrite?",
                                                buttons: {
                                                    Yes: doTheSet,
                                                    No() {}
                                                }
                                            })
                                        }
                                    })
                                }
                                else {
                                    ref.push(value).then(success).catch(reject);
                                }
                            }).catch(reject)
                        })
                    }
                }
            })
        }
    },
    // watch: {
    //     pageData(pd) {
    //         console.log('pd changed to', pd);
    //     }
    // }
}
</script>

<style scoped>
.jsonCell {
    margin-bottom: 10px;
    position: relative;
    border: solid 1px lightgray;
    min-height: 40px;
}

.btn--delete {
    background-color: red;
    color: white;
}

.btn--mini {
    min-width: 20px;
    min-height: 20px;
    padding: 0;
}



.overlayControls {
    position: absolute;
    top: 0;
    right: 0;
    height: 30px;
    z-index: 4;
    background-color: gray;
}

.header {
    height: 30px;
    background-color: gray;
    color: white;
    padding: 5px;
}

.btn {
    margin-left: 5px;
    margin-right: 5px;
}

</style>
