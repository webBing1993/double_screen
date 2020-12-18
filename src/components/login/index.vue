<template>
    <div>
      <div class="login">
        <div class="index_bg">
          <img src="../../assets/index_bg.png" alt="">
        </div>
        <div class="content">
          <el-row >
            <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" class="content_fr">
              <div class="title" v-if="!resetUser">
                <img src="../../assets/indexLogo.png" alt="">
              </div>
              <div class="title" v-else @click="goBackBtn">
                <img src="../../assets/return.png" alt="" class="back">
                <span>返回</span>
              </div>
              <div class="tabs" v-if="!resetUser">
                <span :class="tabIndex == 1 ? 'active' : ''" @click="tabChange(1)">密码登录</span>
                <span :class="tabIndex == 2 ? 'active' : ''" @click="tabChange(2)">验证码登录</span>
              </div>
              <div class="lists" v-if="tabIndex == 1 && !resetUser">
                <div class="list">
                  <input name="phone" type="tel" min="1" placeholder="请输入11位手机号" v-model="phone" @focus="onFocus" maxlength="11"/>
                </div>
                <div class="list">
                  <input type="number" placeholder="请输入6位密码" v-model="password" @focus="onFocus1"  maxlength="6"/>
                  <el-button :plain="true" class="btns" @click="forgotBtn">忘记密码</el-button>
                </div>
                <el-button type="primary" class="loginBtn" :loading="loginLoading"  @click="login()" >确认登录</el-button>
              </div>
              <div class="lists" v-else-if="tabIndex == 2 && !resetUser">
                <div class="list">
                  <input name="phone" type="tel" min="1" placeholder="请输入11位手机号" v-model="phone" @focus="onFocus" maxlength="11"/>
                  <el-button :plain="true" v-if="btntxt != '获取验证码' && btntxt != '重新获取'" class="btns btning">{{btntxt}}</el-button>
                  <el-button :plain="true" @click="sendcode" :class="btntxt == '获取验证码' || btntxt == '重新获取' ? 'btns' : 'btns btning'" v-else>{{btntxt}}</el-button>
                </div>
                <div class="list">
                  <input type="number" placeholder="请输入6位验证码" v-model="code" @focus="onFocus_"  maxlength="6"/>
                </div>
                <el-button type="primary" class="loginBtn" :loading="loginLoading"  @click="login()" >确认登录</el-button>
              </div>
              <div class="lists" v-else-if="resetUser">
                <div class="list">
                  <input name="phone" type="tel" min="1" placeholder="请输入11位手机号" v-model="phone" @focus="onFocus" maxlength="11"/>
                  <el-button :plain="true" v-if="btntxt != '获取验证码' && btntxt != '重新获取'" class="btns btning">{{btntxt}}</el-button>
                  <el-button :plain="true" @click="sendcode" :class="btntxt == '获取验证码' || btntxt == '重新获取' ? 'btns' : 'btns btning'" v-else>{{btntxt}}</el-button>
                </div>
                <div class="list">
                  <input type="number" placeholder="请输入6位验证码" v-model="code" @focus="onFocus_"  maxlength="6"/>
                </div>
                <div class="list listLast">
                  <input type="number" placeholder="请输入6位数字新密码" v-model="resetPassword" @focus="onFocus2"  maxlength="6"/>
                </div>
                <el-button type="primary" class="loginBtn" :loading="resetBtnLoading"  @click="resetBtn()" >确认修改</el-button>
              </div>
            </el-col>
            <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" class="content_fl">
              <div class="key_board">
                <div class="keyBoard">
                  <div class="keyBoards">
                    <span v-for="item in keyBords"  @click="item == '清除' ? clear($event, phoneCode) : keyEntry($event, item, phoneCode)">{{item}}</span>
                    <span @click="keyCancel($event, phoneCode)"><img src="../../assets/ic_delete.png" alt=""></span>
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
  import crypto from '../../tool/aes'

  export default {
    name: 'login',
    components: {ElCol},
    data () {
      return {
        nowTime: '',
        disabled: false,
        tabIndex: 1,      // tab active
        time:0,
        btntxt: "获取验证码",
        code: '',
        phone: '',
        password: '',
        resetPassword: '',
        entryAll: false,  // 判断是否可以点击确定按钮
        getTimer: null,
        keyBords: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        phoneCode: 0,  // 0表示的是手机号输入，1表示的是验证码的输入
        loginLoading: false,
        resetUser: false,     // 是否修改密码
        resetBtnLoading: false,
      }
    },
    methods: {
      ...mapActions([
        'goto', 'getCode', 'loginEntry', 'getAllConfig', 'loginEntryMima', 'updatePassword'
      ]),

      // tab click
      tabChange(index) {
        this.code = '';
        this.tabIndex = index;
        this.phoneCode = 0;
        this.resetPassword = '';
        if (index == 1) {
          this.time = 0;
          this.btntxt = "获取验证码";
          this.disabled = false;
        }
      },

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
        }else if (type == 1) {
          if (this.code.length < 6) {
            this.code += item;
          }else {

          }
        }else if (type == 2) {
            this.password += item;
        }else {
            this.resetPassword += item;
        }
      },

      // 键盘删除事件
      keyCancel(event, type) {
        event.preventDefault();
        if (type == 0) {
          this.phone = this.phone.substr(0, this.phone.length - 1);
        }else if (type ==1) {
          this.code = this.code.substr(0, this.code.length - 1);
        }else if (type == 2) {
          this.password = this.password.substr(0, this.code.length - 1);
        }else {
          this.resetPassword = this.resetPassword.substr(0, this.code.length - 1);
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

      onFocus1(){
        this.phoneCode = 2;
      },

      onFocus2(){
        this.phoneCode = 3;
      },

      //验证手机号码部分
      sendcode(){
        let reg = 11 && /^((13|14|15|16|17|18|19)[0-9]{1}\d{8})$/;
        if(this.phone == ''){
          this.$toast({
            message: '请输入手机号码',
            iconClass: 'icon ',
          });
        }else if(!reg.test(this.phone)){
          this.$toast({
            message: '手机格式不正确',
            iconClass: 'icon ',
          });
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
          this.$toast({
            message: '请输入手机号码',
            iconClass: 'icon ',
          });
          return
        }else if(!reg.test(this.phone)){
          this.$toast({
            message: '手机格式不正确',
            iconClass: 'icon ',
          });
          return
        }else {
          if (this.tabIndex == 2) {
            if (this.code == '') {
              this.$toast({
                message: '请输入验证码',
                iconClass: 'icon ',
              });
              return
            } else if (this.code.length != 6) {
              this.$toast({
                message: '请输入６位数验证码',
                iconClass: 'icon ',
              });
              return
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
                    let userId = body.data.data.userId;
                    this.getAllConfig({
                      onsuccess: body => {
                        this.loginLoading = false;
                        if(body.data.data != null) {
                          sessionStorage.setItem('subPermissions', JSON.stringify(body.data.data[0].subPermissions));
                          this.goto('/home');
                          setTimeout(() => {
                            this.SendParameter(userId);
                          }, 1500);
                        }else {
                          this.$toast({
                            message: '该账号无权限',
                            iconClass: 'icon ',
                          });
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
                    this.$toast({
                      message: body.data.msg,
                      iconClass: 'icon ',
                    });
                  }
                },
                onfail: body => {
                  this.loginLoading = false;
                  this.$toast({
                    message: body.data.msg,
                    iconClass: 'icon ',
                  });
                },
                onerror: body => {
                  this.loginLoading = false;
                }
              })
            }
          }else {
            if (this.password == '') {
              this.$toast({
                message: '请输入密码',
                iconClass: 'icon ',
              });
              return
            } else if (this.password.length != 6) {
              this.$toast({
                message: '请输入６位数密码',
                iconClass: 'icon ',
              });
              return
            } else {
              this.loginLoading = true;
              this.loginEntryMima({
                data: {
                  phone: this.phone,
                  password: crypto.jiami(this.password)
                },
                onsuccess: body => {
                  console.log('body:',body);
                  if (body.data.code == 0 && body.data.data) {
                    sessionStorage.setItem('avatar',body.data.data.avatar);
                    sessionStorage.setItem('name',body.data.data.name);
                    sessionStorage.session_id = body.data.data.token;
                    sessionStorage.hotel_id = body.data.data.hotelId;
                    sessionStorage.hotel_Name = body.data.data.hotelName;
                    let userId = body.data.data.userId;
                    this.getAllConfig({
                      onsuccess: body => {
                        this.loginLoading = false;
                        if(body.data.data != null) {
                          sessionStorage.setItem('subPermissions', JSON.stringify(body.data.data[0].subPermissions));
                          this.goto('/home');
                          setTimeout(() => {
                            this.SendParameter(userId);
                          }, 1500);
                        }else {
                          this.$toast({
                            message: '该账号无权限',
                            iconClass: 'icon ',
                          });
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
                    this.$toast({
                      message: body.data.msg,
                      iconClass: 'icon ',
                    });
                  }
                },
                onfail: body => {
                  this.loginLoading = false;
                  this.$toast({
                    message: body.data.msg,
                    iconClass: 'icon ',
                  });
                },
                onerror: body => {
                  this.loginLoading = false;
                }
              })
            }
          }
        }
      },

      // 确认修改
      resetBtn() {
        if (this.code == '') {
          this.$toast({
            message: '请输入验证码',
            iconClass: 'icon ',
          });
          return
        } else if (this.code.length != 6) {
          this.$toast({
            message: '请输入６位数验证码',
            iconClass: 'icon ',
          });
          return
        }else if (this.resetPassword == '') {
          this.$toast({
            message: '请输入新密码',
            iconClass: 'icon ',
          });
          return
        } else if (this.resetPassword.length != 6) {
          this.$toast({
            message: '请输入６位数新密码',
            iconClass: 'icon ',
          });
          return
        }else {
          this.resetBtnLoading = true;
          this.updatePassword({
            data: {
              phone: this.phone,
              code: this.code,
              password: crypto.jiami(this.resetPassword),
            },
            onsuccess: body => {
                if (body.data.code == 0) {
                  this.$toast({
                    message: '密码设置成功，请重新登录',
                    iconClass: 'icon ',
                  });
                  this.resetUser = false;
                }else {
                  this.$toast({
                    message: body.data.msg,
                    iconClass: 'icon ',
                  });
                }
              this.resetBtnLoading = false;
            },
            onfail: body => {
              this.$toast({
                message: body.data.msg,
                iconClass: 'icon ',
              });
              this.resetBtnLoading = false;
            },
            onerror: body => {
              this.$toast({
                message: body.data.msg,
                iconClass: 'icon ',
              });
              this.resetBtnLoading = false;
            }
          })
        }
      },

      // 忘记密码
      forgotBtn() {
          this.resetUser = true;
      },

      // 返回
      goBackBtn() {
        this.resetUser = false;
      },

      SendParameter(type) {
        jsObj.sendParameter = new Date().getSeconds() + "@" + type;
        jsObj.IdentityUserInfo();
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
    .index_bg {
      position: fixed;
      z-index: 1;
      width: 100vw;
      height: 100vh;
      img {
        width: 100%;
        height: 100%;
        display: block;
      }
    }
    .content {
      position: fixed;
      z-index: 2;
      width: 100%;
      height: 100%;
      padding: 60px 80px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      .content_fl {
        position: relative;
        height: calc(100vh - 120px);
        .key_board {
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: #F7F7F7;
          border-radius: 0 16px 16px 0;
          left: 0;
          top: 0;
          .keyBoard {
            position: relative;
            width: 100%;
            height: 100%;
            .keyBoards {
              position: absolute;
              left: 50%;
              height: 50%;
              width: 511px;
              transform: translate(-50%, -50%);
              top: 50%;
              span {
                border-radius: 7.8px;
                width: 157px;
                height: 94px;
                line-height: 94px;
                text-align: center;
                background-color: #FEFFFE;
                color: #333333;
                font-size: 38px;
                margin: 0 14px 15px 0;
                cursor: pointer;
                display: inline-block;
                -moz-user-select:none;
                -ms-user-select: none;
                -webkit-user-select: none;
                user-select: none;
                -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
              }
              span:nth-of-type(2), span:nth-of-type(3), span:first-of-type {
                margin-top: 0;
              }
              span:nth-of-type(3n) {
                margin-right: 0;
              }
              span:nth-of-type(10) {
                width: 334px;
              }
              span:last-of-type {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-right: 0;
                img {
                  width: 40px;
                  height: 32px;
                  display: inline-block;
                }
              }
              span:active {
                background-color: #d6d6d6;
              }
            }
          }
        }
      }
      .content_fr {
        background-color: #fff;
        height: calc(100vh - 120px);
        border-radius: 16px 0 0 16px;
        padding: 123px 198px 0 200px;
        .title {
          margin-bottom: 88px;
          display: flex;
          align-items: center;
          img {
            width: 100%;
          }
          .back {
            width: 15px;
            height: 25px;
          }
          span {
            font-family: PingFangSC-Medium;
            font-size: 30px;
            color: #333333;
            margin-left: 5px;
          }
        }
        .tabs {
          text-align: left;
          span {
            position: relative;
            margin-right: 40px;
            /*font-family: MicrosoftYaHei;*/
            font-size: 32px;
            color: #666666;
            letter-spacing: 4px;
            padding: 12px 0;
            cursor: pointer;
          }
          .active {
            color: #1BAC18;
            font-weight: bold;
          }
          .active:after {
            content: '';
            display: inline-block;
            width: 30px;
            height: 4px;
            background: #1BAC18;
            border-radius: 2px;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: 0;
          }
        }
        .list {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin-top: 28px;
          background: #F7F7F7;
          border-radius: 14px;
          height: 100px;
          input {
            border: none;
            font-size: 28px;
            line-height: 100px;
            background-color: #F7F7F7 !important;
            color: #333;
            width: calc(100% - 200px);
            padding-left: 40px;
            border-radius: 14px 0 0 14px;
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
            font-size: 28px;
            cursor: pointer;
            width: 200px;
            padding: 20px 15px 20px 0;
            text-align: right;
          }
          .btning {
            color: #999;
          }
        }
        .list:first-of-type {
          margin-top: 53px;
        }
        .listLast {
          input {
            width: 360px;
          }
        }
        .loginBtn {
          width: 100%;
          margin-top: 56px;
          text-align: center;
          height: 78px;
          font-size: 28px;
          color: #fff;
          background: #1AAD19;
          box-shadow: 0 3px 16px 0 rgba(26,173,25,0.64);
          border-radius: 45px;
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
