<template>
    <div>
        <button @click="randomize()">RAND</button>
        <autoform
            :title="title"
            :description="description"
            :fields="fields"
        />
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
                    validateFn(v) {
                        if(!v || !v.length)
                            return 'Too short'

                        if(v.length < 3)
                            return 'Too short'

                        return true;
                    }
                },
                last: String,
                date: Date,
                gender: {
                    type: "combo",
                    options: ["Male", "Female"]
                }
            }
        }
    },
    methods: {
        randomize() {
            this.title = chance.first();
            this.description = chance.paragraph();
        }
    }
}

</script>