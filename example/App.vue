<template>
    <div id="app">
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
import toggleButton from "@/button/ToggleButton"
import fbAdminPanel from "./examples/fbAdminPanel/adminPanel"

export default {
    name: 'app',
    data() {
        return {
            myComponent: null,
            examples: ["fbAdminPanel"]
        }
    },
    components: {
        toggleButton,
        fbAdminPanel
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
}

.viewport {
    flex: 1 1 90vw;
    height: 100vh;
}

</style>
