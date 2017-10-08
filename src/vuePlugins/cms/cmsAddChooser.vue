<template>
    <div class="background">
        <div class="root">
            <div class="title">
                <div class="title--text">Add</div>
                <button class="svtbtn title--button title--button-cancel" @click="close()">✖</button>
            </div>
            <div class="content" ref="content">
                <div class="content-background"/>
                <div class="content-button-area">
                    <button class="svtbtn content-button-area-button" v-for="(v,k,index) in addParams" :key="k" @click="callFn(v)">{{ k }}</button>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
    import lodash from 'lodash'

    export default {
        methods: {
            init(addOptions) {
                this.addParams = lodash.pickBy(addOptions, (v) => {
                    return typeof v === `function`
                })
            },
            close(arg) {
                this.$emit('close', arg);
            },
            callFn(fn) {
                this.close(fn);
            }
        },
        data() {
            return {
                addParams: {}
            }
        }
    }
</script>

<style scoped>
    .background {
        width: 100%;
        height: 100%;
        display:grid;
        grid-template-columns: 1fr 10fr 1fr;
        grid-template-rows   : 1fr 10fr 1fr;
        grid-template-areas  : ".  .  ."
                               ".  p  ."
                               ".  .  .";
        background-color: transparent;
    }


    .root {
        background-color: transparent;
        border-style: solid;
        border-width: 1px;
        box-shadow: 1px 1px 2px black, 0 0 25px gray, 0 0 5px transparent;
        -webkit-box-shadow: 1px 1px 2px black, 0 0 25px gray, 0 0 5px transparent;
        -moz-box-shadow: 1px 1px 2px black, 0 0 25px gray, 0 0 5px transparent;

        grid-area: p;
        
        display: grid; 
        grid-template-rows: 1fr 10fr;
        grid-template-areas: "title"
                             "content";
                             
    }

    .title {
        border-style: solid;
        border-width: 0 0 1px 0;
        background-color: #555;
        color: white;
        text-align: center;
        grid-area: title;
        height: 100%;
        display: grid;
        grid-template-columns: repeat(20, 1fr);
    }

    .title--text {
        grid-column: auto / span 19;
        align-self: center;
        font-size : 16pt;
    }

    .title--button-cancel {
        border: none;
        color: white;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        border-radius: 5%;
        background-color: red;
        height: 90%;
        align-self:center;
        grid-column: auto / span 1;
    }

    .content {
        grid-area: content;
        display: grid;
        grid-template-columns: 1fr 10fr 1fr;
        grid-template-rows: 1fr 10fr 1fr;
        grid-template-areas: ". . ."
                             ". b ."
                             ". . .";
        background-color: transparent;
        position: relative;
    }

    .content-background {
        width: 100%;
        height: 100%;
        position: absolute;
        top:0;
        left:0;
        background-color: rgba(255,255,255,0.5);
        overflow-y: auto;
    }

    .content-button-area {
        display: grid;
        grid-area: b;
        grid-gap: 5px;
        z-index: 2;
        align-self: center;
    }

    .content-button-area-button {
        border-style: solid;
        border-width: 0 0 1px 0;
        background-color: #555;
        color: white;
        text-align: center;
        height: 48px;
    }


</style>
