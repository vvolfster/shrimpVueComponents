<template>
    <div>
        <modal ref="modal" @close="$emit('closeModal')">
            <tabView class="stepper" ref="tabView" 
                @indexChanged="$event === computedSteps.length - 1 ? finish() : null"
            >
                <autoform 
                    v-for="(step, index) in computedSteps" 
                    :ref="`autoform_${index}`"
                    :key="index" slot="tab" 
                    :name="index < computedSteps.length - 1 ? index + 1 : 'finish'" 
                    :title="step.title"
                    :description="step.description"
                    :fields="step.fields || step.form"
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
    import animator from '../../../../misc/animator'

    export default {
        components: { tabView, autoform, modal },
        props: ['steps'],
        methods: {
            start() {
                const self = this;
                return new Promise((resolve, reject) => {
                    if(!self.steps || !self.steps.length) {
                        reject('adder.vue:: no steps provided when start() was called');
                        return;
                    }

                    self.$on("closeModal", () => {
                        // console.log('user closed modal without finishing');
                        reject("user didn't finish adding a new record");
                    })
                    self.$on('formCompleted', (formValue) => {
                        // console.log('im gonna resolve with', self.model)
                        self.$refs.modal.close();
                        resolve(formValue);
                    })

                    self.$refs.tabView.goTo(0);
                    self.$refs.modal.open();
                })
            },
            // createModel() {
            //     this.model = lodash.reduce(this.steps, (a, val) => {
            //         const fields = val.fields || val.form;
            //         lodash.each(fields, (field, fieldName) => {
            //             lodash.set(a, fieldName, lodash.get(field, "model", ""))
            //         })
            //         return a;
            //     }, {});
            // },
            // handleValue(v) {
            //     lodash.each(v, (value, key) => {
            //         lodash.set(this.model, key, value);
            //     })
            // },
            finish() {
                const self = this;
                const steps = this.steps;
                const tabViewInstance = lodash.get(self, `$refs.tabView`)

                // combine all the form values
                const formVal = {}
                const canComplete = lodash.every(steps, (step, index) => {
                    const fields = step.fields || step.form;
                    let autoForm = lodash.get(self, `$refs.autoform_${index}`);
                    if(lodash.isArray(autoForm))
                        autoForm = autoForm[0];

                    if(!autoForm) {
                        console.error(`no autoform for step ${index}`)
                        return false;
                    }

                    if(!autoForm.isValid()){
                        animator.shake({ el: self.$el })
                        if(tabViewInstance)
                            tabViewInstance.goTo(index);
                    }

                    const autoFormVal = autoform.getValue();
                    lodash.each(fields, (k) => {
                        const value = lodash.get(autoFormVal, k);
                        lodash.set(formVal, k, value);
                    })

                    return true;
                })

                if(canComplete)
                    this.$emit('formCompleted', formVal)
            }
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
