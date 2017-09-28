<template>
    <div class="markdown">
        <div :style="ui.style" class="bordered">
            <textarea class="paragraph__input"
                ref="input"
                :placeholder="placeholder"
                rows="1"
                v-show="false"
            />
        </div>
        <div v-if="error !== null" class="paragraph--error">
            {{ error }}
        </div>
    </div>
</template>

<script>
import lodash from 'lodash'
import Showdown from 'showdown'
import SimpleMDE from 'simplemde'
import 'simplemde/dist/simplemde.min.css'
import '../../../cssImporter'
import './simpleMdeStyleOverride.css'


const converter = new Showdown.Converter();

export default {
    props: {
        validateFn: {
            type: [Function, null],
            default: null
        },
        value: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: "Input..."
        },
        options: {
            type: [Object, null, undefined],
            default: null
        }
    },
    mounted() {
        const self = this;
        this.d_value = this.value;
        this.editor = new SimpleMDE({ element: self.$refs.input })
        this.editor.codemirror.on('change', this.updateValue);
        this.editor.value(this.value);
    },
    beforeDestroy() {
        if(this.editor)
            this.editor.codemirror.off('change', this.updateValue);
    },
    data() {
        return {
            editor: null,
            d_value: '',
            error: null,
        }
    },
    computed: {
        ui() {
            const options = this.options;
            const style = options && options.style ? options.style : null;
            const defStyleObj = {
                'min-width': "inherit",
                'min-height': "inherit",
                width: "inherit",
                height: "inherit",
                font: "inherit",
                color: "inherit",
                background: "inherit",
            }
            if(typeof style === 'string')
                return { style }

            if(typeof style === 'object')
                return { style: Object.assign(defStyleObj, style) }

            return { style: defStyleObj };
        },
        html() {
            return converter.makeHtml(this.d_value);
        }
    },
    methods: {
        handleToolbarAction(action) {
            // console.log(action);
            const input = this.$refs.input;
            if(!input)
                return;

            let value = input.value;
            const length = value.length;
            let offset = 0;
            const selection = {
                start: input.selectionStart,
                end: input.selectionEnd
            }

            function update() {
                value = input.value;
            }

            // console.log(selection, input.value);
            function insert(chr, index) {
                let idx = typeof index !== 'number' ? selection.start : index;
                if(idx < 0)
                    idx = 0;

                input.value = value.slice(0, idx) + chr + value.slice(idx);
                update();
            }

            function remove(index, len) {
                let idx = typeof index !== 'number' ? selection.start : index;
                if(idx < 0)
                    idx = 0;

                // console.log(idx, value.slice(0, idx), value.slice(idx + len));
                input.value = value.slice(0, idx) + value.slice(idx + len);
                update();
            }

            function wrapSelectionWith(chr) {
                function alreadyWrapped() {
                    function matchStart() {
                        return lodash.every(chr, (c, i) => {
                            const idx = chr.length - 1 - i;
                            const cVal = value[selection.start - 1 - idx];
                            return cVal === c;
                        })
                    }

                    function matchEnd() {
                        return lodash.every(chr, (c, i) => {
                            const cVal = value[selection.end + i];
                            return cVal === c;
                        })
                    }

                    return matchStart() && matchEnd();
                }

                if(alreadyWrapped()){
                    remove(selection.end, chr.length);
                    remove(selection.start - chr.length, chr.length);
                }
                else {
                    insert(chr, selection.end);
                    insert(chr, selection.start);
                }
            }

            switch(action) {
                case 'preview':
                    this.preview = !this.preview;
                    break;
                case 'heading1':
                    insert('#');
                    offset = 1;
                    break;
                case 'heading2':
                    insert('##');
                    offset = 2;
                    break;
                case 'heading3':
                    insert('###');
                    offset = 3;
                    break;
                case 'heading4':
                    insert('####');
                    offset = 4;
                    break;
                case 'heading5':
                    insert('#####');
                    offset = 5;
                    break;
                case 'heading6':
                    insert('######');
                    offset = 6;
                    break;
                case 'bold':
                    wrapSelectionWith('**');
                    offset = length < input.value.length ? 2 : -2;
                    break;
                case 'italic':
                    wrapSelectionWith('_');
                    offset = length < input.value.length ? 1 : -1;
                    break;
                default: break;
            }

            if(document.activeElement !== input) {
                input.focus();

                input.selectionStart = this.selection.start + offset;
                input.selectionEnd = this.selection.end + offset;
            }
            // console.log(input.focus, document.activeElement);
        },
        updateValue() {
            const v = this.editor.value();
            if(typeof v !== 'string')
                return;

            const lines = 1 + (v.match(/\n/g) || []).length;
            this.$refs.input.rows = lines;

            if(typeof this.validateFn === 'function') {
                const err = this.validateFn(v);
                this.error = typeof err === 'string' ? err : null;
            }
            else
                this.error = null;

            if(this.error)
                return;

            this.$emit('input', this.d_value);
            this.d_value = v;
            this.$emit('value', this.d_value);
        },
        isEmpty() { return !this.d_value; },
        getValue() { return this.d_value; },
        isInError() { return !!this.error }
    },
    watch: {
        value() {
            if(!this.editor || this.value === this.editor.value())
                return;

            this.d_value = this.value;
            this.editor.value(this.value);
        }
    }
}
</script>

<style scoped>
.markdown {}
.bordered { 
    border: solid 1px black;
}



.paragraph--error {
    color: red;
    font-size: 12px;
}
.paragraph__input {
    width: 100%;
    resize: none;
    outline: none;
    border: none;
    text-align: inherit;
    padding: 5px;
    min-height: inherit;
    max-height: inherit;
}
.paragraph__input:hover { border: none; }
.paragraph__input:focus { border: none; }
.paragraph__input:focus:hover { border:none; }
</style>
