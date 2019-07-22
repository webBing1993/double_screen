<template>
  <div>
    <div class="paymentIndex">
      <div class="changeItem">
        <span>交易时间</span>
        <el-date-picker
          v-model="timeVal"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="datePicker"
        >
        </el-date-picker>
        <span :class="isPreauthorize ? 'change_item active' : 'change_item'" @click="preLicensingChange">预授权</span>
        <span class="items">
          <span :class="filterObj.payFlag == 1 ? 'change_item active' : 'change_item'" @click="payStatusChange(1)">微信支付</span>
          <span :class="filterObj.payFlag == 2 ? 'change_item active' : 'change_item'" @click="payStatusChange(2)">支付宝</span>
        </span>
      </div>
      <div class="paymentLists" v-if="showList">
        <div class="list" v-for="item in paymentLists" @click="detailTig(item.orderId, item.channel, item.tradeType)">
          <div class="list_header">
            <span>交易时间：{{datetimeparse(item.timeEnd,"yy/MM/dd hh:mm")}}</span>
            <span>交易单号：{{item.orderId}}</span>
          </div>
          <div class="list_content">
            <div class="list_fl">
              <p class="title">{{item.payFlag == 1 ? '微信支付' : '支付宝支付'}}<sapn v-if="item.channel == 4 || item.channel == 5 || item.channel == 6"> . 预授权</sapn></p>
              <div class="rooms"><span>房间号：</span>{{item.roomNo ? item.roomNo : '暂无房号'}}</div>
              <div class="roomIn"><span>入住人：</span>{{item.contactName ? item.contactName : '暂无入住人'}}</div>
            </div>
            <div class="list_fr">
              <p>{{item.channel == 4 ? '冻结' : item.channel == 5 ? '结算' : item.channel== 6 ? '解冻' : '交易'}}金额： <span class="green">{{item.totalFeeStr}}元</span></p>
              <span :class="{'red':item.resultCode=='FAILED'}" v-if="item.channel != 4 && item.channel != 5 && item.channel != 6">{{item.tradeType=='refund'?item.resultCode=='FAILED'?'退款失败':'已退款':item.resultCode=='FAILED'?'收款失败':'已收款'}}</span>
              <span v-if="item.channel == 6" class="red">已撤销</span>
              <span v-if="item.channel == 4" class="blue">快速结算</span>
              <span v-if="item.channel == 5" class="grey">{{item.founder}} {{item.timeEndStr}} 已结算</span>
              <img src="../../assets/gengduo.png" alt="">
            </div>
          </div>
        </div>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="page"
          :page-size="10"
          layout="total, prev, pager, next"
          :total="total" v-if="paymentLists.length != 0">
        </el-pagination>
        <div class="noMsg" v-else>
          <div class="img"><img src="../../assets/zanwuneirong.png" alt=""></div>
          <p>暂无内容</p>
        </div>
      </div>
      <!-- 结算、退款弹框-->
      <div class="payTig" v-if="payTig">
        <div class="shadow"></div>
        <div class="payTigContent">
          <div class="payTig_title">
            请确认{{payTigStatus == 1 ? '退款' : '结算'}}金额
            <img src="../../assets/guanbi.png" alt="" @click="payTig = false;payMoney = ''">
          </div>
          <div class="payTig_content">
            <div class="payTig_input"><input type="text" v-model="payMoney" :placeholder="payTigStatus == 1 ? '请输入退款金额' : '请输入结算金额'"></div>
            <div class="payTig_keyBoard">
              <span v-for="item in keyBoard" @click="keyEntry(item)">{{item}}</span>
              <span @click="keyCancel()"><img src="../../assets/shanchuanniu.png" alt=""></span>
            </div>
            <div class="btn" @click="payTigStatus == 1 ? refundMoney() : accountMoney()">确定</div>
          </div>
        </div>
      </div>

      <!-- 預授權詳情-->
      <div class="channelDetail" v-if="channelDetail">
        <div class="shadow"></div>
        <div class="detail">
          <div class="title" v-if="!detailVal.refundModel || detailVal.refundModel.channel == 4">
            授权信息
            <img src="../../assets/guanbi.png" alt="" @click="channelDetailCancle">
          </div>
          <div class="title1 title" v-if="detailVal.refundModel && detailVal.refundModel.channel != 4">
            授权信息
            <img src="../../assets/guanbi.png" alt="" @click="channelDetailCancle">
          </div>
          <div class="lists">
            <div class="list">
              <span>冻结金额</span>
              <span>￥{{detailVal.totalFeeStr}}</span>
            </div>
            <div class="list">
              <span>操作人员</span>
              <span>{{detailVal.founder}}</span>
            </div>
            <div class="list">
              <span>授权通道</span>
              <span v-if="detailVal.payFlag == 1">微信</span>
              <span v-else-if="detailVal.payFlag == 2">支付宝</span>
              <span v-else>微信</span>
            </div>
              <div class="list">
              <span>授权时间</span>
              <span>{{datetimeparse(detailVal.timeEnd, 'yy/MM/dd hh:mm:ss')}}</span>
            </div>
            <div class="list">
              <span>商户订单号</span>
              <span>{{detailVal.outTradeNo}}</span>
            </div>
          </div>
          <div class="title1 title" v-if="detailVal.channel == 4 && detailVal.refundModel && detailVal.refundModel.channel == 5">
            结算信息
          </div>
          <div class="lists" v-if="detailVal.channel == 4 && detailVal.refundModel && detailVal.refundModel.channel == 5">
            <div class="list">
              <span>结算金额</span>
              <span>￥{{(detailVal.refundModel.totalFee/100).toFixed(2)}}</span>
            </div>
            <div class="list">
              <span>操作人员</span>
              <span>{{detailVal.refundModel.founder}}</span>
            </div>
            <div class="list">
              <span>结算时间</span>
              <span>{{detailVal.refundModel.timeEnd}}</span>
            </div>
            <div class="list">
              <span>商户订单号</span>
              <span>{{detailVal.outTradeNo}}</span>
            </div>
          </div>
          <div class="title1 title" v-if="detailVal.channel == 4 && detailVal.refundModel && detailVal.refundModel.channel == 5">
            解冻信息
          </div>
          <div class="lists" v-if="detailVal.channel == 4 && detailVal.refundModel && detailVal.refundModel.channel == 5">
            <div class="list">
              <span>解冻金额</span>
              <span>￥{{(detailVal.refundModel.refund_fee/100).toFixed(2)}}</span>
            </div>
            <div class="list">
              <span>操作人员</span>
              <span>{{detailVal.refundModel.founder}}</span>
            </div>
            <div class="list">
              <span>解冻时间</span>
              <span>{{detailVal.refundModel.timeEnd}}</span>
            </div>
            <div class="list">
              <span>解冻单号</span>
              <span>{{detailVal.refundModel.outTradeNo}}</span>
            </div>
          </div>
          <div class="title1 title" v-if="detailVal.channel == 4 && detailVal.refundModel && detailVal.refundModel.channel == 6" style="padding: 5px 0">

          </div>
          <div class="lists" v-if="detailVal.channel == 4 && detailVal.refundModel && detailVal.refundModel.channel == 6">
            <div class="list">
              <span>授权状态</span>
              <span class="blue">取消授权</span>
            </div>
            <div class="list">
              <span>操作人员</span>
              <span>{{detailVal.refundModel.founder}}</span>
            </div>
            <div class="list">
              <span class="list_title">操作时间</span>
              <span class="list_content">{{detailVal.refundModel.timeEnd}}</span>
            </div>
          </div>
          <div class="btns" v-if="detailVal.channel == 4 && !detailVal.refundModel">
            <span @click="accountCancelSure">取消授权</span>
            <span @click="accounts">结算</span>
          </div>
        </div>
      </div>

      <!-- 订单详情-->
      <div class="channelDetail" v-if="channelDetail1">
        <div class="shadow"></div>
        <div class="detail">
          <div class="title"  v-if="!detailVal.refundModel || detailVal.refundModel == null">
            支付信息
            <img src="../../assets/guanbi.png" alt="" @click="channelDetail1 = false;">
          </div>
          <div class="title1 title"  v-if="detailVal.refundModel || detailVal.refundModel != null">
            支付信息
            <img src="../../assets/guanbi.png" alt="" @click="channelDetail1 = false;">
          </div>
          <div class="lists">
            <div class="list">
              <span>支付金额</span>
              <span>￥{{detailVal.totalFeeStr}}</span>
            </div>
            <div class="list">
              <span>操作人员</span>
              <span>{{detailVal.founder}}</span>
            </div>
            <div class="list">
              <span>支付通道</span>
              <span v-if="detailVal.payFlag == 1">微信</span>
              <span v-else-if="detailVal.payFlag == 2">支付宝</span>
              <span v-else>微信</span>
            </div>
            <div class="list">
              <span>交易状态</span>
              <span :class="{'red':detailVal.resultCode=='FAILED'}">{{detailVal.tradeType=='refund'?detailVal.resultCode=='FAILED'?'退款失败':'退款':detailVal.resultCode=='FAILED'?'收款失败':'收款'}}</span>
            </div>
            <div class="list">
              <span>交易时间</span>
              <span>{{datetimeparse(detailVal.timeEnd, 'yy/MM/dd hh:mm:ss')}}</span>
            </div>
            <div class="list">
              <span>商户订单号</span>
              <span>{{detailVal.outTradeNo}}</span>
            </div>
          </div>
          <div class="title1 title refundTitle"  v-if="detailVal.refundModel || detailVal.refundModel != null">
            退款信息
          </div>
          <div class="lists"  v-if="detailVal.refundModel || detailVal.refundModel != null">
            <div class="list">
              <span>退款金额</span>
              <span>￥{{detailVal.refundModel.totalFeeStr}}</span>
            </div>
            <div class="list">
              <span>操作人员</span>
              <span>{{detailVal.refundModel.founder}}</span>
            </div>
            <div class="list">
              <span>退款时间</span>
              <span>{{detailVal.refundModel.timeEnd}}</span>
            </div>
            <div class="list">
              <span>商户订单号</span>
              <span>{{detailVal.refundModel.outTradeNo}}</span>
            </div>
          </div>
          <div class="btns" v-if="!detailVal.refundModel || detailVal.refundModel == null">
            <span class="refund" @click="refund">退款</span>
          </div>
        </div>
      </div>
      <loadingList v-if="loadingShow" :loadingText="loadingText"></loadingList>
    </div>
  </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex';
  import ElCol from "element-ui/packages/col/src/col";
  import loadingList from './loading.vue'

  export default {
    name: 'payment',
    components: {ElCol, loadingList},
    data () {
      return {
        loadingShow: false,  // loading
        loadingText: '加载中...', // loading text
        showList: false,
        timeVal: '', // 日期选择
        isPreauthorize: false, // 预授权冻结选中状态
        paymentLists: [],  // 数据列表
        page: 1,  // 当前页数
        total: 0, // 总条数
        payTig: false,   // 结算/退款弹框
        payTigStatus: '',  // 判断是否为退款还是结算
        payMoney: '',   // 退款，结算金额
        keyBoard: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'],   // 键盘
        filterObj: {
          source: '',
          payFlag: '', // 支付的方式
          payType: '',//支付授权方式 1刷脸支付
          tradeType: '',//交易类型 1收款、2退款
          resultCode: ''//交易状态 1成功，2失败,}
        },
        channelDetail: false,  // 授權詳情
        channelDetail1: false,  // 授權詳情
        detailVal: {},   // 詳情
      }
    },
    filters: {

    },
    methods: {
      ...mapActions([
        'goto', 'reimburse', 'depositConsume', 'undisposed', 'canclePreAuthorizedDeposit', 'paymentAndUnfinish'
      ]),

      // 日期选择
      datePicker(val) {
        this.loadingShow = true;
        console.log('datePciker',val);
        this.showList = false;
        this.paymentList(1, '');
      },

      // 支付选择
      payStatusChange (index) {
        this.loadingShow = true;
        this.filterObj.payFlag = index;
        this.showList = false;
        this.paymentList(1, '');
      },

      // 选择预授权冻结
      preLicensingChange() {
        this.loadingShow = true;
        this.isPreauthorize = !this.isPreauthorize;
        this.showList = false;
        this.paymentList(1, '');
      },

      // 分页
      handleSizeChange (val) {

      },

      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.loadingShow = true;
        this.showList = false;
        this.paymentList(val);
      },

      // 获取数据列表
      paymentList(page) {
        this.undisposed ({
          data: {
            page: page,  //页数
            roomNo: '',//房号 (房间名字：如303)
            startTime: this.datetimeparse(this.timeVal[0].getTime(), 'yy-MM-dd hh:mm:ss'),
            endTime: this.datetimeparse(this.timeVal[1].getTime() + 24*60*60*1000-1, 'yy-MM-dd hh:mm:ss'),
            founder: 'All',
            isPreauthorize: this.isPreauthorize ? 1 : '',
            ...this.filterObj
          },
          onsuccess: body => {
              console.log('body.data',body.data.data);
            this.loadingShow = false;
            if (body.data.code == 0) {
              this.paymentLists = body.data.data.data;
              this.total = body.data.data.total;
            }
            this.showList = true;
          },
          onfail: (body, headers) => {
            this.loadingShow = false;
          }
        })
      },

      // 獲取詳情
      detailTig(id, channel,tradeType) {
        this.loadingShow = true;
        this.paymentAndUnfinish({
          data:{
            orderId: id,
            isRefund: tradeType == 'refund' ? true : false
          },
          onsuccess: (body) => {
            this.loadingShow = false;
            if(body.data.code == 0){
              this.detailVal = body.data.data;
              if (channel == 4 || channel == 5 || channel == 6) {
                document.body.addEventListener('touchmove',this.bodyScroll,false);
                document.body.style.position = 'fixed';
                document.body.style.height = '100%';
                this.channelDetail = true;
              }else {
                this.channelDetail1 = true;
              }
            }
          },
          onfail: (body, headers) => {
            this.loadingShow = false;
          }
        });
      },

      // 撤销预授权
      accountCancelSure() {
        this.loadingShow = true;
        this.canclePreAuthorizedDeposit({
          data: {
            orderId: this.detailVal.outTradeNo || '',
            remark: ''
          },
          onsuccess: body => {
            this.loadingShow = false;
            if (body.code == 0) {
              this.channelDetail = false;
              this.paymentList(this.page);
            }
          },
          onfail: (body, headers) => {
            this.loadingShow = false;
          }
        });
      },

      // 结算
      refund() {
        this.channelDetail1 = false;
        this.payTig = true;
        this.payTigStatus = 1;
      },

      // 快速结算
      accounts() {
        this.channelDetail = false;
        this.payTig = true;
        this.payTigStatus = 2;
      },

      // 退款事件
      refundMoney () {
          console.log('this.detailVal',this.detailVal);
        if ((this.payMoney * 100) > this.detailVal.totalFee) {
          this.$message('退款金额大于总额');
        }else {
          this.loadingShow = true;
          this.reimburse({
            data:{
              orderId: this.detailVal.outTradeNo,
              refundfee: this.payMoney
            },
            onsuccess: (body) => {
              this.loadingShow = false;
              if(body.data.code == 0){
                this.payTig = false;
                this.paymentList(1)
              }
            },
            onfail: (body, headers) => {
              this.loadingShow = false;
            }
          });
        }
      },

      // 结算接口
      accountMoney() {
        if ((this.payMoney * 100) > this.detailVal.totalFee) {
          this.$message('退款金额大于总额');
        }else {
          this.loadingShow = true;
          this.depositConsume({
            data: {
              orderId: this.detailVal.outTradeNo || '',
              amount: this.payMoney,
              remark: ''
            },
            onsuccess: body => {
              this.loadingShow = false;
              if (body.data.code == 0) {
                this.payTig = false;
                this.paymentList(1);
              }
            },
            onfail: (body, headers) => {
              this.loadingShow = false;
            }
          });
        }
      },

      // 键盘事件
      keyEntry(item) {
        this.payMoney += item;
      },

      keyCancel () {
        if (this.payMoney.length > 0) {
          this.payMoney = this.payMoney.substr(0, this.payMoney.length - 1);
        }
      },

      // 取消弹框
      channelDetailCancle () {
        this.channelDetail = false;
        document.body.removeEventListener('touchmove',this.bodyScroll,false);
        document.body.style.position = 'initial';
        document.body.style.height = 'auto';
      },

      bodyScroll(event){
        event.preventDefault();
      }

    },

    mounted () {
      this.loadingShow = true;
      let startTime = new Date(new Date(new Date().toLocaleDateString()).getTime());
      let endTime = new Date(new Date(new Date().toLocaleDateString()).getTime());
      this.timeVal = [];
      this.timeVal.push(startTime, endTime);
      this.paymentList(1);
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .paymentIndex {
    padding-top: 100px;
    width: 100vw;
    .changeItem {
      padding: 40px;
      text-align: left;
      span {
        color: #303133;
        font-size: 24px;
      }
      .change_item {
        background: #FFFFFF;
        box-shadow: 0 8px 22px 0 rgba(0,0,0,0.10);
        border-radius: 40px;
        height: 54px;
        line-height: 54px;
        padding: 0 40px;
        margin-right: 30px;
        display: inline-block;
        cursor: pointer;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      }
      .change_item.active {
        background-color: #C8E1C8;
        border: 1px solid #1AAD19;
        color: #1AAD19;
      }
    }
    .paymentLists {
      padding-bottom: 115px;
      .list {
        padding: 0 40px;
        background: #FFFFFF;
        box-shadow: 0 8px 16px 0 rgba(0,0,0,0.10);
        border-radius: 6px;
        text-align: left;
        margin-bottom: 20px;
        .list_header {
          border-bottom: 1px solid #E5E5E5;
          padding: 20px 0;
          span {
            color: #909399;
            font-size: 20px;
            margin-right: 35px;
          }
        }
        .list_content {
          padding: 15px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .list_fl {
            .title {
              font-size: 24px;
              color: #000;
              font-weight: bold;
              margin-bottom: 20px;
            }
            div {
              font-size: 20px;
              color: #000;
              margin-bottom: 10px;
              span {
                width: 80px;
                display: inline-block;
              }
            }
            div:last-of-type {
              margin-bottom: 0;
            }
          }
          .list_fr {
            text-align: right;
            p, span {
              font-size: 20px;
              color: #000;
            }
            span.green {
              color: #1AAD19;
              font-weight: normal;
            }
            span.blue {
              color: #4A90E2;
              font-weight: normal;
            }
            span.red {
              color: #D0021B;
              font-weight: normal;
            }
            span.grey {
              color: #909399;
              font-weight: normal;
            }
            p {
              margin-bottom: 20px;
              font-weight: bold;
            }
            img {
              display: inline-block;
              width: 10px;
            }
          }
        }
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
            line-height: 78px;
            font-size: 26px;
            color: #fff;
            cursor: pointer;
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
        width: 960px;
        padding: 0 30px 30px;
        position: fixed;
        z-index: 12;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        max-height: 90vh;
        overflow-y: scroll;
        -webkit-overflow-scrolling: touch;
        .title {
          color: #303133;
          font-size: 30px;
          position: relative;
          padding: 30px 0;
          font-weight: bold;
          border-bottom: 1px solid #D8D8D8;
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
        .title1 {
          font-size: 30px;
          text-align: left;
        }
        .refundTitle {
          color: #D0021B;
        }
        .lists {
          .list {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .red {
              color:#F5222D;
            }
            .blue {
              color: #4A90E2;
            }
            span {
              font-size: 26px;
              color: #000;
            }
          }
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
      .detail::-webkit-scrollbar {
        display: none;
      }
    }
  }

  /deep/ .el-range-editor.el-input__inner {
    background-color: #FFFFFF;
    border-radius: 40px;
    box-shadow: 0 8px 22px 0 rgba(0,0,0,0.10);
    width: 385px;
    height: 50px;
    margin: 0 30px;
    padding: 3px 20px;
  }

  /deep/ .el-date-editor .el-range__icon {
    font-size: 24px;
    line-height: 42px;
  }

  /deep/ .el-date-editor .el-range-separator {
    line-height: 42px;
    font-size: 24px;
  }

  /deep/ .el-date-editor .el-range-input, .el-date-editor .el-range-separator {
    font-size: 24px;
    font-family: '黑色';
  }

  .noMsg {
    margin-top: 150px;
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

  /deep/ .el-pagination {
    padding: 30px 0;
    position: fixed;
    width: 100vw;
    bottom: 0;
    left: 0;
    z-index: 1;
    background-color: #DEE7F8;
  }
  /deep/ .el-pager li {
    background: rgba(0, 0, 0, .3);
    color: #fff;
    margin: 0 10px;
    font-size: 20px;
    height: 44px;
    line-height: 44px;
    min-width: 44px;
    font-family: '黑体';
  }
  /deep/ .el-pagination__total {
    font-size: 20px !important;
    line-height: 44px !important;
    height: 44px !important;
  }
  /deep/ .el-pager li.active {
    background-color: #1AAD19;
    color: #fff;
  }
  /deep/ .el-pagination button {
    height: 44px;
  }

</style>
