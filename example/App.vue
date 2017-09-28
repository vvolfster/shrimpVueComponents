<template>
    <div id="q-app">
        <div class="drawer">
            <toggleButton class="drawer__btn" v-for="example in examples" :key="example" 
                @on="myComponent = example" 
                :text="example"
                :isPushed="example === myComponent"
            />
        </div>
        <div class="viewport">
            <component :is="myComponent"></component>
        </div>
    </div>
</template>

<script>
import toggleButton from "@/button/toggleButton"

import autoform from './examples/autoform/autoform'
import fbAdminPanel from "./examples/fbAdminPanel/adminPanel"
import fbAuthentication from "./examples/fbAuthentication/fbAuthentication"
import toast from './examples/toast/toast'
import modal from './examples/modal/modal'
import dialogExample from './examples/dialog/dialogExample'
import animator from './examples/animator/animator'
import fileExample from './examples/file/file'
import adder from './examples/adder/adder'

export default {
    name: 'app',
    data() {
        return {
            myComponent: null,
            examples: ["fbAdminPanel", "fbAuthentication", "animator", "toast", "modal", "autoform", "dialogExample", "fileExample", "adder"]
        }
    },
    components: {
        toggleButton,
        fbAdminPanel,
        fbAuthentication,
        animator,
        toast,
        modal,
        dialogExample,
        autoform,
        fileExample,
        adder
    },
};
</script>

<style>
#q-app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  
  display: flex;
  flex-flow: row;
}

.drawer {
    flex: 0 1 10vw;
    height: 100vh;
    border: solid 1px;
    color: white;
    background: teal;

    display: flex;
    flex-flow: column;
    align-items: center;
}

.drawer__btn {
    width: 90%;
    height: 40px;
    margin-top: 20px;
}

.viewport {
    flex: 1 1 90vw;
    height: 100vh;
    overflow-y: auto;
}

html {
    min-width: unset !important;   
}

body {
    font-family: 'Roboto', sans-serif;
    min-width: unset !important;
}

</style>
