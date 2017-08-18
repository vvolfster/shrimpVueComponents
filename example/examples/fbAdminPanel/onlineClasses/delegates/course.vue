<template>
    <div class="course">
        <div class="title hoverable" placeholder="title" @click.stop="edit('title', ui.title)">
            {{ ui.title || 'No title...' }}
        </div>
        <div class="description hoverable" placeholder="description" @click.stop="edit('description', ui.description)">
            {{ ui.description || 'No description...' }}
        </div>
        <div class="roadmap">
            <div class="roadmap__header" style="position:relative;">
                <div class="roadmap__title">Roadmap</div>
                <button @click.stop="addNew('roadmapEntry')" class="roadmap__btn" style="margin-left:20px;">
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
                    <div class="leftDivider">
                        <button @click.stop="remove(`roadmapEntry`, idx)" class="roadmap__sectionBtn roadmap__sectionBtn--delete">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div slot="content" class="roadmap__segmentList">
                    <button @click.stop="addNew(`segment`, idx)" class="roadmap__sectionBtn">
                        <i class="fa fa-plus"></i>
                        Add Segment
                    </button>
                    <div v-for="(segment, segIdx) in roadmap.segments" :key="segment" class="roadmap__segment">
                        <segment  
                            :id="segment" 
                            :value="segments ? segments[segment] : null"
                            @removeSegment="remove('segment', { roadmapIdx: idx, segmentIdx: segIdx })"
                        />
                    </div>
                </div>
            </collapsible>
        </div>
    </div>
</template>

<script>
import lodash from 'lodash'
import Dialog from '@/layout/dialog'
import Toast from '@/vuePlugins/toasts'
import collapsible from '@/misc/collapsible'
import fbase from '@/bigTools/firebaseAdminPanel/fbase'
import segmentListener from './segmentListener'
import segment from './segment'


function addNewSegment(roadmapIdx){
    const selfRef = this.fbRef;
    const rmapEntry = lodash.get(this, `value.roadmap[${roadmapIdx}]`);
    return new Promise((rootResolve, rootReject) => {
        if(!rmapEntry)
            return rootReject('invalid roadmap idx provided')

        if(!selfRef)
            return rootReject('no ref')

        return Dialog.create({
            onDismiss: rootReject,
            title: "New segment",
            form: {
                title: {
                    type: String,
                    required: true,
                },
                description: {
                    type: "paragraph",
                    options: {
                        style: "min-height: 10vh;"
                    }
                },
                media: {
                    type: File,
                    options: {
                        limit: 1
                    }
                },
                type: {
                    type: "combo",
                    required: true,
                    options: ['assignment', 'lesson']
                }
            },
            buttons: {
                Submit(val) {
                    const media = lodash.get(val, "media[0]");
                    return new Promise((resolve, reject) => {
                        fbase.getTableRef('segments').then((ref) => {
                            function getUniqueKey(){
                                return ref.push(); // this is a promise in iself
                            }

                            function addMedia({ key }) {
                                return new Promise((resolve, reject) => {
                                    if(!media)
                                        return resolve({ key });

                                    return fbase.getStorageRef(`segments/${key}`).then((storageRef) => {
                                        storageRef.put(media).then(() => resolve({ key, mediaPath: `segments/${key}` }))
                                        .catch(reject);
                                    }).catch(reject);
                                })
                            }

                            function addToSegmentsTable({ key, mediaPath }) {
                                return new Promise((resolve, reject) => {
                                    const obj = {
                                        media: mediaPath || "",
                                        type: val.type,
                                        meta: {
                                            title: val.title,
                                            description: val.description
                                        }
                                    }
                                    ref.child(key).set(obj).then(() => resolve({ key }))
                                    .catch(reject);
                                })
                            }

                            function addSegmentToCourseRoadmap({ key }) {
                                return new Promise((resolve, reject) => {
                                    const newSegIdx = Number(lodash.last(lodash.keys(rmapEntry.segments).sort())) + 1;
                                    if(isNaN(newSegIdx))
                                        return reject();

                                    return selfRef.child(`roadmap/${roadmapIdx}/segments/${newSegIdx}`).set(key).then(resolve).catch(reject);
                                })
                            }

                            // do it all now
                            getUniqueKey()
                            .then(addMedia)
                            .then(addToSegmentsTable)
                            .then(addSegmentToCourseRoadmap)
                            .then(rootResolve)
                            .then(resolve)
                            .catch(reject);
                        }).catch(reject);
                    })
                }
            },
            style: "min-width:50vw;min-height:50vh;"
        })
    })
}

