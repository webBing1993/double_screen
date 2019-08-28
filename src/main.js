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
import Axios from 'axios'

var root = process.env.API_ROOT;
const axios = Axios.create();
//请求拦截
axios.interceptors.request.use((config) => {
  // 请求之前重新拼装url
  config.url = root + config.url;
  return config;
});

// http response 响应拦截器
Axios.interceptors.response.use(response => {
  return response;
},error => {
  if (error.response) {
    switch (error.response.status) {
      // 返回401，清除token信息并跳转到登录页面
      case 401:
        localStorage.removeItem('token');
        Vue.prototype.$confirm('当前登录失效，请重新登录', '提示', {
          confirmButtonText: '确定',
          type: 'warning',
          showCancelButton: false,
          center: true
        }).then(() => {
          let url = window.location.href.split('#')[0];
          window.location.href = url;
        });
        break;
      case 403:
        Vue.prototype.$confirm('当前登录失效，请重新登录', '提示', {
          confirmButtonText: '确定',
          type: 'warning',
          showCancelButton: false,
          center: true
        }).then(() => {
          let url = window.location.href.split('#')[0];
          window.location.href = url;
        });
        break;
      case 404:
        Vue.prototype.$confirm('当前登录失效，请重新登录', '提示', {
          confirmButtonText: '确定',
          type: 'warning',
          showCancelButton: false,
          center: true
        }).then(() => {
          let url = window.location.href.split('#')[0];
          window.location.href = url;
        });
        break;
      case 504:
        Vue.prototype.$message({
          showClose: true,
          message: '当前无网络',
          type: 'error',
          duration: 0,
        });
        break;
      case 502:
        Vue.prototype.$message({
          message: '服务端报，请稍后再试',
          type: 'error',
        });
        break;
      default:
        Vue.prototype.$message.error(error.response.data);
    }
    // 返回接口返回的错误信息
    return Promise.reject(error.response.data);
  }
});


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
