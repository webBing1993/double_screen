import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: resolve => require(['../components/login/index.vue'],resolve),
    },
    {
      path: '/home',
      name: 'home',
      component: resolve => require(['../components/home/index.vue'],resolve),
      children: [
        {
          path: '/order',
          name: 'order',
          component: resolve => require(['../components/home/order.vue'],resolve),
        },
        {
          path: '/payment',
          name: 'payment',
          component: resolve => require(['../components/home/payment.vue'],resolve),
        },
        {
          path: '/policeIdentity',
          name: 'policeIdentity',
          component: resolve => require(['../components/home/policeIdentity.vue'],resolve),
        }
      ],
    },
    {
      path: '/doSth',
      name: 'doSth',
      component: resolve => require(['../components/home/doSth.vue'],resolve),
    }
  ]
})
