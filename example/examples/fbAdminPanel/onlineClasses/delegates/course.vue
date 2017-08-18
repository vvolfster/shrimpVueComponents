<template>
    <div class="course">
        <div class="title hoverable" placeholder="title" @click="edit('title', ui.title)">
            {{ ui.title }}
        </div>
        <div class="description hoverable" placeholder="description" @click="edit('description', ui.description)">
            {{ ui.description }}
        </div>
        <div class="roadmap">
            <div class="roadmap__header" style="position:relative;">
                <div class="roadmap__title">Roadmap</div>
                <button @click="addNew('roadmapEntry')" class="roadmap__btn" style="margin-left:20px;">
                    <i class="fa fa-plus"></i>
                    New
                </button>
            </div>

            <!-- this is the list of all existing roadmap sections -->
            <collapsible v-for="(roadmap, idx) in ui.roadmap" :key="idx" class="roadmap__section">
                <div slot="heading" class='roadmap__sectionHeader'>
                    <div>
                        #{{ idx }} {{ roadmap.title || 'Untitled' }}
                    </div>
                    <div>
                        <button @click="addNew(`segment`, idx)"><i class="fa fa-plus"></i>New Section</button>
                        <i class="fa fa-caret-down"></i>
                    </div>
                </div>
                <div slot="content" class="roadmap__segmentList">
                    <div v-for="segment in roadmap.segments" :key="segment" class="roadmap__segment">
                        <segment  :id="segment" :value="segments ? segments[segment] : null"/>
                    </div>
                </div>
            </collapsible>
        </div>
    </div>
</template>

<script>
import lodash from 'lodash'
import Dialog from '@/layout/dialog'
import collapsible from '@/misc/collapsible'
import segmentListener from './segmentListener'
import segment from './segment'

function addNewSegment(roadmapIdx){
    const self = this;
    const selfRef = this.fbRef;
    const rmapEntry = this.value.roadmap[roadmapIdx]
    return new Promise((resolve, reject) => {
        if(!rmapEntry)
            return reject('invalid roadmap idx provided')

        return Dialog.create({
            onDismiss: reject,
            title: "New segment",
            form: {
                title: {
                    type: String,
                    required: true,
                },
                description: "Paragraph",
                media: File,
                type: {
                    type: "combo",
                    required: true,
                    options: ['assignment', 'lesson']
                }
            },
            buttons: {
                Submit(val) {
                    return new Promise((resolve, reject) => {
                        fbase.getTableRef('segments').then((ref) => {

                            function getUniqueKey(){
                                return ref.push(); // this is a promise in iself
                            }

                            function addMedia({ key }) {
                                return new Promise((resolve, reject) => {
                                    if(!val.media)
                                        return resolve({ key });

                                    fbase.getStorageRef(`segments/${key}`).then((storageRef) => {
                                        storageRef.put(val.media).then(() => {
                                            resolve({ key, media: `segments/${key}`})
                                        }).catch(reject);
                                    }).catch(reject);
                                })
                            }

                            function addToSegmentsTable({ key, media }) {
                                return new Promise((resolve, reject) => {
                                    ref.child(key).set({
                                        media,
                                        type: val.type,
                                        meta: {
                                            title: val.title,
                                            description: val.description
                                        }
                                    }).then(() => resolve(key)).catch(reject);
                                })
                            }

                            function addSegmentToCourseRoadmap({ key }) {
                                return new Promise((resolve, reject) => {
                                    const newSegIdx = lodash.last(lodash.keys(rmapEntry.segments).sort()) + 1;
                                    selfRef.child(`roadmap/${roadmapIdx}/segments/${newSegIdx}`).set(key).then(resolve).catch(reject);
                                })
                            }

                            // do it all now
                            getUniqueKey()
                            .then(addMedia)
                            .then(addToSegmentsTable)
                            .then(addSegmentToCourseRoadmap)
                            .then(resolve)
                            .catch(reject);
                        })
                    })
                }
            }
        })
    })
}

function addExistingSegment(roadmapIdx){
    const self = this;
    const selfRef = this.fbRef;
    const rmapEntry = this.value.roadmap[roadmapIdx];
    const allSegments = this.allSegments;
    return new Promise((resolve, reject) => {
        Dialog.create({
            onDismiss: reject,
            title: 'Existing Segment',
            form: {
                segment: {
                    type: "textLineAutoComplete",
                    options: {
                        dictionary: allSegments,
                        matchOn: ['meta.title'],
                        show: ['meta.title'],
                    }
                }
            },
            buttons: {
                Submit(val) {
                    const id = val.id;
                    return new Promise((resolve, reject) => {
                        const newSegIdx = lodash.last(lodash.keys(rmapEntry.segments).sort()) + 1;
                        selfRef.child(`roadmap/${roadmapIdx}/segments/${newSegIdx}`).set(id).then(resolve).catch(reject);
                    })
                }
            }
        })
    })
}


