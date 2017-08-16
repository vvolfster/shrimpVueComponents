<template>
    <div class="segmentRoot">
        <img :src="ui.img" class="segment__img">
        <div class='segment__text'>
            <div class='segment__row'>
                <textLine :value="ui.title" />
                <combobox :options="['lesson', 'assignment']" placeholder="type" :value="ui.type"/>
            </div>
            <textParagraph :value="ui.description" class='segment__description' :options="{ style: { 'min-height': '81px' } }"/>
        </div>
    </div>
</template>

<script>
import textLine from '@/input/textLine'
import textParagraph from '@/input/textParagraph'
import combobox from "@/input/combobox"


export default {
    components: {
        combobox, textParagraph, textLine
    },
    props: ['id', 'value'],
    data(){
        return{
        }
    },
    computed: {
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
        }
    },
    methods: {
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

</style>
