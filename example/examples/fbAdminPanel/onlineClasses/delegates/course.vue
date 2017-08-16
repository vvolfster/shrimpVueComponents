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
        </div>
        <button class="savebtn" @click="save">
            <div v-if="!saving">
                <i class="fa fa-save"></i>
                Save
            </div>
            <i v-else class="savebtn--busy fa fa-circle-o-notch"></i>
        </button>

        <modal ref="roadmapEntryModal" containerStyle="width:50vw;">
            <roadmapEntry>
            </roadmapEntry>
        </modal>

    </div>
</template>

<script>
import lodash from 'lodash'
import textLine from '@/input/textLine'
import textParagraph from '@/input/textParagraph'
import modal from '@/layout/modal'
import roadmapEntry from './components/roadmapEntry'
// import fbase from '@/bigTools/firebaseAdminPanel/fbase'

export default {
    props: ['id', 'value', 'fbRef', 'navFn'],
    components: {
        textParagraph, textLine, modal, roadmapEntry
    },
    data(){
        return{
            d_value: null,
            saving: false,
        }
    },
    mounted() {
        this.valueChg();
    },
    methods: {
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
                type: value ? value.type : ''
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



</style>