function addExistingSegment(roadmapIdx){
    const selfRef = this.fbRef;
    const roadmap = lodash.get(this `value.roadmap`);
    const rmapEntry = lodash.get(this, `value.roadmap[${roadmapIdx}]`);
    const allSegments = this.segments;
    return new Promise((rootResolve, rootReject) => {
        if(!selfRef)
            return rootReject('no ref')

        if(!roadmap || !rmapEntry)
            return rootReject('roadmap or roadmap entry invalid')

        if(!allSegments)
            return rootReject('no existing segments loaded yet')

        return Dialog.create({
            onDismiss: rootReject,
            title: 'Existing Segment',
            form: {
                segment: {
                    type: "textLineAutoComplete",
                    required: true,
                    options: {
                        dictionary: allSegments,
                        matchOn: ['meta.title'],
                        display: ['meta.title'],
                    }
                }
            },
            buttons: {
                Submit(val) {
                    const id = lodash.get(val, 'segment.key');
                    const newSegIdx = Number(lodash.last(lodash.keys(rmapEntry.segments).sort())) + 1;

                    // check if this segment exists in any other roadmapEntry or this one!
                    const existingRoadmapEntry = lodash.find(roadmap, (roadmapEntry) => {
                        const rmapSegs = roadmapEntry.segments;
                        return lodash.find(rmapSegs, segId => segId === id);
                    })

                    return new Promise((resolve, reject) => {
                        if(!id || isNaN(newSegIdx))
                            return reject();

                        if(existingRoadmapEntry){
                            const title = lodash.get(existingRoadmapEntry, "title");
                            const msg = title ? `in ${title}` : ``
                            Toast.negative(`This segment already exists ${msg}`)
                            return reject();
                        }


                        return selfRef.child(`roadmap/${roadmapIdx}/segments/${newSegIdx}`).set(id).then(() => {
                            rootResolve();
                            resolve();
                        }).catch(reject);
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
            segments: null, // we need all segment data in order to add!
        }
    },
    beforeDestroy() {
        segmentListener.unsubscribe(this.updateSegments);
    },
    mounted() {
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

                    return ref.child(fbLocation).set(val).then(resolve).catch(reject);
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
            const roadmap = lodash.get(this, "value.roadmap");
            const fbRef = this.fbRef;
            function newSegment() {
                addNewSegment.apply(self, [idx])
            }
            function existingSegment() {
                addExistingSegment.apply(self, [idx]);
            }

            if(!roadmap || !fbRef)
                return;

            if(type === 'roadmapEntry'){
                Dialog.create({
                    title: type,
                    form: {
                        roadmapEntry: String
                    },
                    buttons: {
                        Submit({ roadmapEntry }){
                            // find the max of all the keys, add 1 to it
                            const newKey = Number(lodash.last(lodash.keys(roadmap).sort())) + 1;
                            return new Promise((resolve, reject) => {
                                const val = {
                                    title: roadmapEntry,
                                    segments: {}
                                }
                                if(!self.fbRef || isNaN(newKey))
                                    return reject('no ref or key is invalid')

                                return fbRef.child('roadmap').child(newKey).set(val)
                                    .then(resolve)
                                    .catch(reject);
                            })
                        }
                    }
                })
            }
            else if(type === 'segment'){
                Dialog.create({
                    title: "Add segment",
                    buttons: {
                        Existing: existingSegment,
                        New: newSegment
                    }
                })
            }
        },
        remove(type, idx) {
            const fbRef = this.fbRef;
            if(!fbRef)
                return;

            if(type === 'roadmapEntry'){
                fbRef.child(`roadmap/${idx}`).remove();
            }
            else if(type === 'segment' && typeof idx === 'object') {
                const roadmapIdx = idx.roadmapIdx;
                const segmentIdx = idx.segmentIdx;

                fbRef.child(`roadmap/${roadmapIdx}/segments/${segmentIdx}`).remove();
            }
        }
    },
    computed: {
        ui() {
            const value = this.value;
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

.roadmap__sectionBtn {
    border: solid 1px;
}

.roadmap__sectionBtn--delete {
    background: red;
}

.leftDivider {
    border-width: 0 0 0 1px;
    color: white;
    border-style: solid;
    padding-left: 10px;
}

</style>
