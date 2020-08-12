<template>
    <div>
      <div class="login">
        <div class="header">
          <div class="bg"><img src="../../assets/logoBg.png" alt=""></div>
         <div class="title_timer">
           <div class="title"><img src="../../assets/zhuihuijiedai.png" alt=""></div>
           <div class="timer">{{nowTime}}</div>
         </div>
        </div>
        <div class="content">
          <el-row >
            <el-col :xs="14" :sm="14" :md="14" :lg="14" :xl="14" class="content_fr">
              <p>请输入手机号登录</p>
              <div class="phone">
                <i><img src="../../assets/zhanghao.png" alt=""></i>
                <input name="phone" type="tel" min="1" id="input_id" placeholder="请输入11位手机号" v-model="phone" @focus="onFocus" maxlength="11"/>
                <el-button :plain="true" v-if="btntxt != '获取验证码' && btntxt != '重新获取'" class="btns btning">{{btntxt}}</el-button>
                <el-button :plain="true" @click="sendcode" :class="btntxt == '获取验证码' || btntxt == '重新获取' ? 'btns' : 'btns btning'" v-else>{{btntxt}}</el-button>
              </div>
              <div class="code">
                <i><img src="../../assets/mima.png" alt=""></i>
                <input type="number" placeholder="请输入6位验证码" v-model="code" @focus="onFocus_"  maxlength="6"/>
              </div>
              <el-button type="primary" class="loginBtn" :loading="loginLoading"  @click="login()" >确定</el-button>
            </el-col>
            <el-col :xs="10" :sm="10" :md="10" :lg="10" :xl="10" class="content_fl">
              <div class="key_board">
                <div class="keyBoard">
                  <div class="keyBoards">
                    <span v-for="item in keyBords"  @click="item == '清除' ? clear($event, phoneCode) : keyEntry($event, item, phoneCode)">{{item}}</span>
                    <span @click="keyCancel($event, phoneCode)"><img src="../../assets/shanchuanniu.png" alt=""></span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex';
  import ElCol from "element-ui/packages/col/src/col";

  export default {
    name: 'login',
    components: {ElCol},
    data () {
      return {
        nowTime: '',
        disabled:false,
        time:0,
        btntxt: "获取验证码",
        code: '',
        phone: '',
        entryAll: false,  // 判断是否可以点击确定按钮
        getTimer: null,
        keyBords: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '清除', '0'],
        phoneCode: 0,  // 0表示的是手机号输入，1表示的是验证码的输入
        loginLoading: false,
      }
    },
    methods: {
      ...mapActions([
        'goto', 'getCode', 'loginEntry', 'getAllConfig'
      ]),

      // 键盘清除事件
      clear (event, type) {
        event.preventDefault();
        if (type == 0) {
            this.phone = '';
        }else {
            this.code = '';
        }
      },

      // 键盘事件
      keyEntry (event, item, type) {
        event.preventDefault();
        if (type == 0) {
          if (this.phone.length < 11) {
            this.phone += item;
          }else {
              return;
          }
        }else {
          if (this.code.length < 6) {
            this.code += item;
          }else {

          }
        }
      },

      // 键盘删除事件
      keyCancel(event, type) {
        event.preventDefault();
        if (type == 0) {
          this.phone = this.phone.substr(0, this.phone.length - 1);
        }else {
          this.code = this.code.substr(0, this.code.length - 1);
        }
      },

      getDateTime(){
        let dateObj = new Date(); //表示当前系统时间的Date对象
        let year = dateObj.getFullYear(); //当前系统时间的完整年份值
        let month = dateObj.getMonth()+1; //当前系统时间的月份值
        let date = dateObj.getDate(); //当前系统时间的月份中的日
        let day = dateObj.getDay(); //当前系统时间中的星期值
        let weeks = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
        let week = weeks[day]; //根据星期值，从数组中获取对应的星期字符串

        return this.dateFilter(year) + "年" + this.dateFilter(month) + "月" + this.dateFilter(date) + "日 " + "  " + week;
      },

      // 年月日不满10位的前面补0
      dateFilter(date){
        if(date < 10){return "0"+date;}
        return date;
      },

      onFocus(){
        this.phoneCode = 0;
      },

      onFocus_(){
        this.phoneCode = 1;
      },

      onBlur () {
        this.phoneCode = 0;
      },

      //获取键盘值
      getInputValue(val){
        console.log(val)
        if(val==='del'){
          this.phone=this.phone.toString().substr(0,this.phone.toString().length-1);
          console.log(this.phone)
        }else{
          if(this.phone==null){
            this.phone=''
          }
          this.phone+=val
        }
      },

      getInputValue_(val){
        console.log(val)
        if(val==='del'){
          this.code=this.code.toString().substr(0,this.code.toString().length-1);
          console.log(this.phone)
        }else{
          if(this.code==null){
            this.code=''
          }
          this.code+=val
        }
      },

      //验证手机号码部分
      sendcode(){
        let reg = 11 && /^((13|14|15|16|17|18|19)[0-9]{1}\d{8})$/;
        if(this.phone == ''){
          this.$message('请输入手机号码');
        }else if(!reg.test(this.phone)){
          this.$message.error('手机格式不正确');
        }else{
          this.time = 60;
          this.disabled = true;
          this.getCode({
            data: {
              phone: this.phone,
              type: 'key_channel'
            },
            onsuccess: body => {
              this.entryAll = true;
              console.log('body.data', body.data);
              if (body.data.code == 0) {
                if (body.data.data == '' || body.data.data == null) {
                  this.phoneCode = 1;
                  this.timer();
                }else {
                  this.$toast({
                    message: body.data.data.msg,
                    iconClass: 'icon ',
                  });
                }
              }else {
                this.$toast({
                  message: body.data.msg,
                  iconClass: 'icon ',
                });
              }
            },
            onfail: body => {
              this.$toast({
                message: body.data.msg,
                iconClass: 'icon ',
              });
            }
          })
        }
      },

      timer() {
        if (this.time > 0) {
          this.time--;
          this.btntxt = this.time+"s后重新获取";
          setTimeout(this.timer, 1000);
        } else{
          this.time = 0;
          this.btntxt = "重新获取";
          this.disabled = false;
        }
      },

      // 登录
      login(){
        let reg = 11 && /^((13|14|15|16|17|18|19)[0-9]{1}\d{8})$/;
        if(this.phone == ''){
          this.$message('请输入手机号码');
        }else if(!reg.test(this.phone)){
          this.$message.error('手机格式不正确');
          if (this.code == '') {
            this.$message('请输入验证码');
          }else if (this.code.length > 6) {
            this.$message('请输入６位数验证码');
          }
        }else {
          if (this.code == '') {
            this.$message('请输入验证码');
          } else if (this.code.length != 6) {
            this.$message('请输入６位数验证码');
          } else {
            this.loginLoading = true;
            this.loginEntry({
              data: {
                phone: this.phone,
                code: this.code
              },
              onsuccess: body => {
                console.log('body:',body);
                if (body.data.code == 0 && body.data.data) {
                  sessionStorage.setItem('avatar',body.data.data.avatar);
                  sessionStorage.setItem('name',body.data.data.name);
                  sessionStorage.session_id = body.data.data.token;
                  sessionStorage.hotel_id = body.data.data.hotelId;
                  sessionStorage.hotel_Name = body.data.data.hotelName;
                  jsObj.IdentityUserInfo = new Date().getSeconds() + "@" + body.data.data.userId;
                  this.getAllConfig({
                    onsuccess: body => {
                      this.loginLoading = false;
                      if(body.data.data != null) {
                        sessionStorage.setItem('subPermissions', JSON.stringify(body.data.data[0].subPermissions));
                        this.goto('/home');
                      }else {
                        this.$message.error('该账号无权限');
                      }
                      setTimeout(() =>{
                        this.loginLoading = false;
                      },1000);
                    },
                    onfail: body => {
                      this.loginLoading = false;
                    },
                    onerror: body => {
                      this.loginLoading = false;
                    }
                  });
                }else {
                  this.loginLoading = false;
                  this.$message.error(body.data.msg);
                }
              },
              onfail: body => {
                this.loginLoading = false;
                this.$message.error(body.data.msg);
              },
              onerror: body => {
                this.loginLoading = false;
              }
            })
          }
        }
      },
    },

    beforeMount () {
      jsObj.getBrowserFinish();
      jsObj.GetDeviceId();      // 获取deviceId
    },

    mounted () {
       this.nowTime = this.getDateTime();
       this.getTimer = setInterval(() => {
         this.nowTime = this.getDateTime();
       },1000);
    },
    beforeRouteLeave(to,from,next) {
      sessionStorage.removeItem('tabIndex');
      sessionStorage.removeItem('tabIndex_');
      sessionStorage.removeItem('tabToDay');
      sessionStorage.removeItem('currentChange');
      sessionStorage.removeItem('pmsFlag');
      sessionStorage.removeItem('changeItem');
      sessionStorage.removeItem('checkOutItem');
      sessionStorage.removeItem('changeTabString');
      sessionStorage.removeItem('gotoCheckIn');
      sessionStorage.removeItem('checkOutList');
      clearInterval(this.getTimer);
      next();
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .login {
    .header {
      height: 150px;
      background: #FFFFFF;
      position: relative;
      .bg {
        width: 100%;
        height: 150px;
        img {
          display:  block;
          width: 100%;
          height: 100%;
        }
      }
      .title_timer {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 109px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 40px;
        .title {
          font-size: 48px;
          color: #000;
          font-weight: bold;
          display: inline-flex;
          img {
            height: 54px;
          }
        }
        .timer {
          font-weight: bold;
          color: #000;
          font-size: 36px;
        }
      }
    }
    .content {
      .content_fl {
        position: relative;
        .key_board {
          position: absolute;
          width: 100%;
          height: calc(100vh - 112px);
          background-color: #DEE7F8;
          left: 0;
          top: -38px;
          .keyBoard {
            position: relative;
            width: 100%;
            height: 100%;
            .keyBoards {
              position: absolute;
              left: 50%;
              height: 50%;
              width: 480px;
              transform: translate(-50%, -50%);
              top: 50%;
              span {
                border-radius: 3.6px;
                width: 110px;
                height: 78px;
                line-height: 78px;
                text-align: center;
                background-color: #D8D8D8;
                color: #0B0B0B;
                font-size: 40px;
                margin: 0 25px 25px 0;
                cursor: pointer;
                display: inline-block;
                font-weight: bold;
                -moz-user-select:none;
                -ms-user-select: none;
                -webkit-user-select: none;
                user-select: none;
                -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
              }
              span:nth-of-type(3n) {
                margin-right: 0;
              }
              span:nth-of-type(10) {
                font-size: 30px;
                color: #EC8B2F;
              }
              span:last-of-type {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                img {
                  width: 50px;
                  height: 28px;
                  display: inline-block;
                }
              }
              span:active {
                background-color: #1AAD19;
                color: #f1f1f1;
              }
            }
          }
        }
      }
      .content_fr {
        background-color: #fff;
        height: calc(100vh - 150px);
        padding: 0 13%;
        p {
          color: #000;
          font-weight: bold;
          font-size: 42px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.04);
          margin: 155px 0 20px;
          text-align: left;
        }
        div {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          border-bottom: 1px solid #C0C4CC ;
          margin: 60px 0;
          i {
            width: 36px;
            height: 36px;
            margin-right: 30px;
            img {
              display: inline-block;
              width: 100%;
              height: 100%;
            }
          }
          input {
            border: none;
            font-size: 36px;
            line-height: 48px;
            background-color: #fff !important;
            color: #606266;
            width: calc(100% - 200px);
          }
          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button {
            -webkit-appearance: none;
          }
          input[type="number"]{
            -moz-appearance: textfield;
          }
          input:-moz-placeholder {
            color: #909399;
          }
          input:-ms-input-placeholder {
            color: #909399;
          }
          input::-moz-placeholder {
            color: #909399;
          }
          input::-webkit-input-placeholder {
            color: #909399;
          }
          .btns {
            background-color: transparent;
            border: none;
            box-shadow: none;
            color: #1AAD19;
            font-size: 32px;
            cursor: pointer;
            font-weight: bold;
          }
          .btning {
            color: #999;
          }
        }
        .loginBtn {
          width: 100%;
          margin-top: 56px;
          text-align: center;
          height: 78px;
          font-size: 30px;
          color: #fff;
          border-radius: 50px;
          background-color: #1AAD19;
          cursor: pointer;
          display: block;
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        }
      }
    }
    input:focus, input:active:focus, button:focus {
      outline: none;
      border-color: transparent;
      box-shadow:none;
    }
  }

</style>
