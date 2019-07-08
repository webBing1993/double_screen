import qs from 'qs'
import axios from 'axios'
import router from '../../router/index.js'
import httpTool from '../../tool/httpTool.js'
import Vue from 'vue'

function openFullScreen() {
  const loading = Vue.prototype.$loading({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  return loading;
}

function closeFullScreen(loading){
  loading.close();
}

const actions = {

  goto: (ctx, param) => {
    if (typeof param === 'number') {
       router.go(param)
    } else {
      router.push(param)
    }
  },
  replaceto: (ctx, param) => {
    router.replace(param)
    // console.log('router:',router)
  },


  request: (ctx, param) => {
    axios({
      url: httpTool.httpUrlEnv() + 'ecard-wechat' + param.url,
      method: param.method || 'GET',
      baseURL: '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      params: param.params || null,
      data: param.body || null,
      timeout: param.timeout || 60000,
    }).then(response => {
      sessionStorage.setItem('onLoad',true);
      console.log("response",response);
      if (response.data.code == 0) {
        param.onSuccess && param.onSuccess(response)
      }
      else if (response.data.errcode !== 0) {
        param.onFail && param.onFail(response)
      }
      else {
        param.onFail && param.onFail(response)
      }
    }).catch(
      error => {
        // ctx.dispatch ('showLoading', false);
        if(error){
          console.log("error",error)
        }

      }
    )
  },

  resource: (ctx, param) => {
    openFullScreen();
    axios({
      url: httpTool.httpUrlEnv() + 'ecard-wechat' + param.url,
      method: param.method || 'GET',
      baseURL: '/',
      headers: param.headers || {
        Session: sessionStorage.session_id,
        token: sessionStorage.session_id
      },
      params: qs.stringify(param.params) || null,
      data: qs.stringify(param.body) || null,
      timeout: param.timeout || 60000,
      credentials: false,
      emulateHTTP: false,
      emulateJSON: param.emulateJSON ? param.emulateJSON:true,
    }).then(response => {
      console.log("response",response);
      closeFullScreen (openFullScreen());
      if (response.data.code == 0 || response.data.errcode == 0) {
        param.onSuccess && param.onSuccess(response)
      }
      else if (response.data.code === 10004) {
        router.replace('/');
      }
      else if (response.data.errcode != 0 || response.data.code != 0 || response.data.code != 10004) {
        Vue.prototype.$message.error(response.data.msg);
        param.onFail && param.onFail(response)
      }
      else {
        Vue.prototype.$message.error(response.data.msg);
        param.onFail && param.onFail(response)
      }
    }).catch(
      error => {
        closeFullScreen (openFullScreen());
        if(error){
          console.log("error",error)
        }

      }
    )
  },
  resource_: (ctx, param) => {
    openFullScreen();
    axios({
      url: httpTool.httpUrlEnv() + 'ecard-wechat' + param.url,
      method: param.method || 'GET',
      baseURL: '/',
      headers: param.headers || {
        Session: sessionStorage.session_id,
        token: sessionStorage.session_id
      },
      params: param.params || null,
      data: param.body || null,
      timeout: param.timeout || 60000,
      credentials: false,
      emulateHTTP: false,
      emulateJSON: param.emulateJSON ? param.emulateJSON:true,
    }).then(response => {
      console.log("response",response);
      closeFullScreen (openFullScreen());
      if (response.data.code == 0 || response.data.errcode == 0) {
        param.onSuccess && param.onSuccess(response)
      }
      else if (response.data.code === 10004) {
        router.replace('/');
      }
      else if (response.data.errcode != 0 || response.data.code != 0 || response.data.code != 10004) {
        Vue.prototype.$message.error(response.data.msg);
        param.onFail && param.onFail(response)
      }
      else {
        Vue.prototype.$message.error(response.data.msg);
        param.onFail && param.onFail(response)
      }
    }).catch(
      error => {
        closeFullScreen (openFullScreen());
        if(error){
          console.log("error",error)
        }

      }
    )
  },

  // 获取验证码
  getCode (ctx,param){
    ctx.dispatch('request',{
      url: '/ecard/workWechat/sendCode',
      method: 'POST',
      params: param.data,
      onSuccess: body => {
        param.onsuccess ? param.onsuccess(body) : null
      },
      onFail: body => {
      }
    })
  },

  // 登录
  loginEntry (ctx,param){
    ctx.dispatch('request',{
      url: '/ecard/workWechat/channelLogin',
      method: 'POST',
      params: param.data,
      onSuccess: body => {
        param.onsuccess ? param.onsuccess(body) : null
      },
      onFail: body => {
        param.onfail ? param.onfail(body) : null
      }
    })
  },

  // 获取列表
  getQueryByPage (ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/orders/queryByPage',
      method: 'POST',
      body: param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      }
    })
  },

  // 查询费用接口
  getOrderFree (ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/wechatPay/getOrderFree',
      method: 'POST',
      body: param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      }
    })
  },

  //更改支付状态
  updatePaidMode(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/orders/update/paid/'+param.orderId+'/'+param.modeId+'?isFreeDeposit='+param.isFreeDeposit,
      method: 'PUT',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      }
    })
  },

  // 判断是否为今日的订单
  sendCheck(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/orders/check/sendToDevice/'+param.id+'?subOrderId='+param.subOrderId,
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      }
    })
  },

  //同步订单列表
  refreshList(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/orders/pms/refreshList',
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      }
    })
  },

  //获得同步时间
  getRefreshTime(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/hotel/hotelInfo?refresh=1',
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      }
    })
  },

  // 退款
  reimburse(ctx,param){
    ctx.dispatch('resource', {
      url: '/ecard/wechatPay/updateRefundMoney',
      method: 'post',
      body:param.data,
      emulateJSON:true,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      }
    })
  },

  // 预授权结算
  depositConsume(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/wechatPay/depositConsume',
      body: param.data,
      method: 'POST',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      }
    })
  },

  // 获取交易记录
  undisposed(ctx, param) {
    ctx.dispatch('resource_', {
      url: '/ecard/wechatPay/getWechatPayList',
      method: 'POST',
      body: param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
    })
  },

  // 撤销预授权
  canclePreAuthorizedDeposit(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/wechatPay/canclePreAuthorizedDeposit',
      body: param.data,
      method: 'POST',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      }
    })
  },

  //支付/退款记录详情信息
  paymentAndUnfinish(ctx,param){
    ctx.dispatch('resource', {
      url: '/ecard/wechatPay/getWechatPayDetail',
      method: 'POST',
      body: param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
    })
  },

  // 获取代办接口
  getTodoList(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/hotel/getTodoLists',
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      }
    })
  },

  // 发卡失败处理事件
  getFaka(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/hotel/updateFakaFail/'+param.id,
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      }
    })
  },

  // pms入住失败处理状态
  updateCheckinfailedStatus(ctx, param){
    ctx.dispatch('resource', {
      url: "/ecard/checkinfailed/updateById/status/"+param.id+"/"+param.status,
      method: 'PUT',
      onSuccess: (body, headers,code) => {
        param.onsuccess ? param.onsuccess(body, headers,code) : null
      }
    })
  },

  // pms入账失败处理状态
  updateWechatPay(ctx,param){
    ctx.dispatch('resource', {
      url: '/ecard/wechatPay/updateWechatStauts',
      method: 'post',
      body: param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      }
    })
  },


};
export default {
  actions: actions
}
