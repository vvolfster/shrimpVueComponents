<template>
    <div class="modalExample">
        <div>
            Unlimited
            <file/>
        </div>

        <div>
            Only 3
            <file :options="only3"/>
        </div>

        <div>
            Only 3 Jpg or Png
            <file :options="only3img"/>
        </div>

        <div>
            Only 3 Jpg or Png. Duplicates allowed.
            <file :options="only3imgWithDupes"/>
        </div>

        <div>
            File in dialog
            <button @click="open">Open</button>
        </div>
        

    </div>
</template>

<script>
import file from '@/input/file'
import Dialog from '@/layout/dialog'

export default {
    data(){
        return {
            only3: {
                limit: 3
            },
            only3img: {
                limit: 3,
                filter: ['image/jpg', 'image/jpeg', 'image/png']
            },
            only3imgWithDupes: {
                limit: 3,
                filter: ['image/jpg', 'image/jpeg', 'image/png'],
                duplicates: true
            }
        }
    },
    methods: {
        open() {
            Dialog.create({
                title: "File in dialog",
                form: {
                    file: File
                },
                buttons: {
                    Yes: true
                }
            })
        }
    },
    components: { file }
}
</script>

<style scoped>
.modalExample {
    padding: 20px;
    display: flex;
    flex-flow: row;
    justify-content: space-between;
    align-items: center;
}

button {
    border: solid 1px;
    border-radius: 2px;
    margin-top: 20px;
    width: 10vw;
}
</style>
