<template>
    <div>
        <q-modal ref="modal" @close="$emit('closeModal')">
            <div class="layout-padding">
                <q-stepper ref="stepper" @finish="$emit('formCompleted')" class="stepper">
                    <q-step v-for="(step, index) in steps" :key="index" :title="step.title || step.description || 'no title'">
                        {{ step.description || "" }}

                        <!-- form components go here -->
                        <div v-for="(field, fieldName) in step.fields">
                            <label :for="fieldName">{{ fieldName }}</label>
                            <input type="text" :name="fieldName" v-model="model[fieldName]" :id="fieldName"/>
                        </div>
                        
                    </q-step>
                </q-stepper>
            </div>
        </q-modal>
    </div>
</template>

<script>
    import lodash from 'lodash'

    export default {
        props: ['steps'],
        data() {
            return {
                model: {}
            }
        },
        methods: {
            start() {
                const self = this;
                return new Promise((resolve, reject) => {
                    if(!self.steps) {
                        reject('adder.vue:: no steps provided when start() was called');
                        return;
                    }

                    self.createModel();
                    self.$on("closeModal", () => {
                        // console.log('user closed modal without finishing');
                        reject("user didn't finish adding a new record");
                    })
                    self.$on('formCompleted', () => {
                        // console.log('im gonna resolve with', self.model)
                        self.$refs.modal.close();
                        resolve(self.model);
                    })

                    self.$refs.modal.open();
                })
            },
            createModel() {
                this.model = lodash.reduce(this.steps, (a, { fields }) => {
                    lodash.each(fields, (field, fieldName) => {
                        a[fieldName] = lodash.get(field, "default", "");
                    })
                    return a;
                }, {});
            },
        }
    }
</script>

<style>
    .stepper {
        width: 40vw;
    }
</style>
