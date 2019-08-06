<template>
  <div>
    <div class="policeIdentityDetail">
      <div class="detail_fl" v-if="!loadingShow">
        <div class="bgCheckTop"></div>
        <div class="goback">
          <div @click="gobanck">
            <img src="../../assets/fanhui2.png" alt="">
            <span>返回</span>
          </div>
        </div>
        <div class="detail">
          <div class="search">
            <span>房间号：</span>
            <input type="text" placeholder="请输入房间号" v-model="roomNum">
            <span class="tig" v-if="!roomShow && roomNum != ''">酒店无该房间，请重新输入</span>
          </div>
          <div class="time_origin">
            <span>拍照时间：{{datetimeparse(detail.createdTime,'YYYY/MM/DD hh:mm:ss')}}</span>
            <span>相似度：<i class="blue">{{detail.similarity}}</i></span>
          </div>
          <!--<div class="outTime">-->
            <!--<span>最晚离店时间：</span>-->
            <!--<el-date-picker-->
              <!--v-model="outTime"-->
              <!--type="datetime"-->
              <!--value-format="yyyy-MM-dd HH:mm"-->
              <!--placeholder="选择日期时间">-->
            <!--</el-date-picker>-->
          <!--</div>-->
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
      <div class="detail_fr" v-if="!loadingShow">
        <div class="keyBoard">
          <span v-for="item in keyBords" @click="item == '清除' ? clear($event) : keyEntry(item)">{{item}}</span>
          <span @click="keyCancel()"><img src="../../assets/shanchuanniu.png" alt=""></span>
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

  export default {
    name: 'policeIdentityDetail',
    components: {ElCol, loadingList},
    data () {
      return {
        loadingShow: false,  // loading
        loadingText: '加载中...', // loading text
        roomShow: false,   // 判断房间号是否正确
        loadingCheckIn: false,  // 上传旅业loading
        loadingRefund: false,  // 拒绝loading
        roomNum: '',  // 房间号
        keyBords: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '清除', '0'],   // 数字键盘
        roomList: [],  // 酒店房间所有的列表
        detail: {},   // 详情
        guestType:'LODGER',
        inputRoomNumber: '',  // 获取的房间号
        outTime: '',   // 最晚离店时间
      }
    },
    watch: {
      // 区分未处理详情还是已处理详情
      buttonGroupShow(val){
        if(val){
          this.guestType = null;
        }
      },
      guestType(val){
        if(val == "STAFF") {
          this.roomNum = '';
        }
      },
    },
    filters: {

    },
    methods: {
      ...mapActions([
        'getRoomNumberList', 'newIdentityDetail', 'rejectStatus', 'reportLvYe'
      ]),

      // 返回上一页
      gobanck() {
        this.$router.go(-1);
      },

      // 键盘事件
      keyEntry(item) {
        this.roomNum += item;
        this.roomShow = false;
        this.roomList.forEach(item=>{
          if(this.roomNum == item.room_number){
            this.roomShow = true;
          }
          return;
        });
      },

      // 键盘清空事件
      clear (event) {
        event.preventDefault();
        this.roomNum = '';
        this.roomShow = false;
      },

      // 键盘删除事件
      keyCancel () {
        if (this.roomNum.length > 0) {
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
            }
            this.loadingShow = false;
          }
        })
      },

      // 区分未处理详情还是已处理详情
      buttonGroupShow(){
        if(this.detail.reportInStatus == 'SUCCESS'||this.detail.reportInStatus == 'UNREPORTED'||this.detail.reportInStatus=='PENDING'){
          return false;
        }else {
          return true;
        }
      },

      // 拒绝事件
      isRejectDialogShow(){
        this.rejectStatus({
          status: 'REFUSED',
          identity_id: this.$route.params.id,
          onsuccess: body => {
            if (body.errcode != '' && body.errcode == 0) {
              this.$message({
                message: '拒绝成功',
                type: 'success'
              });
              this.$emit('getMessage', this.$route.params.id);
              this.gobanck();
            }else {
              this.$message.error(body.errmsg);
            }
          }
        })
      },

      // 上传旅业
      setMultiConfirm() {
        if (this.detail.similarity < 70) {
          this.$confirm('此人相似度太低, 是否确认上传?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {

          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消上传'
            });
          });
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
              roomNumber: this.detail.roomNum,//房间号
