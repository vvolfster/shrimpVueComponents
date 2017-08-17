<template>
    <div>
        <button @click="open('simple')">Open Simple</button>
        <button @click="open('form')">Open Form</button>
    </div>
</template>

<script>
import mousetrap from 'mousetrap'
import dialog from '@/layout/dialog'

export default {
    data() {
        return {}
    },
    methods: {
        open(v) {
            if(v === 'simple'){
                dialog.create({
                    title: 'Simple',
                    description: "This is a simple dialog",
                    buttons: {
                        cancel: true,
                        submit() {
                            console.log('donezoes');
                        },
                    },
                    noDismiss: true,
                })
            }
            else {
                dialog.create({
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
                        last: String,
                        age: Number
                    },
                    buttons: {
                        cancel: true,
                        submit(formVal) {
                            console.log(formVal);
                        }
                    }
                })
            }
        }
    },
    mounted() {
        mousetrap.bind('esc', dialog.dismissAll);
    }
}
</script>

<style scoped>
</style>
