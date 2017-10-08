<template>
    <div :style="ui.style">
        <fileDropper v-if="!limit || limit > d_value.length"
            class="fileDropper line"
            @files='updateValue'
            extensions="*/*"
        />
        <div v-else class="fileDropper line check">
            <i class="fa fa-check"></i>
        </div>
        <div class="fileList">
            <div v-for="(file, idx ) in d_value" :key="idx" class="file">
                <div class="fileName">
                    {{ limit > 1 ? `${idx + 1}.` : `` }} {{ file.name }}
                </div>
                <button class='svtbtn' @click="removeFile(idx)"><i class='fa fa-trash'></i></button>
            </div>
        </div>
        <div v-if="error !== null" class="line__error">
            {{ error }}
        </div>
    </div>
</template>

<script>
import lodash from 'lodash'
import fileDropper from '../../misc/fileDropper'
import Toast from '../../vuePlugins/toasts'
import '../../../cssImporter'

function getOptions(options) {
    if(!options)
        return { limit: null, filters: null, duplicates: false }

    const limit = typeof options.limit === 'number' && options.limit > 0 ? options.limit : null;

    // figure out filters
    const filter = options.filters || options.filter || null;
    let filters = [];
    if(typeof filter === 'string')
        filters = [filter]
    else if(toString.call(filter) === '[object Array]')
        filters = filter;

    return { limit, filters }
}

export default {
    components: {
        fileDropper
    },
    props: ['placeholder', 'value', 'validateFn', 'options'],
    data() {
        return {
            d_value: [],
            error: null
        }
    },
    methods: {
        updateValue(f) {
            const self = this;
            const options = getOptions(self.options);
            // console.log('options', options);
            function itr(collection) {
                const v = [];
                lodash.each(collection, (file) => {
                    const isFile = file instanceof File;
                    if(!isFile)
                        return;

                    if(options.filters && options.filters.length) {
                        const idx = lodash.findIndex(options.filters, filter => filter.toLowerCase() === file.type.toLowerCase())
                        if(idx === -1){
                            Toast.negative(`${file.name} cannot be added because only ${JSON.stringify(options.filters)} are accepted`)
                            return;
                        }
                    }

                    v.push(file);
                })

                if(typeof self.validateFn === 'function') {
                    const err = self.validateFn(v);
                    self.error = typeof err === 'string' ? err : null;
                }
                else {
                    self.error = null;
                }

                if(self.error)
                    return;

                if(options.limit && self.d_value.length + v.length > options.limit) {
                    const pickAmt = options.limit - self.d_value.length;
                    const ignoredFiles = []
                    lodash.each(v, (file, idx) => {
                        if(idx < pickAmt)
                            self.d_value.push(file);
                        else
                            ignoredFiles.push(file.name);
                    })

                    if(ignoredFiles)
                        Toast.negative(`${ignoredFiles.join(", ")} ignored because the limit of ${options.limit} was reached`)
                }
                else {
                    self.d_value = self.d_value.concat(v);
                }

                // console.log(self.d_value)
                self.$emit('input', self.d_value);
                self.$emit('value', self.d_value);
            }

            if(f instanceof FileList) {
                itr(f);
            }
            else if(f instanceof File) {
                itr([f])
            }
            else if(typeof f === 'object'){
                itr(f);
            }
        },
        removeFile(file){
            const isFile = file instanceof File;
            if(isFile){
                const idx = lodash.findIndex(this.d_value, f => f === file);
                if(idx !== -1)
                    this.d_value.splice(idx, 1);
            }
            else if(typeof file === 'number' && file >= 0 && file < this.d_value.length) {
                this.d_value.splice(file, 1);
            }
            else if(typeof file === 'string'){
                const idx = lodash.findIndex(this.d_value, f => f.name === file);
                if(idx !== -1)
                    this.d_value.splice(idx, 1);
            }
        },
        getValue() {
            return this.d_value;
        },
        isInError() {
            return !!this.error;
        },
        isEmpty() {
            if(!this.d_value)
                return true;

            if(toString.call(this.d_value) === '[object Array]' && !this.d_value.length)
                return true;

            if(toString.call(this.d_value) === '[object Object]' && !Object.keys(this.d_value).length)
                return true;

            return false;
        }
    },
    computed: {
        ui() {
            const options = this.options;
            const style = options && options.style ? options.style : null;
            const defStyleObj = { width: "inherit", height: "inherit" }
            if(typeof style === 'string')
                return { style }
            if(typeof style === 'object')
                return { style: Object.assign(defStyleObj, style) }

            return { style: defStyleObj };
        },
        limit(){
            return this.options && typeof this.options.limit === 'number' && this.options.limit > 0 ? this.options.limit : null;
        }
    },
}
</script>

<style scoped>
.line {
    border: solid 1px black;
    
}

.check {
    display: flex;
    align-items: center;
    justify-content: center;
    color: green;
    font-size: 3em;
    border-color: black;
}

button {
    color: white;
    background: red;
    border-radius: 5px;
    margin-left: 20px;
}

.fileDropper {
    min-width: 100px;
    min-height: 100px;
}

.fileList {
    margin-top: 10px;
}

.file {
    border: solid 1px;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.fileName {
    max-width: 200px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    text-align: right;
}

.line__error {
    color: red;
    font-size: 12px;
}

</style>