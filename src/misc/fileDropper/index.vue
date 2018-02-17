<template>
    <div style="position:relative;">
        <div v-show="isSupported" ref="form" 
            :class="hover ? 'box box--supported box--hover' : focused ? 'box box--supported box--focused' : 'box box--supported'"
            @focus="focused = true"
            @blur="focused = false"
        >
            <div class="box__input">
                <input ref="input" 
                    class="box__file" 
                    type="file"
                    name="files[]"
                    multiple :accept="accepts"
                />
                <label class="box__fileLabel" ref='label'>
                    <div class="box__inputContainer column items-center justify-center">
                        <i class="fa fa-plus box__inputIcon" :class="focused ? 'aquamarine' : ''" v-show="!busy"></i>
                        <i class="fa fa-circle-o-notch box__inputIcon box__inputIcon--spinning" v-show="busy" @click.stop.prevent="doNothing"></i>
                    </div>
                </label>
            </div>
        </div>

        <div class="box box--unsupported" v-show="!isSupported">
            Your browser does not have the features needed to support drag and drop files.
        </div>
    </div>
</template>

<script>
import lodash from 'lodash'
import BLI from 'blueimp-load-image'
import idGen from './idGen'
import fns from '../functions'
import '../../../cssImporter'
import Toast from '../../vuePlugins/toasts'


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
            type: [String, Array],
            default() {
                return "image/*"
            }
        },
        autoCorrectImageOrientation: {
            type: Boolean,
            default: true
        }
    },
    data() {
        const dataObj = {
            generatedId: null,
            focused: false,
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
                endHover: ['dragleave', 'dragend', 'drop'],
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

        input.addEventListener('focus', () => { self.focused = true });
        input.addEventListener('blur', () => { self.focused = false });
        form.addEventListener('focus', () => { self.focused = true });
        form.addEventListener('blur', () => { self.focused = false });
    },
    methods: {
        matchesFilters(files) {
            // console.log('matchesFilters', files);
            const e = this.extensions;
            const filters = lodash.isArray(e) ? e : e.trim().split(',');
            const allAccepted = filters.indexOf('*/*') !== -1 || filters.indexOf('*.*') !== -1;
            const badFiles = [];
            const goodFiles = lodash.filter(files, (file) => {
                // console.log(file);
                if(allAccepted)
                    return true;

                const type1 = file.type.toLowerCase();
                const type2 = lodash.last(file.name.split('.')).toLowerCase();
                const type3 = `.${type2}`
                const type4 = lodash.last(file.type.split('/')).toLowerCase();
                const type5 = `.${type4}`;
                const type6 = lodash.first(file.type.split('/')).toLowerCase();

                const typesArr = [type1, type2, type3, type4, type5, type6];
                // console.log(filters);

                const idx = lodash.findIndex(filters, (filter) => {
                    const f = filter.toLowerCase();
                    if(typesArr.indexOf(f) !== -1)
                        return true;

                    const jpgArr = ['image/jpg', '.jpg', 'jpg'];
                    const jpegArr = ['image/jpeg', '.jpeg', 'jpeg'];

                    if(jpgArr.indexOf(f) !== -1) {
                        const j1 = typesArr.indexOf(jpegArr[0]);
                        const j2 = typesArr.indexOf(jpegArr[1]);
                        const j3 = typesArr.indexOf(jpegArr[2]);
                        if(j1 !== -1 || j2 !== -1 || j3 !== -1)
                            return true;
                    }

                    if(jpegArr.indexOf(f) !== -1) {
                        const j1 = typesArr.indexOf(jpgArr[0]);
                        const j2 = typesArr.indexOf(jpgArr[1]);
                        const j3 = typesArr.indexOf(jpgArr[2]);
                        if(j1 !== -1 || j2 !== -1 || j3 !== -1)
                            return true;
                    }

                    if(f.indexOf('/*') !== -1 && f.startsWith(type6)){
                        // console.log(`case last`)
                        return true;
                    }

                    return false;
                })

                if(idx === -1){
                    badFiles.push(file.name);
                    return false;
                }

                return true;
            })

            if(badFiles.length){
                Toast.negative(`${badFiles.join('<br>')}<br> cannot be added because only ${filters.join(', ')} type(s) are accepted`, { duration: 5000 })
            }
            return goodFiles;
        },
        correctOrientation(files) {
            function filePromise(file) {
                return new Promise((resolve) => {
                    if(!file || !file.type.startsWith('image/')){
                        return resolve(file);
                    }

                    return BLI(file, (canvas) => {
                        canvas.toBlob((blob) => {
                            blob.name = file.name;
                            blob.lastModified = file.lastModified;
                            blob.lastModifiedDate = file.lastModifiedDate;
                            resolve(blob);
                        })
                    }, { canvas: true, orientation: true })
                })
            }

            return new Promise((resolve) => {
                const promises = lodash.reduce(files, (acc, file) => {
                    acc.push(filePromise(file));
                    return acc;
                }, [])

                Promise.all(promises).then(resolve);
            })
        },
        handleDrop(e) {
            // console.log('handleDrop')
            if(this.busy)
                return false;

            const self = this;
            const files = this.matchesFilters(lodash.get(e, "originalEvent.dataTransfer.files") || lodash.get(e, "dataTransfer.files"));
            return self.autoCorrectImageOrientation ? self.correctOrientation(files).then(f => self.emitFiles(f)) : self.emitFiles(files);
        },
        handleSubmit() {
            // console.log('handleSubmit')
            if(this.busy)
                return false;

            const self = this;
            const files = this.matchesFilters(lodash.get(this, "$refs.input.files"));
            return self.autoCorrectImageOrientation ? self.correctOrientation(files).then(f => self.emitFiles(f)) : self.emitFiles(files);
        },
        emitFiles(files) {
            const self = this;
            const unbusy = () => { self.busy = false; }
            const fn = self.fn;

            if(!files)
                return;

            // console.log('emitFiles')
            if(typeof fn === 'function') {
                self.busy = true;
                fns.genericResolver(fn, files, unbusy).then(unbusy).catch(unbusy);
            }
            else {
                self.$emit('files', files);
            }
        },
        clear() {
            // console.log(this.$refs.input.value);
            this.$refs.input.value = '';
        },
        doNothing() { /* this is called when we are already uploading something. */ }
    },
    computed: {
        accepts() {
            const e = toString.call(this.extensions) === '[object Array]' ? this.extensions : [this.extensions];
            return lodash.map(e, (x) => {
                return x.indexOf("/") === -1 && !x.startsWith(".") ? `.${x}` : x;
            }).join(', ');
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
.box--focused {
    outline: 2px dashed #5E9ED6;
}

.aquamarine {
    color: #5E9ED6;
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
    background: transparent;
}

.box__file {
    opacity: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
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
