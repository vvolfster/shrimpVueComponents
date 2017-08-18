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
                <button @click="$refs.roadmapEntryModal.open()" class="roadmap__btn" style="margin-left:20px;">
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
                    <i class="fa fa-caret-down"></i>
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