//              nights: +this.days,//入住晚数
//              inTime: this.inTimeFilter,//入住时间
//              outTime: Date.parse(this.outTimeFilter)||'',//离店时间
              guestType:this.guestType,
            },
            onsuccess: (body) => {
              if (body.errcode == 0) {
                this.$message({
                  type: 'success',
                  message: '旅业上传成功'
                });
                this.$emit('getMessage', this.$route.params.id);
                this.gobanck();
              }
            }
          })
        }
      },

    },

    mounted () {
      this.loadingShow = true;
      this.getRoomNumber();
      this.getDetail();
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

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
        width: 100vw;
        height: 20px;
        background-color: #DEE7F8;
      }
      .goback {
        padding-left: 60px;
        text-align: left;
        div {
          padding: 40px 0;
          display: inline-flex;
          align-items: center;
          img {
            width: 21px;
            height: 36px;
            display: inline-flex;
            margin-right: 10px;
          }
          span {
            color: #000;
            font-size: 36px;
          }
        }
      }
      .detail {
        padding: 0 30px;
        .search {
          border-top: 1px solid #E5E5E5;
          padding: 30px 0;
          display: flex;
          align-items: center;
          span {
            font-size: 32px;
            color: #000;
            margin-right: 30px;
          }
          input {
            border: 1px solid #979797;
            height: 88px;
            line-height: 88px;
            padding-left: 30px;
            width: 454px;
            font-size: 32px;
            color: #000;
          }
          .tig {
            margin-left: 44px;
            font-size: 28px;
            color: #F5222D;
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
            width: 400px;
            height: 400px;
            img {
              display: inline-flex;
              width: 100%;
              height: 100%;
            }
          }
          .idCard_info {
            margin-left: 60px;
            background: #F2F8FF;
            border-radius: 20px;
            height: 400px;
            padding: 0 44px 0 58px;
            width: calc(100% - 460px);
            .idCard_info_shang {
              display: flex;
              justify-content: space-between;
              .lists {
                padding: 56px 30px 0 0;
                width: calc(100% - 222px);
                .list {
                  display: flex;
                  align-items: center;
                  margin-bottom: 26px;
                  text-align: left;
                  .title {
                    font-size: 22px;
                    color: #000000;
                    opacity: 0.4;
                  }
                  .content {
                    font-size: 28px;
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
                width: 192px;
                height: 250px;
                background-color: #fff;
                margin-top: 56px;
                img {
                  display: block;
                  width: 100%;
                  height: 100%;
                }
              }
            }
            .idCard_info_xia {
              margin-top: 30px;
              .list {
                text-align: left;
                .title {
                  font-size: 22px;
                  color: #000000;
                  opacity: .4;
                }
                .content {
                  font-size: 26px;
                  color: #000000;
                  opacity: .8;
                  margin-left: 35px;
                }
              }
            }
          }
        }
        .btns {
          margin-top: 50px;
          width: 100%;
          display: flex;
          justify-content: flex-start;
          .tig_btn {
            margin-right: 98px;
            width: 480px;
            height: 98px;
            font-size: 34px;
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
      min-height: calc(100vh - 120px);
      position: relative;
      .keyBoard {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: calc(100% - 66px);
        padding: 0 33px;
        span {
          background: #D7D7D7;
          border: 1px solid #979797;
          border-radius: 3.6px;
          color: #0B0B0B;
          font-weight: bold;
          font-size: 58px;
          display: inline-block;
          width: 115px;
          height: 80px;
          line-height: 80px;
          text-align: center;
          margin-right: 27px;
          margin-bottom: 27px;
        }
        span:nth-of-type(3n) {
          margin-right: 0;
        }
        span:nth-of-type(10) {
          font-size: 38px;
          padding: 11px 0;
          height: 58px;
          margin-top: 0px;
          line-height: 70px;
        }
      }
    }
  }


</style>
