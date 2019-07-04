<template>
    <div>
      <div class="login">
        <div class="header">
          <!--<div class="img"><img src="../../assets/zhoujijiudian.png" alt=""></div>-->
          <div class="timer">{{nowTime}}</div>
        </div>
        <div class="content">
          <el-row >
            <el-col :xs="10" :sm="10" :md="10" :lg="10" :xl="10" class="content_fl">
              <p>欢迎使用</p>
              <p>智慧接待前台</p>
              <div class="img">
                <img src="../../assets/huanying.png" alt="">
              </div>
            </el-col>
            <el-col :xs="10" :sm="10" :md="10" :lg="10" :xl="10" :offset="2" class="content_fr">
              <p>请输入手机号登录</p>
              <div class="phone">
                <i><img src="../../assets/zhanghao.png" alt=""></i>
                <input name="phone" type="tel" min="1" id="input_id" placeholder="请输入11位手机号" v-model="phone"  ref="keyboard" @focus="onFocus($event)" />
                <el-button :plain="true" v-if="btntxt != '获取验证码' && btntxt != '重新获取'" class="btns btning">{{btntxt}}</el-button>
                <el-button :plain="true" @click="sendcode" :class="btntxt == '获取验证码' || btntxt == '重新获取' ? 'btns' : 'btns btning'" v-else>{{btntxt}}</el-button>
              </div>
              <div class="code">
                <i><img src="../../assets/mima.png" alt=""></i>
                <input type="number" placeholder="请输入6位验证码" v-model="code"   ref="keyboard_" @focus="onFocus_($event)"/>
              </div>
              <p class="login"  @click="login">登录</p>
            </el-col>
          </el-row>
          <keyboard :option="option" @keyVal="getInputValue" @close="option.show=false"></keyboard>
          <keyboard :option="option_" @keyVal="getInputValue_" @close="option_.show=false"></keyboard>
        </div>
      </div>
    </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex';
  import ElCol from "element-ui/packages/col/src/col";
  import Keyboard from '../keyboard.vue'

  export default {
    name: 'login',
    components: {ElCol, Keyboard},
    data () {
      return {
        nowTime: '',
        disabled:false,
        time:0,
        btntxt: "获取验证码",
        code: '',
        phone: '',
        entryAll: false,  // 判断是否可以点击确定按钮
        option: {
          show: false,
          sourceDom: ''
        },
        option_: {
          show: false,
          sourceDom: ''
        },
        getTimer: null,
      }
    },
    methods: {
      ...mapActions([
        'goto', 'getCode', 'loginEntry'
      ]),

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

      onFocus(ev){
//      document.activeElement.blur();//禁止默认键盘
        this.$set(this.option,'show',true)
        this.$set(this.option,'sourceDom',this.$refs['keyboard'])
      },

      onFocus_(ev){
//      document.activeElement.blur();//禁止默认键盘
        this.$set(this.option_,'show',true)
        this.$set(this.option_,'sourceDom',this.$refs['keyboard_'])
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
        let reg = 11 && /^((13|14|15|16|17|18)[0-9]{1}\d{8})$/;
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
              if (body.data.code == 0) {
                if (body.data.data == '' || body.data.data == null) {
                  this.timer();
                }
                if (body.data.data.code != 0) {
                  this.$message.error(body.data.data.msg);
                }
              }else {
                this.$message.error(body.data.data.msg);
              }
            },
            onfail: body => {
              this.$message.error(body.data.msg);
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
        let reg = 11 && /^((13|14|15|16|17|18)[0-9]{1}\d{8})$/;
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
            this.loginEntry({
              data: {
                phone: this.phone,
                code: this.code
              },
              onsuccess: body => {
                console.log('body:',body);
                if (body.data.code == 0) {
                  sessionStorage.setItem('avatar',body.data.data.avatar);
                  sessionStorage.setItem('name',body.data.data.name);
                  sessionStorage.session_id = body.data.data.token;
                  sessionStorage.hotel_id = body.data.data.hotelId;
                  this.goto('/home');
                }else {
                  this.$message.error(body.data.msg);
                }
              },
              onfail: body => {
                this.$message.error(body.data.msg);
              }
            })
          }
        }
      },
    },

    mounted () {
       this.nowTime = this.getDateTime();
       this.getTimer = setInterval(() => {
         this.nowTime = this.getDateTime();
       },1000)
    },
    beforeRouteLeave(to,from,next) {
      clearInterval(this.getTimer);
      next();
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .login {
    .header {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 0 40px;
      height: 150px;
      background: #FFFFFF;
      box-shadow: 0 11px 44px 0 rgba(0,0,0,0.07);
      .img {
        height: 94px;
        img {
          display: inline-flex;
          height: 100%;
        }
      }
      .timer {
        color: #909399;
        font-size: 34px;
      }
    }
    .content {
      padding: 70px 70px 0;
      .content_fl {
        p {
          font-size: 48px;
          color: #606266;
          margin: 0;
          text-align: left;
        }
        .img {
          margin-top: 70px;
          img {
            display: block;
            width: 100%;
          }
        }
      }
      .content_fr {
        p {
          color: #606266;
          opacity: .8;
          font-size: 30px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.04);
          margin: 80px 0 20px;
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
            font-size: 20px;
            line-height: 30px;
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
            font-size: 20px;
            cursor: pointer;
          }
        }
        .login {
          margin-top: 56px;
          text-align: center;
          height: 60px;
          line-height: 60px;
          font-size: 22px;
          color: #fff;
          border-radius: 50px;
          background-color: #1AAD19;
          cursor: pointer;
          display: block;
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
