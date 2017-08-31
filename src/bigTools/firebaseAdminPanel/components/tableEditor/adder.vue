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
                const tabViewInstance = lodash.get(self, `$refs.tabView`);
                const modalInstance = lodash.get(self, `$refs.modal`);

                const formVal = {};
                function amalgamateValueIntoFormVal(step, val) {
                    return new Promise((resolve) => {
                        const fields = step.fields || step.form;
                        lodash.each(fields, (v, k) => {
                            const value = lodash.get(val, k);
                            lodash.set(formVal, k, value);
                        })
                        resolve();
                    })
                }

                function generateGetValueFn(step, index) {
                    return () => {
                        return new Promise((resolve, reject) => {
                            let autoForm = lodash.get(self, `$refs.autoform_${index}`);
                            if(lodash.isArray(autoForm))
                                autoForm = autoForm[0];

                            if(!autoForm) {
                                console.error(`no autoform for step ${index}`)
                                return reject(`no autoform for step ${index}`);
                            }

                            if(!autoForm.isValid()){
                                if(tabViewInstance) {
                                    if(modalInstance)
                                        animator.shake({ element: tabViewInstance })
                                    tabViewInstance.goTo(index);
                                }
                                return reject('Invalid form');
                            }

                            const val = autoForm.getValue();
                            return amalgamateValueIntoFormVal(step, val).then(() => {
                                if(lodash.isFunction(step.after)){
                                    return Promise.resolve(step.after(formVal)).then(resolve).catch(reject);
                                }
                                return resolve();
                            }).catch(reject);
                        })
                    }
                }

                // we need to execute in order!
                function getAllStepValues() {
                    return new Promise((resolve) => {
                        const pChain = lodash.reduce(steps, (acc, step, index) => {
                            acc.push(generateGetValueFn(step, index));
                            return acc;
                        }, []);

                        // now reduce the pChain
                        lodash.reduce(pChain, (acc, fn, idx) => {
                            const nextFn = pChain[idx + 1] || resolve;
                            // console.log(idx, "next fn is resolve", resolve === nextFn, nextFn);
                            if(idx === 0)
                                return fn().then(nextFn);

                            return acc.then(nextFn);
                        }, null);
                    })
                }

                getAllStepValues().then(() => self.$emit('formCompleted', formVal))
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