export default {
    props: ['id', 'value', 'fbRef', 'navFn'],
    components: {
        segment, collapsible
    },
    data(){
        return{
            d_value: null,
            saving: false,
            segments: null, // we need all segment data in order to add!
        }
    },
    beforeDestroy() {
        segmentListener.unsubscribe(this.updateSegments);
    },
    mounted() {
        const self = this;
        segmentListener.subscribe(this.updateSegments);
    },
    methods: {
        updateSegments(val) {
            this.segments = val;
        },
        edit(property, currentValue){
            const ref = this.fbRef;
            const dict = {
                tite: {
                    form: {
                        type: String,
                        validator(v) {
                            if(v.length < 5)
                                return "too short"
                            return true;
                        },
                        model: currentValue        
                    },
                    firebaseLocation: 'title'
                },
                description: {
                    form: {
                        type: 'Paragraph',
                        options: {
                            style: 'min-width: 50vw;'
                        },
                        model: currentValue
                    },
                    firebaseLocation: 'description',
                    style: 'min-width: 60vw;'
                }
            }

            function Submit(data) {
                return new Promise((resolve, reject) => {
                    const val = data[property];
                    const fbLocation = lodash.get(dict, `${property}.firebaseLocation`)
                    if(!ref || !fbLocation)
                        return reject('no firebase ref provided or no location')
                    
                    ref.child(fbLocation).set(val).then(resolve).catch(reject);
                })
            }

            Dialog.create({
                title: property,
                form: lodash.get(dict, `${property}.form`),
                buttons: { Submit }
            })
        },
        addNew(type, idx) {
            const self = this;
            if(type === 'roadmapEntry'){
                Dialog.create({
                    title: type,
                    form: {
                        roadmapEntry: String
                    },
                    buttons: {
                        Submit({ roadmapEntry}){
                            // get current roadmap
                            const keys = lodash.keys(ui.roadmap).sort();
                            
                            // find the max of all the keys, add 1 to it
                            const newKey = lodash.last(keys) + 1;
                            return new Promise((resolve, reject) => {
                                const val = {
                                    title: roadmapEntry,
                                    segments: {}
                                }
                                if(!self.fbRef || isNan(newKey))
                                    return reject('no ref or key is invalid')

                                fbRef.child('roadmap').child(newKey).set(val).then(resolve).catch(reject);
                            })
                        }
                    }
                })
            }
            else if(type === 'segment'){

                function newSegment() {
                    return addNewSegment.apply(self, [idx])
                }
                function existingSegment() {
                    return addExistingSegment.apply(self, [idx]);
                }

                Dialog.create({
                    title: "Add segment",
                    buttons: {
                        Existing: existingSegment,
                        New: newSegment
                    }
                })
            }
        }
    },
    computed: {
        ui() {
            const self = this;
            const value = self.d_value;
            const meta = value && value.meta ? value.meta : null;
            return {
                title: meta ? meta.title : '',
                description: meta ? meta.description : '',
                img: value ? value.media : '',
                type: value ? value.type : '',
                roadmap: value && value.roadmap ? value.roadmap : null
            }
        }
    },
}
</script>

<style scoped>
.course {
    position:relative; 
    margin-top: 5px; 
    padding: 5px;
    border: solid 1px;
}

.title {
    width: 50vw;
    font-size: 20px;
}

.description {
    min-height: 69px;
}

.roadmap {
    margin-top: 10px;
}

.roadmap__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: seagreen;
    min-height: 44px;
    padding: 5px;
    margin-bottom: 10px;
}

.roadmap__title {
    color: white;
    font-size: 20px;
    text-align: center;
}

.roadmap__btn {
    color: white;
    font-size: 14px;
    border-width: 0 0 0 1px;
    border-style: solid;
    border-color: white;
}



.savebtn {
    position: absolute;
    top: 5px;
    right: 5px;
    font-size: 14px;
    border: solid 1px;
    color: black;
    background: lightblue;
    min-width: 50px;
}

.savebtn--busy {
    -webkit-animation:spin 1s linear infinite;
    -moz-animation:spin 1s linear infinite;
    animation:spin 1s linear infinite;
    color: white;
    font-size: 20px;
    min-width: 50px;
}

.inline {
    display: inline-block;
}

.roadmap__section {
    border-width: 0 0 1px 0;
    padding: 5px;
}

.roadmap__sectionHeader {
    display: flex;
    background: seagreen;
    color: white;
    padding: 5px;
    border: solid 1px black;
    justify-content: space-between;
    align-items: center;
}

.roadmap__segmentList{
    padding: 5px;
    padding-bottom: 20px;
    border: solid 1px black;
    border-top: none;
}

.roadmap__segment {
    border-width: 0 0 1px 0;
    border-color: gray;
    border-style: solid;
    padding-top: 10px;
    padding-bottom: 10px;
}



</style>
