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
            <span :class="tabIndex == 1 ? 'active' : ''" @click="tabChange(1)">入住<el-badge class="mark" :value="tabNums.checkInNum" v-if="tabNums.checkInNum != 0" :max="99" /></span>
            <span :class="tabIndex == 2 ? 'active' : ''" @click="tabChange(2)">退房<el-badge class="mark" :value="tabNums.quitNum" v-if="tabNums.quitNum != 0" :max="99" /></span>
            <span :class="tabIndex == 3 ? 'active' : ''" @click="tabChange(3)">账务<el-badge class="mark" :value="tabNums.payNum" v-if="tabNums.payNum != 0" :max="99" /></span>
            <span :class="tabIndex == 4 ? 'active' : ''" @click="tabChange(4)">旅业<el-badge class="mark" :value="tabNums.lvyeNum" v-if="tabNums.lvyeNum != 0" :max="99" /></span>
          </div>
        </div>
      </div>
      <div class="doSthContent">
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
                <el-button @click="checkoutRoomApply(item.id)" v-if="item.applyBy && item.applyBy == 'PMSINCARDOUT'" :disabled="loadingShow">处理完成</el-button>
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
                <el-button @click="faka(item.id)" :disabled="loadingShow">
                  处理完成
                </el-button>
              </div>
            </div>
            <div class="list_content" v-else-if="item.doSthTitle=='PMS入住失败'">
              <div class="list_fl">
                <div class="rooms"><span>房间号：</span>{{item.roomNo ? item.roomNo : '-'}}</div>
                <div class="roomIn"><span>住客信息：</span><span v-if="item.guestList" v-for="i in item.guestList">【{{i.name}}/{{i.idCard}}/{{i.address}} 】</span></div>
              </div>
              <div class="list_fr">
                <el-button @click="pmsCheckIn(item.id)" :disabled="loadingShow">
                  处理完成
                </el-button>
              </div>
            </div>
            <div class="list_content" v-else-if="item.doSthTitle=='PMS入账失败'">
              <div class="list_fl">
                <div class="roomIn"><span>PMS订单号：</span>{{item.pmsOrderNo}}</div>
                <div class="rooms rooms_"><span>预订人：</span>{{item.contactName}} {{item.contactPhone}}  &nbsp;&nbsp;<span>房费：</span>{{item.roomFeeStr == '预付房费' ? '预付房费' : (item.roomFeeStr != null ? item.roomFeeStr + '元' : '无')}}  &nbsp;&nbsp;<span>押金：</span>{{item.depositFeeStr != '免押' ? (item.depositFeeStr != null ? item.depositFeeStr+'元' : '无') : item.depositFeeStr}}</div>
              </div>
              <div class="list_fr">
                <el-button @click="pmsPayDetail(item.orderId, item.payFlowId)" class="lookDetail" :disabled="loadingShow">
                  查看详情
                </el-button>
                <el-button @click="pmsPay(item.orderId, item.payFlowId)" :disabled="loadingShow">
                  处理完成
                </el-button>
              </div>
            </div>
            <div class="list_content" v-else-if="item.doSthTitle == '前台支付'">
              <div class="list_fl">
                <div class="rooms"><span>预订人：</span>{{item.owner}} {{item.ownerTel}}</div>
                <div class="roomIn"><span>订单金额：</span>{{(item.totalfee/100).toFixed(2)}}元</div>
              </div>
              <div class="list_fr">
                <el-button @click="nativepay(item.id)" :disabled="loadingShow">
                  处理完成
                </el-button>
              </div>
            </div>
            <div class="list_content" v-else-if="item.doSthTitle=='旅业退房失败'">
              <div class="list_fl">
                <div class="rooms"><span>房间号：</span>{{item.roomNo ? item.roomNo : '-'}}</div>
                <div class="roomIn"><span>住客姓名：</span><span v-for="(i, index) in item.guestList">{{index < (item.guestList.length - 1) ? i.name + '/' : i.name}}</span></div>
              </div>
              <div class="list_fr">
                <el-button @click="lvyeCheckout(item.id, item.subOrderId)" :disabled="loadingShow">
                  处理完成
                </el-button>
              </div>
            </div>
            <div class="list_content" v-else-if="item.doSthTitle=='旅业换房失败'">
              <div class="list_fl">
                <div class="rooms"><span>原房间号：</span>{{item.oldRoomNo ? item.oldRoomNo : '-'}}</div>
                <div class="rooms"><span>新房间号：</span>{{item.roomNo ? item.roomNo : '-'}}</div>
                <div class="roomIn"><span>住客姓名：</span><span>{{item.checkInName}}</span></div>
              </div>
              <div class="list_fr">
                <el-button @click="lvyeCheckout(item.id, item.subOrderId)">
                  处理完成
                </el-button>
              </div>
            </div>
            <div class="list_content" v-else-if="item.doSthTitle=='自动挂账失败'">
              <div class="list_fl">
                <div class="rooms"><span>房间号：</span>{{item.roomNo ? item.roomNo : '-'}}</div>
                <div class="roomIn">请至PMS处理挂账</div>
              </div>
              <div class="list_fr">
                <el-button @click="lvyeCheckout(item.id, item.subOrderId)" :disabled="loadingShow">
                  处理完成
                </el-button>
              </div>
            </div>
            <div class="list_content" v-else-if="item.doSthTitle=='退款计划失败'">
              <div class="list_fl">
                <div class="rooms"><span>房间号：</span>{{item.roomNo ? item.roomNo : '-'}}</div>
                <div class="roomIn"><span>失败原因：</span><span>{{ item.remark }}</span></div>
              </div>
              <div class="list_fr">
                <el-button @click="lvyeCheckout(item.id, item.subOrderId)" :disabled="loadingShow">
                  处理完成
                </el-button>
              </div>
            </div>
            <div class="list_content" v-else-if="item.doSthTitle=='脏房入住'">
              <div class="list_fl">
                <div class="rooms"><span>房间号：</span>{{item.roomNo ? item.roomNo : '-'}}</div>
                <div class="roomIn">客人已登记，请及时打扫</div>
              </div>
              <div class="list_fr">
                <el-button @click="lvyeCheckout(item.id, item.subOrderId)" :disabled="loadingShow">
                  处理完成
                </el-button>
              </div>
            </div>
            <div class="list_content" v-else-if="item.doSthTitle=='PMS续住失败'">
              <div class="list_fl">
                <div class="rooms"><span>房间号：</span>{{item.roomNo ? item.roomNo : '-'}}</div>
                <div class="roomIn">续住失败，房费已支付，请及时处理</div>
              </div>
              <div class="list_fr">
                <el-button @click="lvyeCheckout(item.id, item.subOrderId)" :disabled="loadingShow">
                  处理完成
                </el-button>
              </div>
            </div>
            <div class="list_content" v-else-if="item.doSthTitle=='旅业登记失败'">
              <div class="list_fl">
                <div class="rooms"><span>房间号：</span>{{item.roomNo ? item.roomNo : '-'}}</div>
                <div class="roomIn"><span>住客信息：</span><span v-if="item.guestList" v-for="i in item.guestList">【{{i.name}}/{{i.idcard}}/{{i.address}} 】</span></div>
              </div>
              <div class="list_fr">
                <el-button @click="lvyeCheckout(item.id, item.subOrderId)" :disabled="loadingShow">
                  处理完成
                </el-button>
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
        doSthLists: [],  // 代办未处理列表
        doSthLists_: [],  // 代办未处理列表
        tabNums: {
          checkInNum: 0,    // 入住待办数量(PMS入住失败、脏房入住、PMS续住失败)
          quitNum: 0,       // 退房待办数量(退房申请)
          payNum: 0,        // 账务待办数量(入账失败、挂账失败、结算失败退款计划失败)
          lvyeNum: 0,       // 旅业待办数量(旅业登记入住失败、退房失败)
        },
        tabIndex: 1,        // tab index active
      }
    },
    filters: {

    },
    methods: {
      ...mapActions([
        'goto', 'getTodoList', 'getFaka', 'updateCheckinfailedStatus', 'updateWechatPay', 'updateCheckpmslvStatus', 'updateCheckoutRoomApply'
      ]),

      // tab
      tabChange(index) {
          this.tabIndex = index;
          let arr = [];
          if (this.doSthLists_.length != 0) {
            this.doSthLists_.forEach(item => {
                if ((index == 1 && item.doSthTitle == 'PMS入住失败') || (index == 1 && item.doSthTitle == '脏房入住') || (index == 1 && item.doSthTitle == 'PMS续住失败')) {
                    arr.push(item)
                }else if (index == 2 && item.doSthTitle == '退房申请') {
                    arr.push(item)
                }else if ((index == 3 && item.doSthTitle == '自动挂账失败') || (index == 3 && item.doSthTitle == 'PMS入账失败') || (index == 3 && item.doSthTitle == '退款计划失败')) {
                    arr.push(item);
                }else if ((index == 4 && item.doSthTitle == '旅业退房失败') || (index == 4 && item.doSthTitle == '旅业登记失败')) {
                    arr.push(item);
                }
            })
          }
          this.doSthLists = arr;
          this.doSthLists.sort(this.compare('createTime'));
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
              let continueLive = [];    // PMS续住失败
              let dirtyRoom = [];       // 脏房入住
              let rulvye = [];          // 旅业登记
              faka = body.data.data.faka;
              pmscheckin = body.data.data.pmscheckin;
              pmspay = body.data.data.pmspay;
              nativepay = body.data.data.nativepay;
              checkoutapply = body.data.data.checkoutapply != null ? body.data.data.checkoutapply : [];
              lvyeCheckout = body.data.data.LVYECHECKOUT ? body.data.data.LVYECHECKOUT : [];
              lvyeChangeRoom = body.data.data.LVYECHANGEROOM ? body.data.data.LVYECHANGEROOM : [];
              autoSettleAccount = body.data.data.AUTO_CREDIT_ACCOUNT ? body.data.data.AUTO_CREDIT_ACCOUNT : [];
              autoSettlePay = body.data.data.AUTO_SETTLE_PAY ? body.data.data.AUTO_SETTLE_PAY : [];
              continueLive = body.data.data.CONTINUE_LIVE ? body.data.data.CONTINUE_LIVE : [];
              dirtyRoom = body.data.data.TEMPCHECKIN ? body.data.data.TEMPCHECKIN : [];
              rulvye = body.data.data.RULVYE ? body.data.data.RULVYE : [];
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
              dirtyRoom.forEach(item => {
                item.doSthTitle = '脏房入住';
              });
              continueLive.forEach(item => {
                item.doSthTitle = 'PMS续住失败';
              });
              rulvye.forEach(item => {
                item.doSthTitle = '旅业登记失败';
              });
              this.doSthLists_ = checkoutapply.concat(faka, pmscheckin, pmspay, nativepay, lvyeCheckout, lvyeChangeRoom, autoSettleAccount, autoSettlePay, dirtyRoom, continueLive, rulvye);
              this.tabChange(this.tabIndex);
              this.tabNums.checkInNum = pmscheckin.length + dirtyRoom.length + continueLive.length;
              this.tabNums.quitNum = checkoutapply.length;
              this.tabNums.payNum = pmspay.length + autoSettleAccount.length + autoSettlePay.length;
              this.tabNums.lvyeNum = lvyeCheckout.length + rulvye.length;
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

      // pms退房申请处理
      checkoutRoomApply(id) {
        this.loadingShow = true;
        this.updateCheckoutRoomApply({
          id: id,
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
        })
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

      // 旅业退房、换房失败、脏房入住、PMS续住失败、旅业登记失败
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
<style lang="less" scoped>

  .doSthIndex {
    width: 100vw;
    padding-top: 100px;
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
            width: 18px;
            height: 22px;
            margin-right: 7px;
          }
          span {
            font-size: 20px;
            color: #fff;
          }
        }
        .tabs {
          height: 100%;
          span {
            margin-right: 40px;
            height: 100%;
            position: relative;
            color: #909399;
            font-size: 20px;
            display: inline-flex;
            align-items: center;
            cursor: pointer;
            /deep/ .el-badge__content {
              font-size: 16px;
              min-width: 28px;
              height: 28px;
              line-height: 28px;
              border-radius: 50%;
              text-align: center;
              top: 0;
            }
            /deep/ .el-badge {
              display: inline-flex;
              align-items: center;
              font-size: 16px;
            }
          }
          .active {
            color: #1AAD19;
          }
          .active:after {
            content: '';
            display: inline-block;
            position: absolute;
            width: 80%;
            height: 4px;
            background-color: #1AAD19;
            left: 50%;
            bottom: 0;
            transform: translateX(-50%);
          }
        }
      }
    }
    .doSthContent {
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
          margin-top: 20px;
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
                font-size: 20px;
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
              .el-button {
                cursor: pointer;
                width: 125px;
                padding: 0;
                line-height: 44px;
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
      padding-top: 200px;
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
