<template>
    <div class="dialogExample">
        Press Esc to Dismiss

        <div>
            Position
            <combobox :options="positions" v-model="chosen.position"/>
        </div>
        <div>
            Animation
            <combobox :options="animations" v-model="chosen.animation"/>
        </div>

        <button @click="open('simple')">Open Simple</button>
        <button @click="open('simpleNonClosing')">Open No Dismiss</button>
        <button @click="open('form')">Open Form</button>
        <button @click="open('formWithModel')">Open Form With Model</button>
        <button @click="open('form3s')">Form that takes 3 seconds to resolve</button>
        <button @click="open('formDeterminate')">Form Determinate</button>
    </div>
</template>

<script>
import lodash from 'lodash'
import mousetrap from 'mousetrap'
import dialog from '@/layout/dialog'
import combobox from '@/input/combobox'
import Toast from '@/vuePlugins/toasts'


export default {
    components: {
        combobox
    },
    data() {
        return {
            animations: ['up', 'down', 'left', 'right', 'none'],
            positions: ['up', 'down', 'left', 'right', 'center'],
            chosen: {
                animation: "up",
                position: 'center'
            },

            simple: {
                title: 'Simple',
                description: "This is a simple dialog",
            },
            simpleNonClosing: {
                title: 'Simple',
                description: "This is a simple dialog",
                buttons: {
                    close() {},
                },
                noDismiss: true,
            },
            form: {
                title: 'Form',
                description: "This dialog contains a form",
                form: {
                    first: {
                        type: String,
                        required: true,
                        validateFn(s) {
                            if(s.length < 3)
                                return "too short"
                            return true;
                        }
                    },
                    last: {
                        type: String,
                        required: true,
                    },
                    age: {
                        type: Number,
                        required: true,
                        validator(s) {
                            if(s < 0)
                                return "No benji buttons allowed"
                            return true;
                        }
                    }
                },
                buttons: {
                    cancel: true,
                    submit(formVal) {
                        Toast.positive(`${formVal.first} ${formVal.last} ${formVal.age}`)
                    }
                }
            },
            formWithModel: {
                title: 'Form',
                description: "This dialog contains a form",
                form: {
                    first: {
                        type: String,
                        required: true,
                        model: "Shahan",
                        validateFn(s) {
                            if(s.length < 3)
                                return "too short"
                            return true;
                        }
                    },
                    last: {
                        model: "Kazi",
                        type: String,
                        required: true,
                    },
                    age: {
                        type: Number,
                        model: 29,
                        required: true,
                        validator(s) {
                            if(s < 0)
                                return "No benji buttons allowed"
                            return true;
                        }
                    }
                },
                buttons: {
                    cancel: true,
                    submit(formVal) {
                        Toast.positive(`${formVal.first} ${formVal.last} ${formVal.age}`)
                    }
                }
            },
            form3s: {
                title: 'form3s',
                description: 'wait 3s after submit',
                form: {
                    first: {
                        type: String,
                        required: true,
                        model: "Shahan",
                        validateFn(s) {
                            if(s.length < 3)
                                return "too short"
                            return true;
                        }
                    },
                    last: {
                        model: "Kazi",
                        type: String,
                        required: true,
                    },
                    age: {
                        type: Number,
                        model: 29,
                        required: true,
                        validator(s) {
                            if(s < 0)
                                return "No benji buttons allowed"
                            return true;
                        }
                    },
                    married: Boolean
                },
                buttons: {
                    Submit() {
                        return new Promise((resolve) => {
                            setTimeout(resolve, 3000);
                        })
                    }
                }
            },
            formDeterminate: {
                title: 'form3s',
                description: 'wait 3s after submit',
                form: {
                    first: {
                        type: String,
                        required: true,
                        model: "Shahan",
                        validateFn(s) {
                            if(s.length < 3)
                                return "too short"
                            return true;
                        }
                    },
                    last: {
                        model: "Kazi",
                        type: String,
                        required: true,
                    },
                    age: {
                        type: Number,
                        model: 29,
                        required: true,
                        validator(s) {
                            if(s < 0)
                                return "No benji buttons allowed"
                            return true;
                        }
                    },
                    married: Boolean
                },
                buttons: {
                    Submit(val, prog) {
                        return new Promise((resolve) => {
                            prog(0.3);
                            setTimeout(() => prog(0.6), 1000);
                            setTimeout(() => prog(0.9), 2000);
                            setTimeout(resolve, 3000);
                        })
                    }
                }
            }
        }
    },
    methods: {
        open(v) {
            const conf = {  position: this.chosen.position, animation: this.chosen.animation }
            lodash.assign(conf, this[v] || this.simple)
            dialog.create(conf);
        }
    },
    beforeDestroy() {
        mousetrap.unbind('esc', dialog.dismissAll);
    },
    mounted() {
        mousetrap.bind('esc', dialog.dismissAll);
    },
}
</script>

<style scoped>
.dialogExample {
    display: flex;
    flex-flow: column;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
}

button {
    width: 25vw;
    border: solid 1px;
    margin: 5px;
    font-size: 20px;
}
</style>
