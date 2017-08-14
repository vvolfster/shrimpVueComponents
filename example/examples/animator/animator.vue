<template>
    <div>
        <div class="buttons">
            <button @click="animator().setPositionWithinParent({ element: $refs.rect, position: 'center' })">Center</button>
            <button @click="animator().animateOutTop({ element: $refs.rect })">Out Top</button>
            <button @click="animator().animateOutBottom({ element: $refs.rect })">Out Bottom</button>
            <button @click="animator().animateOutLeft({ element: $refs.rect })">Out Left</button>
            <button @click="animator().animateOutRight({ element: $refs.rect })">Out Right</button>
        </div>

        <div class="exampleArea">
            <div class='container'>
                <div class='rect' ref="rect">
                </div>
            </div>
        </div>

    </div>
</template>

<script>
    import animator from "@/misc/animator"

    export default {
        methods: {
            animator() {
                return animator;
            }
        },
        mounted() {
            animator.setPositionWithinParent({ element: this.$refs.rect, position: 'center' })
        }
    }
</script>

<style scoped>
    button {
        border: solid 1px;
        border-radius: 2px;
        margin-top: 20px;
        width: 10vw;
    }

    .exampleArea {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }

    .container {
        position: relative;
        width: 50vw;
        height: 50vh;
        border: solid 1px;
    }

    .rect {
        position: absolute;
        border: solid 1px;
        width: 64px;
        height: 64px;
        background: red;
    }
</style>