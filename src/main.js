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

import Mint from 'mint-ui'
import 'mint-ui/lib/style.css'

Vue.use(Mint);

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
    let url = window.location.href.split('#')[0];
    switch (error.response.status) {
      // 返回401，清除token信息并跳转到登录页面
      case 401:
        localStorage.removeItem('token');
        Vue.prototype.$toast({
          message: "当前登录失效",
          iconClass: 'icon ',
        });
        jsObj.LogOut();
        break;
      case 403:
        Vue.prototype.$toast({
          message: "当前登录失效",
          iconClass: 'icon ',
        });
        jsObj.LogOut();
        break;
      case 404:
        Vue.prototype.$toast({
          message: "当前登录失效",
          iconClass: 'icon ',
        });
        // window.location.href = url;
        jsObj.LogOut();
        break;
      case 504:
        Vue.prototype.$toast({
          message: "请求超时或网络断开连接",
          iconClass: 'icon ',
        });
        break;
      case 502:
        Vue.prototype.$toast({
          message: "服务端报错，请稍后再试",
          iconClass: 'icon ',
        });
        break;
      default:
        Vue.prototype.$toast({
          message: "当前登录失效",
          iconClass: 'icon ',
        });
        // window.location.href = url;
        jsObj.LogOut();
        Vue.prototype.$message.error(error.response.data);
    }
    // 返回接口返回的错误信息
    return Promise.reject(error.response.data);
  }else {
    Vue.prototype.$toast({
      message: "网络断开连接",
      iconClass: 'icon ',
    });
    // router.replace('/wuwangluo');
    router.push('/wuwangluo');
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
});
