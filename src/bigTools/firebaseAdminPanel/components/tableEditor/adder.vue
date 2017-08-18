<template>
    <div>
        <modal ref="modal" @close="$emit('closeModal')">
            <tabView class="stepper" ref="tabView" 
                @indexChanged="$event === computedSteps.length - 1 ? $emit('formCompleted') : null"
            >
                <autoform 
                    v-for="(step, index) in computedSteps" 
                    :key="index" slot="tab" 
                    :name="index < computedSteps.length - 1 ? index + 1 : 'finish'" 
                    :title="step.title"
                    :description="step.description"
                    :fields="step.fields || step.form"
                    @value="handleValue"
                />
            </tabView>
        </modal>
    </div>
</template>

<script>
    import lodash from 'lodash'
    import tabView from '../../../../layout/tabView'
    import autoform from '../../../../input/autoform'
    import modal from '../../../../layout/modal'

    export default {
        components: { tabView, autoform, modal },
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

                    self.$refs.tabView.goTo(0);
                    self.$refs.modal.open();
                })
            },
            createModel() {
                this.model = lodash.reduce(this.steps, (a, val) => {
                    const fields = val.fields || val.form;
                    lodash.each(fields, (field, fieldName) => {
                        lodash.set(a, fieldName, lodash.get(field, "model", ""))
                    })
                    return a;
                }, {});
            },
            handleValue(v) {
                lodash.each(v, (value, key) => {
                    lodash.set(this.model, key, value);
                })
            },
        },
        computed: {
            computedSteps() {
                const steps = this.steps;
                const finalStep = {
                    title: "Finish"
                }

                if(!steps)
                    return [];

                const shallowClone = [];
                steps.forEach(v => shallowClone.push(v));
                shallowClone.push(finalStep);
                return shallowClone
            }
        }
    }
</script>

<style>
    .stepper {
        width: 40vw;
        height: 50vh;
    }

    .step {
        display: flex;
        flex-flow: column;
        justify-content:center;
        align-items:center;
    }

    .step__info {
        flex: 0 0 10vh;
        text-align: center;
    }

    .step__form {
        display: flex;
        flex-flow: column;
    }

    .form__input {
        font-size: 20pt;
        width: 10vw;
    }

</style>
