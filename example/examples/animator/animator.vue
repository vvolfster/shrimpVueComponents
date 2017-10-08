<template>
    <div style="height: 100vh;">
        <div class="mainRow">
            <div class="zcolumn">
                <div class="zrow">
                    <button class="svtbtn" @click="from='upLeft'" :class="from === 'upLeft' ? 'buttonActive' : ''">TL</button>
                    <button class="svtbtn" @click="from='up'" :class="from === 'up' ? 'buttonActive' : ''">T</button>
                    <button class="svtbtn" @click="from='upRight'" :class="from === 'upRight' ? 'buttonActive' : ''">TR</button>
                </div>
                <div class="zrow">
                    <button class="svtbtn" @click="from='left'" :class="from === 'left' ? 'buttonActive' : ''">L</button>
                    <button class="svtbtn" @click="from='center'" :class="from === 'center' ? 'buttonActive' : ''">C</button>
                    <button class="svtbtn" @click="from='right'" :class="from === 'right' ? 'buttonActive' : ''">R</button>
                </div>
                <div class="zrow zrow--right">
                    <button class="svtbtn" @click="from='downLeft'" :class="from === 'downLeft' ? 'buttonActive' : ''">BL</button>
                    <button class="svtbtn" @click="from='down'" :class="from === 'down' ? 'buttonActive' : ''">B</button>
                    <button class="svtbtn" @click="from='downRight'" :class="from === 'downRight' ? 'buttonActive' : ''">BR</button>
                </div>
                <button class="svtbtn" @click="from=null" :class="from === null ? 'buttonActive' : ''"><i class='fa fa-trash'></i></button>
            </div>

            <div class="zcolumn zcolumn--buttons">
                <button class="svtbtn" @click="animator().setPositionWithinParent({ element: $refs.rect, position: 'center' })">Center</button>
                <div class="mainRow mainRow--buttons">
                    <div class="zcolumn zcolumn--buttons">
                        <button class="svtbtn" @click="animator().animateOutTop({ element: $refs.rect, startingPosition: from })">Out Top</button>
                        <button class="svtbtn" @click="animator().animateOutBottom({ element: $refs.rect, startingPosition: from })">Out Bottom</button>
                        <button class="svtbtn" @click="animator().animateOutLeft({ element: $refs.rect, startingPosition: from })">Out Left</button>
                        <button class="svtbtn" @click="animator().animateOutRight({ element: $refs.rect, startingPosition: from })">Out Right</button>
                    </div>
                    <div class="zcolumn zcolumn--buttons">
                        <button class="svtbtn" @click="animator().animateInTop({ element: $refs.rect, startingPosition: from })">In Top</button>
                        <button class="svtbtn" @click="animator().animateInBottom({ element: $refs.rect, startingPosition: from })">In Bottom</button>
                        <button class="svtbtn"  @click="animator().animateInLeft({ element: $refs.rect, startingPosition: from })">In Left</button>
                        <button class="svtbtn" @click="animator().animateInRight({ element: $refs.rect, startingPosition: from })">In Right</button>
                        <button class="svtbtn" @click="animator().animateInCenter({ element: $refs.rect, startingPosition: from })">In Center</button>
                    </div>                
                </div>
            </div>
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
    import combobox from '@/input/combobox'

    export default {
        components: {
            combobox
        },
        data() {
            return {
                from: null,
            }
        },
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
    .zcolumn {
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: center;
    }

    .zcolumn--buttons {
        margin: 0;
        justify-content: flex-start;
    }

    .zcolumn--buttons > button {
        margin: 0;
    }

    .mainRow {
        display: flex;
        flex-flow: row nowrap;
    }

    .mainRow--buttons {
        margin-left: 20px;
    }

    .zrow {
        flex: 0 0 45px;
        height: 45px;
        flex-flow: row;
        display: flex;
    }

    .zrow > button {
        flex: 0 0 45px;
        width : 45px;
        height: 45px;
    }
    


    .exampleArea {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 40px;
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

    .buttonActive {
        color: white;
        background: blue;
    }
</style>