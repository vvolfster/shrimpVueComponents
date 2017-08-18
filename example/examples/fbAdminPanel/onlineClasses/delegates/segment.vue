<template>
    <div class="segmentRoot">
        <div class="segment__img">
            <img :src="url" style="width:100%;height:100%;" class="hoverable" @click="edit('media', ui.img)">
        </div>
        <div class='segment__text'>
            <div class='segment__header'>
                <div class="hoverable" @click="edit('title', ui.title)">
                    {{ ui.title || "No title..." }}
                </div>
                <div class="hoverable" @click="edit('type', ui.type)">
                    {{ ui.type }}
                </div>
                <button class="deleteBtn" @click="$emit('removeSegment')">
                    <i class="fa fa-trash"></i>
                </button>
            </div>
            <div class='segment__description hoverable' @click="edit('description', ui.description)">
                {{ ui.description || 'No description...' }}
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

function getMediaUrl(media) {
    return new Promise((resolve) => {
        if(!media)
            return resolve('');

        if(media.startsWith('http://') || media.startsWith('https://'))
            return resolve(media);

        return fbase.getStorageUrl(media).then((url) => {
            resolve(url);
        }).catch(() => resolve(''))
    })
}

export default {
    props: ['id'],
    data(){
        return{
            allSegments: null,
            url: ''
        }
    },
    mounted() {
        const self = this;
        segmentsListener.subscribe(this.updateSegments);
        if(self.value && self.value.media)
            getMediaUrl(self.value.media).then((url) => { self.url = url })
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
                type: value ? value.type : ''
            }
        },
    },
    methods: {
        updateSegments(val) {
            this.allSegments = val;
        },
        edit(property, currentValue) {
            const self = this;
            const id = self.id;
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
            function Submit(data) {
                return new Promise((resolve, reject) => {
                    // console.log(`submit heretic`, data[property], property);
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

            if(property !== 'media') {
                Dialog.create({
                    title: property,
                    form: {
                        [property]: {
                            model: currentValue,
                            type: lodash.get(dict, `${property}.type`, String),
                            options: lodash.get(dict, `${property}.options`, null),
                        },
                    },
                    buttons: { Submit },
                    style: lodash.get(dict, `${property}.style`, String)
                })
            }
            else {
                Dialog.create({
                    title: property,
                    buttons: {
                        url(){
                            Dialog.create({
                                title: property,
                                form: {
                                    media: {
                                        type: String,
                                        validator(v) {
                                            if(!v.startsWith('http://') && !v.startsWith('https://'))
                                                return "Not a valid url";
                                            return true;
                                        }
                                    },
                                },
                                buttons: { Submit }
                            })
                        },
                        fromDisk() {
                            Dialog.create({
                                title: property,
                                form: {
                                    files: {
                                        type: File,
                                        options: {
                                            limit: 1,
                                            filter: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/tga']
                                        }
                                    },
                                },
                                buttons: {
                                    Submit({ files }) {
                                        return new Promise((resolve, reject) => {
                                            const file = files[0];
                                            if(!file)
                                                return reject('no file')

                                            // console.log(file);
                                            // return resolve(file);
                                            const storagePath = `segments/${id}`
                                            function uploadToStorage(){
                                                return new Promise((resolve, reject) => {
                                                    fbase.getStorageRef(storagePath).then((storageRef) => {
                                                        storageRef.put(file).then(resolve).catch(reject);
                                                    }).catch(reject);
                                                })
                                            }

                                            function setInDb() {
                                                return new Promise((resolve, reject) => {
                                                    fbase.getTableRef(`segments`).then((ref) => {
                                                        ref.child(id).child('media').set(storagePath)
                                                        .then(resolve)
                                                        .catch(reject);
                                                    }).catch(reject);
                                                })
                                            }

                                            return uploadToStorage().then(setInDb).then(resolve).catch(reject);
                                        })
                                    }
                                }
                            })
                        }
                    }
                })
            }
        }
    },
    watch: {
        value: {
            deep: true,
            handler(v) {
                const self = this;
                if(v)
                    getMediaUrl(v.media).then((url) => { self.url = url })
            }
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

.deleteBtn {
    background: red;
    color: white;
    border: solid 1px black;
}

</style>
