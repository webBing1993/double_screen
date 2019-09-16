import qs from 'qs'
import axios from 'axios'
import router from '../../router/index.js'
import httpTool from '../../tool/httpTool.js'
import Vue from 'vue'

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
      url: httpTool.httpUrlEnv() + 'double-screen' + param.url,
      method: param.method || 'GET',
      baseURL: '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      params: param.params || null,
      data: param.body || null,
      timeout: param.timeout || 120000,
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
          console.log("error",error);
          param.onError && param.onError(error);
        }

      }
    )
  },

  resource: (ctx, param) => {
    axios({
      url: httpTool.httpUrlEnv() + 'double-screen' + param.url,
      method: param.method || 'GET',
      baseURL: '/',
      headers: param.headers || {
        Session: sessionStorage.session_id,
        token: sessionStorage.session_id
      },
      params: qs.stringify(param.params) || null,
      data: qs.stringify(param.body) || null,
      timeout: param.timeout || 120000,
      credentials: false,
      emulateHTTP: false,
      emulateJSON: param.emulateJSON ? param.emulateJSON:true,
    }).then(response => {
      console.log("response",response);
      if (response.data.code == 0 || response.data.errcode == 0 || response.data.code === 888000 || response.data.code === 20005 || response.data.code == 20002 || response.data.code == 20006 || response.data.code == 10006) {
        param.onSuccess && param.onSuccess(response)
      }
      else if (response.data.code === 10004) {
        router.replace('/');
      }
      else if (response.data.errcode != 0 || response.data.code != 0 || response.data.code != 10004) {
        // Vue.prototype.$message.error(response.data.msg);
        Vue.prototype.$toast({
          message: response.data.msg,
          iconClass: 'icon ',
        });
        param.onFail && param.onFail(response)
      }
      else {
        // Vue.prototype.$message.error(response.data.msg);
        // Vue.prototype.$toast(response.data.msg);
        Vue.prototype.$toast({
          message: response.data.msg,
          iconClass: 'icon ',
        });
        param.onFail && param.onFail(response)
      }
    }).catch(
      error => {
        if(error){
          console.log("error",error);
          param.onError && param.onError(error);
        }

      }
    )
  },
  resource_: (ctx, param) => {
    axios({
      url: httpTool.httpUrlEnv() + 'double-screen' + param.url,
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
      if (response.data.code == 0 || response.data.errcode == 0) {
        param.onSuccess && param.onSuccess(response)
      }
      else if (response.data.code === 10004) {
        router.replace('/');
      }
      else if (response.data.errcode != 0 || response.data.code != 0 || response.data.code != 10004) {
        // Vue.prototype.$message.error(response.data.msg);
        Vue.prototype.$toast({
          message: response.data.msg,
          iconClass: 'icon ',
        });
        param.onFail && param.onFail(response)
      }
      else {
        // Vue.prototype.$message.error(response.data.msg);
        Vue.prototype.$toast({
          message: response.data.msg,
          iconClass: 'icon ',
        });
        param.onFail && param.onFail(response)
      }
    }).catch(
      error => {
        if(error){
          console.log("error",error);
          param.onError && param.onError(error);
        }

      }
    )
  },

  resourceGemini: (ctx, param) => {
    axios({
      url: httpTool.httpUrlEnv() + 'gemini' + param.url,
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
      if (response.data.code == 0 || response.data.errcode == 0) {
        param.onSuccess && param.onSuccess(response)
      }
      else if (response.data.code === 10004) {
        router.replace('/');
      }
      else if (response.data.errcode != 0 || response.data.code != 0 || response.data.code != 10004) {
        // Vue.prototype.$message.error(response.data.msg);
        Vue.prototype.$toast({
          message: response.data.msg,
          iconClass: 'icon ',
        });
        param.onFail && param.onFail(response)
      }
      else {
        // Vue.prototype.$message.error(response.data.msg);
        Vue.prototype.$toast({
          message: response.data.msg,
          iconClass: 'icon ',
        });
        param.onFail && param.onFail(response)
      }
    }).catch(
      error => {
        if(error){
          console.log("error",error);
          param.onError && param.onError(error);
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
        param.onfail ? param.onfail(body) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
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
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 首页权限
  getAllConfig(ctx, param) {
    ctx.dispatch('resource', {
      url: '/permission/getByUserId',
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail: body => {
        param.onfail ? param.onfail(body) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  //查看是否对接PMS
  getPmsFlag(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/orders/get/pmsFlag',
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 获取预订单列表
  getQueryByPage (ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/orders/queryByPage',
      method: 'POST',
      body: param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 获取在住单列表
  getNoPmsQueryCheckInList (ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/workWechat/room/checkInOutList',
      method: 'POST',
      body: param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
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
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  //更改支付状态
  updatePaidMode(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/orders/update/paid/'+param.orderId+'/'+param.modeId+'?isFreeDeposit='+param.isFreeDeposit,
      method: 'PUT',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 发卡和rc单的dab权限
  cardRule(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/hotel/get/hotel/config?key='+param.cardStatus,
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 获取房间号列表
  getRooms(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/orders/preOrderRoom/'+param.orderId,
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 判断是否为今日的订单
  sendCheck(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/orders/check/sendToDevice/'+param.id+'?subOrderId='+param.subOrderId,
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  //同步订单列表
  refreshList(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/orders/pms/refreshList',
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 单个同步
  refreshOne(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/orders/pms/refreshOne/'+param.orderId,
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 获得同步时间
  getRefreshTime(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/hotel/hotelInfo?refresh=1',
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 添加入住人判断是否满住
  guestCount(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/orders/subOrder/'+param.subOrderId+'/guestCount',
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 结账后退房
  accountCheckout(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/wechatPay/checkOut',
      body: param.data,
      method: 'POST',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 获取结账列表详情
  getCheckOutInfo(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/orders/fee/'+param.orderId,
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 发卡
  sendCardRule(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/orders/sendCardRule/subOrderId/'+param.subOrderId+'?sendCard='+param.sendCard,
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
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
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
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
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  //退款处理
  refundHandle(ctx, param){
    ctx.dispatch('resource', {
      url: '/ecard/wechatPay/updateRefundMoney',
      method: 'POST',
      body:param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 收款退款
  accountRefund(ctx, param){
    ctx.dispatch('resource', {
      url: '/ecard/wechatPay/getNeedRefundFee',
      method: 'POST',
      body:param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  //获取支付纪录
  getChargeRecard(ctx, param){
    ctx.dispatch('resource', {
      url: '/ecard/workWechat/room/checkOut',
      method: 'POST',
      body:param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
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
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
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
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
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
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
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
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 发卡失败处理事件
  getFaka(ctx, param) {
    ctx.dispatch('resource', {
      url: '/ecard/hotel/updateToDoStatus/'+param.id,
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // pms入住失败处理状态
  updateCheckinfailedStatus(ctx, param){
    ctx.dispatch('resource', {
      url: "/ecard/checkinfailed/updateById/status/"+param.id+"/"+param.status,
      method: 'PUT',
      onSuccess: (body, headers,code) => {
        param.onsuccess ? param.onsuccess(body, headers,code) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
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
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 已处理按钮是否显示
  getShowPoliceConfigs(ctx, param){
    ctx.dispatch('resourceGemini', {
      url: '/getHotelConfig/enable_show_plice_processed',
      method: 'GET',
      onSuccess: body=>{
        param.onsuccess ? param.onsuccess(body) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 获取公安核验列表
  newIdentityList(ctx, param) {
    ctx.dispatch('resourceGemini', {
      url: '/lvye/searchLvyeReportInfos?limit='+ param.limit+'&offset='+param.offset,
      method: 'POST',
      body: param.data,
      onSuccess: (response) => {
        param.onsuccess ? param.onsuccess(response.data, response.headers) : null
      },
      onFail:(response) => {
        param.onfail ? param.onfail(response.body, response.headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 获取酒店房间列表
  getRoomNumberList(ctx, param) {
    ctx.dispatch('resourceGemini', {
      url: '/room/list',
      method: 'GET',
      onSuccess: (response) => {
        param.onsuccess ? param.onsuccess(response.data, response.headers) : null
      },
      onFail:(response) => {
        param.onfail ? param.onfail(response.body, response.headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 公安核验详情
  newIdentityDetail(ctx, param) {
    ctx.dispatch('resourceGemini', {
      url: '/lvye/lvyeReportInfo/' + param.identity_id,
      onSuccess: (response) => {
        param.onsuccess ? param.onsuccess(response.data, response.headers) : null
      },
      onFail:(response) => {
        param.onfail ? param.onfail(response.body, response.headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 拒绝
  rejectStatus(ctx, param){
    ctx.dispatch('resourceGemini',{
      url:'/lvye/checkStatus/'+param.identity_id+'/'+param.status,
      method:'PUT',
      body:param.body,
      onSuccess: (response) => {
        param.onsuccess ? param.onsuccess(response.data, response.headers) : null
      },
      onFail:(response) => {
        param.onfail ? param.onfail(response.body, response.headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 上传旅业
  reportLvYe(ctx, param) {
    ctx.dispatch('resourceGemini', {
      url: '/lvye/lvyeReport',
      method: 'PUT',
      body: param.data,
      onSuccess: (response) => {
        param.onsuccess ? param.onsuccess(response.data, response.headers) : null
      },
      onFail:(response) => {
        param.onfail ? param.onfail(response.body, response.headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 团队订单获取投屏选项
  checkInGetOptions(ctx, param){
    ctx.dispatch('resource', {
      url: "/ecard/orders/group/order/"+param.orderId+"/checkInOptions",
      method: 'GET',
      onSuccess: (body, headers,code) => {
        param.onsuccess ? param.onsuccess(body, headers,code) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 团队订单办理入住
  checkInPostOptions(ctx, param){
    ctx.dispatch('resource_', {
      url: "/ecard/orders/group/order/"+param.orderId+"/checkInOptions",
      method: 'POST',
      body: param.data,
      onSuccess: (body, headers,code) => {
        param.onsuccess ? param.onsuccess(body, headers,code) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },


};
export default {
  actions: actions
}
