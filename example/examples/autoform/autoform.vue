<template>
    <div>
        <autoform
            :title="title"
            :description="description"
            :fields="fields"
            @value="updateJSON"
        />
        <br>
        ---- JSON form value ----
        <br>
        <pre>
            {{ json }}
        </pre>
    </div>
</template>

<script>
import autoform from '@/input/autoform'
import Chance from 'chance'

const chance = new Chance();
export default {
    components: {
        autoform
    },
    data() {
        return {
            title: chance.first(),
            description: chance.paragraph(),
            fields: {
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
                    model: new Date(),
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
                age: {
                    type: Range,
                    validateFn(v) {
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
                powerLevel: {
                    type: Number,
                    required: true,
                    options: {
                        allowInfinity: true,
                    },
                    validateFn(v) {
                        if(v <= 0)
                            return "You cannot be that young!!"

                        return true;
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
                    }
                },
                "embedded.field": {
                    type: String,
                    model: "This is an embedded field"
                }
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