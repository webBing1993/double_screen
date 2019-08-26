<template>
  <div>
    <div class="checkIn" v-show="checkInShow">
      <div class="check_fl">
        <div class="bgCheckTop"></div>
        <div class="check_fl_content">
          <div class="goback">
            <div @click="gobanck">
              <img src="../../assets/fanhui1.png" alt="">
              <span>返回</span>
            </div>
          </div>
          <div class="checkInChange">
            <div class="checkIn_header">
              <!--<div class="order_origin">-->
              <!--订单来源：{{changeItem.sourceId ? changeItem.sourceId : '-'}}-->
              <!--</div>-->
              <div class="order_info">
                <div class="order_person">
                  <img src="../../assets/renyuan.png" alt="">
                  <span>{{changeItem.owner}}</span>
                  <span>{{changeItem.ownerTel}}</span>
                </div>
                <div class="order_remark">备注：{{changeItem.remark ? changeItem.remark : '-'}}</div>
              </div>
            </div>
            <div class="checkIn_content" v-if="changeItem.type == 0">
              <div class="lists">
                <div class="list" v-if="cardShow">
                  <div class="title">是否需要发房卡：</div>
                  <div class="changeItem">
                    <div class="item_tab" @click="changeStatus(1, 1)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="isfaka">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span>发卡</span>
                    </div>
                    <div class="item_tab" @click="changeStatus(2, 1)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="!isfaka">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span>不发卡</span>
                    </div>
                  </div>
                </div>
                <div class="list" v-if="rcShow">
                  <div class="title">是否需要RC单：</div>
                  <div class="changeItem">
                    <div class="item_tab" @click="changeStatus(1, 2)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="isrcpdf">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span>需要</span>
                    </div>
                    <div class="item_tab" @click="changeStatus(2, 2)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="!isrcpdf">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span>不需要</span>
                    </div>
                  </div>
                </div>
                <div class="list">
                  <div class="title">是否需要手机号：</div>
                  <div class="changeItem">
                    <div class="item_tab" @click="changeStatus(1, 3)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="isphone">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span>需要</span>
                    </div>
                    <div class="item_tab" @click="changeStatus(2, 3)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="!isphone">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span>不需要</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="btns">
                <el-button type="danger" round :loading="loadingCancel" @click="gobanck()">取消办理</el-button>
                <el-button type="primary" round :loading="loadingSure" @click="checkIn()">开始办理</el-button>
              </div>
            </div>
            <div class="checkIn_content checkIn_content_" v-else>
              <div class="lists">
                <div class="list">
                  <div class="title"><span>总房费：</span><span>{{(roomFeeShow/100).toFixed(2)}}元</span></div>
                  <div class="changeItem">
                    <div class="item_tab" @click="payModeChange(1)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="payMode == 1">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span>当面付</span>
                    </div>
                    <div class="item_tab" @click="payModeChange(2)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="payMode == 2">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span>已预付</span>
                    </div>
                    <div class="item_tab" @click="payModeChange(3)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="payMode == 3">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span>挂账</span>
                    </div>
                  </div>
                </div>
                <div class="list">
                  <div class="title"><span>押金：</span><span>{{(cashFee/100).toFixed(2)}}元</span></div>
                  <div class="changeItem">
                    <div class="item_tab" @click="changeFreeDeposit(1)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="cashFeeTrue || changeItem.isFreeDeposit">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span>免押金</span>
                    </div>
                    <div class="item_tab" @click="changeFreeDeposit(2)"  v-if="!cashFeeTrue">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="!changeItem.isFreeDeposit">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span>收押金</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="btns">
                <el-button type="danger" round :loading="loadingCancel" @click="gobanck()">取消办理</el-button>
                <el-button type="primary" round :loading="loadingSure" @click="checkIn()" v-if="changeItem.type == 0">开始办理</el-button>
                <el-button type="primary" round :loading="loadingSure" @click="checkIn()" v-if="changeItem.type == 1 && payMode != 0">开始办理</el-button>
                <el-button type="primary" class="tig_info" round :loading="loadingSure" v-if="changeItem.type == 1 && payMode == 0">开始办理</el-button>
              </div>
            </div>
          </div>
        </div>
        <div class="bgCheckTop"></div>
      </div>
      <div class="check_fr">
        <div>
          <div class="fast_title">
            <img src="../../assets/xiantiao.png" alt="">
            待入住房间
          </div>
          <div class="roomLists">
            <div class="list" v-for="item in rooms">
              <div class="title" @click="roomListShow(item)">
                <span>{{item.roomTypeName}}（{{item.count}}）</span>
                <img src="../../assets/shouqi.png" alt="" v-if="!item.roomList">
                <img src="../../assets/zhankai.png" alt="" v-else>
              </div>
              <div class="content"  v-if="item.roomList">
                <div class="lis">
                  <span class="li" v-for="i in item.roomNo">{{i}}</span>  <!-- <i>脏</i>-->
                </div>
              </div>
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
  export default {
    components: {ElCol, loadingList},
    name: 'checkIn',
    data () {
      return {
        loadingShow: false,  // loading
        loadingText: '加载中...', // loading text
        isfaka: false,   // 是否发卡
        isrcpdf: false,  // 是否需要RC单
        isphone: false,  // 是否需要手机号
        loadingCancel: false, // 取消办理按钮加载状态
        loadingSure: false,  // 办理入住按钮加载状态
        changeItem: '',   // 临时数据
        checkInShow: false,  // 模块显示隐藏
        roomFeeShow: 0,  // 总房费
        paidFeeShow: 0,  // 已付房费
        cashFee: 0,      // 押金
        cashFeeTrue: false,  // 判断是否有无押金配置
        payMode: 0,  // 判断房费支付状态
        cardShow: false,  // 发卡dab权限
        rcShow: false,    // rc单dab权限
        rooms: [],  // 房间号列表
      }
    },
    methods: {
      ...mapActions([
         'checkInGetOptions', 'checkInPostOptions', 'getOrderFree', 'updatePaidMode', 'cardRule', 'getRooms'
      ]),

      // 返回上一页
      gobanck() {
//        this.$router.go(-1);
        this.$router.replace({name:'order'})
      },

      // 办理选择
      changeStatus(status, type) {
        if (type == 1) {
          if (status == 1) {
              this.isfaka = true;
          }else {
              this.isfaka = false;
          }
        }else if (type == 2) {
          if (status == 1) {
            this.isrcpdf = true;
          }else {
            this.isrcpdf = false;
          }
        }else {
          if (status == 1) {
            this.isphone = true;
          }else {
            this.isphone = false;
          }
        }
      },

      // 房费更改
      payModeChange(index) {
        this.payMode = index;
      },

      // 选择是否免押金
      changeFreeDeposit(num) {
        if (num == 1) {
          this.changeItem.isFreeDeposit = true;
        }else {
          this.changeItem.isFreeDeposit = false;
        }
      },

      // 开始办理
      checkIn() {
        this.loadingSure = true;
        if (this.changeItem.type == 0) {
          this.checkInPostOptions({
            orderId: this.$route.params.id,
            data: {
              sendCard: this.isfaka,
              printRc: this.isrcpdf,
              needPhoneNum: this.isphone,
              hotelId: sessionStorage.hotel_id
            },
            onsuccess: body => {
              if (body.data.code == 0) {
                this.SendTeamOrderMessage(this.changeItem.id, this.changeItem.subOrderId, this.isfaka, this.isrcpdf, this.isphone, false)
              }
              this.loadingSure = false;
              this.gobanck();
            },onfail: body => {
              this.loadingSure = false;
            }
          });
        }else {
          this.updatePaidMode({
            orderId: this.changeItem.id,
            isFreeDeposit: this.changeItem.isFreeDeposit,
            modeId: this.payMode,
            onsuccess: body => {
              this.loadingShow = false;
              if (body.data.code == 0) {
                this.loadingSure = false;
                this.OpenExternalScreen('SendMessage@'+this.changeItem.id+'');
                this.gobanck();
              }
            },
            onfail: (body, headers) => {
              this.loadingSure = false;
            }
          });
        }
      },

      OpenExternalScreen(type) {
        document.title = new Date().getSeconds() + "@" + type;
      },

      SendTeamOrderMessage(orderId, subOrderId, fakaStatus, rcStatus, phoneStatus, status) {
        document.title = new Date().getSeconds() + "@SendTeamOrderMessage@" + orderId + '@' + subOrderId + '@' + fakaStatus + '@' + phoneStatus + '@' + rcStatus + '@' + status;
      },

      // 初始化获取设置列表
      getCheckList() {
          this.checkInGetOptions({
            orderId: this.$route.params.id,
            onsuccess: body => {
              if (body.data.code == 0) {
                 if (body.data.data != null) {
                    this.isfaka = body.data.data.sendCard ? body.data.data.sendCard : false;
                    this.isrcpdf = body.data.data.printRc ? body.data.data.printRc : false;
                    this.isphone = body.data.data.needPhoneNum ? body.data.data.needPhoneNum : false;
                 }
              }
              this.checkInShow = true;
              this.loadingShow = false;
            },onfail: body => {
              this.checkInShow = true;
              this.loadingShow = false;
            }
          })
      },

      // 散客
      getOrderFreeList() {
        this.getOrderFree({
          data: {
            orderId: this.changeItem.id
          },
          onsuccess: body => {
            console.log('body.code',body.data);
            if (body.data.code == 0) {
              this.loadingShow = false;
              if (body.data.data.cashFeeShow == '免押') {
                this.cashFee = 0;
                this.cashFeeTrue = true;
              }else {
                this.cashFeeTrue = false;
                this.cashFee = body.data.data.cashFeeShow;
              }
              if (body.data.data.roomFeeShow == '预付房费') {
                if (body.data.data.cashFeeShow == '免押') {
                  this.roomFeeShow = body.data.data.totalFeeShow;
                }else {
                  this.roomFeeShow = parseFloat(body.data.data.totalFeeShow) - parseFloat(body.data.data.cashFeeShow);
                }
              }else {
                this.roomFeeShow = body.data.data.roomFeeShow;
              }
              this.payMode = body.data.data.payMode;
              this.checkInShow = true;
            }else {
              this.checkInShow = true;
              this.loadingShow = false;
            }
          },
          onfail: (body, headers) => {
            this.checkInShow = true;
            this.loadingShow = false;
          }
        });
      },

      // 获取权限
      getCard(cardStatus) {
        this.cardRule({
          cardStatus: cardStatus,
          onsuccess: body => {
            if (cardStatus == 'support_room_card' && body.data.code == 0 && body.data.data == 'true') {
                this.cardShow = true;
            }
            if (cardStatus == 'rc_status' && body.data.code == 0 && body.data.data == 'true') {
                this.rcShow = true;
            }
          }
        })
      },

      // 展开隐藏房号列表
      roomListShow(item) {
        item.roomList = !item.roomList;
      },

      // 获取房间号列表
      getRoomsList() {
        this.getRooms({
          orderId: this.changeItem.id,
          onsuccess: body => {
            if (body.data.code == 0 && body.data.data) {
              body.data.data.forEach((item, index) => {
                item.roomList = true;
              });
              this.rooms = body.data.data;
            }
          }
        })
      },

    },

    mounted () {
      this.loadingShow = true;
      this.getCard('support_room_card');
      this.getCard('rc_status');
      this.changeItem = JSON.parse(sessionStorage.getItem('changeItem'));
      this.getRoomsList();
      if (this.changeItem.type == 0) {
        this.getCheckList();
      }else {
        this.getOrderFreeList();
      }
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .checkIn {
    width: 100vw;
    padding-top: 100px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .check_fl {
      padding: 0 40px;
      width: calc(100vw - 480px);
      .bgCheckTop {
        height: 20px;
        background-color: #DEE7F8;
      }
      .check_fl_content {
        width: 100%;
        min-height: calc(100vh - 140px);
        box-shadow: 0 8px 16px 0 rgba(0,0,0,0.10);
        background-color: #fff;
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
        .checkInChange {
          .checkIn_header {
            padding: 0 50px;
            background: #F8F8F8;
            border-top: 1px solid #D5D5D5;
            text-align: left;
            .order_origin {
              padding: 30px 0 20px 10px;
              font-size: 24px;
              color: #909399;
              border-bottom: 1px solid #D5D5D5;
            }
            .order_info {
              padding: 30px 0 30px 10px;
              .order_person {
                display: inline-flex;
                align-items: center;
                margin-bottom: 30px;
                img {
                  width: 24px;
                  height: 24px;
                  margin-right: 16px;
                }
                span {
                  font-size: 24px;
                  color: #000;
                }
                span:first-of-type {
                  margin-right: 32px;
                }
              }
            }
            .order_remark {
              color: #303133;
              font-size: 24px;
            }
          }
          .checkIn_content {
            padding: 40px 60px;
            .lists {
              margin-bottom: 200px;
              .list {
                display: flex;
                align-items: center;
                margin-bottom: 40px;
                .title {
                  color: #303133;
                  font-weight: bold;
                  font-size: 26px;
                  text-shadow: 0 2px 3px rgba(0,0,0,0.04);
                  width: 358px;
                  text-align: left;
                  span:first-of-type {
                    width: 150px;
                    display: inline-block;
                  }
                  span:last-of-type {
                    color: #F55825;
                  }
                }
                .changeItem {
                  display: inline-flex;
                  justify-content: flex-start;
                  .item_tab {
                    position: relative;
                    font-size: 22px;
                    color: #000;
                    line-height: 64px;
                    height: 64px;
                    width: 172px;
                    text-align: center;
                    margin-right: 44px;
                    img {
                      position: absolute;
                      z-index: 1;
                      width: 172px;
                      height: 64px;
                      left: 0;
                      top: 0;
                    }
                    span {
                      position: absolute;
                      left: 50%;
                      top: 50%;
                      z-index: 2;
                      transform: translate(-50%, -50%);
                    }
                  }
                }
              }
            }
            .btns {
              margin-top: 110px;
              text-align: left;
              /deep/ button {
                width: 390px;
                height: 80px;
                border-radius: 50px;
                font-size: 28px;
                color: #fff;
                -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
              }

              /deep/ .el-button--danger {
                background-color: #F5222D;
                margin-right: 60px;
              }

              /deep/ .el-button--primary {
                background-color: #1AAD19;
              }
              .tig_info {
                background-color: #d7d7d7;
                color: #a4a4a4;
                border: none;
              }
            }
          }
          .checkIn_content_ {
            .lists {
              margin-bottom: 300px;
            }
          }
        }
      }
    }
    .check_fr {
      width: 480px;
      height: calc(100vh - 100px);
      background-color: #fff;
      overflow-y: scroll;
      -webkit-overflow-scrolling: touch; // 为了滚动顺畅
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
      .roomLists {
        .list {
          margin-top: 36px;
          .title {
            position: relative;
            border-bottom: 1px solid #D8D8D8;
            padding: 16px 0 16px 40px;
            font-size: 26px;
            color: #1AAD19;
            text-align: left;
            img {
              position: absolute;
              right: 40px;
              top: 50%;
              transform: translateY(-50%);
              width: 24px;
              height: 14px;
            }
          }
          .content {
            .lis {
              padding: 0 40px;
              text-align: left;
              .li {
                display: inline-block;
                width: 116px;
                height: 64px;
                line-height: 64px;
                text-align: center;
                font-size: 24px;
                border: 1px solid #D8D8D8;
                margin: 30px 25px 0 0;
                position: relative;
                i {
                  font-style: normal;
                  background-color: #F5222D;
                  font-size: 18px;
                  color: #fff;
                  width: 22px;
                  height: 22px;
                  text-align: center;
                  line-height: 22px;
                  position: absolute;
                  right: 0;
                  top: 0;
                }
              }
              .li:nth-of-type(3n) {
                margin-right: 0;
              }
            }
          }
        }
      }
    }
    .check_fr::-webkit-scrollbar {
      display: none; // 隐藏滚动条
    }
  }

</style>
