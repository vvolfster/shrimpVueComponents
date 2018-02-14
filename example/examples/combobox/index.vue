<template>
    <div>
        <options
            placeholder="position"
            :options="config.position"
            v-model="model.position"
        />
        <options
            placeholder="position modifier"
            :options="config.positionMod"
            v-model="model.positionMod"
        />
        <options
            placeholder="list color"
            :options="config.listColor"
            v-model="model.listColor"
        />
        <options
            placeholder="list item color"
            :options="config.listColor"
            v-model="model.itemColor"
        />

        <div class="column items-center">
            <combobox :options="combobox"/>
        </div>
        
    </div>
</template>

<script>
import combobox from '@/input/combobox'
import options from '@/input/options'

export default {
    components: {
        combobox,
        options
    },
    data(){
        return {
            config: {
                position: {
                    choices: ['top', 'left', 'right', 'bottom'],
                    multiple: false
                },
                positionMod: {
                    choices: ['start', 'end'],
                    multiple: false
                },
                listColor: {
                    choices: ['red', 'blue', 'purple'],
                    multiple: false
                }
            },
            model: {
                position: 'top',
                positionMod: "",
                options: ['choice1', 'choice2', 'choice3'],
                listColor: '',
                itemColor: ''
            }
        }
    },
    computed: {
        combobox() {
            const model = this.model;
            return {
                options: model.options,
                position: model.positionMod ? `${model.position}-${model.positionMod}` : model.position,
                styleList: `background:${model.listColor};`,
                styleListItem: `background:${model.itemColor};`
            }
        }
    }
}
</script>

<style scoped>
</style>
