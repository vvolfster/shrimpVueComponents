// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
// import Quasar from 'quasar-framework'
import 'font-awesome/css/font-awesome.css'
import App from './App';

// Vue.use(Quasar);
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    template: '<App/>',
    components: { App },
});
