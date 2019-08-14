// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import ElementUI from 'element-ui'
import 'element-theme-chalk';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);

// import iView from 'iview';
import 'iview/dist/styles/iview.css';

// Vue.use(iView);

Vue.config.productionTip = false;

import './mixins'

import 'qs'
import 'axios'

import store from './store'

import loadingList from './components/home/loading.vue'

Vue.component('loadingList',loadingList );

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
