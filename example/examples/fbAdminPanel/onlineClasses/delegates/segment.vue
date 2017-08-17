<template>
    <div class="segmentRoot">
        <div class="segment__img">
            <img :src="ui.img" style="width:100%;height:100%;" class="hoverable" @click="edit('media', ui.img)">
        </div>
        <div class='segment__text'>
            <div class='segment__header'>
                <div class="hoverable" @click="edit('title', ui.title)">
                    {{ ui.title }}
                </div>
                <div class="hoverable" @click="edit('type', ui.type)">
                    {{ ui.type }}
                </div>
            </div>
            <div class='segment__description hoverable' @click="edit('description', ui.description)">
                {{ ui.description }}
            </div>
            <!-- <textParagraph :value="ui.description"  :options="{ style: { 'min-height': '81px' } }"/> -->
        </div>
    </div>
</template>

<script>
import lodash from 'lodash'
import Dialog from '@/layout/dialog'
import fbase from '@/bigTools/firebaseAdminPanel/fbase'
import segmentsListener from './segmentListener'

export default {
    props: ['id'],
    data(){
        return{
            allSegments: null
        }
    },
    mounted() {
        segmentsListener.subscribe(this.updateSegments);
    },
    beforeDestroy() {
        segmentsListener.unsubscribe(this.updateSegments);
    },
    computed: {
        value() {
            return this.allSegments ? this.allSegments[this.id] : null;
        },
        ui() {
            const self = this;
            const value = self.value ? self.value : null;
            const meta = self.value && self.value.meta ? self.value.meta : null;
            return {
                title: meta ? meta.title : '',
                description: meta ? meta.description : '',
                img: value ? value.media : '',
                type: value ? value.type : ''
            }
        },
    },
    methods: {
        updateSegments(val) {
            this.allSegments = val;
        },
        edit(property, currentValue) {
            const dict = {
                title: {
                    type: String,
                    firebaseLocation: 'meta/title'
                },
                description: {
                    type: 'paragraph',
                    firebaseLocation: 'meta/description',
                    style: 'min-width: 90vw;',
                    options: {
                        style: 'min-height: 10vh; max-height: 50vh;'
                    }
                },
                type: {
                    type: 'combo',
                    firebaseLocation: 'type',
                    options: ['assignment', 'lesson']
                },
                media: {
                    type: 'text',
                    style: 'min-width: 90vw;',
                    firebaseLocation: 'media'
                }
            }

            const self = this;
            Dialog.create({
                title: property,
                form: {
                    [property]: {
                        model: currentValue,
                        type: lodash.get(dict, `${property}.type`, String),
                        options: lodash.get(dict, `${property}.options`, null),
                    },
                },
                buttons: {
                    Submit(data) {
                        const id = self.id;
                        return new Promise((resolve, reject) => {
                            fbase.getTableRef('segments').then((ref) => {
                                const path = lodash.get(dict, `${property}.firebaseLocation`)
                                if(!path)
                                    return reject('no such path');

                                return ref.child(id).child(path).set(data[property])
                                       .then(resolve)
                                       .catch(reject);
                            })
                        })
                    }
                },
                style: lodash.get(dict, `${property}.style`, String)
            })
        }
    }
}
</script>

<style scoped>
.segmentRoot {
    display: flex;
    margin-top: 10px;
}

.segment__img {
    flex: 0 0 128px;
    height: 128px;
    justify-content: center;
    border-style: solid;
    border-width: 0 1px 0 0;
    border-color: black;
    padding-right: 10px;
}

.segment__text {
    flex: 1 1 auto;
    display: flex;
    flex-flow: column;
    justify-content: flex-start;
    margin-left: 5px;
    margin-right: 5px;
}

.segment__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-style: solid;
    border-width: 0 0 1px 0;
    margin-bottom: 10px;
    font-size: 24px;
}

.hoverable:hover {
    cursor: pointer;
    background: seagreen;
    color: white;
}

</style>
