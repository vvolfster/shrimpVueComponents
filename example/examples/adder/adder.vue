<template>
    <div>
        <button @click="start" class="svtbtn">
            Start
        </button>
        <adder :steps="steps" ref="adder" />
    </div>
</template>

<script>
import adder from "@/bigTools/firebaseAdminPanel/components/tableEditor/adder"
import userInactivity from '@/misc/userActiveStatus'

export default {
    components: {
        adder
    },
    data() {
        return {
            steps: [
                {
                    fields: {
                        "hero.first": String,
                        "hero.last": String,
                    },
                },
                {
                    fields: {
                        "hero.age": Number,
                        "hero.gender": {
                            type: String,
                            required: true
                        },
                    },
                }
            ],
            userIsActive: true,
        }
    },
    methods: {
        start() {
            this.$refs.adder.start().then((val) => {
                console.log(val);
            })
        },
        updateUserIsActive(v) {
            console.log(`changing to`, v);
            this.userIsActive = v;
        }
    },
    mounted() { userInactivity.addListener(this.updateUserIsActive); },
    beforeDestroy() { userInactivity.removeListener(this.updateUserIsActive); },
}
</script>

<style scoped>

</style>