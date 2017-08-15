<template>
    <div>
        <textLine :value="ui.title" class="title"/>
        <textParagraph :value="ui.description" :options="{ style: { 'min-height': '69px' } }"/>
        <div class="roadmap">
            <h5>roadmap</h5>
        </div>
    </div>
</template>

<script>
import textLine from '@/input/textLine'
import textParagraph from '@/input/textParagraph'

export default {
    props: ['id', 'value', 'fbRef', 'navFn'],
    components: {
        textParagraph, textLine
    },
    data(){
        return{}
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
}
</script>

<style scoped>
.title {
    width: 120px;
    font-size: 20px;
}
</style>
