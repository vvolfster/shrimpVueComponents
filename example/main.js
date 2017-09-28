// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

/* eslint-disable import/first */
/* eslint-disable global-require */

// require(`quasar-framework/dist/quasar.mat.css`)

import Vue from 'vue';
// import Quasar from 'quasar-framework'
// import '../cssImporter'
import svt from '../'


// Vue.use(Quasar);
Vue.use(svt);
Vue.config.productionTip = false;

window.app = new Vue({
    name: "AppRoot",
    el: '#q-app',
    render: h => h(require('./App.vue')),
})
