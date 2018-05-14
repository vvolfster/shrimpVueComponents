<template>
    <div id="q-app" class="column">
        <div class="title shadow-1 row items-center">
            &nbsp;Shrimp Vue Components
        </div>
        <div class="row">
            <div class="drawer">
                <div style="overflow-y:auto" class="column items-stretch">
                    <toggleButton class="drawer__btn" v-for="example in examples" :key="example" @on="myComponent = example" :isPushed="example === myComponent">
                        {{ example }}
                    </toggleButton>
                </div>
            </div>
            <div class="viewport">
                <component :is="myComponent"></component>
            </div>
        </div>
    </div>
</template>

<script>
import toggleButton from '@/button/toggleButton';
import autoform from './examples/autoform/autoform';
import autoformWithCustomComponents from './examples/autoformWithCustomComponents/autoformCustom';
import fbAdminPanel from './examples/fbAdminPanel/adminPanel';
import fbAuthentication from './examples/fbAuthentication/fbAuthentication';
import toast from './examples/toast/toast';
import modal from './examples/modal/modal';
import dialogExample from './examples/dialog/dialogExample';
import animator from './examples/animator/animator';
import fileExample from './examples/file/file';
import adder from './examples/adder/adder';
import jsonEditor from './examples/jsonEditor/jsonEditor';
import virtualList from './examples/virtualList';
import datatable from './examples/datatable';
import combobox from './examples/combobox';
import components from './examples/components';

export default {
    name: 'app',
    data() {
        return {
            myComponent: null,
            userIsActive: true,
            examples: [
                'combobox',
                'fbAdminPanel',
                'fbAuthentication',
                'animator',
                'toast',
                'modal',
                'autoform',
                'autoformWithCustomComponents',
                'jsonEditor',
                'dialogExample',
                'fileExample',
                'adder',
                'virtualList',
                'datatable',
                'components'
            ].sort(),
        };
    },
    components: {
        combobox,
        toggleButton,
        fbAdminPanel,
        fbAuthentication,
        datatable,
        animator,
        toast,
        modal,
        dialogExample,
        autoform,
        autoformWithCustomComponents,
        fileExample,
        adder,
        jsonEditor,
        virtualList,
        components
    },
};
</script>

<style>
#q-app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
}

.title {
    height: 4vh;
    width: 100%;
    font-size: 20px;
    color: white;
    background: steelblue;
}

.drawer {
    /* flex: 0 0 10vw; */
    height: 96vh;
    overflow: hidden;
    margin: 0;
    margin-right: 5px;
    background: steelblue;
}

.drawer__btn {
    height: 40px;
}

.viewport {
    flex: 1 1 90vw;
    height: 96vh;
    overflow-y: auto;
}

body {
    margin: 0;
    padding: 0;
}
</style>
