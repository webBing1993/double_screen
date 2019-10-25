<template>
  <div>
    <div class="check_out">
      <div class="bgCheckTop"></div>
      <div class="check_fl_content">
        <div class="checkTop">
          <div @click="gobanck" class="goback">
            <img src="../../assets/fanhui1.png" alt="">
            <span>返回</span>
          </div>
          <div class="roomNo">
            <span>房间号：<span v-for="(item, index) in orderDetail.roomNos">{{index == (orderDetail.roomNos.length - 1) ? item : item + '/'}}</span></span>
          </div>
          <div class="replayList" @click="replayList">
            <img src="../../assets/tongbu.png" alt="">
            <span>刷新</span>
          </div>
        </div>
        <div class="check_content" v-show="checkOutShow">
          <!-- 微前台收款-->
          <div class="payInfo" v-if="orderDetail.refundVO">
            <div class="header">
              <div class="lists">
                <div class="list">微前台收款</div>
                <div class="list">金额</div>
                <div class="list">操作</div>
              </div>
            </div>
            <div class="content">
              <div class="lists" v-if="orderDetail.refundVO.roomFeeStr != '预付房费'">
                <div class="list">
                  <span>房费</span>
                  <span>{{orderDetail.deposits[0].payFlag == 1 ? '微信支付' : orderDetail.deposits[0].payFlag == 2 ? '支付宝支付' : '翼支付'}}  {{datetimeparse(orderDetail.deposits[0].finishTime, 'yy/MM/dd hh:mm')}}</span>
                </div>
                <div class="list">
                  <span class="red">{{orderDetail.refundVO.roomFeeStr}}元</span>
                </div>
                <div class="list"></div>
              </div>
              <div class="lists">
                <div class="list">
                  <span>押金</span>
                  <span>{{orderDetail.deposits[0].payFlag == 1 ? '微信支付' : orderDetail.deposits[0].payFlag == 2 ? '支付宝支付' : '翼支付'}}  {{datetimeparse(orderDetail.deposits[0].finishTime, 'yy/MM/dd hh:mm')}}</span>
                </div>
                <div class="list">
                  <span class="red">{{orderDetail.refundVO.refundFeeStr}}元</span>
                </div>
                <div class="list">
                  <el-button type="primary" :loading="false" class="btn green"  @click="payInfoClick()" v-if="!orderDetail.deposits[0].refund && !orderDetail.isFreeDeposit">结账</el-button>
                </div>
              </div>
            </div>
          </div>
          <!-- 预授权收款-->
          <div class="payInfo" v-if="orderDetail.preAuthorizedDeposit">
            <div class="header">
              <div class="lists">
                <div class="list">微前台收款</div>
                <div class="list">金额</div>
                <div class="list">操作</div>
              </div>
            </div>
            <div class="content">
              <div class="lists" v-for="item in orderDetail.preAuthorizedDeposit">
                <div class="list">
                  <span>房费押金</span>
                  <span>{{item.payFlag == 1 ? '微信预授权' : item.payFlag == 2 ? '支付宝预授权' : '翼支付预授权'}}  {{datetimeparse(item.finishTime, 'yy/MM/dd hh:mm')}} </span>
                </div>
                <div class="list">
                  <span class="red">{{(item.totalFee/100).toFixed(2)}}元</span>
                </div>
                <div class="list">
                  <el-button type="primary" :loading="false" class="btn green" @click="payInfoClick(item)" v-if="item.channel == 4">结账</el-button>
                </div>
              </div>
            </div>
          </div>
          <!-- PMS账单-->
          <div class="payInfo" v-if="orderDetail.pmsOrder.length != 0">
            <div class="header">
              <div class="lists">
                <div class="list">PMS账单</div>
                <div class="list">金额</div>
                <div class="list">操作</div>
              </div>
            </div>
            <div class="content">
              <div class="lists" v-if="payInfoGetList.length != 0">
                <div class="list">
                  <span>总收款 {{payInfoGetList.length}}笔</span>
                </div>
                <div class="list">
                  <span class="green">{{(payInfoGetNum/100).toFixed(2)}}元</span>
                </div>
                <div class="list">
                  <el-button type="primary" :loading="false" class="btn green" @click="lookInfoList(1)">查看明细</el-button>
                </div>
              </div>
              <div class="lists" v-if="payConsumeList.length != 0">
                <div class="list">
                  <span>总消费 {{payConsumeList.length}}笔</span>
                </div>
                <div class="list">
                  <span class="red">{{(payInfoConsumeNum/100).toFixed(2)}}元</span>
                </div>
                <div class="list">
                  <el-button type="primary" :loading="false" class="btn green" @click="lookInfoList(2)">查看明细</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bgCheckTop"></div>
      <loadingList v-if="loadingShow" :loadingText="loadingText"  style="width: 100vw"></loadingList>

      <!-- 明细-->
      <div class="channelDetail" v-if="channelDetail">
        <div class="shadow" @click="channelDetail=false"></div>
        <div class="detail">
          <div class="detail_content">
            <div class="title">{{payInfoType == 1 ? 'PMS收款' : 'PMS消费'}}<img src="../../assets/guanbi.png" alt="" @click="channelDetail=false"></div>
            <div class="lists">
              <div class="list" v-if="payInfoType == 1" v-for="item in payInfoGetList">
                <p>
                  <span>{{item.payName}}  {{item.roomNo}}</span>
                  <span>¥{{(item.amount/100).toFixed(2)}}元</span>
                </p>
                <p>
                  <span class="gey">PMS {{datetimeparse(item.payAt, 'yy/MM/dd hh:mm')}}</span>
                  <span></span>
                </p>
              </div>
              <div class="list" v-for="item in payConsumeList"  v-if="payInfoType == 2">
                <p>
                  <span>{{item.payName}}  {{item.roomNo}}</span>
                  <span>¥{{(item.amount/100).toFixed(2)}}元</span>
                </p>
                <p>
                  <span class="gey">PMS {{datetimeparse(item.payAt, 'yy/MM/dd hh:mm')}}</span>
                  <span></span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 结账弹框-->
      <div class="payTig" v-if="payTig">
        <div class="shadow"></div>
        <div class="payTigContent">
          <div class="payTig_title">
            {{orderDetail.refundVO ? '请确认退款金额' : '请确认消费金额'}}
            <img src="../../assets/guanbi.png" alt="" @click="payTig = false;payMoney = '';infoLoading = false;">
          </div>
          <div class="payTig_content">
            <div class="payTig_input"><input type="text" v-model="payMoney" :placeholder="orderDetail.refundVO ? '请确认退款金额' : '请确认消费金额'"></div>
            <div class="payTig_keyBoard">
              <span v-for="item in keyBoard" @click="keyEntry_(item)">{{item}}</span>
              <span @click="keyCancel_()"><img src="../../assets/shanchuanniu.png" alt=""></span>
            </div>
            <el-button type="primary" :loading="infoLoading" class="btn" @click="paySure()">确定</el-button>
          </div>
        </div>
      </div>
      <!-- 退出弹框提示-->
      <div class="quit" v-if="quit">
        <div class="shadow"></div>
        <div class="quit_content">
          <div class="quit_title">是否需要退房？</div>
          <div class="quit_tabs">
            <span class="cancel" @click="cancel">取消</span>
            <el-button type="primary" :loading="quitLoading" class="sure" @click="sure()">确认</el-button>
          </div>
        </div>
      </div>
      <!-- PMS入账异常-->
      <div class="showPmsAbnormal" v-if="showPmsAbnormal">
        <div class="shadow"></div>
        <div class="pmsAbnormal">
          <div class="title">PMS入账异常</div>
          <div class="lists">
            <div class="list">
              <span>退款金额</span>
              <span>¥{{payMoney}}</span>
            </div>
          </div>
          <p class="zhuyi_text">
            注意：由于系统异常，无法自动入账PMS，请手工至PMS入账。
         </p>
          <div class="btns">
            <el-button type="primary" :loading="false" class="btn1" @click="showPmsAbnormal=false">暂不退款</el-button>
            <el-button type="primary" :loading="showPmsAbnormalLoading" class="btn" @click="continuedCheckOutRoom()">继续退款</el-button>
          </div>
          <div class="know_btn">
            <img src="../../assets/Group.png" alt=""  @click="showPmsAbnormal=false;">
          </div>
        </div>
      </div>

      <!-- 预授权PMS入账异常-->
      <div class="showPmsAbnormal_" v-if="showPmsAbnormal_">
        <div class="shadow"></div>
        <div class="pmsAbnormal">
          <div class="pmsAbnormal_content">
            <div class="pmsAbnormal_fl">
              <img src="../../assets/qiantai.png" alt="">
            </div>
            <div class="pmsAbnormal_fr">
              <div class="title">结算成功，系统入账异常</div>
              <div class="content">您可进入交易管理，查看结算信息并手工至PMS系统入账。</div>
            </div>
          </div>
          <div class="know_btn">
            <img src="../../assets/Group.png" alt=""  @click="showPmsAbnormal_=false;">
          </div>
        </div>
      </div>

      <!-- 账户余额不足提示-->
      <div class="balance" v-if="showBalance">
        <div class="shadow"></div>
        <div class="balance_content">
          <div class="title_img"><img src="../../assets/querenshanchu.png" alt=""></div>
          <div class="title">账户余额不足</div>
          <div class="content">微信支付宝账户余额不足，请处理后重试</div>
          <div class="know_btn"><img src="../../assets/Group.png" alt="" @click="showBalance=false"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex';
  import ElCol from "element-ui/packages/col/src/col";
  import loadingList from './loading.vue'
  export default {
    components: {ElCol, loadingList},
    name: 'checkOut',
    data () {
      return {
        loadingShow: false,  // loading
        loadingText: '加载中...', // loading text
        checkOutShow: false,  // 模板显示隐藏
        orderDetail: {},     // 详情
        payInfoGetList: [],     // 收款记录
        payConsumeList: [],     // 消费记录
        payInfoConsumeNum: 0, // 消费总额
        payInfoGetNum: 0,     // 收款总额
        infoLoading: false,  // 结账loading
        channelDetail: false,  // 明细弹框
        payInfoType: 1,    // 判断是否是收款弹框还是消费弹框  1收款 2消费
        payTig: false,   // 退款弹框
        payMoney: '',   // 退款，结算金额
        quitLoading: false,  // 退房loading
        keyBoard: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'],   // 键盘
        quit: false,  // 是否退房
        showPmsAbnormal: false,  // pms入账异常
        showPmsAbnormal_: false,  // 预授权pms入账异常
        chargeRecordObj: {},
        showPmsAbnormalLoading: false,  // pms入账btn loading
        checked: '',  // 判断pms入账是否异常
        accountItem: {},  // 预授权结算的临时数据
        showBalance: false,  // 账户余额不足提示
      }
    },
    methods: {
      ...mapActions([
          'accountCheckout', 'depositConsume', 'getCheckOutInfo', 'refundHandle', 'accountRefund'
      ]),

      // 返回上一页
      gobanck() {
//        this.$router.go(-1);
        this.$emit('checkOutLoading', 0);
        this.$router.replace({name:'liveIn'})
      },

      // 结账
      payInfoClick(item) {
        if (this.orderDetail.refundVO) {
          this.accountRefund({
            data: {
              orderId: this.orderDetail.id
            },
            onsuccess: body => {
              if (body.data.code == 0 && body.data.data) {
                this.chargeRecordObj = body.data.data
              }
              this.payMoney = '';
              this.payTig = true;
            }
          })
        }else {
          this.payMoney = '';
          this.accountItem = item;
          this.payTig = true;
        }
      },

      //继续退房
      continuedCheckOutRoom(){
        this.showPmsAbnormal = false;
        this.checked = true;
        this.showPmsAbnormalLoading = true;
        this.paySure();
      },

      // 结账弹框确定事件
      paySure() {
        this.infoLoading = true;
        let regPos = /^\d+(\.\d+)?$/; //非负浮点数
        if (this.orderDetail.refundVO) {
          if (this.payMoney == '') {
//            this.$message({
//              message: '请输入结账金额',
//              type: 'warning'
//            });
            this.$toast({
              message: '请输入退款金额',
              iconClass: 'icon ',
            });
            this.infoLoading = false;
            this.showPmsAbnormalLoading = false;
          }else if (!regPos.test(this.payMoney)) {
            this.$toast({
              message: '请输入正确的退款金额',
              iconClass: 'icon ',
            });
            this.infoLoading = false;
          }else if (parseFloat(this.payMoney*100) > parseFloat(this.orderDetail.refundVO.refundFeeStr*100)) {
//            this.$message({
//              message: '注意：不能大于押金金额',
//              type: 'warning'
//            });
            this.$toast({
              message: '注意：不能大于押金金额',
              iconClass: 'icon ',
            });
            this.infoLoading = false;
            this.showPmsAbnormalLoading = false;
          }else {
            this.refundHandle({
              data:{
                checkInRoomId: sessionStorage.getItem('roomcode') ? sessionStorage.getItem('roomcode') : '',
                orderId: sessionStorage.getItem('checkOutItem') ? JSON.parse(sessionStorage.getItem('checkOutItem')).orderId : this.orderDetail.id,
                refundfee: this.payMoney,
                checked: this.checked,
                ischeckOut: false
              },
              onsuccess:(body)=>{
                if(body.data.code == 0){
//                  this.$message({
//                    message: '退款成功',
//                    type: 'success'
//                  });
                  this.payTig = false;
                  this.quit = true;
                }else if(body.data.code == 20003){
                  this.showPmsAbnormal = true;
                }else if (body.data.code == 20006) {
//                  this.$message({
//                    message: body.data.data,
//                    type: 'warning'
//                  });
                  this.$toast({
                    message: body.data.msg,
                    iconClass: 'icon ',
                  });
                  this.gobanck();
                }else if (body.data.code == 100049 || body.data.code == 100036) {
                  this.showBalance = true;
                }
                this.checked = '';
                this.payTig = false;
                this.infoLoading = false;
                this.showPmsAbnormalLoading = false;
              },
              onfail: body => {
//                this.payTig = false;
                this.infoLoading = false;
                this.showPmsAbnormalLoading = false;
              },
              onerror: body => {
                this.infoLoading = false;
                this.showPmsAbnormalLoading = false;
              }
            })
          }
        }else {
          if (this.payMoney == '') {
            this.$toast({
              message: '请确认消费金额',
              iconClass: 'icon ',
            });
            this.infoLoading = false;
          }else if (this.payMoney == 0) {
            this.$toast({
              message: '请输入正确的消费金额',
              iconClass: 'icon ',
            });
            this.infoLoading = false;
          }else if (!regPos.test(this.payMoney)) {
            this.$toast({
              message: '请输入正确的消费金额',
              iconClass: 'icon ',
            });
            this.infoLoading = false;
          }else if (parseFloat(this.payMoney*100) > this.accountItem.totalFee) {
            this.$toast({
              message: '消费金额不可大于预授权金额',
              iconClass: 'icon ',
            });
            this.infoLoading = false;
          }else {
            this.depositConsume({
              data: {
                orderId: this.changeItem.orderId || '',
                amount: this.payMoney,
                remark: ''
              },
              onsuccess: body => {
                if (body.data.code == 0) {
                  this.payTig = false;
                  this.quit = true;
                }else if (body.data.code == 20003) {
                  this.showPmsAbnormal_ = true;
                }else {
                  this.gobanck();
                }
                this.infoLoading = false;
              },
              onfail: body => {
                this.infoLoading = false;
              },
              onerror: body => {
                this.infoLoading = false;
              }
            });
          }
        }
      },

      // 查看明细
      lookInfoList(index) {
        this.payInfoType = index;
        this.channelDetail = true;
      },

      cancel() {
        this.quit = false;
        this.gobanck();
      },

      // 退房操作
      sure() {
        this.quitLoading = true;
        this.accountCheckout({
          data: {
            checkInRoomId: this.changeItem.checkInRoomId,
            amount: this.payMoney
          },
          onsuccess: body => {
            this.payMoney  = '';
            if (body.data.code == 0) {
              this.$message({
                message: '退房成功',
                type: 'success'
              });
              this.gobanck();
            }else if (body.data.code == 10006) {
              this.$toast({
                message: body.data.msg,
                iconClass: 'icon ',
              });
              this.gobanck();
            }else if (body.data.code == 20006) {
              this.$toast({
                message: body.data.msg,
                iconClass: 'icon ',
              });
              this.gobanck();
            }
            this.quitLoading = false;
            this.quit = false;
          },
          onfail: body => {
            this.quitLoading = false;
          },
          onerror: body => {
            this.quitLoading = false;
          }
        })
      },

      // 键盘事件
      keyEntry_(item) {
        this.payMoney += item;
      },

      keyCancel_ () {
        if (this.payMoney.length > 0) {
          this.payMoney = this.payMoney.substr(0, this.payMoney.length - 1);
        }
      },

      // 获取详情
      getDetail() {
        this.payConsumeList = [];
        this.payInfoGetList = [];
        this.getCheckOutInfo({
          orderId:  this.changeItem.orderId,
          onsuccess: body => {
            if (body.data.code == 0) {
              this.loadingShow = false;
              this.orderDetail = body.data.data;
              if (this.orderDetail.pmsOrder.length != 0) {
                this.orderDetail.pmsOrder.forEach((item, index) => {
                  if (item.type == 1) {
                    this.payConsumeList.push(item);
                    this.payInfoConsumeNum = this.payInfoConsumeNum + item.amount;
                    console.log('this.payConsumeList', this.payConsumeList);
                  }else {
                    this.payInfoGetList.push(item);
                    this.payInfoGetNum = this.payInfoGetNum + item.amount;
                  }
                });
              }else {
                this.orderDetail.pmsOrder = [];
              }
              this.checkOutShow = true;
            }else {
              this.loadingShow = false;
              this.checkOutShow = true;
            }
            this.$emit('checkOutLoading', 1);
          },
          onfail: body => {
            this.$emit('checkOutLoading', 1);
            this.loadingShow = false;
            this.checkOutShow = true;
          },
          onerror: error => {
            this.$emit('checkOutLoading', 1);
            this.loadingShow = false;
            this.checkOutShow = true;
          }
        })
      },

      // 刷新事件
      replayList() {
        this.loadingShow = true;
        this.checkOutShow = false;
        this.payInfoConsumeNum = 0; // 消费总额
        this.payInfoGetNum = 0;     // 收款总额
        this.payInfoGetList = [];     // 收款记录
        this.payConsumeList = [];     // 消费记录
        this.getDetail();
      },

    },
    beforeMount () {
      this.loadingShow = false;
    },

    mounted () {
      this.loadingShow = true;
      this.checkOutShow = false;
      this.changeItem = sessionStorage.getItem('checkOutItem') ? JSON.parse(sessionStorage.getItem('checkOutItem')) : '';
      this.getDetail();
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .check_out {
    padding: 100px 40px 0;
    width: 100vw;
    .bgCheckTop {
      height: 20px;
      background-color: #DEE7F8;
    }
    .check_fl_content {
      width: 100%;
      min-height: calc(100vh - 140px);
      box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.10);
      background-color: #fff;
      .checkTop {
        text-align: left;
        padding: 24px 0 24px 60px;
        position: relative;
        div {
          display: inline-flex;
          align-items: center;
        }
        .goback {
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
        .roomNo {
          font-size: 30px;
          color: #000;
          margin-left: 117px;
          margin-right: 300px;
        }
        .replayList {
          position: absolute;
          top: 50%;
          right: 74px;
          transform: translateY(-50%);
          font-size: 28px;
          color: #1AAD19;
          padding: 0 30px;
          img {
            display: inline-block;
            width: 44px;
            height: 44px;
            margin-right: 7px;
          }
        }
      }
      .check_content {
        width: 100%;
        .header {
          background: #F8F8F8;
          border-top: 1px solid #CCCCCC;
          border-bottom: 1px solid #CCCCCC;
          .lists {
            padding: 25px 80px 25px 60px;
            .list {
              color: #000;
              font-size: 30px;
              font-weight: bold;
            }
            .list:last-of-type {
              padding-right: 79px;
            }
          }
        }
        .list {
          display: inline-flex;
        }
        .list:first-of-type {
          width: 25%;
        }
        .list:nth-of-type(2) {
          width: 49%;
          justify-content: center;
        }
        .list:last-of-type {
          width: 25%;
          justify-content: flex-end;
        }
        .content {
          .lists {
            padding: 20px 80px 20px 60px;
            border-bottom: 1px solid #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
            .list {
              align-items: center;
              span {
                display: block;
                width: 100%;
              }
              span:first-of-type {
                font-size: 26px;
                color: #000;
              }
              span:nth-of-type(2) {
                font-size: 24px;
                color: #909399;
                margin-top: 20px;
              }
              span:first-of-type.red {
                color: #F55825;
              }
              span:first-of-type.green {
                color: #1AAD19;
              }
              .btn {
                width: 200px;
                height: 80px;
                color: #1AAD19;
                border-color: #d7d7d7;
                background-color: #f8f8f8;
                font-size: 28px;
                border-radius: 10px;
              }
            }
            .list:first-of-type {
              display: inline-block;
              text-align: left;
            }
          }
        }
      }
    }
    .channelDetail {
      .shadow {
        position: fixed;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .6);
      }
      .detail {
        background: #FFFFFF;
        border-radius: 20px;
        padding: 0 30px 30px;
        position: fixed;
        z-index: 12;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        white-space: pre-wrap;
        .detail_content {
          width: 960px;
          max-height: 90vh;
          overflow-y: scroll;
          -webkit-overflow-scrolling: touch;
        }
        .title {
          color: #303133;
          font-size: 30px;
          position: relative;
          padding: 30px 0;
          font-weight: bold;
          border-bottom: 1px solid #D8D8D8;
          text-align: left;
          img {
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            display: block;
            width: 24px;
            height: 24px;
            cursor: pointer;
          }
        }
        .refundTitle {
          color: #D0021B;
        }
        .lists {
          .list {
            padding: 24px 0;
            border-bottom: 1px solid #D8D8D8;
            p {
              font-size: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              span {
                color: #000;
              }
              .gey {
                color: #909399;
              }
            }
          }
        }
        .lists:last-of-type {
          padding-bottom: 30px;
        }
        .btns {
          margin: 50px 0 0;
          display: flex;
          justify-content: space-around;
          align-items: center;
          span:first-of-type {
            border: 1px solid #F5222D;
            border-radius: 44px;
            width: 280px;
            height: 78px;
            text-align: center;
            line-height: 78px;
            font-size: 30px;
            color:#F5222D;
          }
          span:last-of-type {
            background: #1AAD19;
            border-radius: 44px;
            width: 280px;
            height: 78px;
            text-align: center;
            line-height: 78px;
            font-size: 30px;
            color: #fff;
          }
          span.refund {
            width: 400px;
            background-color: transparent;
            color:#F5222D;
          }
        }
      }
      .detail_content::-webkit-scrollbar {
        display: none;
      }
    }
    .payTig {
      .shadow {
        position: fixed;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .6);
      }
      .payTigContent {
        background: #FFFFFF;
        border-radius: 20px;
        width: 960px;
        position: fixed;
        z-index: 12;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        .payTig_title {
          color: #303133;
          font-size: 30px;
          position: relative;
          padding: 30px 40px;
          img {
            position: absolute;
            right: 30px;
            top: 50%;
            transform: translateY(-50%);
            display: block;
            width: 24px;
            height: 24px;
            cursor: pointer;
          }
        }
        .payTig_content {
          width: 680px;
          margin: 0 auto;
          .payTig_input {
            input {
              width: 678px;
              border: 1px solid #979797;
              outline: none;
              text-align: center;
              font-size: 26px;
              height: 68px;
              line-height: 68px;
            }
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button {
              -webkit-appearance: none;
            }
            input[type="number"]{
              -moz-appearance: textfield;
            }
            input:-moz-placeholder {
              font-size: 26px;
              color: #606266;
            }
            input:-ms-input-placeholder {
              font-size: 26px;
              color: #606266;
            }
            input::-moz-placeholder {
              font-size: 26px;
              color: #606266;
            }
            input::-webkit-input-placeholder {
              font-size: 26px;
              color: #606266;
            }
          }
          .payTig_keyBoard {
            span {
              border-radius: 3.6px;
              width: 214px;
              height: 70px;
              line-height: 70px;
              text-align: center;
              background-color: #D8D8D8;
              font-size: 29px;
              margin: 20px 15px 0 0;
              cursor: pointer;
              display: inline-block;
              font-weight: bold;
            }
            span:nth-of-type(3n) {
              margin-right: 0;
            }
            span:last-of-type {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              img {
                width: 33px;
                height: 22px;
                display: inline-block;
              }
            }
          }
          .btn {
            margin: 30px 0 40px;
            background: #1AAD19;
            border-radius: 44px;
            text-align: center;
            height: 78px;
            cursor: pointer;
            width: 100%;
            font-size: 26px;
            color: #fff;
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
            color: #909399;
          }
          .sure {
            background-color: inherit;
            border-width: 0;
            border-radius: 20px;
            color: #1AAD19;
            font-size: 24px;
            width: 50%;
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
    .showPmsAbnormal {
      .shadow {
        position: fixed;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .6);
      }
      .pmsAbnormal {
        background: #FFFFFF;
        border-radius: 20px;
        width: 960px;
        position: fixed;
        z-index: 12;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        .title {
          color: #303133;
          font-size: 30px;
          position: relative;
          padding: 30px 40px;
          border-bottom: 1px solid #D8D8D8;
        }
        .lists {
          padding: 0 40px;
          .list {
            padding: 24px 0;
            font-size: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #000;
          }
        }
        p {
          color:#F5222D;
          font-size: 28px;
          padding: 0 40px;
        }
        .btns {
          margin: 50px 0;
          display: flex;
          justify-content: space-around;
          align-items: center;
          .btn1 {
            border: 1px solid #F5222D;
            border-radius: 44px;
            width: 280px;
            height: 78px;
            text-align: center;
            font-size: 30px;
            color:#F5222D;
            background-color: #fff;
          }
          .btn {
            background: #1AAD19;
            border-radius: 44px;
            width: 380px;
            height: 78px;
            text-align: center;
            font-size: 30px;
            color: #fff;
          }
        }
      }
    }
    .showPmsAbnormal_ {
      .shadow {
        position: fixed;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .6);
      }
      .pmsAbnormal {
        background: #FFFFFF;
        border-radius: 20px;
        width: 960px;
        position: fixed;
        z-index: 12;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        .pmsAbnormal_content {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          padding: 183px 80px 143px;
          .pmsAbnormal_fl {
            img {
              display: inline-flex;
              width: 304px;
              height: 218px;
            }
            margin-right: 64px;
          }
          .pmsAbnormal_fr {
            .title {
              color: #000;
              font-size: 36px;
              margin-bottom: 33px;
              text-align: left;
            }
            .content {
              color: #303133;
              font-size: 30px;
              text-align: left;
            }
          }
        }
        .know_btn {
          padding-bottom: 60px;
          text-align: center;
          img {
            width: 440px;
            display: block;
            margin: 0 auto;
          }
        }
      }
    }
    .balance {
      .shadow {
        position: fixed;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .6);
      }
      .balance_content {
        background: #FFFFFF;
        border-radius: 20px;
        width: 960px;
        position: fixed;
        z-index: 12;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        .title_img {
          img {
            display: block;
            width: 160px;
            margin: 98px auto 25px;
          }
        }
        .title {
          color: #000;
          font-size: 36px;
          margin-bottom: 33px;
        }
        .content {
          color: #303133;
          font-size: 30px;
        }
        .know_btn {
          margin-top: 57px;
          padding-bottom: 60px;
          text-align: center;
          img {
            width: 440px;
            display: block;
            margin: 0 auto;
          }
        }
      }
    }
  }

</style>
