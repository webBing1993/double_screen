<template>
  <div>
    <div class="homeIndex" v-show="homeIndexShow">
      <div :class="tabIndex != 5 ? 'header' : 'header header_'">
        <div class="header_fl">
          <div class="changeScreen" @click="openExternalScreen()">
            <img src="../../assets/qiehuan.png" alt="">
            <span>查看外屏</span>
          </div>
          <div class="tabs" ref="tabs">
            <span :class="tabIndex == 1 ? 'tab homeTab active' : 'tab homeTab'" @click="tabClick(1)" data-id="1" v-if="getAllConfigList.qyOrders">办理入住</span>
            <span :class="tabIndex == 2 ? 'tab homeTab active' : 'tab homeTab'" @click="tabClick(2)" data-id="2" v-if="getAllConfigList.qyCheckIn">在住房间</span>
            <span :class="tabIndex == 3 ? 'tab homeTab active' : 'tab homeTab'" @click="tabClick(3)" data-id="3" v-if="getAllConfigList.isQyPay">交易管理</span>
            <span :class="tabIndex == 4 ? 'tab homeTab active' : 'tab homeTab'" @click="tabClick(4)" data-id="4" v-if="getAllConfigList.isRztCheck">公安核验 <i v-if="unhandleNum > 0">{{unhandleNum > 99 ? '99+' : unhandleNum}}</i></span>
            <span :class="tabIndex == 5 ? 'tab homeTab active' : 'tab homeTab'" @click="tabClick(5)" data-id="5">数据看板</span>
            <span :class="tabIndex == 6 ? 'tab homeTab active' : 'tab homeTab'" @click="tabClick(6)" data-id="6" v-if="getAllConfigList.independentTrande">EasyPos</span>
          </div>
        </div>
        <div class="header_fr">
          <div class="newTig" @click="goto('/doSth')" v-if="speakShow">
            <img src="../../assets/xiaoxi.png" alt="">
            <span>您有待办事项点击查看</span>
            <img src="../../assets/gengduo.png" alt="">
          </div>
          <div class="myInfo" @click="myInfoClick">
            <img :src="myInfo.img" alt="" onerror="this.myInfo.src='../../assets/morentouxiang.png'">
            <span>{{myInfo.name}}</span>
          </div>
          <!--<div class="tuichu" @click="quitTipShow">-->
            <!--<img src="../../assets/tuichu.png" alt="">-->
          <!--</div>-->
          <div class="tuichu">
            <el-dropdown trigger="click">
                <span class="el-dropdown-link">
                  更多
                </span>
              <el-dropdown-menu slot="dropdown">
                <!--<el-dropdown-item icon="el-icon-s-finance"  @click.native="printTipShow(1)">上门散客房价</el-dropdown-item>-->
                <el-dropdown-item icon="el-icon-s-home" v-if="!extendConfig" @click.native="printTipShow(2)">续住模式</el-dropdown-item>
                <el-dropdown-item icon="el-icon-tickets" v-if="getAllConfigList.operateLog" @click.native="goto('/opertaionLog')">操作日志</el-dropdown-item>
                <el-dropdown-item icon="el-icon-switch-button" @click.native="quit=true;">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </div>
      <div class="content">
        <router-view @getMessage="showMsg" @gotoDtail="policeIdentity" @gocheckIn="gotocheckIn" :searchVal="searchVal" @goToCheckOut="goCheckOut" @checkOutLoading="checkOutLoading" @unhandleNumFun="unhandleNumFun" :pmsOrderIdChange = 'pmsOrderIdChange'></router-view>
      </div>

      <!-- 退出弹框提示-->
      <div class="quit" v-if="quit">
        <div class="shadow"></div>
        <div class="quit_content">
          <div class="quit_title">是否确认退出？</div>
          <div class="quit_tabs">
            <span class="cancel" @click="quitTipClose">取消</span>
            <span class="sure" @click="sure">确认</span>
          </div>
        </div>
      </div>

      <!-- 退房，发卡槽无卡或回收卡槽满 待办弹框-->
      <div class="quitHouse" v-for="(item, index) in tipArr">
        <div class="content" v-if="item.doType == 1">
          【{{ item.roomNo }}】房间客人申请退房，房卡已回收，请及时处理，可至右上角<span>待办事项</span>查看
        </div>
        <div class="content" v-else-if="item.doType == 2">
          房号【{{item.roomNo}}】客人旅业退房失败
        </div>
        <div class="content" v-else-if="item.doType == 4">
          收款成功！收款金额{{ item.totalFeeStr }}元，自动入账失败，请手工至PMS系统处理入账，<span>点击查看详情</span>
        </div>
        <div class="content" v-else-if="item.doType == 5">
          房号【{{item.roomNo}}】客人插卡退房成功，房卡已回收，房态已改为脏房请及时打扫
        </div>
        <div class="content" v-else-if="item.doType == 6">
          房号【{{item.roomNo}}】退款计划失败，{{ item.remark }}
        </div>
        <div class="content" v-else-if="item.doType == 7">
          房号【{{item.roomNo}}】客人插卡退房成功，房态已改为脏房请及时打扫
        </div>
        <div class="content" v-else-if="item.doType == 8">
          房号【{{item.roomNo}}】挂帐失败
        </div>
        <div class="content" v-else-if="item.doType == 9">
          【{{item.roomNo}}】房间脏房入住，请及时打扫
        </div>
        <div class="content" v-else-if="item.doType == 10">
          房号【{{item.roomNo}}】续住失败，房费已支付，请及时处理
        </div>
        <div class="btns" v-if="item.doType != 5 && item.doType != 7">
          <span class="knowBtn" @click="checkOut(item.id, index, 1)">我知道了</span>
          <span class="lookDetail" @click="lookDetail(item, index)">查看详情</span>
        </div>
        <div class="btns" v-if="item.doType == 5 || item.doType == 7 || item.doType == 8 || item.doType == 2 || item.doType == 9 || item.doType == 10">
          <span class="lookDetail" @click="checkOut(item.id, index, 2)">我知道了</span>
        </div>
      </div>

      <!-- 选择续住类型/散客房价码-->
      <div class="printTip" v-if="printTip">
        <div class="shadow"></div>
        <div class="tip_content">
          <div class="title">{{ tipStatusType == 1 ? '请选择上门散客房价' : '请选择续住模式' }}</div>
          <div class="lists" v-if="tipStatusType == 2">
            <div class="list" v-for="item in tipLists">
              <el-radio v-model="tipStatus" :label="item.id" border size="medium">{{ item.label }}</el-radio>
            </div>
          </div>
          <div class="lists" v-else>
            <div class="list" v-for="item in tipLists_">
              <el-radio v-model="tipStatus" :label="item.id" border size="medium">{{ item.label }}</el-radio>
            </div>
          </div>
          <div class="btns">
            <button type="info" @click="tipCancel">取消</button>
            <el-button type="primary" @click="tipSure()">确认</el-button>
          </div>
        </div>
      </div>

      <loadingList v-if="loadingShow" :loadingText="loadingText"  style="width: 100vw"></loadingList>
    </div>
  </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex';
  import loadingList from './loading.vue'
  export default {
    name: 'home',
    components: {loadingList},
    data () {
      return {
        loadingShow: false,
        loadingText: '加载中...',
        homeIndexShow: false,  // 模板显示隐藏
        tabIndex: 1,  // tab切换
        myInfo: {
          img: sessionStorage.getItem('avatar') ? sessionStorage.getItem('avatar') : require('../../assets/morentouxiang.png'),
          name: sessionStorage.getItem('name')
        },      // 获取个人头像和姓名
        quit: false,     // 是否退出弹框
        speakShow: false,  // 判断是否有新代办来了
        websock: null,
        timer: null,
        unhandleNum: 0,  // 公安核验数量
        getAllConfigList: {
          qyOrders: false,   // 办理入住
          qyCheckIn: false,  // 在住列表
          isQyPay: false,     // 交易管理
          isRztCheck: false, // 公安验证
          independentTrande: false, // 独立支付
          operateLog: false,  // 操作日志
        },  // 权限
        searchVal: 0,
        windowUrl: '',
        quithouse: false,   // 弹框提示
        quithouse_: false,  // 退房
        wuka: false,        // 无卡提示
        manka: false,       // 卡槽满
        pmsPay: false,       // pms入账失败
        quitSuccessHouse: false,       // 插卡退房成功
        quitMoney: false,       // 退款计划失败
        checkoutsuccess: false, // 插卡退房成功
        pmsOrderIdChange: 0,
        onlyItem: {},    // 临时退房数据
        tipArr: [],
        printTip: false,     // 续住选择tip
        tipStatus: 'EX_PRICE',        // 续住选择
        tipLists: [
          {
            id: 'EX_PRICE',
            label: '按前一天价格续住'
          },
          {
            id: 'RATE_CODE',
            label: '按订单房价码续住'
          }
        ],       // 续住tip
        tipLists_: [
          {
            id: 1,
            label: '房价码1'
          },
          {
            id: 2,
            label: '房价码2'
          },
          {
            id: 3,
            label: '房价码3'
          },
          {
            id: 4,
            label: '房价码4'
          },
          {
            id: 5,
            label: '房价码5'
          },
          {
            id: 6,
            label: '房价码6'
          },
        ],        // 上门散客房价
        tipStatusType: 1,     // 区分是续住模式2还是散客房价码模式1
        extendConfig: false,    // 续住权限
      }
    },
    methods: {
      ...mapActions([
        'goto', 'replaceto', 'getTodoList', 'newIdentityList', 'creditDoSth', 'extendInfo', 'extendUpdate'
      ]),

      // tab切换
      tabClick (index) {
        document.body.removeEventListener('touchmove',this.bodyScroll,false);
        document.body.style.position = 'initial';
        document.body.style.width = 'auto';
        this.tabIndex = index;
        this.loadingShow = false;
        if (index == 1) {
          sessionStorage.removeItem('changeTabString');
          this.replaceto('/order');
        }else if (index == 2) {
          sessionStorage.removeItem('changeTabString');
          this.replaceto('/liveIn');
        }else if (index == 3) {
          sessionStorage.removeItem('changeTabString');
          this.replaceto('/payment');
        }else if (index == 4) {
          this.replaceto('/policeIdentity');
        }else if (index == 5) {
          this.replaceto('/statistics');
        }else if (index == 6) {
          this.replaceto('/independent');
        }
        if (sessionStorage.getItem('pmsPayDetail')) {

        }else {
          sessionStorage.setItem('tabIndex', index);
        }
      },

      // 点击头像调用A屏事件
      myInfoClick() {
        jsObj.WalkInConfig();
      },

      // tip show
      printTipShow(type) {
        this.tipStatusType = type;
        this.printTip = true;
      },

      // tip cancel
      tipCancel() {
        this.printTip = false;
//        this.tipStatus = 1;
      },

      // tip sure
      tipSure() {
        if (this.tipStatusType == 1) {

        }else {
            this.extendUpdate({
              data: {
                  mode: this.tipStatus
              },
              onsuccess: body => {
                  if (body.data.code == 0) {
                      if (body.data.data) {
                        this.$toast({
                          message: "续住模式修改成功",
                          iconClass: 'icon ',
                        });
                        this.tipCancel();
                      }else {
                        this.$toast({
                          message: "续住模式修改失败",
                          iconClass: 'icon ',
                        });
                      }
                  }
              },
              onfail: body => {

              },
              onerror: body => {

              }
            })
        }
      },

      // 语音播报
      speckText(str){
        let url = "http://tts.baidu.com/text2audio?cuid=baiduid&lan=zh&ctp=1&pdt=311&tex=" + encodeURI(str);        // baidu
        let n = new Audio(url);
        n.src = url;
        n.play();
        n = null;
      },

      // 退出弹框
      quitTipShow() {
          document.body.addEventListener('touchmove',this.bodyScroll,false);
          document.body.style.position = 'fixed';
          document.body.style.width = '100%';
          this.quit = true;
      },

      // 退出事件
      sure() {
        document.body.removeEventListener('touchmove',this.bodyScroll,false);
        document.body.style.position = 'initial';
        document.body.style.width = 'auto';
        this.quit = false;
//        window.location.href = this.windowUrl;
        this.logOut();
      },

      // 退出弹框消失
      quitTipClose() {
          document.body.removeEventListener('touchmove',this.bodyScroll,false);
          document.body.style.position = 'initial';
          document.body.style.width = 'auto';
          this.quit = false;
      },

      logOut() {
        jsObj.LogOut();
      },

      // 获取列表
      doSthList() {
          let arr = [];
        this.getTodoList({
          onsuccess: body => {
            if (body.data.code == 0) {
              if (body.data.data.pmspay.length == 0 &&  body.data.data.checkoutapply == null && (!body.data.data.lvyeCheckout || (body.data.data.lvyeCheckout && body.data.data.lvyeCheckout.length == 0)) && body.data.data.creditcheckout.length == 0 && (!body.data.data.checkoutsuccess || (body.data.data.checkoutsuccess && body.data.data.checkoutsuccess.length == 0)) && (!body.data.data.AUTO_CREDIT_ACCOUNT || (body.data.data.AUTO_CREDIT_ACCOUNT && body.data.data.AUTO_CREDIT_ACCOUNT.length == 0)) && (!body.data.data.AUTO_SETTLE_PAY || (body.data.data.AUTO_SETTLE_PAY && body.data.data.AUTO_SETTLE_PAY.length == 0)) && body.data.data.pmscheckin.length == 0 && (!body.data.data.CONTINUE_LIVE || (body.data.data.CONTINUE_LIVE && body.data.data.CONTINUE_LIVE.length == 0)) && (!body.data.data.DIRTY_ROOM || (body.data.data.DIRTY_ROOM && body.data.data.DIRTY_ROOM.length == 0)) && (!body.data.data.RULVYE || (body.data.data.RULVYE && body.data.data.RULVYE.length == 0))) {
                  this.speakShow = false;
              }else {
                  this.speakShow = true;
                  let doSthList = sessionStorage.getItem('doSthArr') ? JSON.parse(sessionStorage.getItem('doSthArr')) : [];
//                  this.speckText('您有待办事项未处理，点击查看');
                  if (body.data.data.checkoutapply != null) {
//                    this.findItem(body.data.data, 1);
                    body.data.data.checkoutapply.forEach(item => {
                        item.doType = 1;
                    });
                    arr = [...body.data.data.checkoutapply, ...arr];
                  }
                  if (body.data.data.lvyeCheckout && body.data.data.lvyeCheckout.length != 0) {
                    body.data.data.lvyeCheckout.forEach(item => {
                      item.doType = 2;
                    });
                    arr = [...body.data.data.lvyeCheckout, ...arr];
                  }
                  if (body.data.data.pmspay.length != 0) {
//                    this.findItem(body.data.data, 4);
                    body.data.data.pmspay.forEach(item => {
                      item.doType = 4;
                    });
                    arr = [...body.data.data.pmspay, ...arr];
                  }
                  if (body.data.data.creditcheckout && body.data.data.creditcheckout.length != 0) {
//                    this.findItem(body.data.data, 5);
                    body.data.data.creditcheckout.forEach(item => {
                      item.doType = 5;
                    });
                    arr = [...body.data.data.creditcheckout, ...arr];
                  }
                  if (body.data.data.AUTO_SETTLE_PAY && body.data.data.AUTO_SETTLE_PAY.length != 0) {
//                    this.findItem(body.data.data, 6);
                    body.data.data.AUTO_SETTLE_PAY.forEach(item => {
                      item.doType = 6;
                    });
                    arr = [...body.data.data.AUTO_SETTLE_PAY, ...arr];
                  }
                  if (body.data.data.checkoutsuccess.length != 0) {
//                    this.findItem(body.data.data, 7);
                    body.data.data.checkoutsuccess.forEach(item => {
                      item.doType = 7;
                    });
                    arr = [...body.data.data.checkoutsuccess, ...arr];
                  }
                  if (body.data.data.AUTO_CREDIT_ACCOUNT && body.data.data.AUTO_CREDIT_ACCOUNT.length != 0) {
                    body.data.data.AUTO_CREDIT_ACCOUNT.forEach(item => {
                      item.doType = 8;
                    });
                    arr = [...body.data.data.AUTO_CREDIT_ACCOUNT, ...arr];
                  }
                  if (body.data.data.DIRTY_ROOM && body.data.data.DIRTY_ROOM.length != 0) {
                    body.data.data.DIRTY_ROOM.forEach(item => {
                      item.doType = 9;
                    });
                    arr = [...body.data.data.DIRTY_ROOM, ...arr];
                  }
                  if (body.data.data.CONTINUE_LIVE && body.data.data.CONTINUE_LIVE.length != 0) {
                    body.data.data.CONTINUE_LIVE.forEach(item => {
                      item.doType = 10;
                    });
                    arr = [...body.data.data.CONTINUE_LIVE, ...arr];
                  }
                  console.log('arr', arr, doSthList);
                  if (doSthList.length != 0) {
                    let result = [];
                    for(var i = 0; i < arr.length; i++){
                      let obj = arr[i];
                      let num = obj.id;
                      let isExist = false;
                      for(var j = 0; j < doSthList.length; j++){
                        var aj = doSthList[j];
                        var n = aj.id;
                        if(n == num){
                          isExist = true;
                          break;
                        }
                      }
                      if(!isExist){
                        result.push(obj);
                      }
                    }
                    console.log('result', result);
                    if (result.length != 0) {
                      this.tipArr = [...result, ...this.tipArr];
                      console.log('this.tipArr', this.tipArr);
//                      this.findItem(result, result[0].doType);
                      this.findItem(result);
                    }
                  }
                  sessionStorage.setItem('doSthArr', JSON.stringify(arr));
              }
            }
            this.loadingShow = false;
          },
          onfail: body => {
            this.loadingShow = false;
          },
          onerror: body => {
            this.loadingShow = false;
          }
        })
      },

      // 过滤
      findItem(data) {
        let checkOutList = [];
        checkOutList = data;
        console.log('checkOutList', checkOutList);
        this.onlyItem = checkOutList[0];
        this.$nextTick(() => {
          setTimeout(() => {
            this.quithouse = true;
            if (this.onlyItem.doType == 1) {
              this.speckText(checkOutList[0].roomNo+'房间客人申请退房，房卡已回收，请及时处理');
            }else if (this.onlyItem.doType == 2) {
              this.speckText('房号'+checkOutList[0].roomNo+'客人旅业退房失败');
            }else if (this.onlyItem.doType == 4) {
              this.speckText('收款成功！收款金额'+checkOutList[0].totalFeeStr+'元，自动入账失败，请手工至PMS系统处理入账');
            }else if (this.onlyItem.doType == 5) {
              this.speckText('房号'+checkOutList[0].roomNo+'客人插卡退房成功，房卡已回收，房态已改为脏房请及时打扫');
            }else if (this.onlyItem.doType == 6) {
              this.speckText('房号'+checkOutList[0].roomNo+'退款计划失败，'+checkOutList[0].remark);
            }else if (this.onlyItem.doType == 7) {
              this.speckText('房号'+checkOutList[0].roomNo+'客人插卡退房成功，房态已改为脏房请及时打扫');
            }else if (this.onlyItem.doType == 8) {
              this.speckText('房号'+checkOutList[0].roomNo+'挂帐失败');
            }else if (this.onlyItem.doType == 9) {
              this.speckText(checkOutList[0].roomNo+'房间脏房入住，请及时打扫');
            }else if (this.onlyItem.doType == 10) {
              this.speckText('房号'+checkOutList[0].roomNo+'续住失败，房费已支付，请及时处理');
            }
          }, 500)
        })
      },

      // 我知道了
      checkOut(id, index, type) {
          if (type == 2) {
              this.creditDoSth({
                id: id,
                onsuccess: body => {
                    if (body.data.code == 0) {
                      this.quithouse = false;
                      this.tipArr.splice(index, 1);
                    }
                },
                onfail: body => {

                },
                onerror: body => {

                }
              })
          }else {
            this.tipArr.splice(index, 1);
          }
      },

      // 查看详情
      lookDetail(item, index) {
        this.tipArr.splice(index, 1);
        if (item.id) {
          this.goto('/doSth');
        }else {
          sessionStorage.setItem('pmsPayDetail', item.orderId+'-'+item.payFlowId);
          this.tabClick(3);
          this.pmsOrderIdChange++;
        }
      },

      // 获取公安核验未处理数据
      unhandleList() {
        this.newIdentityList ({
          data: {
            createTimeStart: '',
            createTimeEnd: '',
            reportInStatuses: ["NONE","FAILED"],//需要的入住上报旅业状态
            desc: true,
            name: ''  // 搜索
          },
          limit: 5,
          offset: 0,
          onsuccess: (body, headers) => {
            this.loadingShow = false;
            if (body.errcode == 0) {
              this.unhandleNum = headers['x-total-count'];
            }
          },
          onfail: body => {
            this.loadingShow = false;
          },
          onerror: body => {
            this.loadingShow = false;
          }
        });
      },

      showMsg (val) {
//        this.unhandleList();
      },

      // 进公安核验详情
      policeIdentity(val) {
        this.loadingShow = true;
        this.goto('/policeIdentityDetail/'+val);
      },

      // 进入团队投屏前选择
      gotocheckIn(val) {
        this.loadingShow = true;
        this.goto('/checkIn/'+val);
      },

      // 进入退房详情
      goCheckOut(val) {
        this.loadingShow = true;
        this.goto('/checkOut/'+val)
      },

      // 公安核验待处理数据条数
      unhandleNumFun (val) {
        this.unhandleNum = val;
      },

      checkOutLoading(val) {
        this.loadingShow = false;
      },

      openExternalScreen() {
        jsObj.OpenExternalScreen();
      },

      //初始化weosocket
      initWebSocket(){
        //ws地址
        let mymessage = encodeURIComponent(sessionStorage.session_id+sessionStorage.hotel_id);
        let wsuri = '';
        wsuri = "wss://wqt.fortrun.cn" + sessionStorage.getItem('windowUrl') + "todolistws?wsCode=" + mymessage;  // qa
        this.websock = new WebSocket(wsuri);
        this.websock.onopen = this.websocketonopen;
        this.websock.onmessage = this.websocketonmessage;
        this.websock.onclose = this.websocketclose;
      },
      websocketonopen(e){ //建立通道
        // let redata = e;
      },
      websocketonmessage(e){ //数据接收
        let date = e.data;
        if (date == '"refresh"') {
          this.speakShow = true;
          this.unhandleList();
          this.searchVal++;
          this.doSthList();
        }
      },
      websocketsend(agentData){//数据发送
        this.websock.send(agentData);
      },
      websocketclose(e){  //关闭通道
        this.initWebSocket();
      },


      // 是否支持续住
      isConfigExtend() {
        this.extendInfo({
          onsuccess: body => {
            if (body.data.errcode == 0) {
              this.extendConfig = body.data.data ? body.data.data.extend == 'true' ? true: false : false;
              this.tipStatus = body.data.data ? body.data.data.mode : 'EX_PRICE';
            }
          },
          onfail: body => {

          },
          onerror: body => {

          }
        })
      },

    },

    mounted () {
      let list = JSON.parse(sessionStorage.getItem('subPermissions'));
      this.windowUrl = window.location.href.split('#')[0];
      list.forEach(item => {
        if (item.tag == 'sp_checkin') {
          this.getAllConfigList.qyOrders = true;
        }else if(item.tag=="sp_inroom"){
          this.getAllConfigList.qyCheckIn=true;
        }else if(item.tag=="sp_trade") {
          this.getAllConfigList.isQyPay=true;
        }else if(item.tag=="sp_check") {
          this.getAllConfigList.isRztCheck = true;
          this.unhandleList();
        }else if (item.tag == 'sp_independent_trade') {
          this.getAllConfigList.independentTrande = true;
        }else if (item.tag == 'sp_operate_log') {
          this.getAllConfigList.operateLog = true;
        }
      });
      setTimeout(() => {
        let dataId = document.getElementsByClassName('homeTab')[0].attributes[1];
        if (sessionStorage.getItem('pmsPayDetail')) {

        }else {
          this.tabClick(sessionStorage.getItem('tabIndex') ? sessionStorage.getItem('tabIndex') : dataId.value);
        }
      },500);
      this.homeIndexShow = true;
      this.isConfigExtend();
      this.doSthList();
      this.initWebSocket();
      this.timer = setInterval(() => {
        this.websocketsend(88888);
      },1500);
      if (sessionStorage.getItem('pmsPayDetail')) {
        this.tabClick(3);
      }
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .homeIndex {
    .header {
      background: #f7f7f7;
      box-shadow: 0 11px 44px 0 rgba(0,0,0,0.07);
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: fixed;
      width: 100vw;
      left: 0;
      top: 0;
      z-index: 1;
      .header_fl {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100%;
        .changeScreen {
          height: 100%;
          background-color: #1AAD19;
          padding: 0 20px;
          display: flex;
          align-items: center;
          margin-right: 25px;
          line-height: 1;
          img {
            display: inline-block;
            width: 24px;
            height: 24px;
            margin-right: 10px;
          }
          span {
            font-size: 20px;
            color: #fff;
            font-family: "Microsoft Himalaya";
            margin-top: 10px;
          }
        }
        .changeScreen * {
          vertical-align:middle;
        }
        .tabs {
          height: 100%;
          .tab {
            margin-right: 45px;
            height: 100%;
            position: relative;
            color: #909399;
            font-size: 20px;
            display: inline-flex;
            align-items: center;
            i {
              font-style:normal;
              background-color: #F5222D;
              border-radius: 50%;
              font-size: 16px;
              color: #fff;
              margin-left: 6px;
              width: 28px;
              height: 28px;
              line-height: 28px;
              letter-spacing: 0;
            }
          }
          .active {
            color: #303133;
            font-weight: bold;
          }
          .active:after {
            content: '';
            display: block;
            position: absolute;
            bottom: 0;
            left: 0;
            background-color: #1AAD19;
            height: 4px;
            width: 100%;
          }
        }
      }
      .header_fr {
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .newTig {
          display: flex;
          align-items: center;
          height: 100%;
          cursor: pointer;
          img:first-of-type {
            width: 40px;
            display: inline-block;
          }
          span {
            color: #303133;
            font-size: 18px;
            margin: 0 10px;
          }
          img:last-of-type {
            display: inline-block;
            width: 12px;
          }
        }
        .myInfo {
          margin: 0 60px 0 80px;
          display: flex;
          align-items: center;
          height: 100%;
          cursor: pointer;
          img {
            display: inline-block;
            width: 68px;
            height: 68px;
            margin-right: 15px;
            border-radius: 50%;
          }
          span {
            color: #4A4A4A;
            font-size: 18px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 80px;
          }
        }
        .tuichu {
          margin-right: 20px;
          .el-dropdown {
            border: 1px solid #9A9A9A;
            padding: 12px 22px;
            font-size: 20px;
            border-radius: 10px;
            color: #1AAD19;
            font-weight: bold;
            letter-spacing: 2px;
          }
        }
      }
    }
    .header_ {
      box-shadow: none;
    }
    .quit {
      .shadow {
        position: fixed;
        z-index: 999999999;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .6);
      }
      .quit_content {
        background: #FFFFFF;
        border-radius: 20px;
        width: 540px;
        position: fixed;
        z-index: 9999999999;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        .quit_title {
          padding: 120px 50px;
          border-bottom: 1px solid #D8D8D8;
          color: #0B0B0B;
          font-size: 24px;
          text-align: center;
          font-weight: bold;
        }
        .quit_tabs {
          display: flex;
          justify-content: center;
          span {
            display: inline-block;
            width: 50%;
            position: relative;
            padding: 30px 0;
            font-size: 20px;
            text-align: center;
          }
          span:first-of-type {
            color: #909399;
          }
          span:last-of-type {
            color: #1AAD19;
          }
          span:first-of-type:after {
            content: '';
            display: block;
            background-color: #D8D8D8;
            width: 1px;
            height: 64px;
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
          }
        }
      }
    }
    .quitHouse {
      background: #FFFFFF;
      box-shadow: 0 8px 22px 0 rgba(0,0,0,0.40);
      border-radius: 14px;
      width: 676px;
      position: fixed;
      z-index: 9;
      top: 100px;
      right: 352px;
      padding: 40px;
      .content {
        font-size: 20px;
        color: #303133;
        text-align: left;
        span {
          color: #F5A623;
        }
      }
      .btns {
        margin-top: 30px;
        text-align: right;
        span {
          box-shadow: 0 4px 10px 0 rgba(0,0,0,0.17);
          border-radius: 32px;
          width: 160px;
          height: 64px;
          font-size: 20px;
          display: inline-block;
          text-align: center;
          line-height: 64px;
        }
        .knowBtn {
          background: #FFFFFF;
          color: #303133;
          margin-right: 30px;
        }
        .lookDetail {
          background-color: #1AAD19;
          color: #fff;
        }
      }
    }
    .printTip {
      .shadow {
        position: fixed;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .6);
      }
      .tip_content {
        background: #FFFFFF;
        border-radius: 13.2px;
        width: 750px;
        padding: 67px 74px 60px;
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 12;
        .title {
          font-family: MicrosoftYaHei;
          font-size: 28px;
          color: #333333;
          letter-spacing: 3.27px;
          margin-bottom: 71px;
        }
        .lists {
          padding: 0 9px;
          overflow-y: scroll;
          max-height: 55vh;
          -webkit-overflow-scrolling: touch;
          .list {
            margin-bottom: 23px;
            /deep/ .el-radio.is-bordered {
              padding: 35px 72px 39px;
              background: #F7F7F7;
              border-radius: 10.4px;
              height: auto;
              width: 100%;
              text-align: left;
            }
            /deep/ .el-radio__label {
              font-size: 20px;
              font-family: MicrosoftYaHei;
              letter-spacing: 2px;
              color: #666666;
              margin-left: 42px;
            }
            /deep/ label {
              display: flex;
              align-items: center;
            }
            /deep/ .el-radio--medium.is-bordered .el-radio__inner {
              width: 27px;
              height: 27px;
            }
            /deep/ .el-radio.is-bordered.is-checked {
              border: 1px solid #1AAD19;
              color:  #1AAD19;
              background: #F5FFF5;
            }
            /deep/ .el-radio__input.is-checked .el-radio__inner {
              background: #1AAD19;
              border-color: #1AAD19;
            }
            /deep/ .el-radio__input.is-checked+.el-radio__label {
              color:  #1AAD19;
            }
          }
        }
        .lists::-webkit-scrollbar {
          display: none; // 隐藏滚动条
        }
        .btns {
          margin-top: 80px;
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          button {
            width: 278px;
            height: 68px;
            border-radius: 45px;
            font-size: 24px;
            font-family: MicrosoftYaHei-Bold;
            letter-spacing: 4.04px;
            border: none;
            outline: none;
          }
          button:first-of-type {
            background: #EEEEEE;
            color: #666666;
          }
          button:last-of-type {
            background: #1AAD19;
            box-shadow: 0 3px 16px 0 rgba(26,173,25,0.64);
            color: #FFFFFF;
          }
        }
      }
    }
  }

  .el-dropdown-menu {
    width: 260px;
    z-index: 9 !important;
    .el-dropdown-menu__item {
      display: flex;
      align-items: center;
      width: 100%;
      font-size: 20px;
      line-height: 36px;
      cursor: pointer;
    }
    .el-dropdown-menu__item:not(.is-disabled):hover {
      color: #1AAD19;
    }
    /deep/ .el-dropdown-menu__item i {
      margin-right: 15px;
    }
  }

</style>
