<template>
    <div>
        <button @click="start">
            Start
        </button>
        <adder :steps="steps" ref="adder"/>
    </div>
</template>

<script>
    import adder from "@/bigTools/firebaseAdminPanel/components/tableEditor/adder"

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
                ]
            }
        },
        methods: {
            start() {
                this.$refs.adder.start().then((val) => {
                    console.log(val);
                })
            }
        },
    }
</script>

<style scoped>

</style>