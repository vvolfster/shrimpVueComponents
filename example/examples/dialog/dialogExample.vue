<template>
    <div>
        <button @click="open('simple')">Open Simple</button>
    </div>
</template>

<script>
import dialog from '@/layout/dialog'

export default {
    data() {
        return {}
    },
    methods: {
        open() {
            dialog.create({
                title: 'Simple',
                description: "This is a simple dialog",
                buttons: {
                    submit() {
                        console.log('donezoes');
                    },
                    no: true
                }
            })
        }
    }
}
</script>

<style scoped>
</style>
