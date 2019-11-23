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
        },
        {
          path: '/independent',
          name: 'independent',
          component: resolve => require(['../components/home/independent.vue'],resolve),
        },
      ],
    },
    {
      path: '/doSth',
      name: 'doSth',
      component: resolve => require(['../components/home/doSth.vue'],resolve),
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (from.name != null || from.name != 'login' || to.name == 'wuwangluo') {
    router.onError((error) => {
      console.log("error.response", error.response);
      if (error.response) {

      }else {
        const pattern = /Loading chunk (\d)+ failed/g;
        const isChunkLoadFailed = error.message.match(pattern);
        if (isChunkLoadFailed) {
          // router.push('/');
          Vue.prototype.$toast({
            message: "版本升级，请重新登录",
            iconClass: 'icon ',
          });
          // window.location.href = url;
          setTimeout(() => {
            jsObj.LogOut();
          }, 1000)
        }
      }
      return;
    });
    next();
  }else {
    // router.onError((error) => {
    //   Vue.prototype.$toast({
    //     message: '网络断开连接',
    //     iconClass: 'icon ',
    //   });
    //   return;
    // });
    next();
  }
});



export default router
