<template>
  <div>
    <div class="doSthIndex">
      <div class="header">
        <div class="header_fl">
          <div class="changeScreen" @click="goto('/home')">
            <img src="../../assets/fanhui.png" alt="">
            <span>返回首页</span>
          </div>
          <div class="tabs">
            <span>待办事项</span>
          </div>
        </div>
      </div>
      <div class="doSthContent">
        <!--<div class="changTabs">-->
          <!--<span :class="changeTabString == 1 ? 'active' : ''" @click="changeTabClick(1)">待处理</span>-->
          <!--<span :class="changeTabString == 2 ? 'active' : ''" @click="changeTabClick(2)">已处理</span>-->
        <!--</div>-->
        <div class="doSthLists" v-if="showList">
          <div class="list" v-for="item in doSthLists">
            <div class="list_header">
              <div>
                <span class="title">{{item.doSthTitle}}</span>
                <span>{{datetimeparse(item.createTime,"yy/MM/dd hh:mm")}}</span>
              </div>
            </div>
            <div class="list_content" v-if="item.doSthTitle=='退房申请'">
              <div class="list_fl">
                <div class="rooms"><span>房间号：</span>{{item.roomNo ? item.roomNo : '-'}}</div>
                <div class="checkOut">客人申请退房，房卡已回收，请及时处理</div>
              </div>
              <div class="list_fr">
                <!--<span @click="pmsCheckIn(item.id)">处理完成</span>-->
              </div>
            </div>
            <div class="list_content" v-else-if="item.doSthTitle=='发卡失败'">
              <div class="list_fl">
                <div class="rooms"><span>房间号：</span>{{item.roomNo ? item.roomNo : '-'}}</div>
                <div class="roomIn" v-if="item.type == 'QUEKA'"><span>失败原因：</span>缺卡</div>
                <div class="roomIn" v-else-if="item.type == 'FAKA'"><span>失败原因：</span>发卡失败</div>
                <div class="roomIn" v-else-if="item.type == 'WUKA'"><span>失败原因：</span>无卡</div>
                <div class="roomIn" v-else><span>失败原因：</span>回收卡槽已满</div>
              </div>
              <div class="list_fr">
                <span @click="faka(item.id)">处理完成</span>
              </div>
            </div>
            <div class="list_content" v-else-if="item.doSthTitle=='PMS入住失败'">
              <div class="list_fl">
                <div class="rooms"><span>房间号：</span>{{item.roomNo ? item.roomNo : '-'}}</div>
                <div class="roomIn"><span>住客信息：</span><span v-if="item.guestList" v-for="i in item.guestList">【{{i.name}}/{{i.idCard}}/{{i.address}} 】</span></div>
              </div>
              <div class="list_fr">
                <span @click="pmsCheckIn(item.id)">处理完成</span>
              </div>
            </div>
            <div class="list_content" v-else-if="item.doSthTitle=='PMS入账失败'">
              <div class="list_fl">
                <div class="roomIn"><span>PMS订单号：</span>{{item.pmsOrderNo}}</div>
                <div class="rooms rooms_"><span>预订人：</span>{{item.contactName}} {{item.contactPhone}}  &nbsp;&nbsp;<span>房费：</span>{{item.roomFeeStr == '预付房费' ? '预付房费' : (item.roomFeeStr != null ? item.roomFeeStr + '元' : '无')}}  &nbsp;&nbsp;<span>押金：</span>{{item.depositFeeStr != '免押' ? (item.depositFeeStr != null ? item.depositFeeStr+'元' : '无') : item.depositFeeStr}}</div>
              </div>
              <div class="list_fr">
                <span @click="pmsPayDetail(item.orderId, item.payFlowId)" class="lookDetail">查看详情</span>
                <span @click="pmsPay(item.orderId, item.payFlowId)">处理完成</span>
              </div>
            </div>
            <div class="list_content" v-else-if="item.doSthTitle == '前台支付'">
              <div class="list_fl">
                <div class="rooms"><span>预订人：</span>{{item.owner}} {{item.ownerTel}}</div>
                <div class="roomIn"><span>订单金额：</span>{{(item.totalfee/100).toFixed(2)}}元</div>
              </div>
              <div class="list_fr">
                <span @click="nativepay(item.id)">处理完成</span>
              </div>
            </div>
            <div class="list_content" v-else-if="item.doSthTitle=='旅业退房失败'">
              <div class="list_fl">
                <div class="rooms"><span>房间号：</span>{{item.roomNo ? item.roomNo : '-'}}</div>
                <div class="roomIn"><span>住客姓名：</span><span v-for="(i, index) in item.guestList">{{index < (item.guestList.length - 1) ? i.name + '/' : i.name}}</span></div>
              </div>
              <div class="list_fr">
                <span @click="lvyeCheckout(item.id, item.subOrderId)">处理完成</span>
              </div>
            </div>
            <div class="list_content" v-else-if="item.doSthTitle=='旅业换房失败'">
              <div class="list_fl">
                <div class="rooms"><span>原房间号：</span>{{item.oldRoomNo ? item.oldRoomNo : '-'}}</div>
                <div class="rooms"><span>新房间号：</span>{{item.roomNo ? item.roomNo : '-'}}</div>
                <div class="roomIn"><span>住客姓名：</span><span>{{item.checkInName}}</span></div>
              </div>
              <div class="list_fr">
                <span @click="lvyeCheckout(item.id, item.subOrderId)">处理完成</span>
              </div>
            </div>
            <div class="list_content" v-else-if="item.doSthTitle=='自动挂账失败'">
              <div class="list_fl">
                <div class="rooms"><span>房间号：</span>{{item.roomNo ? item.roomNo : '-'}}</div>
                <div class="roomIn">请至PMS处理挂账</div>
              </div>
              <div class="list_fr">
                <span @click="lvyeCheckout(item.id, item.subOrderId)">处理完成</span>
              </div>
            </div>
            <div class="list_content" v-else-if="item.doSthTitle=='退款计划失败'">
              <div class="list_fl">
                <div class="rooms"><span>房间号：</span>{{item.roomNo ? item.roomNo : '-'}}</div>
                <div class="roomIn"><span>失败原因：</span><span>{{ item.remark }}</span></div>
              </div>
              <div class="list_fr">
                <span @click="lvyeCheckout(item.id, item.subOrderId)">处理完成</span>
              </div>
            </div>
          </div>
          <div class="noMsg" v-if="doSthLists.length == 0">
            <div class="img"><img src="../../assets/zanwuneirong.png" alt=""></div>
            <p>暂无内容</p>
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
    name: 'doSth',
    components: {ElCol, loadingList},
    data () {
      return {
        loadingShow: false,  // loading
        loadingText: '加载中...', // loading text
        showList: false,
        changeTabString: 1,  // tab选中
        page: 1,  // 当前页数
        page1: 1,  // 当前页数
        total: 1, // 总条数
        total1: 1, // 总条数
        doSthLists: [],  // 代办未处理列表
        doSthLists1: [],  //代办已处理列表
      }
    },
    filters: {

    },
    methods: {
      ...mapActions([
        'goto', 'getTodoList', 'getFaka', 'updateCheckinfailedStatus', 'updateWechatPay', 'updateCheckpmslvStatus'
      ]),

      // tab
      changeTabClick(index) {
          this.changeTabString = index;
          this.page = 0;
          this.page1 = 1;
      },

      // 分页
      handleSizeChange (val) {

      },

      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.loadingShow = true;
        this.doSthList(val, 1);
      },
      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.loadingShow = true;
        this.doSthList(val, 2);
      },

      // 获取列表
      doSthList() {
        this.getTodoList({
          onsuccess: body => {
            this.loadingShow = false;
            if (body.data.code == 0) {
              let faka = [];   // 发卡代办
              let pmscheckin = [];  // pms入住失败代办
              let pmspay = [];   // pms入账失败
              let nativepay = [];  // 前台支付
              let checkoutapply = [];  // 退房申请
              let lvyeCheckout = [];   // 旅业退房
              let lvyeChangeRoom = [];  // 旅业换房
              let autoSettleAccount = [];   // 自动挂账失败
              let autoSettlePay = [];   // 退款计划失败
              faka = body.data.data.faka;
              pmscheckin = body.data.data.pmscheckin;
              pmspay = body.data.data.pmspay;
              nativepay = body.data.data.nativepay;
              checkoutapply = body.data.data.checkoutapply != null ? body.data.data.checkoutapply : [];
              lvyeCheckout = body.data.data.lvyeCheckout;
              lvyeChangeRoom = body.data.data.LVYECHANGEROOM ? body.data.data.LVYECHANGEROOM : [];
              autoSettleAccount = body.data.data.AUTO_CREDIT_ACCOUNT ? body.data.data.AUTO_CREDIT_ACCOUNT : [];
              autoSettlePay = body.data.data.AUTO_SETTLE_PAY ? body.data.data.AUTO_SETTLE_PAY : [];
              checkoutapply.forEach(item => {
                item.doSthTitle = '退房申请';
                item.createTime = item.applyTime;
              });
              faka.forEach(item => {
                item.doSthTitle = '发卡失败';
              });
              pmscheckin.forEach(item => {
                item.doSthTitle = 'PMS入住失败';
              });
              pmspay.forEach(item => {
                item.doSthTitle = 'PMS入账失败';
              });
              nativepay.forEach(item => {
                item.doSthTitle = '前台支付';
              });
              lvyeCheckout.forEach(item => {
                item.doSthTitle = '旅业退房失败';
              });
              lvyeChangeRoom.forEach(item => {
                item.doSthTitle = '旅业换房失败';
              });
              autoSettleAccount.forEach(item => {
                item.doSthTitle = '自动挂账失败';
              });
              autoSettlePay.forEach(item => {
                item.doSthTitle = '退款计划失败';
              });
              this.doSthLists = checkoutapply.concat(faka, pmscheckin, pmspay, nativepay, lvyeCheckout, lvyeChangeRoom, autoSettleAccount, autoSettlePay);
              this.doSthLists.sort(this.compare('createTime'));
              console.log('this.doSthLists',this.doSthLists);
            }
            this.showList = true;
          },
          onfail: (body, headers) => {
            this.loadingShow = false;
          },
          onerror: error => {
            this.loadingShow = false;
          }
        })
      },

      // 排序
      compare(attr) {
        return function(a,b){
          let val1 = a[attr];
          let val2 = b[attr];
          return val2 - val1;
        }
      },

      // 发卡失败处理事件
      faka(id) {
        this.loadingShow = true;
        this.getFaka({
          id: id,
          onsuccess: body => {
            if (body.data.code == 0) {
              this.doSthList();
            }else {
              this.loadingShow = false;
            }
          },
          onfail: (body, headers) => {
            this.loadingShow = false;
          }
        })
      },

      // 查看详情
      pmsPayDetail(orderId, payFlowId) {
        sessionStorage.setItem('pmsPayDetail', orderId+"-"+payFlowId);
        this.goto(-1);
      },

      // pms 入住失败处理事件
      pmsCheckIn(id) {
        this.loadingShow = true;
        this.updateCheckinfailedStatus({
          id: id,
          status: 1,
          onsuccess:(body)=>{
            if (body.data.code == 0) {
              this.doSthList();
            }else {
              this.loadingShow = false;
            }
          },
          onfail: (body, headers) => {
            this.loadingShow = false;
          }
        })
      },

      // pms入账失败处理事件
      pmsPay(id, payFlowId) {
        this.loadingShow = true;
        this.updateWechatPay({
          data:{
            orderId: id,
            payFlowId: payFlowId
          },
          onsuccess: (body) => {
            if(body.data.code == 0){
              this.doSthList();
            }else {
              this.loadingShow = false;
            }
          },
          onfail: (body, headers) => {
            this.loadingShow = false;
          }
        });
      },

      // 前台支付
      nativepay(id){
        this.loadingShow = true;
        this.getFaka({
          id: id,
          onsuccess: body => {
            if (body.data.code == 0) {
              this.doSthList();
            }else {
              this.loadingShow = false;
            }
          },
          onfail: (body, headers) => {
            this.loadingShow = false;
          }
        })
      },

      // 旅业退房、换房失败
      lvyeCheckout(id, subOrderId) {
        this.loadingShow = true;
        this.updateCheckpmslvStatus({
          data: {
            id: id,
            hotelId: sessionStorage.hotel_id,
            subOrderId: subOrderId,
            deviceId: ''
          },
          onsuccess: (body) => {
            if (body.data.code == 0) {
              this.doSthList();
            }else {
              this.loadingShow = false;
            }
          },
          onfail: (body, headers) => {
            this.loadingShow = false;
          }
        })
      },
    },

    mounted () {
      this.loadingShow = true;
      this.doSthList();
    },
    beforeRouteLeave (to, from, next) {
      this.loadingShow = false;
      next();
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">

  .doSthIndex {
    width: 100vw;
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
          }
        }
        .tabs {
          height: 100%;
          span {
            margin-right: 40px;
            height: 100%;
            position: relative;
            color: #000;
            font-size: 26px;
            display: inline-flex;
            align-items: center;
          }
        }
      }
    }
    .doSthContent {
      margin-top: 100px;
      .changTabs {
        padding: 40px;
        text-align: left;
        span {
          color: #303133;
          font-size: 13px;
          background: #FFFFFF;
          box-shadow: 0 8px 22px 0 rgba(0,0,0,0.10);
          border-radius: 40px;
          height: 40px;
          line-height: 40px;
          width: 105px;
          text-align: center;
          margin-right: 15px;
          display: inline-block;
          cursor: pointer;
        }
        span.active {
          color: #1AAD19;
          border: 1px solid #1AAD19;
        }
      }
      .doSthLists {
        .list {
          padding: 0 40px;
          background: #FFFFFF;
          box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.10);
          border-radius: 6px;
          text-align: left;
          margin-bottom: 20px;
          .list_header {
            border-bottom: 1px solid #E5E5E5;
            padding: 20px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            div:first-of-type {
              span {
                color: #909399;
                font-size: 20px;
              }
              .title {
                font-size: 24px;
                color: #000;
                font-weight: bold;
                margin-right: 30px;
              }
            }
            div:last-of-type {
              color: #303133;
              font-size: 14px;
            }
          }
          .list_content {
            padding: 20px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .list_fl {
              div {
                font-size: 20px;
                color: #000;
                margin-top: 10px;
                span:first-of-type {
                  width: 125px;
                  display: inline-block;
                }
                span:last-of-type {
                  width: auto;
                }
                span:only-child {
                  width: 125px;
                  display: inline-block;
                }
              }
              .rooms {
                span {
                  width: 125px !important;
                  display: inline-block;
                }
              }
              .rooms_ {
                span {
                  width: auto !important;
                }
              }
            }
            .list_fr {
              span {
                cursor: pointer;
                width: 125px;
                height: 44px;
                line-height: 44px;
                background-color: #1AAD19;
                font-size: 20px;
                color: #fff;
                text-align: center;
                display: inline-block;
                border-radius: 32px;
                -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
                margin-left: 15px;
              }
              .lookDetail {
                background-color: #4A90E2;
              }
            }
          }
        }
      }
    }
    .noMsg {
      padding-top: 400px;
      img {
        display: block;
        width: 180px;
        margin: 0 auto;
      }
      p {
        font-size: 26px;
        margin-top: 20px;
      }
    }
  }


</style>
