<template>
    <div>
        <modal ref="modal">
            <autoform ref="autoform">

            </autoform>
        </modal>
    </div>
</template>

<script>
import modal from "../modal"
import autoform from "../../input/autoform"

export default {
    components: {
        modal,
        autoform
    },
    methods: {
        open(config) {
            this.$refs.modal.open(config);
        }
    }
}
</script>

<style scoped>
</style>