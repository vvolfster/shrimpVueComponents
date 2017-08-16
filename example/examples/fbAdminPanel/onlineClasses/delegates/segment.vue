<template>
    <div class="segmentRoot">
        <img :src="ui.img" class="segment__img">
        <div class='segment__text'>
            <div class='segment__row'>
                <div class="segment__title" @click="edit('title', ui.title)">
                    {{ ui.title }}
                </div>
                <combobox :options="['lesson', 'assignment']" placeholder="type" :value="ui.type"/>
            </div>
            <div class='segment__description' @click="edit('description', ui.description)">
                {{ ui.description }}
            </div>
            <!-- <textParagraph :value="ui.description"  :options="{ style: { 'min-height': '81px' } }"/> -->
        </div>
    </div>
</template>

<script>
import { Dialog } from 'quasar-framework'
import textLine from '@/input/textLine'
import textParagraph from '@/input/textParagraph'
import combobox from "@/input/combobox"
import segmentsListener from './segmentListener'


export default {
    components: {
        combobox, textParagraph, textLine
    },
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
            const formDict = {
                title: 'textbox',
                description: 'textarea'
            }


            Dialog.create({
                title: property,
                description: currentValue,
                form: {
                    [property]: {
                        model: currentValue,
                        type: formDict[property]
                    },
                    classes: 'wide',
                },
                buttons: [{
                    label: 'Submit',
                    handler(data) {
                        const input = data[property];
                        console.log(input);
                    }
                }]
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
    width: 128px;
    height: 128px;
}

.segment__text {
    flex: 1 1 auto;
    display: flex;
    flex-flow: column;
    justify-content: flex-start;
    margin-left: 5px;
    margin-right: 5px;
}

.segment__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.segment__description {
 
}

.wide {
    width: 50vw;
}

</style>
