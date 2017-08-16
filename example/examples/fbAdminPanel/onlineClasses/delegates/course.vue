<template>
    <div class="course">
        <textLine :value="ui.title" class="title" placeholder="title" @value="d_value.meta.title = $event"/>
        <textParagraph :value="ui.description" class="description" placeholder="description" @value="d_value.meta.description = $event"/>
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
                <div slot="content" class="roadmap__sectionList">
                    <div v-for="segment in roadmap.segments" :key="segment">
                        <segment  :id="segment" :value="segments ? segments[segment] : null"/>
                    </div>
                </div>
            </collapsible>
            
        </div>
        <button class="savebtn" @click="save">
            <div v-if="!saving">
                <i class="fa fa-save"></i>
                Save
            </div>
            <i v-else class="savebtn--busy fa fa-circle-o-notch"></i>
        </button>

        <modal ref="roadmapEntryModal" containerStyle="width:50vw;">
            <roadmapEntry
                :allSegments="segments"
            />
        </modal>

    </div>
</template>

<script>
import lodash from 'lodash'
import textLine from '@/input/textLine'
import collapsible from '@/misc/collapsible'
import textParagraph from '@/input/textParagraph'
import modal from '@/layout/modal'
import roadmapEntry from './components/roadmapEntry'
import segmentListener from './segmentListener'
import segment from './segment'

export default {
    props: ['id', 'value', 'fbRef', 'navFn'],
    components: {
        textParagraph, textLine, modal, roadmapEntry, segment, collapsible
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
        self.valueChg();

        segmentListener.subscribe(this.updateSegments);
    },
    methods: {
        updateSegments(val) {
            console.log(`update segments`, val);
            this.segments = val;
        },
        valueChg() {
            if(this.value)
                this.d_value = lodash.cloneDeep(this.value);
            else
                this.d_value = null;
        },
        save() {
            this.saving = true;
            const self = this;
            const ref = this.fbRef;

            function unbusy() {
                self.saving = false;
            }

            function doSave() {
                return new Promise((resolve, reject) => {
                    if(!ref)
                        return reject();

                    const promises = lodash.reduce(self.d_value, (acc, v, k) => {
                        acc.push(ref.child(k).set(v));
                    }, [])

                    return Promise.all(promises).then(resolve).catch(reject);
                })
            }

            doSave().then(unbusy).catch(unbusy);
        }
    },
    watch: {
        value() {
            this.valueChg();
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

.roadmap__sectionList{
    padding: 5px;
    padding-bottom: 20px;
    border: solid 1px black;
    border-top: none;
}



</style>
