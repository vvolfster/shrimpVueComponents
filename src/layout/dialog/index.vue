<template>
    <div>
        <modal ref="modal">
            <div>
                TODO. This needs some re-engineering
                <!-- <autoform ref="autoform"
                    :title="title"
                    :description="description"
                    :fields="fields"
                > -->
                </autoform>
            </div>
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