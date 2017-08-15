<template>
    <div id="q-app">
        <q-layout>
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
        </q-layout>
    </div>
</template>

<script>
import toggleButton from "@/button/toggleButton"

import autoform from './examples/autoform/autoform'
import fbAdminPanel from "./examples/fbAdminPanel/adminPanel"
import onlineClasses from './examples/fbAdminPanel/onlineClasses'
import toast from './examples/toast/toast'
import modal from './examples/modal/modal'
import animator from './examples/animator/animator'

export default {
    name: 'app',
    data() {
        return {
            myComponent: null,
            examples: ["fbAdminPanel", "onlineClasses", "animator", "toast", "modal", "autoform"]
        }
    },
    components: {
        toggleButton,
        onlineClasses,
        fbAdminPanel,
        animator,
        toast,
        modal,
        autoform
    },
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
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

.fade-enter-active, .fade-enter{
    -webkit-animation: moveFromRight .5s both ease;
    animation: moveFromRight .5s both ease;
}
.fade-leave-to, .fade-leave-active {
    -webkit-animation: moveToLeft 1s both ease;
    animation: moveToLeft 1s both ease;
}


/*.menu-enter-active, .scale-enter{*/
    /*-webkit-animation: moveFromLeftFade .9s ease both;*/
    /*animation: moveFromLeftFade .9s ease both;*/
/*}*/
/*.menu-leave-to, .scale-leave-active {*/
    /*-webkit-animation: moveToLeft .9s ease both;*/
    /*animation: moveToLeft .9s ease both;*/
/*}*/
@-webkit-keyframes moveFromLeftFade {
    from { opacity: 0.3; -webkit-transform: translateX(-100%); }
}
@keyframes moveFromLeftFade {
    from { opacity: 0.3; -webkit-transform: translateX(-100%); transform: translateX(-100%); }
}
@-webkit-keyframes moveToRight {
    from { }
    to { -webkit-transform: translateX(100%); }
}

@keyframes cartOut {
    from {
        transform: translate(0px, 0px);
    }
    to {
        transform: translate(1200px, 0px);
        animation-timing-function: ease-out;
    }
}
@-webkit-keyframes moveToLeft {
    from { }
    to { opacity: .5; -webkit-transform: translateX(-100%); }
}
@keyframes moveToLeft {
    from { }
    to { opacity: .5; -webkit-transform: translateX(-100%); transform: translateX(-100%); }
}

@-webkit-keyframes moveFromRight {
    from { opacity: .7; -webkit-transform: translateX(100%); }
}
@keyframes moveFromRight {
    from {opacity: .7; -webkit-transform: translateX(100%); transform: translateX(100%); }
}

.drawer-closer .item-content {
    margin-left: 50px !important;
}
.drawer-content .list-label {
    line-height: 45px;
}
.drawer-content .item {
    height: 45px;
}
.router-link-active .item-primary{
    color: #027be3;
}
.q-picker-textfield .q-picker-textfield-label{
    color: inherit !important;
}
.label-success .q-picker-textfield-label {
    color: #4caf50 !important;
}
.label-error .q-picker-textfield-label {
    color: #f44336 !important;
}
select {
    -webkit-appearance: none;
    -moz-appearance: none;
    text-indent: 1px;
    text-overflow: '';
}
.label-success .q-picker-textfield:after, .label-error .q-picker-textfield:after{
    content: "" !important;
}

.underline {
    text-decoration: underline;
}

</style>
