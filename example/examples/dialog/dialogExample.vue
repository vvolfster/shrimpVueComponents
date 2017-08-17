<template>
    <div class="dialogExample">
        Press Esc to Dismiss
        <button @click="open('simple')">Open Simple</button>
        <button @click="open('simpleNonClosing')">Open No Dismiss</button>
        <button @click="open('form')">Open Form</button>
    </div>
</template>

<script>
import mousetrap from 'mousetrap'
import dialog from '@/layout/dialog'
import Toast from '@/vuePlugins/toasts'

export default {
    data() {
        return {
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
            }

        }
    },
    methods: {
        open(v) {
            dialog.create(this[v] || this.simple);
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
