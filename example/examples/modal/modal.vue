<template>
    <div class="modalExample">
        <div>
            Position
            <combobox :options="positions" v-model="chosen.position"/>
        </div>
        <div>
            Animation
            <combobox :options="animations" v-model="chosen.animation"/>
        </div>
        <button @click="showModal(0)">
            SHOW MODAL
        </button>

        <button @click="showModal(1)">
            SHOW Modal 2
        </button>

        <button @click="dismissAll">
             dismissAll
        </button>

        <modal ref="modal0" :animation="chosen.animation" :position="chosen.position">
            <div>
                Oh noes!! what has happened!
            </div>
        </modal>

        <modal ref="modal1" :animation="chosen.animation" :position="chosen.position">
            <div style="width:100vw; display:block;">
                {{ superLongText }}
            </div>
        </modal>

    </div>
</template>

<script>
import Chance from 'chance'
import modal from '@/layout/modal'
import combobox from '@/input/combobox'

const chance = new Chance();

export default {
    data(){
        return {
            modalStyles: ['standard'],
            animations: ['up', 'down', 'left', 'right', 'none'],
            positions: ['up', 'down', 'left', 'right', 'center'],
            chosen: {
                animation: "up",
                position: 'center'
            },
            superLongText: chance.paragraph({ sentences: 200 })
        }
    },
    methods: {
        showModal(idx) {
            this.$refs[`modal${idx}`].open();
        },
        dismissAll() {
        }
    },
    components: {
        modal, combobox
    }
}
</script>

<style scoped>
.modalExample {
    padding-top: 20px;
    display: flex;
    flex-flow: column;
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
