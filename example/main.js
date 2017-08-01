// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
/* eslint-disable import/first */
/* eslint-disable global-require */
require(`quasar-framework/dist/quasar.mat.css`)

import Vue from 'vue';
import Quasar from 'quasar-framework'
import 'font-awesome/css/font-awesome.css'
// import App from './App';

Vue.use(Quasar);
Vue.config.productionTip = false;

/* eslint-disable no-new */
Quasar.start(() => {
    /* eslint-disable no-new */
    window.app = new Vue({
        name: "AppRoot",
        el: '#q-app',
        render: h => h(require('./App')),
    })
})
