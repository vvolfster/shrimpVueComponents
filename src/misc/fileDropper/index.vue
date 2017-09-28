<template>
    <div style="position:relative;">
        <form method="post" action="" enctype="multipart/form-data" 
            v-show="isSupported" 
            ref="form"
            :class="!hover ? 'box box--supported' : 'box box--supported box--hover'"
            @submit="handleSubmit"
        >
            <div class="box__input">
                <input ref="input" class="box__file" type="file" name="files[]" multiple :accept="extensions"/>
                <label class="box__fileLabel" ref='label'>
                    <div class="box__inputContainer column items-center justify-center">
                        <i class="fa fa-plus box__inputIcon" v-show="!busy"></i>
                        <i class="fa fa-circle-o-notch box__inputIcon box__inputIcon--spinning" v-show="busy" @click.stop.prevent="doNothing"></i>
                    </div>
                </label>
            </div>
            <div class="box__uploading">Uploading&hellip;</div>
            <div class="box__success">Done!</div>
            <div class="box__error">Error! <span></span>.</div>
        </form>

        <div class="box box--unsupported" v-show="!isSupported">
            Your browser does not have the features needed to support drag and drop files.
        </div>
    </div>
</template>

<script>
import lodash from 'lodash'
import idGen from './idGen'
import fns from '../functions'
import '../../../cssImporter'

function supportsDragDrop() {
    const div = document.createElement('div');
    const isDraggable = ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)
    const hasFormData = 'FormData' in window;
    const hasFileReader = 'FileReader' in window;
    return isDraggable && hasFormData && hasFileReader;
}

export default {
    props: {
        fn: {
            type: [Function, null],
            default: null
        },
        extensions: {
            type: String,
            default: "image/*"
        }
    },
    data() {
        const dataObj = {
            generatedId: null,
            isSupported: supportsDragDrop(),
            hover: false,
            busy: false,
            eventListeners: {
                preventDefault(e) {
                    e.preventDefault();
                    e.stopPropagation();
                },
                hoverOn() {
                    dataObj.hover = true;
                },
                hoverOff() {
                    dataObj.hover = false;
                },
            },
            events: {
                all: ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'],
                startHover: ['dragover', 'dragenter'],
                endHover: ['dragleave', 'dragend', 'drop']
            }
        }
        return dataObj;
    },
    beforeDestroy() {
        const self = this;
        const form = self.$refs.form;
        const events = self.events;
        const listeners = self.eventListeners;
        const input = self.$refs.input;

        events.all.forEach(eName => form.removeEventListener(eName, listeners.preventDefault))
        events.startHover.forEach(eName => form.removeEventListener(eName, listeners.hoverOn))
        events.endHover.forEach(eName => form.removeEventListener(eName, listeners.hoverOff))
        form.removeEventListener('drop', self.handleDrop);
        input.removeEventListener("change", self.handleSubmit);
    },
    mounted() {
        const self = this;
        const form = self.$refs.form;
        const events = self.events;
        const listeners = self.eventListeners;
        const input = self.$refs.input;

        this.generatedId = idGen.getId();
        this.$refs.input.id = this.generatedId;
        this.$refs.label.htmlFor = this.generatedId;


        events.all.forEach(eName => form.addEventListener(eName, listeners.preventDefault))
        events.startHover.forEach(eName => form.addEventListener(eName, listeners.hoverOn))
        events.endHover.forEach(eName => form.addEventListener(eName, listeners.hoverOff))
        form.addEventListener('drop', self.handleDrop);

        input.addEventListener("change", self.handleSubmit);
    },
    methods: {
        handleDrop(e) {
            if(this.busy)
                return;

            const files = lodash.get(e, "originalEvent.dataTransfer.files") || lodash.get(e, "dataTransfer.files");
            this.emitFiles(files);
        },
        handleSubmit() {
            if(this.busy)
                return;

            const files = lodash.get(this, "$refs.input.files");
            this.emitFiles(files);
        },
        emitFiles(files) {
            const self = this;
            const unbusy = () => { self.busy = false; }
            const fn = self.fn;

            if(!files)
                return;

            if(typeof fn === 'function') {
                self.busy = true;
                fns.genericResolver(fn, files, unbusy).then(unbusy).catch(unbusy);
            }
            else {
                self.$emit('files', files);
            }
        },
        doNothing() {
            // this is called when we are already uploading something.
        }
    }
}
</script>

<style scoped>

.box--unsupported {
    pointer-events: none;
}

.box__dragndrop,
.box__uploading,
.box__success,
.box__error {
  display: none;
}

.box--supported {
  background-color: white;
  outline: 2px dashed black;
  outline-offset: -10px;
  border-radius: inherit;
  cursor: pointer;
}

.box--hover {
    background-color: gray;
}

.box__dragndrop {
  display: inline;
}

.box {
    position: absolute;
    width: 100%;
    height: 100%;
    padding: 2px;
}

.box__file {
    display: none;
}

.box__input {
    width: 100% !important;
    height: 100% !important;
}

.box__inputContainer {
    width: 100% !important;
    height: 100% !important;
    text-align: center;
}

.box__inputIcon {
    text-align: center;
    font-size: 20pt;
    line-height: normal;
}

.box__inputIcon--spinning {
    -webkit-animation:spin 1s linear infinite;
    -moz-animation:spin 1s linear infinite;
    animation:spin 1s linear infinite;
}
@-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
@-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
@keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }



</style>
