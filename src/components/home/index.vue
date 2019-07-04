<template>
  <div>
    <div class="homeIndex">
      <div class="header">
        <div class="header_fl">
          <div class="changeScreen" @click="OpenExternalScreen('OpenExternalScreen')">
            <img src="../../assets/qiehuan.png" alt="">
            <span>切换外屏</span>
          </div>
          <div class="tabs">
            <span :class="tabIndex == 1 ? 'tab active' : 'tab'" @click="tabClick(1)">订单中心</span>
            <span :class="tabIndex == 2 ? 'tab active' : 'tab'" @click="tabClick(2)">交易管理</span>
          </div>
        </div>
        <div class="header_fr">
          <div class="newTig" @click="goto('/doSth')" v-if="speakShow">
            <img src="../../assets/xiaoxi.png" alt="">
            <span>您有一笔待办待处理，点击查看</span>
            <img src="../../assets/gengduo.png" alt="">
          </div>
          <div class="myInfo" @click="quit=true;">
            <img :src="myInfo.img" alt="">
            <span>{{myInfo.name}}</span>
          </div>
        </div>
      </div>
      <div class="content">
        <router-view></router-view>
      </div>

      <!-- 退出弹框提示-->
      <div class="quit" v-if="quit">
        <div class="shadow"></div>
        <div class="quit_content">
          <div class="quit_title">是否确认退出？</div>
          <div class="quit_tabs">
            <span class="cancel" @click="quit=false">取消</span>
            <span class="sure" @click="sure">确认</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex';
  export default {
    name: 'home',
    data () {
      return {
        tabIndex: 1,  // tab切换
        myInfo: {
          img: sessionStorage.getItem('avatar'),
          name: sessionStorage.getItem('name')
        },      // 获取个人头像和姓名
        quit: false,     // 是否退出弹框
        speakShow: false,  // 判断是否有新代办来了
        websock: null,
        timer: null,
      }
    },
    methods: {
      ...mapActions([
        'goto', 'replaceto'
      ]),

      // tab切换
      tabClick (index) {
        this.tabIndex = index;
        if (index == 1) {
          this.replaceto('/order');
        }else {
          this.replaceto('/payment');
        }
      },

      // 语音播报
      speckText(str){
        let url = "http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&text=" + encodeURI(str);        // baidu
        let n = new Audio(url);
        n.src = url;
        n.play();
      },

      // 退出事件
      sure() {
        this.quit = false;
        this.replaceto('/');
      },

      OpenExternalScreen(type) {
        document.title = new Date().getSeconds() + "@" + type;
      },

      //初始化weosocket
      initWebSocket(){
        //ws地址
        let mymessage = encodeURIComponent(sessionStorage.session_id+sessionStorage.hotel_id);
        let wsuri = '';
        wsuri = "wss://qa.fortrun.cn/todolistws?wsCode=" + mymessage;  // qa
        this.websock = new WebSocket(wsuri);
        this.websock.onopen = this.websocketonopen;
        this.websock.onmessage = this.websocketonmessage;
        this.websock.onclose = this.websocketclose;
      },
      websocketonopen(e){ //建立通道
        // let redata = e;
        console.log('============websocket建立链接==============')
      },
      websocketonmessage(e){ //数据接收
        console.log('============websocket数据接收成功==============');
        console.log(e);
        let date = e.data;
        if (date == '"refresh"') {
          this.speakShow = true;
          this.speckText('您有一笔待办待处理，点击查看');
        }
      },
      websocketsend(agentData){//数据发送
        console.log('============websocket数据发送成功==============')
        this.websock.send(agentData);
      },
      websocketclose(e){  //关闭通道
        console.log("关闭通道connection closed (" + e.code + ")");
      },

    },

    mounted () {
      this.tabClick(1);
      this.initWebSocket();
      this.timer = setInterval(() => {
        this.websocketsend(88888);
      },1500)
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .homeIndex {
    .header {
      background: #FFFFFF;
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
          margin-right: 60px;
          img {
            display: inline-block;
            width: 24px;
            height: 24px;
            margin-right: 10px;
          }
          span {
            font-size: 26px;
            color: #fff;
            font-family: "Microsoft Himalaya";
          }
        }
        .tabs {
          height: 100%;
          .tab {
            margin-right: 60px;
            height: 100%;
            position: relative;
            color: #909399;
            font-size: 26px;
            display: inline-flex;
            align-items: center;
            font-weight: bold;
          }
          .active {
            color: #303133;
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
          }
        }
      }
    }
    .quit {
      .shadow {
        position: fixed;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .6);
      }
      .quit_content {
        background: #FFFFFF;
        border-radius: 20px;
        width: 375px;
        position: fixed;
        z-index: 12;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        .quit_title {
          padding: 50px 30px;
          border-bottom: 1px solid #D8D8D8;
          color: #0B0B0B;
          font-size: 26px;
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
            font-size: 24px;
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
  }

</style>
