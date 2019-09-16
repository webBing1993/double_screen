import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

const router = new Router({
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
          meta: {
            requireAuth: true,
            isBack: false,//判断是否是点击返回按钮进入页面的，默认是false
          }
        },
        {
          path: '/liveIn',
          name: 'liveIn',
          component: resolve => require(['../components/home/liveIn.vue'],resolve),
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
        },
        {
          path: '/policeIdentityDetail/:id',
          name: 'policeIdentityDetail',
          component: resolve => require(['../components/home/policeIdentityDetail.vue'],resolve),
        },
        {
          path: '/checkIn/:id',
          name: 'checkIn',
          component: resolve => require(['../components/home/checkIn.vue'],resolve),
        },
        {
          path: '/checkOut/:id',
          name: 'checkOut',
          component: resolve => require(['../components/home/checkOut.vue'],resolve),
        },
        {
          path: '/wuwangluo',
          name: 'wuwangluo',
          // component: resolve => require(['../components/home/wuwangluo.vue'],resolve),
          component: require('../components/home/wuwangluo.vue').default,
        }
      ],
    },
    {
      path: '/doSth',
      name: 'doSth',
      component: resolve => require(['../components/home/doSth.vue'],resolve),
    }
  ]
});

router.onError((error) => {
  Vue.prototype.$toast({
    message: "网络断开连接",
    iconClass: 'icon ',
  });
  router.push('/wuwangluo');
  return;
});

export default router
