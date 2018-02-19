<template>
    <div>
        <button @click="labelLayout = !labelLayout">Switch Layout</button>
        <div class="row">
            <autoform
                :title="title"
                :description="description"
                :fields="fields"
                :labelLayout="labelLayout"
                @value="updateJSON"
            />
            <pre>
                {{ json }}
            </pre>
        </div>
    </div>
</template>

<script>
import autoform from '@/input/autoform'
import Chance from 'chance'
import combobox from '@/input/combobox'
import lodash from 'lodash'

const chance = new Chance();
export default {
    components: {
        autoform, combobox
    },
    data() {
        return {
            title: chance.first(),
            description: chance.paragraph(),
            labelLayout: false,
            fields: {
                formName(formData) {
                    if(lodash.get(formData, "first.length") === 3) {
                        return {
                            type: "readOnly",
                            model: "my Form",
                            when: fd => fd.first.startsWith('s')
                        }
                    }
                    return {
                        type: String,
                        model: "my form normal input"
                    }
                },
                first: {
                    type: String,
                    required: true,
                    model: "Wolf",
                    validateFn(v) {
                        if(!v || !v.length)
                            return 'Too short'

                        if(v.length < 3)
                            return 'Too short'

                        return true;
                    }
                },
                last: String,
                date: {
                    type: Date,
                    required: true,
                    // model: new Date(),
                    options: 'datetime'
                },
                password: {
                    type: "password",
                    validateFn(v) {
                        if(!v || !v.length)
                            return 'Too short'

                        if(v.length < 3)
                            return 'Too short'

                        return true;
                    }
                },
                gender: {
                    type: "combo",
                    options: ["Male", "Female", "Other"]
                },
                file: File,
                powers: {
                    type: Object,
                    options: {
                        choices: {
                            one: "1",
                            two: "2",
                            three: "3",
                            tooPowerful: "tooPowerful"
                        },
                        multiple: false
                    }
                },
                powerLevel: {
                    type: Number,
                    required: true,
                    options: {
                        allowInfinity: true,
                    },
                    model: 9000,
                    when(v) {
                        return v.powers === 'tooPowerful'
                    },
                    validateFn(v) {
                        if(v <= 0)
                            return "You cannot be that young!!"

                        return true;
                    }
                },
                kids: Boolean,
                numKids: {
                    type: Object,
                    options(v) {
                        const options = !v.kids ? ["0"] : ["1", "2", "3"]
                        return { options, multiple: false }
                    },
                    validateFn(v, formValue) {
                        if(formValue.age < 10 && v !== "0")
                            return "You are too young to have kids!"
                        return true;
                    }
                },
                age: {
                    type: Range,
                    validator(v) {
                        if(v < 0)
                            return "You cannot be that young!!"

                        return true;
                    },
                    options: {
                        min: 0,
                        max: 100,
                        step: 10,
                        list: [20, 50, 70]
                    }
                },
                aboutMe: {
                    type: "paragraph",
                    model: "I am the maddest wolf",
                    options: {
                        markdown: true
                    },
                    validateFn(v) {
                        if(!v || !v.length)
                            return 'Too short'

                        if(v.length < 3)
                            return 'Too short'

                        return true;
                    }
                },
                married: {
                    type: Boolean
                },
                markdown: {
                    type: "markdown",
                    model: "** Si Si senior **",
                    required: true,
                    validator(v) {
                        if(v.indexOf('lincoln') !== -1)
                            return 'Cannot contain the lincoln'
                        return true;
                    },
                    options: {
                        style: "max-height: 300px;"
                    }
                },
                "embedded.field": {
                    type: String,
                    model: "This is an embedded field"
                }
            },
            simpleFields: {
                first: String,
                last: String,
                age: Number,
                dob: Date,
                gender: ['male', 'female']
            },
            json: ''
        }
    },
    methods: {
        updateJSON(v) {
            this.json = JSON.stringify(v, null, 2);
        }
    }
}

</script>