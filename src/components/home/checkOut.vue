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
            <span>当前房间：{{orderDetail.subOrderVos[0].roomNo}}</span>
          </div>
          <div :class="(!pmsFlag || !showRC) ? 'replayList replayList_' : 'replayList'">
            <el-button type="primary" :loading="makeLoading" @click="makeKa()">制卡</el-button>
          </div>
          <div class="replayList rcBtn" @click="getPdfCode" v-if="pmsFlag && showRC">
            <span>打印RC单</span>
          </div>
          <div class="replayList quitCurrent" @click="quit=true;">
            <span>退房</span>
          </div>
        </div>
        <div class="roomInfo">
          <div class="nameRooms">
            <div class="namePhone">
              <span class="name">
                <img src="../../assets/renyuan.png" alt="">
                <span>{{orderDetail.owner}}</span>
              </span>
              <span class="phone">
                <span>{{orderDetail.ownerTel ? orderDetail.ownerTel : '-'}}</span>
              </span>
            </div>
            <div class="roomsNo">
              <span>
                <img src="../../assets/fangjian.png" alt="">
                <span v-for="(item, index) in orderDetail.roomNos">{{index == (orderDetail.roomNos.length - 1) ? item : item + '/'}}</span>
              </span>
            </div>
          </div>
          <div class="remark">备注：{{orderDetail.remark ? orderDetail.remark : '-'}}</div>
        </div>
        <div class="check_content" v-show="checkOutShow">
          <!-- 微前台收款-->
          <div class="payInfo" v-if="orderDetail.refundVO && orderDetail.deposits && orderDetail.deposits[0].payFlag < 4">
            <div class="header">
              <div class="lists">
                <div class="list">微前台收款</div>
                <div class="list">金额</div>
                <div class="list">操作</div>
              </div>
            </div>
            <div class="content" v-if="!tradeManager">
              <div class="lists" v-if="orderDetail.refundVO.roomFeeStr != '预付房费'">
                <div class="list">
                  <span>房费</span>
                  <span>{{orderDetail.deposits[0].payFlag == 1 ? '微信支付' : orderDetail.deposits[0].payFlag == 2 ? '支付宝支付' : orderDetail.deposits[0].payFlag == 3 ? '翼支付' : orderDetail.deposits[0].payFlag == 8 ? '工行支付' : '昆仑支付'}}  {{datetimeparse(orderDetail.deposits[0].finishTime, 'yy/MM/dd hh:mm')}}</span>
                </div>
                <div class="list">
                  <span class="red">{{orderDetail.refundVO.roomFeeStr}}元</span>
                </div>
                <div class="list"></div>
              </div>
              <div class="lists">
                <div class="list">
                  <span>押金</span>
                  <span>{{orderDetail.deposits[0].payFlag == 1 ? '微信支付' : orderDetail.deposits[0].payFlag == 2 ? '支付宝支付' : orderDetail.deposits[0].payFlag == 3 ? '翼支付' : orderDetail.deposits[0].payFlag == 8 ? '工行支付' : '昆仑支付'}}  {{datetimeparse(orderDetail.deposits[0].finishTime, 'yy/MM/dd hh:mm')}}</span>
                </div>
                <div class="list">
                  <span class="red">{{orderDetail.refundVO.refundFeeStr}}元</span>
                </div>
                <div class="list">
                  <el-button type="primary" :loading="false" class="btn green"  @click="payInfoClick(orderDetail.deposits[0], 1)" v-if="!orderDetail.deposits[0].refund && !orderDetail.isFreeDeposit">退款</el-button>
                </div>
              </div>
            </div>
            <div class="content" v-else>
              <div class="lists">
                <div class="list">
                  <span>房费/押金</span>
                  <span>{{orderDetail.deposits[0].payFlag == 1 ? '微信支付' : orderDetail.deposits[0].payFlag == 2 ? '支付宝支付' : orderDetail.deposits[0].payFlag == 3 ? '翼支付' : orderDetail.deposits[0].payFlag == 8 ? '工行支付' : '昆仑支付' }}  {{datetimeparse(orderDetail.deposits[0].finishTime, 'yy/MM/dd hh:mm')}}</span>
                </div>
                <div class="list">
                  <span class="red">{{orderDetail.refundVO.totalFee/100}}元</span>
                </div>
                <div class="list">
                  <el-button type="primary" :loading="false" class="btn green"  @click="payInfoClick(orderDetail.deposits[0], 1)" v-if="(!orderDetail.deposits[0].refund)">退款</el-button>
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
                  <span>预授权(房费押金)</span>
                  <span>{{item.payFlag == 1 ? '微信预授权' : item.payFlag == 2 ? '支付宝预授权' : '翼支付预授权'}}  {{datetimeparse(item.finishTime, 'yy/MM/dd hh:mm')}} </span>
                </div>
                <div class="list">
                  <span class="red">{{(item.totalFee/100).toFixed(2)}}元</span>
                </div>
                <div class="list">
                  <el-button type="primary" :loading="false" class="btn primaryColor" @click="payInfoClick(item, 2)" v-if="item.channel == 4">结算</el-button>
                  <el-button type="danger" :loading="false" class="btn dangerColor" @click="payInfoCancle(item)" v-if="item.channel == 4">撤销</el-button>
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
              <div class="lists" v-else>
                <div class="list">
                  <span>总收款 0笔</span>
                </div>
                <div class="list">
                  <span class="green">{{(payInfoGetNum/100).toFixed(2)}}元</span>
                </div>
                <div class="list">

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
              <div class="lists" v-else>
                <div class="list">
                  <span>总消费 0笔</span>
                </div>
                <div class="list">
                  <span class="red">{{(payInfoConsumeNum/100).toFixed(2)}}元</span>
                </div>
                <div class="list">

                </div>
              </div>
            </div>
          </div>
          <div class="payInfo" v-else>
            <div class="header">
              <div class="lists">
                <div class="list">PMS账单</div>
                <div class="list">金额</div>
                <div class="list">操作</div>
              </div>
            </div>
            <div class="content">
              <div class="lists">
                <div class="list">
                  <span>总收款 0笔</span>
                </div>
                <div class="list">
                  <span class="green">{{(payInfoGetNum/100).toFixed(2)}}元</span>
                </div>
                <div class="list">

                </div>
              </div>
              <div class="lists">
                <div class="list">
                  <span>总消费 0笔</span>
                </div>
                <div class="list">
                  <span class="red">{{(payInfoConsumeNum/100).toFixed(2)}}元</span>
                </div>
                <div class="list">

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bgCheckTop"></div>
      <loadingList v-show="loadingShow" :loadingText="loadingText"  style="width: 100vw"></loadingList>

      <!-- 明细-->
      <div class="channelDetail" v-if="channelDetail">
        <div class="shadow" @click="closeTip(1)"></div>
        <div class="detail">
          <div class="detail_content">
            <div class="title">{{payInfoType == 1 ? 'PMS收款' : 'PMS消费'}}<img src="../../assets/guanbi.png" alt="" @click="closeTip(1)"></div>
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
          <div :class="payType ? 'payTig_title titleBg' : 'payTig_title'">
            <span>{{ payType ? '该笔交易关联多个房间，请再次确认消费金额' : ''}}</span>
            <img src="../../assets/guanbi.png" alt="" @click="closeTip(2)">
          </div>
          <div class="payTig_content">
            <div class="content_title">
              {{orderDetail.refundVO ? '请确认退款金额' : '请确认消费金额'}}
            </div>
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
            注意：系统无法自动入账PMS，请手工至PMS入账。
         </p>
          <div class="btns">
            <el-button type="primary" :loading="false" class="btn1" @click="showPmsAbnormal=false">暂不退款</el-button>
            <el-button type="primary" :loading="showPmsAbnormalLoading" class="btn" @click="continuedCheckOutRoom()">继续退款</el-button>
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
            <img src="../../assets/Group.png" alt=""  @click="pmsabnormal">
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

      <!-- 退房费的二次确认-->
      <div class="countinuedQuit" v-if="countinuedQuit">
        <div class="shadow"></div>
        <div class="quit_content">
          <div class="quit_title">退款金额包含房费，请确认是否退款？</div>
          <div class="quit_tabs">
            <span class="cancel" @click="countinuedQuit=false;payTig=true;">取消</span>
            <el-button type="primary" :loading="countinuedQuitSureLoading" class="sure" @click="countinuedQuitSure()">确认退款</el-button>
          </div>
        </div>
      </div>

      <!-- rc单预览弹框-->
      <div class="rcTip" v-if="rcTip">
        <div class="shadow"></div>
        <div class="rcContent">
          <!--<div class="rc_title">明细账单/BILLING</div>-->
          <div class="rc_content">
            <pdf :src="src"></pdf>
          </div>
          <div class="rc_footer">
            <el-button type="primary" class="rc_cancle" @click="rcCancle()">取消</el-button>
            <el-button type="primary" :loading="rcPrintLoading" class="rc_sure" @click="rcPrintClick()">打印</el-button>
          </div>
        </div>
      </div>

      <!-- 撤销弹框-->
      <div class="payCancle" v-if="payCancle">
        <div class="shadow" @click="payCancle = false;accountItem = {};cancleLoading = false;"></div>
        <div class="content">
          <div class="pay_title">
            撤销预授权
            <img src="../../assets/guanbi.png" alt="" @click="payCancle = false;accountItem = {};cancleLoading = false;">
          </div>
          <div class="pay_cantiner">
            <p>撤销预授权后，该笔订单金额 <span> ¥{{(accountItem.totalFee/100).toFixed(2)}}</span>将会原路返回至用户账户，请再次确认后操作！</p>
          </div>
          <el-button type="danger" :loading="cancleLoading" class="btn" @click="accountCancelSure()">撤销预授权</el-button>
        </div>
      </div>

      <!-- 完成预授权二次确认-->
      <div class="secoundTip" v-if="secoundTip">
        <div class="shadow"></div>
        <div class="secoundTip_content">
          <div class="title">
            完成预授权
            <img src="../../assets/guanbi.png" alt="" @click="closeTip(3)">
          </div>
          <div class="lists">
            <div class="list">
              <span>预授权金额</span>
              <span>¥{{ (accountItem.totalFee/100).toFixed(2) }}</span>
            </div>
            <div class="list">
              <span>消费金额</span>
              <span class="primaryColor">¥{{ payMoney }}</span>
            </div>
            <div class="list">
              <span>退还金额</span>
              <span class="dangerColor">¥{{ ((accountItem.totalFee - payMoney*100)/100).toFixed(2) }}</span>
            </div>
          </div>
          <div class="tip">请确认消费金额与实际消费金额一致，点击【完成预授权】退还金额将原路返回</div>
          <el-button type="primary" :loading="countinuedSureLoading" class="btn" @click="syqContentFun()">完成预授权</el-button>
        </div>
      </div>

      <!-- 退款输入二次确认-->
      <div class="secoundTip" v-if="secoundTip1">
        <div class="shadow"></div>
        <div class="secoundTip_content">
          <div class="title">
            退款
            <img src="../../assets/guanbi.png" alt="" @click="closeTip(4)">
          </div>
          <div class="lists">
            <div class="list">
              <span>收款金额</span>
              <span>¥{{ (accountItem.totalFee/100).toFixed(2) }}</span>
            </div>
            <div class="list">
              <span>消费金额</span>
              <span class="primaryColor">¥{{ ((accountItem.totalFee - payMoney*100)/100).toFixed(2) }}</span>
            </div>
            <div class="list">
              <span>退还金额</span>
              <span class="dangerColor">¥{{ payMoney }}</span>
            </div>
          </div>
          <div class="tip">请确认消费金额与实际消费金额一致，点击【完成】退还金额将原路返回</div>
          <el-button type="primary" :loading="countinuedSureLoading1" class="btn" @click="quitTig()">完成</el-button>
        </div>
      </div>

    </div>
  </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex';
  import ElCol from "element-ui/packages/col/src/col";
  import pdf from 'vue-pdf'
  import axios from 'axios'
  import httpTool from '../../tool/httpTool.js'
  import loadingList from './loading.vue'
  export default {
    components: {ElCol, loadingList, pdf},
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
        tradeManager: false, // 退款是否退房费的权限，默认关闭
        countinuedQuit: false,  // 退款的二次确认
        countinuedQuitSureLoading: false,  // 房费二次确认按钮loading
        pmsFlag: true,  // 判断是否对接了pms
        showRC: false,  // rc单入口开关
        src: '',
        rcIframeHtml:'',
        result: '',
        rcPrintLoading: false,    // rc单打印loading
        rcTip: false,    // rc单弹框显示隐藏
        makeLoading: false,   // 制卡loading
        makeKaTimer: null,    // 获取发卡循环timerOut
        cancleLoading: false,   // 预授权撤销loading
        payCancle: false,     // 撤销tip
        countinuedSureLoading: false,     // 完成预授权二次确认loading
        countinuedSureLoading1: false,     // 完成二次确认loading
        secoundTip: false,     // 完成预授权二次tip
        secoundTip1: false,     // 完成二次tip
        payType: false,       // true为关联多房 一起付
      }
    },
    methods: {
      ...mapActions([
          'accountCheckout', 'depositConsume', 'getCheckOutInfo', 'refundHandle', 'accountFeeInfo', 'getRcConfig', 'rcPrint', 'sendRealCard', 'roomCard', 'canclePreAuthorizedDeposit', 'unionPayInfo'
      ]),

      // 返回上一页
      gobanck() {
//        this.$router.go(-1);
        clearTimeout(this.makeKaTimer);
        this.$emit('checkOutLoading', 0);
        this.$router.replace({name:'liveIn'})
      },

      // 制卡
      makeKa() {
        this.makeLoading = true;
        if (sessionStorage.getItem('deviceId')) {

        }else {
          this.$toast({
            message: '网页端不支持该功能',
            iconClass: 'icon ',
          });
          this.makeLoading = false;
          return;
        }
        this.sendRealCard({
          subOrderId: this.changeItem.subOrderId,
          onsuccess: body => {
            if (body.code == 0 && bady.data) {
              this.makeKaTimer = setTimeout(() => {
                this.makeResult(bady.data);
              }, 2000)
            }else {
              this.$toast({
                message: body.msg,
                iconClass: 'icon ',
              });
              this.makeLoading = false;
            }
          },
          onfail: body => {
            this.makeLoading = false;
          },
          onerror: body => {
            this.makeLoading = false;
          }
        })
      },

      // 获取发卡结果
      makeResult(id) {
        clearTimeout(this.makeKaTimer);
        this.roomCard({
          id: id,
          onsuccess: body => {
            if (body.code == 0 && body.data) {
              if (body.data.status == 0) {
                this.$toast({
                  message: '正在创建发卡...',
                  iconClass: 'icon ',
                });
                this.makeKaTimer = setTimeout(() => {
                  this.makeResult(id);
                }, 2000);
              }else if (body.data.status == 1) {
                this.$toast({
                  message: '已发卡',
                  iconClass: 'icon ',
                });
                this.makeLoading = false;
              }else if (body.data.status == 2) {
                this.$toast({
                  message: 'pms记录添加',
                  iconClass: 'icon ',
                });
                this.makeLoading = false;
              }else if (body.data.status == 3) {
                this.$toast({
                  message: 'pms记录撤销',
                  iconClass: 'icon ',
                });
                this.makeLoading = false;
              }else if (body.data.status == 4) {
                this.$toast({
                  message: '发卡未拔卡回收',
                  iconClass: 'icon ',
                });
                this.makeLoading = false;
              }else {
                this.makeLoading = false;
              }
            }
          },
          onfail: body => {
            this.makeLoading = false;
          },
          onerror: body => {
            this.makeLoading = false;
          }
        })
      },

      // 预授权pms入账异常
      pmsabnormal() {
        this.showPmsAbnormal_ = false;
        this.gobanck();
      },

      // 弹框关闭
      closeTip(type) {
          if (type == 1) {
              this.channelDetail = false;
          }else if (type == 2) {
              this.payTig = false;
              this.payMoney = '';
              this.infoLoading = false;
          }else if (type == 3) {
              this.secoundTip = false;
              this.payMoney = '';
          }else if (type == 4) {
              this.secoundTip1 = false;
              this.payMoney = '';
          }
          document.body.removeEventListener('touchmove',this.bodyScroll,false);
          document.body.style.position = 'initial';
          document.body.style.width = 'auto';
      },

      // 撤销
      payInfoCancle(item) {
        this.accountItem = item;
        this.payCancle = true;
        document.body.addEventListener('touchmove',this.bodyScroll,false);
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      },

      // 撤销确认
      accountCancelSure() {
        this.cancleLoading = true;
        this.canclePreAuthorizedDeposit({
          data: {
            orderId: this.orderDetail.id || '',
            remark: '',
            payFlowId: this.orderDetail.payFlowId
          },
          onsuccess: body => {
            this.cancleLoading = false;
            if (body.data.code == 0) {
              this.$toast({
                iconClass: 'icon ',
                message: '撤销成功',
              });
              this.channelDetail = false;
              this.payCancle = false;
              setTimeout(() => {
                this.replayList();
              }, 1000)
            }else if (body.data.code == 20003) {
              this.payCancle = false;
              this.showPmsAbnormal_ = true;
            }else {
              this.$toast({
                iconClass: 'icon ',
                message: body.data.msg,
              });
            }
          },
          onfail: (body, headers) => {
            this.cancleLoading = false;
            this.payCancle = false;
          },
          onerror: body => {
            this.cancleLoading = false;
            this.payCancle = false;
          }
        });
      },

      // 结账
      payInfoClick(item, type) {
        this.accountItem = item;
        this.accountFeeInfo({
          orderId: this.orderDetail.id,
          payFlowId: this.orderDetail.payFlowId,
          onsuccess: body => {
            if (body.data.code == 0 && body.data.data) {
              this.chargeRecordObj = body.data.data
            }
            if (type == 1) {
              this.payMoney = body.data.data ? body.data.data.refundFee ? body.data.data.refundFee <= 0 ? '' : (body.data.data.refundFee/100).toFixed(2) : 0 : '';
            }else {
              this.payMoney = body.data.data ? body.data.data.consumeFee ? body.data.data.consumeFee <= 0 ? '' : (body.data.data.consumeFee/100).toFixed(2) : 0 : '';
            }
            this.unionPayInfo({
              payFlowId: this.orderDetail.payFlowId,
              onsuccess: body => {
                  if (body.data.code == 0) {
                      if (body.data.data) {
                          this.payType = true;
                      }else {
                          this.payType = false;
                      }
                  }
                  document.body.addEventListener('touchmove',this.bodyScroll,false);
                  document.body.style.position = 'fixed';
                  document.body.style.width = '100%';
                  this.payTig = true;
              }
            });
          }
        })
      },

      //继续退房
      continuedCheckOutRoom(){
        this.showPmsAbnormal = false;
        this.checked = true;
        this.showPmsAbnormalLoading = true;
        this.quitTig();
      },

      // 二次确认退房费
      countinuedQuitSure() {
        this.countinuedQuitSureLoading = true;
        this.secoundTip1 = true;
        this.infoLoading = false;
        this.countinuedQuitSureLoading = false;
        this.countinuedQuit = false;
        this.payTig = false;
      },

      // 退款接口
      quitTig() {
        this.countinuedSureLoading1 = true;
        this.refundHandle({
          data:{
            checkInRoomId: sessionStorage.getItem('roomcode') ? sessionStorage.getItem('roomcode') : '',
            orderId: sessionStorage.getItem('checkOutItem') ? JSON.parse(sessionStorage.getItem('checkOutItem')).orderId : this.orderDetail.id,
            refundfee: this.payMoney,
            checked: this.checked,
            ischeckOut: false,
            payFlowId: this.accountItem.payFlowId
          },
          onsuccess:(body)=>{
            this.closeTip();
            if(body.data.code == 0){
              this.payTig = false;
              this.secoundTip1 = false;
              this.countinuedSureLoading1 = false;
              sessionStorage.setItem('quitSe', 1);
              this.quit = true;
              this.payMoney = '';
              this.getDetail();
            }else if(body.data.code == 20003){
              this.showPmsAbnormal = true;
            }else if (body.data.code == 20006) {
              this.$toast({
                message: body.data.msg,
                iconClass: 'icon ',
              });
              this.gobanck();
            }else if (body.data.code == 10006) {
              this.$toast({
                message: body.data.msg,
                iconClass: 'icon ',
              });
            }else if (body.data.code == 100049 || body.data.code == 100036) {
              this.showBalance = true;
            }
            this.checked = '';
            this.countinuedQuit = false;
            this.payTig = false;
            this.secoundTip1 = false;
            this.countinuedSureLoading1 = false;
            this.infoLoading = false;
            this.showPmsAbnormalLoading = false;
            this.countinuedQuitSureLoading = false;
          },
          onfail: body => {
            this.countinuedQuit = false;
            this.infoLoading = false;
            this.countinuedSureLoading1 = false;
            this.showPmsAbnormalLoading = false;
            this.countinuedQuitSureLoading = false;
          },
          onerror: body => {
            this.countinuedQuit = false;
            this.infoLoading = false;
            this.countinuedSureLoading1 = false;
            this.showPmsAbnormalLoading = false;
            this.countinuedQuitSureLoading = false;
          }
        })
      },

      // 结账弹框确定事件
      paySure() {
        this.infoLoading = true;
        let regPos = /^\d+(\.\d+)?$/; //非负浮点数
        if (this.orderDetail.refundVO) {
          if (this.payMoney == '') {
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
          }else if ((parseFloat(this.payMoney*100) > parseFloat(this.orderDetail.refundVO.refundFeeStr*100)) && !this.tradeManager) {
            this.$toast({
              message: '注意：不能大于押金金额',
              iconClass: 'icon ',
            });
            this.infoLoading = false;
            this.showPmsAbnormalLoading = false;
          }else if ((parseFloat(this.payMoney*100) > parseFloat(this.orderDetail.refundVO.totalFee)) && this.tradeManager) {
            this.$toast({
              message: '注意：不能大于总金额',
              iconClass: 'icon ',
            });
            this.infoLoading = false;
            this.showPmsAbnormalLoading = false;
          }else if ((parseFloat(this.payMoney*100) <= parseFloat(this.orderDetail.refundVO.totalFee)) && (parseFloat(this.payMoney*100) > parseFloat(this.orderDetail.refundVO.refundFeeStr*100)) && this.tradeManager) {
            this.payTig = false;
            this.countinuedQuit = true;
            this.infoLoading = false;
            this.showPmsAbnormalLoading = false;
          }else {
//            this.quitTig();
            this.secoundTip1 = true;
            this.infoLoading = false;
            this.countinuedQuitSureLoading = false;
            this.countinuedQuit = false;
            this.payTig = false;
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
            this.secoundTip = true;
            this.infoLoading = false;
            this.payTig = false;
          }
        }
      },

      syqContentFun() {
        this.countinuedSureLoading = true;
        this.depositConsume({
          data: {
            orderId: this.changeItem.orderId || '',
            amount: this.payMoney,
            remark: '',
            payFlowId: this.accountItem.payFlowId
          },
          onsuccess: body => {
            this.closeTip();
            if (body.data.code == 0) {
              this.payMoney = '';
              this.payTig = false;
              this.countinuedSureLoading = false;
              this.secoundTip = false;
              sessionStorage.setItem('quitSe', 1);
              this.quit = true;
              this.getDetail();
            }else if (body.data.code == 20003) {
              this.showPmsAbnormal_ = true;
              this.countinuedSureLoading = false;
              this.secoundTip = false;
            }else {
              this.gobanck();
            }
            this.infoLoading = false;
            this.countinuedSureLoading = false;
            this.secoundTip = false;
          },
          onfail: body => {
            this.infoLoading = false;
            this.countinuedSureLoading = false;
          },
          onerror: body => {
            this.infoLoading = false;
            this.countinuedSureLoading = false;
          }
        });
      },

      // 查看明细
      lookInfoList(index) {
        this.payInfoType = index;
        this.channelDetail = true;
        document.body.addEventListener('touchmove',this.bodyScroll,false);
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      },

      cancel() {
        this.quit = false;
        this.closeTip();
        if (sessionStorage.getItem('quitSe') == 1) {
          sessionStorage.removeItem('quitSe');
          this.replayList();
        }
      },

      // 退房操作
      sure() {
        this.quitLoading = true;
        this.accountCheckout({
          data: {
            checkInRoomId: this.changeItem.checkInRoomId,
            amount: this.payMoney,
            payFlowId: this.orderDetail.payFlowId,
          },
          onsuccess: body => {
            this.payMoney  = '';
            this.closeTip();
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
            }else if (body.data.code == 20006) {
              this.$toast({
                message: body.data.msg,
                iconClass: 'icon ',
              });
            }
            this.replayList();
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
          checkInRoomId: this.changeItem.checkInRoomId,
          onsuccess: body => {
            if (body.data.code == 0) {
              this.loadingShow = false;
              this.orderDetail = body.data.data;
              if (this.orderDetail.pmsOrder && this.orderDetail.pmsOrder.length != 0) {
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
            this.payMoney = '';
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

      // 初始化获取pdf文件
      getPdfCode () {
        let that = this;
        axios({
          method: 'get',
          url: httpTool.httpUrlEnv() + sessionStorage.getItem('windowUrl')+'double-screen/ecard/orders/rcUrl/'+this.changeItem.subOrderId,
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            Session: sessionStorage.session_id,
            token: sessionStorage.session_id
          },
          responseType: 'blob'  //设置响应的数据类型为一个包含二进制数据的 Blob 对象，必须设置！！！
        }).then(response => {
          if (response.data.size != 14) {
            that.result = response.data;
            that.src = that.getObjectURL(response.data);
            this.rcTip = true;
            console.log('that.src', that.src);
          }else {
            this.$toast({
              message: '暂无RC单',
              iconClass: 'icon ',
            });
          }
        }).catch(function (error) {
          console.log(error);
        });
      },

      // 将返回的流数据转换为url
      getObjectURL(file) {
        let url = null;
        if (window.createObjectURL != undefined) { // basic
          url = window.createObjectURL(file);
        } else if (window.webkitURL != undefined) { // webkit or chrome
          try {
            url = window.webkitURL.createObjectURL(file);
          } catch (error) {

          }
        } else if (window.URL != undefined) { // mozilla(firefox)
          try {
            url = window.URL.createObjectURL(file);
          } catch (error) {

          }
        }
        return url;
      },

      // rc单打印
      rcPrintClick(){
        let list = this.changeItem.guestList;
        let nameList = [];
        nameList.push(list[0].name);
        console.log('nameList', nameList);
        this.rcPrintLoading = true;
        this.rcPrint({
          data:{
            subOrderId: this.changeItem.subOrderId,//子订单号
            hotelId: sessionStorage.getItem('hotel_id'),//酒店ID
            name: nameList //入住人姓名
          },
          onsuccess:body => {
            if (body.data.code == 0) {
              this.$toast({
                message: 'RC单打印成功',
                iconClass: 'icon ',
              });
              this.rcTip = false;
            }
            this.rcPrintLoading = false;
          },
          onfail: body => {
            this.rcPrintLoading = false;
          },
          onerror: body => {
            this.rcPrintLoading = false;
          }
        });
      },

      // rc单弹框取消
      rcCancle() {
        this.rcTip = false;
      },


      //是否配置RC单打印
      initRCConfig(){
        this.getRcConfig({
          onsuccess: body => {
            if(body.code==0){
              this.showRC = body.data;
              console.log('this.showRC', this.showRC);
            }
            this.getDetail();
          },
          onfail: body => {
            this.$emit('checkOutLoading', 1);
            this.loadingShow = false;
            this.checkOutShow = true;
          },
          onerror:body => {
            this.$emit('checkOutLoading', 1);
            this.loadingShow = false;
            this.checkOutShow = true;
          }
        })
      },
    },
    beforeMount () {
      this.loadingShow = false;
      this.changeItem = sessionStorage.getItem('checkOutItem') ? JSON.parse(sessionStorage.getItem('checkOutItem')) : '';
    },

    mounted () {
      this.loadingShow = true;
      this.checkOutShow = false;
      let list = JSON.parse(sessionStorage.getItem('subPermissions'));
      list.forEach(item => {
        if (item.tag == 'sp_trade_manager') {
          this.tradeManager = true;
        }
      });
      this.pmsFlag = sessionStorage.getItem('pmsFlag') == 'true' ? true : false;
      this.initRCConfig();
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">

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
        border-bottom: 1px solid #CCCCCC;
        div {
          display: inline-flex;
          align-items: center;
        }
        .goback {
          img {
            width: 18px;
            height: 22px;
            display: inline-flex;
            margin-right: 7px;
          }
          span {
            color: #1AAD19;
            font-size: 20px;
          }
        }
        .roomNo {
          font-size: 20px;
          color: #000;
          margin-left: 117px;
          margin-right: 300px;
        }
        .replayList {
          position: absolute;
          top: 50%;
          right: 530px;
          transform: translateY(-50%);
          font-size: 20px;
          color: #fff;
          background-image: linear-gradient(141deg, #7BAEEF 0%, #4378BA 100%);
          box-shadow: 0 4px 10px 0 rgba(0,0,0,0.17);
          border-radius: 32px;

          .el-button--primary {
            width: 100%;
            height: 100%;
            display: block;
            font-size: 20px;
            background: transparent;
            border: none;
            padding: 14px 50px;
          }
        }
        .quitCurrent {
          background: #1AAD19;
          right: 80px;
          padding: 8px 50px;
        }
        .rcBtn {
          right: 280px;
          padding: 8px 50px;
          background: linear-gradient(-51deg, #D59640 4%, #F3CA8A 92%);
        }
        .replayList_ {
          right: 280px;
        }
      }
      .roomInfo {
        padding: 30px 80px 30px 60px;
        .nameRooms {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin-bottom: 30px;
          .namePhone, .roomsNo {
            display: inline-flex;
            align-items: center;
            span {
              display: inline-flex;
              align-items: center;
              img {
                width: 24px;
                height: 24px;
                margin-right: 16px;
              }
              span {
                font-size: 20px;
                color: #000;
                display: inline-flex;
              }
              span:only-of-type {
                margin-right: 32px;
              }
            }
          }
        }
        .remark {
          color: #303133;
          font-size: 20px;
          text-align: left;
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
              font-size: 20px;
              font-weight: bold;
            }
            .list:last-of-type {
              padding-right: 79px;
            }
          }
        }
        .header:first-of-type {
          border-top: 0;
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
                font-size: 20px;
                color: #000;
              }
              span:nth-of-type(2) {
                font-size: 20px;
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
                width: 160px;
                height: 64px;
                color: #1AAD19;
                border-color: #d7d7d7;
                background-color: #f8f8f8;
                font-size: 20px;
                border-radius: 10px;
              }
              .primaryColor {
                span {
                  color: #1AAD19;
                }
              }
              .dangerColor {
                span {
                  color: #F5222D;
                }
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
          width: 620px;
          max-height: 90vh;
          overflow-y: scroll;
          -webkit-overflow-scrolling: touch;
        }
        .title {
          color: #303133;
          font-size: 24px;
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
            padding: 12px 0;
            border-bottom: 1px solid #D8D8D8;
            p {
              font-size: 20px;
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
            font-size: 28px;
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
            background-color: #F5222D;
            color:#fff;
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
        width: 620px;
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
        .titleBg {
          background: #F5222D;
          color: #fff;
          border-radius: 20px 20px 0 0;
        }
        .payTig_content {
          width: 620px;
          margin: 0 auto;
          .content_title {
            color: #303133;
            font-size: 24px;
            position: relative;
            padding: 30px 40px;
          }
          .payTig_input {
            input {
              width: 470px;
              border: 1px solid #979797;
              outline: none;
              text-align: center;
              font-size: 24px;
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
              font-size: 24px;
              color: #606266;
            }
            input:-ms-input-placeholder {
              font-size: 24px;
              color: #606266;
            }
            input::-moz-placeholder {
              font-size: 24px;
              color: #606266;
            }
            input::-webkit-input-placeholder {
              font-size: 24px;
              color: #606266;
            }
          }
          .payTig_keyBoard {
            span {
              border-radius: 3.6px;
              width: 144px;
              height: 70px;
              line-height: 70px;
              text-align: center;
              background-color: #f7f7f7;
              font-size: 24px;
              margin: 20px 15px 0 0;
              cursor: pointer;
              display: inline-block;
              font-weight: bold;
              color: #333;
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
            cursor: pointer;
            height: 68px;
            width: 70%;
            font-size: 24px;
            color: #fff;
          }
        }
      }
    }
    .quit, .countinuedQuit, .payCancle ,.secoundTip {
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
        position: fixed;
        z-index: 12;
        left: 50%;
        top: 50%;
        width: 540px;
        transform: translate(-50%, -50%);
        .quit_title {
          padding: 120px 50px;
          border-bottom: 1px solid #D8D8D8;
          color: #0B0B0B;
          font-size: 24px;
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
            font-size: 20px;
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
            span {
              color: #1AAD19;
            }
          }
          .cancel:first-of-type:after {
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
    .payCancle {
      .content {
        background: #FFFFFF;
        border-radius: 20px;
        position: fixed;
        z-index: 12;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        .pay_title {
          color: #303133;
          font-size: 30px;
          position: relative;
          padding: 30px 40px;
          border-bottom: 1px solid #D8D8D8;
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
        .pay_cantiner {
          width: 680px;
          margin: 0 auto;
          padding: 20px 0 60px;
          p {
            color: #000;
            font-size: 30px;
            padding: 0 40px;
            text-align: left;
            span {
              color: #1AAD19;
            }
          }
        }
        .btn {
          margin: 30px 0 40px;
          background: #F5222D;
          border-radius: 44px;
          text-align: center;
          height: 78px;
          cursor: pointer;
          width: 50%;
          font-size: 26px;
          color: #fff;
        }
      }
    }
    .secoundTip {
      .secoundTip_content {
        background: #FFFFFF;
        border-radius: 20px;
        width: 620px;
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
        .lists {
          padding: 30px 40px;
          .list {
            padding: 30px 0 0;
            font-size: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #000;
            .primaryColor {
              color: #1AAD19;
            }
            .dangerColor {
              color: #F5222D;
            }
          }
        }
        .tip {
          padding: 0 35px;
          text-align: left;
          font-size: 26px;
          color: #303133;
        }
        .btn {
          margin: 30px 0 40px;
          background: #1AAD19;
          border-radius: 44px;
          text-align: center;
          height: 78px;
          cursor: pointer;
          width: 50%;
          font-size: 26px;
          color: #fff;
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
        width: 620px;
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
        width: 620px;
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
        width: 620px;
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
    .rcTip {
      .shadow {
        position: fixed;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .6);
      }
      .rcContent {
        background: #FFFFFF;
        border-radius: 20px;
        width: 1020px;
        position: fixed;
        z-index: 12;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        padding: 60px 0;
        .rc_content {
          max-height: 68vh;
          overflow-y: scroll;
        }
        .rc_content::-webkit-scrollbar {
          display: none;
        }
        /deep/ canvas {
          display: block;
          width: 620px !important;
        }
      }
      .rc_title {
        color: #000;
        font-size: 36px;
      }
      .rc_content {
        padding: 0 200px;
      }
      .rc_footer {
        margin-top: 47px;
        padding: 0 120px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .rc_cancle {
          background-color: transparent;
          border: 2px solid #F5222D;
          color: #F5222D;
          border-radius: 44px;
          font-size: 24px;
          width: 360px;
          height: 88px;
        }
        .rc_sure {
          width: 360px;
          height: 88px;
          color: #fff;
          background: #1AAD19;
          border-radius: 44px;
          font-size: 24px;
        }
      }
    }
  }

</style>
