<template>
  <div>
    <div class="policeIdentityDetail">
      <div class="detail_fl" v-if="!loadingShow" :style="buttonGroupShow ? detailFlWidth[0] : detailFlWidth[1]">
        <div class="bgCheckTop"></div>
        <div class="goback">
          <div @click="gobanck">
            <img src="../../assets/fanhui1.png" alt="">
            <span>返回</span>
          </div>
        </div>
        <div class="detail">
          <div class="search">
            <span>房间号：</span>
            <input type="text" placeholder="请输入房间号" :value="detail.roomNumber ? detail.roomNumber : '无'" disabled v-if="!buttonGroupShow">
            <input type="text" placeholder="请输入房间号" v-model="roomNum" v-else @input="changeKeyBords">
            <span class="tig" v-if="!roomShow && roomNum != ''">酒店无该房间，请重新输入</span>
          </div>
          <div class="outTime" v-if="buttonGroupShow">
            <span>最晚离店时间：</span>
            <DatePicker
              type="datetime"
              format="yyyy/MM/dd HH:mm"
              placeholder="请选择最晚离店时间"
              :value="outTime"
              @on-change="datePickerTime"
              >
            </DatePicker>
            <i><img src="../../assets/gengduo.png" alt=""></i>
          </div>
          <div class="outTime" v-else>
            <span>最晚离店时间：</span>
            <div v-if="!buttonGroupShow" class="outtime">{{outTime}}</div>
            <i><img src="../../assets/gengduo.png" alt=""></i>
          </div>
          <div class="time_origin">
            <span>拍照时间：{{datetimeparse(detail.createdTime,'YYYY/MM/DD hh:mm:ss')}}</span>
            <span  v-if="hotelConfig.show_similarity==='true'">相似度：<i class="blue">{{detail.similarity}}%</i></span>
          </div>
          <div class="detail_content">
            <div class="now_info">
              <img :src="detail.livePhoto" alt="">
            </div>
            <div class="idCard_info">
              <div class="idCard_info_shang">
                <div class="lists">
                  <div class="list">
                    <span class="title">姓名</span>
                    <span class="content">{{detail.name}}</span>
                  </div>
                  <div class="list">
                    <span class="title">性别</span>
                    <span class="content">{{detail.sex}}</span>
                    <span class="title">民族</span>
                    <span class="content">{{detail.ethnicity}}</span>
                  </div>
                  <div class="list">
                    <span class="title">住址</span>
                    <span class="content">{{detail.address}}</span>
                  </div>
                </div>
                <div class="idCard_img">
                  <img :src="detail.photo" alt="">
                </div>
              </div>
              <div class="idCard_info_xia">
                <div class="list">
                  <span class="title">公民身份号码</span>
                  <span class="content">{{detail.idCard ? idnumber(detail.idCard) : ''}}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="btns" v-if="buttonGroupShow">
            <el-button type="danger" class="tig_btn btn_danger" :loading="loadingRefund"  @click="isRejectDialogShow">拒绝</el-button>
            <el-button type="primary" class="tig_btn btn_success" :loading="loadingCheckIn"  @click="setMultiConfirm" v-if="roomShow && guestType!=='STAFF'">{{detail.reportInStatus && detail.reportInStatus === 'FAILED'? '重新上传旅业系统' : '上传旅业系统'}}</el-button>
            <el-button type="primary" class="tig_btn tig_info"  v-else>{{detail.reportInStatus && detail.reportInStatus === 'FAILED'? '重新上传旅业系统' : '上传旅业系统'}}</el-button>
          </div>
        </div>
      </div>
      <div class="detail_fr" v-if="!loadingShow && buttonGroupShow">
        <div>
          <div class="fast_title">
            <img src="../../assets/xiantiao.png" alt="">
            输入房号
          </div>
          <div class="changTabs">
            <span :class="changeTabFr == 1 ? 'active' : ''" @click="changeTabClick(1)">数字</span>
            <span :class="changeTabFr == 2 ? 'active' : ''" @click="changeTabClick(2)">英文</span>
          </div>
          <div class="change_tabs">
            <div class="tab" v-if="changeTabFr == 1">
              <div class="keyBoard2">
                <span v-for="item in keyBords2" @click="item == '清除' ? clear($event) : keyEntry($event, item)">{{item}}</span>
                <span @click="keyCancel()"><img src="../../assets/shanchuanniu.png" alt=""></span>
              </div>
            </div>
            <div class="tab" v-else>
              <div class="keyBoard">
                <span v-for="item in keyBords1" @click="keyEntry($event, item)">{{item}}</span>
                <span @click="keyCancel()"><img src="../../assets/shanchuanniu.png" alt=""></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 相似度太低提示框-->
      <div class="lowsimilarity" v-if="lowsimilarity">
        <div class="shadow"></div>
        <div class="similarityContent">
          <div class="title">
            <img src="../../assets/guanbi.png" alt="" @click="cancelsimilarity">
          </div>
          <div class="content">
            <img src="../../assets/xiangsidutaidi.png" alt="">
            <p>此人相似度太低，是否确认上传？</p>
            <div class="btns">
              <el-button type="primary" class="btn" :loading="similarityCancel" @click="cancelsimilarity()">取消</el-button>
              <el-button type="primary" class="btn" :loading="similaritySure" @click="suresimilarity()">确认</el-button>
            </div>
          </div>
        </div>
      </div>
      <loadingList v-if="loadingShow" :loadingText="loadingText"  style="width: 100vw"></loadingList>
    </div>
  </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex';
  import ElCol from "element-ui/packages/col/src/col";
  import loadingList from './loading.vue'
  import {DatePicker} from 'iview'

  export default {
    name: 'policeIdentityDetail',
    components: {ElCol, loadingList,DatePicker},
    data () {
      return {
        loadingShow: false,  // loading
        loadingText: '加载中...', // loading text
        roomShow: false,   // 判断房间号是否正确
        loadingCheckIn: false,  // 上传旅业loading
        loadingRefund: false,  // 拒绝loading
        roomNum: '',  // 房间号
        changeTabFr: 1,  // 右侧筛选tab切换
        keyBords1: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K','L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],     // 字母键盘
        keyBords2: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '清除', '0'],   // 数字键盘
        roomList: [],  // 酒店房间所有的列表
        detail: {},   // 详情
        guestType:'LODGER',
        inputRoomNumber: '',  // 获取的房间号
        outTime: '',   // 最晚离店时间
        inTimeFilter: Date.parse(new Date()),
        days: 1,
        buttonGroupShow: false, // 区分待处理还是已处理的详情
        detailFlWidth: ["width: calc(100vw - 560px);", "width: calc(100vw - 80px);"],
        hotelConfig: {},  // 权限
        similarityCancel: false,  // 相似度太低弹框取消loading
        similaritySure: false,    // 相似度太低弹框确认loading
        lowsimilarity: false,     // 相似度太低提示
      }
    },
    watch: {

    },
    filters: {

    },
    methods: {
      ...mapActions([
        'getRoomNumberList', 'newIdentityDetail', 'rejectStatus', 'reportLvYe'
      ]),

      // 返回上一页
      gobanck() {
//        this.$router.go(-1);
        this.$router.replace({name:'policeIdentity'})
      },

      // 日期选择
      datePickerTime(val) {
        this.outTime = val;
        console.log('datePickerTime', val);
      },

      // 键盘事件
      changeKeyBords () {
        this.roomShow = false;
        this.roomList.forEach(item=>{
          if(this.roomNum == item.room_number){
            this.roomShow = true;
          }
          return;
        });
      },


      // 右侧筛选tab切换
      changeTabClick(index) {
        this.changeTabFr = index;
      },

      // 字母键盘事件
      keyEntry(event, item) {
        event.preventDefault();
        if (this.buttonGroupShow) {
          this.roomNum += item;
          this.roomShow = false;
          this.roomList.forEach(item=>{
            if(this.roomNum == item.room_number){
              this.roomShow = true;
            }
            return;
          });
        }
      },

      // 键盘清空事件
      clear (event) {
        event.preventDefault();
        if (this.buttonGroupShow) {
          this.roomNum = '';
          this.roomShow = false;
        }
      },

      // 键盘删除事件
      keyCancel () {
        if (this.roomNum.length > 0 && this.buttonGroupShow) {
          this.roomNum = this.roomNum.substr(0, this.roomNum.length - 1);
          this.roomShow = false;
          this.roomList.forEach(item=>{
            if(this.roomNum == item.room_number){
              this.roomShow = true;
            }
            return;
          });
        }
      },

      // 获取酒店房间列表
      getRoomNumber() {
          this.getRoomNumberList({
            onsuccess: body => {
                if (body.errcode == 0) {
                  this.roomList = body.data;
                }
            }
          })
      },

      // 获取详情
      getDetail() {
        this.newIdentityDetail({
          identity_id: this.$route.params.id,
          onsuccess: body => {
            if (body.errcode == 0) {
              this.detail = body.data.content;
              this.hotelConfig = body.data.config;
              this.inTimeFilter = this.detail.reportInTime ? this.detail.reportInTime : Date.parse(new Date());
              if(!this.detail.outTime || this.detail.outTime==''){
                let today = new Date().getDate()+1;
                let tomorrow = new Date(new Date(new Date().setDate(today)).setHours(12)).setMinutes(0);
                this.outTime = this.datetimeparse(tomorrow,"YYYY/MM/DD hh:mm");
              }else {
                this.outTime = this.datetimeparse(this.detail.outTime, 'YYYY/MM/DD hh:mm');
              }
              this.days = this.getAll(this.inTimeFilter, Date.parse(this.outTime));
            }
            this.buttonGroup();
            this.loadingShow = false;
          },
          onerror: error => {
            this.loadingShow = false;
          }
        })
      },

      // 计算两时间戳之间天数
      getAll(beginTime, endTime) {
        let totalDay = Math.abs(endTime - beginTime) / 1000;
        let days = Math.floor(totalDay/3600/24);
        return days
      },

      // 区分未处理详情还是已处理详情
      buttonGroup(){
        if(this.detail.reportInStatus == 'SUCCESS'||this.detail.reportInStatus == 'UNREPORTED'||this.detail.reportInStatus=='PENDING'){
          this.buttonGroupShow = false;
        }else {
          this.buttonGroupShow = true;
        }
      },

      // 拒绝事件
      isRejectDialogShow(){
        this.loadingRefund = true;
        this.rejectStatus({
          status: 'REFUSED',
          identity_id: this.detail.identityId,
          onsuccess: body => {
            if (body.errcode != '' && body.errcode == 0) {
              this.$message({
                message: '拒绝成功',
                type: 'success'
              });
//              this.$toast({
//                message: '拒绝成功',
//                iconClass: 'icon ',
//              });
              this.$emit('getMessage', this.$route.params.id);
              this.gobanck();
            }else {
//              this.$message.error(body.errmsg);
              this.$toast({
                message: body.errmsg,
                iconClass: 'icon ',
              });
            }
            this.loadingRefund = false;
          },
          onfail: body => {
            this.loadingRefund = false;
          },
          onerror: error => {
            this.loadingRefund = false;
          }
        })
      },

      // 相似度太低确认框
      suresimilarity() {
        this.similaritySure = true;
        let getRoom_id='';
        let room = this.detail.roomNum;
        this.roomList.forEach(item=>{
          if(room == item.room_number){
            getRoom_id= item.room_id;
          }
          return;
        });
        this.reportLvYe({
          data:{
            roomId: getRoom_id || '',
            mobile:'',
            lvyeReportRecordIds: this.detail.lvyeReportRecordId.split(' '),//旅业上报记录Id
            roomNumber: this.roomNum,//房间号
            nights: this.days,//入住晚数
            inTime: this.inTimeFilter,//入住时间
            outTime: Date.parse(this.outTime),//离店时间
            guestType:this.guestType,
          },
          onsuccess: (body) => {
            if (body.errcode == 0) {
              this.$toast({
                message: '正在上传旅业',
                iconClass: 'icon ',
              });
              this.$emit('getMessage', this.$route.params.id);
              this.gobanck();
            }
            this.lowsimilarity = false;
            this.similaritySure = false;
            this.loadingCheckIn = false;
          },
          onfail: body => {
            this.lowsimilarity = false;
            this.similaritySure = false;
            this.loadingCheckIn = false;
          },
          onerror: error => {
            this.lowsimilarity = false;
            this.similaritySure = false;
            this.loadingCheckIn = false;
          }
        });
      },

      // 相似度太低取消框
      cancelsimilarity() {
        this.similarityCancel = true;
        setTimeout(() => {
          this.loadingCheckIn = false;
          this.similarityCancel = false;
          this.lowsimilarity = false;
        },500);
      },

      // 上传旅业
      setMultiConfirm() {
        this.loadingCheckIn = true;
        if (this.detail.similarity < 70) {
          this.lowsimilarity = true;
        }else {
          let getRoom_id='';
          let room = this.detail.roomNum;
          this.roomList.forEach(item=>{
            if(room == item.room_number){
              getRoom_id= item.room_id;
            }
            return;
          });
          this.reportLvYe({
            data:{
              roomId: getRoom_id || '',
              mobile:'',
              lvyeReportRecordIds: this.detail.lvyeReportRecordId.split(' '),//旅业上报记录Id
              roomNumber: this.roomNum,//房间号
              nights: this.days,//入住晚数
              inTime: this.inTimeFilter,//入住时间
              outTime: Date.parse(this.outTime),//离店时间
              guestType:this.guestType,
            },
            onsuccess: (body) => {
              if (body.errcode == 0) {
//                this.$message({
//                  type: 'success',
//                  message: '正在上传旅业'
//                });
                this.$toast({
                  message: '正在上传旅业',
                  iconClass: 'icon ',
                });
                this.$emit('getMessage', this.$route.params.id);
                this.gobanck();
              }
              this.loadingCheckIn = false;
            },
            onfail: body => {
              this.loadingCheckIn = false;
            },
            onerror: error => {
              this.loadingCheckIn = false;
            }
          });
        }
      },

    },

    mounted () {
      this.loadingShow = true;
      this.getRoomNumber();
      this.getDetail();
    },
    beforeRouteLeave (to, from, next) {
      this.loadingShow = false;
      next();
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>

  .policeIdentityDetail {
    width: 100vw;
    padding-top: 100px;
    display: flex;
    justify-content: space-between;
    .detail_fl {
      width: calc(100vw - 560px);
      background-color: #fff;
      min-height: calc(100vh - 120px);
      box-shadow: 0 8px 16px 0 rgba(0,0,0,0.10);
      margin-left: 40px;
      .bgCheckTop {
        height: 20px;
        background-color: #DEE7F8;
      }
      .goback {
        padding-left: 60px;
        text-align: left;
        div {
          padding: 24px 0;
          display: inline-flex;
          align-items: center;
          img {
            width: 18px;
            height: 30px;
            display: inline-flex;
            margin-right: 10px;
          }
          span {
            color: #1AAD19;
            font-size: 30px;
          }
        }
      }
      .detail {
        padding: 0 50px;
        .search {
          border-top: 1px solid #E5E5E5;
          padding: 30px 0;
          display: flex;
          align-items: center;
          span {
            font-size: 30px;
            color: #000;
            text-align: left;
          }
          span:first-of-type {
            width: 250px;
            margin-right: 12.5px;
          }
          input {
            border: 1px solid #979797;
            height: 72px;
            line-height: 72px;
            padding-left: 30px;
            width: 480px;
            font-size: 30px;
            color: #000;
            background-color: #fff;
            outline: none;
          }
          .tig {
            margin-left: 44px;
            font-size: 28px;
            color: #F5222D;
          }
        }
        .outTime {
          font-size: 30px;
          color: #000;
          text-align: left;
          margin-bottom: 30px;
          position: relative;
          span {
            width: 250px;
            display: inline-block;
          }
          .outtime {
            display: inline-block;
            width: 480px;
            font-size: 30px;
            color: #000;
            border: 1px solid #979797;
            height: 72px;
            line-height: 72px;
            padding-left: 30px;
          }
          i {
            position: absolute;
            left: 680px;
            top: 50%;
            transform: translateY(-50%);
            img {
              width: 14px;
              display: inline-block;
            }
          }
        }
        .time_origin {
          font-size: 28px;
          color: #000000;
          opacity: .4;
          text-align: left;
          span {
            margin-right: 57px;
          }
          i {
            font-style:normal;
            font-size: 30px;
            color: #1AAD19;
          }
        }
        .detail_content {
          display: flex;
          align-items: center;
          margin-top: 30px;
          .now_info {
            width: 320px;
            height: 320px;
            img {
              display: inline-flex;
              width: 100%;
              height: 100%;
              border-radius: 20px;
            }
          }
          .idCard_info {
            margin-left: 60px;
            background: #F2F8FF;
            border-radius: 20px;
            height: 320px;
            padding: 0 44px 0 46px;
            width: 514px;
            .idCard_info_shang {
              display: flex;
              justify-content: space-between;
              .lists {
                padding: 36px 26px 0 0;
                width: calc(100% - 154px);
                .list {
                  display: flex;
                  align-items: center;
                  margin-bottom: 18px;
                  text-align: left;
                  .title {
                    font-size: 18px;
                    color: #000000;
                    opacity: 0.4;
                  }
                  .content {
                    font-size: 18px;
                    color: #000000;
                    opacity: .8;
                    margin: 0 27px 0 25px;
                  }
                }
                .list:last-of-type {
                  align-items: flex-start;
                  .title {
                    display: inline-flex;
                    width: 44px;
                  }
                  .content {
                    display: inline-flex;
                    width: calc(100% - 96px);
                  }
                }
              }
              .idCard_img {
                width: 154px;
                height: 200px;
                background-color: #fff;
                margin-top: 36px;
                img {
                  display: block;
                  width: 100%;
                  height: 100%;
                }
              }
            }
            .idCard_info_xia {
              margin-top: 20px;
              .list {
                text-align: left;
                .title {
                  font-size: 18px;
                  color: #000000;
                  opacity: .4;
                }
                .content {
                  font-size: 18px;
                  color: #000000;
                  opacity: .8;
                  margin-left: 35px;
                }
              }
            }
          }
        }
        .btns {
          margin-top: 40px;
          width: 100%;
          display: flex;
          justify-content: flex-start;
          .tig_btn {
            margin-right: 80px;
            width: 390px;
            height: 80px;
            font-size: 28px;
            color: #fff;
            border-radius: 49px;
            border: none;
          }
          .btn_danger {
            background-color: #F5222D;
          }
          .btn_success {
            background-color: #1AAD19;
          }
          .tig_info {
            background-color: #d7d7d7;
            color: #a4a4a4;
          }
        }
      }
    }
    .detail_fr {
      width: 480px;
      background-color: #fff;
      .fast_title {
        position: relative;
        margin: 40px 0;
        font-size: 28px;
        color: #303133;
        text-align: center;
        font-weight: bold;
        img {
          position: absolute;
          left: 30px;
          top: 9px;
          width: calc(100% - 60px);
        }
      }
      .changTabs {
        border-bottom: 1px solid #D8D8D8;
        display: flex;
        justify-content: space-around;
        align-items: center;
        span {
          padding: 52px 0 10px;
          display: inline-block;
          position: relative;
          color: #909399;
          font-size: 24px;
          cursor: pointer;
          font-weight: bold;
        }
        span.active {
          color: #1AAD19;
        }
        span.active:after {
          content: '';
          display: block;
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #1AAD19;
        }
      }
      .change_tabs {
        padding: 40px 15px 0;
        .tab {
          .input {
            padding: 30px 0;
            position: relative;
            input {
              border: 1px solid #9A9A9A;
              border-radius: 44px;
              padding-left: 30px;
              font-size: 20px;
              color: #333;
              height: 64px;
              line-height: 64px;
              width: calc(100% - 30px);
              outline: none;
            }
            input:-moz-placeholder {
              font-size: 20px;
              color: #606266;
            }
            input:-ms-input-placeholder {
              font-size: 20px;
              color: #606266;
            }
            input::-moz-placeholder {
              font-size: 20px;
              color: #606266;
            }
            input::-webkit-input-placeholder {
              font-size: 20px;
              color: #606266;
            }
            img {
              position: absolute;
              right: 20px;
              top: 50%;
              display: inline-block;
              width: 40px;
              height: 40px;
              transform: translateY(-50%);
              cursor: pointer;
            }
          }
        }
      }
      .keyBoard {
        span {
          display: inline-block;
          border: 1px solid #dcdcdc;
          background-color: #f0f0f0;
          border-radius: 12px;
          width: 78px;
          height: 56px;
          font-size: 36px;
          line-height: 56px;
          text-align: center;
          font-weight: bold;
          margin: 0 42px 22px 0;
          cursor: pointer;
          -moz-user-select:none;
          -ms-user-select: none;
          -webkit-user-select: none;
          user-select: none;
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        }
        span:nth-of-type(4n) {
          margin-right: 0;
        }
        span:last-of-type {
          width: 194px;
          margin-right: 0;
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
      .keyBoard2 {
        span {
          width: 110px;
          height: 78px;
          line-height: 78px;
          text-align: center;
          background-color: #f0f0f0;
          border-radius: 12px;
          font-size: 34px;
          margin: 0 25px 25px 0;
          cursor: pointer;
          display: inline-block;
          font-weight: bold;
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        }
        span:nth-of-type(3n) {
          margin-right: 0;
        }
        span:nth-of-type(10) {
          font-size: 28px;
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
    .detail_fr>div {
      position: fixed;
      top: 100px;
      right: 0;
      width: 480px;
      height: calc(100vh - 100px);
      background-color: #fff;
    }
    .lowsimilarity {
      .shadow {
        position: fixed;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .6);
      }
      .similarityContent {
        background: #FFFFFF;
        border-radius: 20px;
        width: 960px;
        padding: 0 25px;
        position: fixed;
        z-index: 12;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        .title {
          display: flex;
          justify-content: flex-end;
          padding: 40px 35px;
          img {
            width: 24px;
            height: 24px;
            display: block;
          }
        }
        .content {
          text-align: center;
          img {
            width: 260px;
            display: block;
            margin: 0 auto;
          }
          p {
            margin-top: 32px;
            color: #606266;
            font-size: 36px;
          }
          .btns {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 52px 135px;
            .btn {
              font-size: 30px;
              border: 2px solid #1AAD19;
              border-radius: 44px;
              height: 88px;
              width: 264px;
            }
            .btn:first-of-type {
              background-color: #fff;
              color: #1AAD19;
            }
            .btn:last-of-type {
              background: #1AAD19;
              color: #fff;
            }
          }
        }
      }
    }
  }


</style>
