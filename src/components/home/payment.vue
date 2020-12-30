<template>
  <div>
    <div class="paymentIndex">
      <div class="changeItem">
        <span>交易时间</span>
        <span class="time_change">
          <i @click="preDay"><img src="../../assets/shaungyige.png" alt=""></i>
          <el-date-picker
            ref="datePicker"
            type="date"
            v-model="timeVal"
            format="yyyy/MM/dd"
            value-format="yyyy/MM/dd"
            placeholder="选择日期"
            @change="datePicker"
          >
          </el-date-picker>
          <span class="noTime" @click="datePickerChange" v-if="noTime">请选择日期</span>
          <i @click="nextDay"><img src="../../assets/xiayige.png" alt=""></i>
        </span>

        <div class="selectTab">
          <el-select v-model="tabIndex" placeholder="支付方式" @change="tabStatusChange">
            <el-option
              v-for="item in payList"
              :key="item"
              :label="item"
              :value="item">
              <span>{{ item }}</span>
            </el-option>
          </el-select>

          <el-select v-model="statusCurrent" placeholder="交易状态" @change="handleCommand">
            <el-option
              v-for="item in statusLists"
              :key="item.key"
              :label="item.value"
              :value="item.key">
              <span>{{ item.value }}</span>
            </el-option>
          </el-select>

        </div>

        <!--<span class="items">-->
          <!--<span :class="filterObj.payFlag == 1 ? 'change_item active' : 'change_item'" @click="payStatusChange(1)" :style="filterObj.payFlag == 1 ? tabImg[1] : tabImg[0]">微信支付</span>-->
          <!--<span :class="filterObj.payFlag == 2 ? 'change_item active' : 'change_item'" @click="payStatusChange(2)" :style="filterObj.payFlag == 2 ? tabImg[1] : tabImg[0]">支付宝</span>-->
        <!--</span>-->
        <!--<span :class="isPreauthorize ? 'change_item active' : 'change_item'" @click="preLicensingChange" :style="isPreauthorize ? tabImg[1] : tabImg[0]">预授权</span>-->
        <span class="change_item sweeping" @click="sweepingClick">扫码结算</span>
      </div>
      <div class="paymentAll">
        <div class="paymentLists" v-if="showList">
          <div class="list" v-for="item in paymentLists" @click="detailTig(item.orderId, item.tradeType, item.payFlowId, item.source)">
            <div class="list_header">
              <span>
                <span>交易时间：{{datetimeparse(item.createTime,"yy/MM/dd hh:mm")}}</span>
                <span>{{item.source == 3 ? 'Easypos' : '值房通'}}单号：{{item.orderId}}</span>
              </span>
              <span>
                <el-button type="primary" @click.stop="payPrint(item.outTradeNo, item.payFlowId)">
                  <img src="../../assets/budaxiaopiao.png" alt="">
                  <span>打印小票</span>
                </el-button>
              </span>
            </div>
            <div class="list_content">
              <div class="list_fl">
                <p class="title">{{item.payFlag == 1 ? '微信支付' : item.payFlag == 2 ? '支付宝支付' : item.payFlag == 3 ? '翼支付': item.payFlag == 4 ? "PMS支付宝支付" : item.payFlag == 5 ? 'PMS微信支付' : item.payFlag == 6 ? '银联支付' : item.payFlag == 7 ? '河马支付' : '工行支付'}}<span v-if="item.payFlag != 5 && (item.channel == 4 || item.channel == 5 || item.channel == 6)"> . 预授权</span></p>
                <div class="rooms"><span>房间号：</span>{{item.roomNo ? item.roomNo : '-'}}</div>
                <div class="roomIn"><span>入住人：</span>{{item.contactName ? item.contactName : '-'}}</div>
              </div>
              <div class="list_fr">
                <p>{{item.channel == 4 ? '冻结' : item.channel == 5 ? '结算' : item.channel== 6 ? '解冻' : '交易'}}金额： <span class="green">{{item.totalFeeStr}}元</span></p>
                <span :class="{'red':(item.resultCode=='FAILED'||(item.tradeType=='refund'&&item.resultCode=='SUCCESS'))}" v-if="item.channel != 4 && item.channel != 5 && item.channel != 6">{{item.founder}} {{datetimeparse(item.timeEnd,"yy-MM-dd hh:mm:ss")}} {{item.tradeType=='refund'?item.resultCode=='FAILED'?'退款失败':'已退款':item.resultCode=='FAILED'?'收款失败':'已收款'}}</span>
                <span v-if="item.channel == 6" class="red">{{item.founder}} {{datetimeparse(item.timeEnd,"yy-MM-dd hh:mm:ss")}} 已撤销</span>
                <span v-if="item.channel == 4" class="blue">快速结算</span>
                <span v-if="item.channel == 5" class="grey">{{item.founder}} {{datetimeparse(item.timeEnd,"yy-MM-dd hh:mm:ss")}} 已结算</span>
                <img src="../../assets/gengduo.png" alt="">
              </div>
            </div>
            <div class="tip" v-if="item.settleScheduleRoom">
              <span>将于{{datetimeparse(item.settleScheduleRoom.scheduledSettleTime,"hh:mm:ss")}}操作{{ item.payFlag != 5 && (item.channel == 4 || item.channel == 5 || item.channel == 6) ? '结算'+((item.settleScheduleRoom.consumeFee)/100).toFixed(2) : '退款' +   ((item.settleScheduleRoom.paidFee - item.settleScheduleRoom.consumeFee)/100).toFixed(2) }}元（如{{ item.payFlag != 5 && (item.channel == 4 || item.channel == 5 || item.channel == 6) ? '结算' : '退款' }}金额有误，请至PMS进行反结账后点击“更新”按钮）</span>
              <button round class="blueColor" @click.stop="resetItem(item.payFlowId)" >更新</button>
            </div>
          </div>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="page"
            :page-size="3"
            layout="total, prev, pager, next"
            :total="total" v-if="paymentLists.length != 0">
          </el-pagination>
          <div class="noMsg" v-else>
            <div class="img"><img src="../../assets/zanwuneirong.png" alt=""></div>
            <p>暂无内容</p>
          </div>
        </div>

        <div class="order_fr">
          <div>
            <div class="fast_title">
              <img src="../../assets/xiantiao.png" alt="">
              快速筛选
            </div>
            <div class="changTabs">
              <span :class="changeTabString == 1 ? 'active' : ''" @click="changeTabClick(1)">房间号</span>
              <span :class="changeTabString == 2 ? 'active' : ''" @click="changeTabClick(2)">入住人</span>
            </div>
            <div class="change_tabs">
              <div class="tab" v-if="changeTabString == 2">
                <div class="input">
                  <input type="text" placeholder="请输入入住人姓名的首字母查询" v-model="searchString1"  @input="changeKeyBords">
                  <img src="../../assets/close.png" alt="" @click="clearSearch" v-if="searchString1.length > 0">
                </div>
                <div class="keyBoard">
                  <span v-for="item in keyBords1" @click="keyEntry($event, item, 1)">{{item}}</span>
                  <span @click="keyCancel($event, 1)"><img src="../../assets/shanchuanniu.png" alt=""></span>
                </div>
              </div>
              <div class="tab" v-else>
                <div class="input">
                  <input type="text" placeholder="请输入入住人房间号查询" v-model="searchString2"  @input="changeKeyBords">
                  <img src="../../assets/close.png" alt="" @click="clearSearch1" v-if="searchString2.length > 0">
                </div>
                <div class="keyBoard2">
                  <span v-for="item in keyBords2" @click="item == '清除' ? clear($event) : keyEntry($event, item, 2)">{{item}}</span>
                  <span @click="keyCancel($event, 2)"><img src="../../assets/shanchuanniu.png" alt=""></span>
                </div>
              </div>
            </div>
            <div class="corporation">
              <p>复创客服电话 4001-690-890</p>
              <p>技术支持电话 021-62593690</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 结算、退款弹框-->
      <div class="payTig" v-if="payTig">
        <div class="shadow" @click="closeTip(3)"></div>
        <div class="payTigContent">
          <div :class="payType ? 'payTig_title titleBg' : 'payTig_title'">
            <span>{{ payType ? '该笔交易关联多个房间，请再次确认消费金额' : ''}}</span>
            <img src="../../assets/guanbi.png" alt="" @click="closeTip(3)">
          </div>
          <div class="payTig_content">
            <div class="content_title">
              请确认{{payTigStatus == 1 ? '退款' : '消费'}}金额
            </div>
            <div class="payTig_input"><input type="text" v-model="payMoney" :placeholder="payTigStatus == 1 ? '请输入退款金额' : '请输入消费金额'"></div>
            <div class="payTig_keyBoard">
              <span v-for="item in keyBoard" @click="keyEntry_(item)">{{item}}</span>
              <span @click="keyCancel_()"><img src="../../assets/shanchuanniu.png" alt=""></span>
            </div>
            <el-button type="primary" :loading="infoLoading" class="btn" @click="payTigStatus == 1 ? refundMoney() : accountMoney()">确定</el-button>
          </div>
        </div>
      </div>

      <!-- 預授權詳情-->
      <div class="channelDetail" v-if="channelDetail">
        <div class="shadow"  @click="closeTip(1)"></div>
        <div class="detail">
          <div class="detail_content">
            <div class="title" v-if="!detailVal.refundModel || detailVal.refundModel.channel == 4">授权信息<img src="../../assets/guanbi.png" alt="" @click="closeTip(1)"></div>
            <div class="title1 title" v-if="detailVal.refundModel && detailVal.refundModel.channel != 4"> 授权信息<img src="../../assets/guanbi.png" alt="" @click="closeTip(1)"></div>
            <div class="lists">
              <div class="list">
                <span>冻结金额</span>
                <span>¥{{detailVal.totalFeeStr}}</span>
              </div>
              <div class="list">
                <span>操作人员</span>
                <span>{{detailVal.founder}}</span>
              </div>
              <div class="list">
                <span>授权通道</span>
                <span v-if="detailVal.payFlag == 1">微信</span>
                <span v-else-if="detailVal.payFlag == 2">支付宝</span>
                <span v-else-if="detailVal.payFlag == 4">PMS支付宝</span>
                <span v-else-if="detailVal.payFlag == 3">翼支付</span>
                <span v-else-if="detailVal.payFlag == 5">PMS微信支付</span>
                <span v-else-if="detailVal.payFlag == 6">银联</span>
                <span v-else-if="detailVal.payFlag == 7">河马支付</span>
                <span v-else>工行支付</span>
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
            <div class="title1 title" v-if="detailVal.channel == 4 && detailVal.refundModel && detailVal.refundModel.channel == 5">结算信息</div>
            <div class="lists" v-if="detailVal.channel == 4 && detailVal.refundModel && detailVal.refundModel.channel == 5">
              <div class="list">
                <span>结算金额</span>
                <span>¥{{(detailVal.refundModel.totalFee/100).toFixed(2)}}</span>
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
            <div class="title1 title" v-if="detailVal.channel == 4 && detailVal.refundModel && detailVal.refundModel.channel == 5">解冻信息</div>
            <div class="lists" v-if="detailVal.channel == 4 && detailVal.refundModel && detailVal.refundModel.channel == 5">
              <div class="list">
                <span>解冻金额</span>
                <span>¥{{(detailVal.refundModel.refund_fee/100).toFixed(2)}}</span>
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
            <div class="title1 title" v-if="detailVal.channel == 4 && detailVal.refundModel && detailVal.refundModel.channel == 6" style="padding: 5px 0"></div>
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
            <div class="btns" v-if="detailVal.channel == 4 && !detailVal.refundModel && detailVal.payFlag < 8">
              <span @click="accountCancelSure1(detailVal)">取消授权</span>
              <span @click="accounts()">结算</span>
            </div>
          </div>
          </div>
      </div>

      <!-- 订单详情-->
      <div class="channelDetail" v-if="channelDetail1">
        <div class="shadow" @click="closeTip(2)"></div>
        <div class="detail">
          <div class="detail_content">
            <div class="title"  v-if="!detailVal.refundModel || detailVal.refundModel == null">支付信息<img src="../../assets/guanbi.png" alt="" @click="closeTip(2)"></div>
            <div class="title1 title"  v-if="detailVal.refundModel || detailVal.refundModel != null">支付信息<img src="../../assets/guanbi.png" alt="" @click="closeTip(2)">
            </div>
            <div class="lists">
              <div class="list">
                <span>支付金额</span>
                <span>¥{{detailVal.totalFeeStr}}</span>
              </div>
              <div class="list">
                <span>操作人员</span>
                <span>{{detailVal.founder}}</span>
              </div>
              <div class="list">
                <span>支付通道</span>
                <span v-if="detailVal.payFlag == 1">微信</span>
                <span v-else-if="detailVal.payFlag == 2">支付宝</span>
                <span v-else-if="detailVal.payFlag == 5">PMS微信</span>
                <span v-else-if="detailVal.payFlag == 4">PMS支付宝</span>
                <span v-else-if="detailVal.payFlag == 3">翼支付</span>
                <span v-else-if="detailVal.payFlag == 6">银联</span>
                <span v-else-if="detailVal.payFlag == 7">河马支付</span>
                <span v-else>工行支付</span>
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
            <div class="title1 title refundTitle"  v-if="detailVal.refundModel || detailVal.refundModel != null">退款信息</div>
            <div class="lists"  v-if="detailVal.refundModel || detailVal.refundModel != null">
              <div class="list">
                <span>退款金额</span>
                <span>¥{{detailVal.refundModel.totalFeeStr}}</span>
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
            <div class="btns" v-if="(((!detailVal.refundModel || detailVal.refundModel == null) && parseFloat(detailVal.refundFeeStr * 100) != 0) || ((!detailVal.refundModel || detailVal.refundModel == null) && parseFloat(detailVal.refundFeeStr * 100) == 0 && tradeManager)) && detailVal.payFlag < 9">
              <span class="refund" @click="refund">退款</span>
            </div>
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
            <el-button type="primary" :loading="false" class="btn1" @click="closeTip(4)">暂不退款</el-button>
            <el-button type="primary" :loading="showPmsAbnormalLoading" class="btn" @click="continuedCheckOutRoom()">继续退款</el-button>
          </div>
        </div>
      </div>

      <!-- 扫码结算弹框步骤-->
      <div class="sweepingTig" v-if="sweepingTig">
        <div class="shadow"></div>
        <div class="sweeping_content">
          <div class="title">
            <img src="../../assets/guanbi.png" alt="" @click="closeSweeping">
          </div>
          <div class="content">
            <img src="../../assets/sweeping.gif" alt="">
            <p class="waringTig" v-if="sweepingTig_">二维码不正确</p>
            <p v-else>请将结算单上的二维码靠近扫码设备</p>
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
            <img src="../../assets/Group.png" alt=""  @click="showPmsAbnormalKnow">
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
          <div class="know_btn"><img src="../../assets/Group.png" alt="" @click="closeTip(5)"></div>
        </div>
      </div>

      <!-- 退房费的二次确认-->
      <div class="countinuedQuit"  v-if="countinuedQuit">
        <div class="shadow"></div>
        <div class="quit_content">
          <div class="quit_title">退款金额包含房费，请确认是否退款？</div>
          <div class="quit_tabs">
            <span class="cancel" @click="closeTip(6)">取消</span>
            <el-button type="primary" :loading="countinuedQuitSureLoading" class="sure" @click="countinuedQuitSure()">确认退款</el-button>
          </div>
        </div>
      </div>

      <!-- 撤销弹框-->
      <div class="payCancle" v-if="payCancle">
        <div class="shadow" @click="closeTip(7)"></div>
        <div class="content">
          <div class="pay_title">
            撤销预授权
            <img src="../../assets/guanbi.png" alt="" @click="closeTip(7)">
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
            <img src="../../assets/guanbi.png" alt="" @click="closeTip(8)">
          </div>
          <div class="lists">
            <div class="list">
              <span>预授权金额</span>
              <span>¥{{ (detailVal.totalFee/100).toFixed(2) }}</span>
            </div>
            <div class="list">
              <span>消费金额</span>
              <span class="primaryColor">¥{{ payMoney }}</span>
            </div>
            <div class="list">
              <span>退还金额</span>
              <span class="dangerColor">¥{{ ((detailVal.totalFee - payMoney*100)/100).toFixed(2) }}</span>
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
            <img src="../../assets/guanbi.png" alt="" @click="closeTip(9)">
          </div>
          <div class="lists">
            <div class="list">
              <span>收款金额</span>
              <span>¥{{ (detailVal.totalFee/100).toFixed(2) }}</span>
            </div>
            <div class="list">
              <span>消费金额</span>
              <span class="primaryColor">¥{{ ((detailVal.totalFee - payMoney*100)/100).toFixed(2) }}</span>
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

      <loadingList v-if="loadingShow" :loadingText="loadingText" :style="isScreen ? 'width: 100vw' : 'width: calc(100vw - 480px)'"></loadingList>
    </div>
  </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex';
  import ElCol from "element-ui/packages/col/src/col";
  import loadingList from './loading.vue'
  import {DatePicker} from 'iview'

  export default {
    name: 'payment',
    components: {ElCol, loadingList, DatePicker},
    props: ['pmsOrderIdChange'],
    data () {
      return {
        loadingShow: false,  // loading
        loadingText: '加载中...', // loading text
        showList: false,
        timeVal: '', // 日期选择
        tabImg: [
          {
            backgroundImage: "url(" + require("../../assets/anniuweixuan.png") + ")",
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% 100%",
          },
          {
            backgroundImage: "url(" + require("../../assets/anniuxuanzhong.png") + ")",
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% 100%",
          }
        ],    // tab bg
        isPreauthorize: false, // 预授权冻结选中状态
        payList: ['全部', '微信支付', '支付宝'],    // 支付方式列表
        tabIndex: null,   // 支付方式tab选中
        statusCurrent: null,   // 交易状态选中
        statusLists: [
          {
            key: '',
            value: '全部'
          },
          {
            key: '1',
            value: '支付成功'
          },
          {
            key: '10',
            value: '退款成功'
          },
          {
            key: '4',
            value: '预授权冻结'
          },
          {
            key: '5',
            value: '预授权完成'
          },
          {
            key: '6',
            value: '预授权取消'
          }
        ],    // 交易状态
        paymentLists: [],  // 数据列表
        page: 1,  // 当前页数
        total: 0, // 总条数
        payTig: false,   // 结算/退款弹框
        payType: false,       // true为关联多房 一起付
        infoLoading: false, // 结算loading
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
        changeTabString: 1,  // 右侧筛选tab切换
        keyBords1: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K','L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],     // 字母键盘
        keyBords2: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '清除', '0'],   // 数字键盘
        searchString: '',  // 搜索
        searchString1: '',  // 字母搜索
        searchString2: '',  // 数字搜索
        timer: null,
        isScreen: false,
        sweepingTig: false,   // 扫码结算步骤提示框
        sweepingTig_: false,   // 扫码结算错误提示框
        showPmsAbnormal: false,  // pms入账异常
        showPmsAbnormal_: false,  // 预授权pms入账异常
        showBalance: false,  // 账户余额不足提示
        chargeRecordObj: {},
        showPmsAbnormalLoading: false,  // pms入账btn loading
        checked: '',  // 判断pms入账是否异常
        tradeManager: false, // 退款是否退房费的权限，默认关闭
        countinuedQuit: false,  // 退款的二次确认
        noTime: false,   // 为了搜索不显示日期
        countinuedQuitSureLoading: false,  // 房费二次确认按钮loading
        source: '',   // 详情区分是否是easypos还是值房通
        payCancle: false,     // 撤销tip
        countinuedSureLoading: false,     // 完成预授权二次确认loading
        countinuedSureLoading1: false,     // 完成二次确认loading
        cancleLoading: false,     // 撤销二次loading
        secoundTip: false,     // 完成预授权二次tip
        secoundTip1: false,     // 完成二次tip
        accountItem: {},
        spTradeBills: false,    // 报表权限
      }
    },
    filters: {

    },
    methods: {
      ...mapActions([
        'goto', 'reimburse', 'depositConsume', 'undisposed', 'canclePreAuthorizedDeposit', 'paymentAndUnfinish', 'printPay', 'refundpos', 'consume', 'resciendCancel', 'configList', 'accountFeeInfo', 'refreshItem', 'unionPayInfo'
      ]),

      // 支付方式选中
      handleCommand(command) {
        this.statusCurrent = command;
        this.page = 1;
        this.paymentList(1);
      },

      // 交易状态选中
      tabStatusChange(command) {
        this.tabIndex = command;
        if (command == '支付宝') {
          this.filterObj.payFlag = 2
        }else if (command == '微信支付') {
          this.filterObj.payFlag = 1;
        }else {
          this.filterObj.payFlag = '';
        }
        this.page = 1;
        this.paymentList(1);
      },

      // 前一天
      preDay() {
        if (this.noTime) {
           return
        }else {
          this.timeVal = new Date(this.timeVal.getTime() - 24 * 60 * 60 * 1000);
          this.loadingShow = true;
          this.showList = false;
          this.page = 1;
          this.paymentList(1);
        }
      },

      // 后一天
      nextDay() {
        if (this.noTime) {
            return
        }else {
          this.timeVal = new Date(this.timeVal.getTime() + 24 * 60 * 60 * 1000);
          this.loadingShow = true;
          this.showList = false;
          this.page = 1;
          this.paymentList(1);
        }
      },

      // 唤起日期选择
      datePickerChange() {
        this.$refs.datePicker.showPicker();
      },

      // 日期选择
      datePicker(val) {
        this.loadingShow = true;
        console.log('datePciker',val);
        console.log('date', new Date(val));
        this.noTime = false;
        this.searchString1 = this.searchString2 = this.searchString = '';
        this.timeVal = new Date(val);
        this.showList = false;
        this.page = 1;
        this.paymentList(1);
      },

      // 键盘事件
      changeKeyBords () {
        if (this.changeTabString == 1) {
          this.searchString = this.searchString1;
          this.page = 1;
          this.paymentList(1);
        }else {
          this.searchString = this.searchString2;
          this.page = 1;
          this.paymentList(1);
        }
      },

      // 右侧筛选tab切换
      changeTabClick(index) {
        this.changeTabString = index;
        if (index == 1) {
          this.searchString2 = '';
        }else {
          this.searchString1 = '';
        }
        this.searchString = '';
        this.page = 1;
        this.paymentList(1);
      },

      keyCancel (event, type) {
        event.preventDefault();
        if (type == 1) {
          if (this.searchString1.length > 0) {
            this.searchString1 = this.searchString1.substr(0, this.searchString1.length - 1);
            this.searchString = this.searchString1;
            this.page = 1;
            this.paymentList(1);
          }
        }else {
          if (this.searchString2.length > 0) {
            this.searchString2 = this.searchString2.substr(0, this.searchString2.length - 1);
            this.searchString = this.searchString2;
            this.page = 1;
            this.paymentList(1);
          }
        }
      },

      // 键盘清除事件
      clear (event) {
        event.preventDefault();
        this.searchString2 = '';
        this.searchString = '';
        this.page = 1;
        this.paymentList(1);
      },

      // 字母键盘事件
      keyEntry(event, item,type) {
        event.preventDefault();
        if (type == 1) {
          this.searchString1 += item;
          this.searchString = this.searchString1;
          this.page = 1;
          this.paymentList(1);
        }else {
          this.searchString2 += item;
          this.searchString = this.searchString2;
          this.page = 1;
          this.paymentList(1);
        }
      },

      // 键盘删除事件
      clearSearch() {
        this.searchString1 = '';
        this.searchString = this.searchString1;
        this.page = 1;
        this.paymentList(1);
      },
      clearSearch1() {
        this.searchString2 = '';
        this.searchString = this.searchString2;
        this.page = 1;
        this.paymentList(1);
      },

      // 补打小票
      payPrint(orderId, payflowId) {
        this.loadingShow = true;
        this.printPay({
          data: {
            orderId: orderId,
            payFlowId: payflowId
          },
          onsuccess: body => {
            if (body.data.code == 0) {
              this.$toast({
                message: '小票补打成功',
                iconClass: 'icon ',
              });
            }
            this.loadingShow = false;
          },
          onfail: body => {
            this.loadingShow = false;
          },
          onerror: body => {
            this.loadingShow = false;
          }
        })
      },

      // 支付选择
      payStatusChange (index) {
        this.loadingShow = true;
        this.filterObj.payFlag = index;
        this.showList = false;
        this.page = 1;
        this.paymentList(1);
      },

      // 选择预授权冻结
      preLicensingChange() {
        this.loadingShow = true;
        this.isPreauthorize = !this.isPreauthorize;
        this.showList = false;
        this.page = 1;
        this.paymentList(1);
      },

      // 分页
      handleSizeChange (val) {

      },

      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.isScreen = false;
        this.loadingShow = true;
        this.showList = false;
        this.paymentList(val);
      },

      // 单条刷新事件
      resetItem(flowId) {
          this.refreshItem({
            flowId: flowId,
            onsuccess: body => {
                if (body.data.code == 0) {
                  this.paymentLists.forEach((item, index) => {
                      if (item.payFlowId == body.data.data.data[0].payFlowId) {
                        this.paymentLists.splice(index, 1, body.data.data.data[0]);
                      }
                  });
                  this.$toast({
                    message: '更新成功',
                    iconClass: 'icon ',
                  });
                }
            },
            onfail: body => {

            },
            onerror: body => {

            }
          })
      },

      // 获取数据列表
      paymentList(page) {
        document.body.removeEventListener('touchmove',this.bodyScroll,false);
        document.body.style.position = 'initial';
        document.body.style.width = 'auto';
        this.undisposed ({
          data: {
            page: page,  //页数
            size: 3,
            roomNo: '',//房号 (房间名字：如303)
            founder: 'All',
            timeEnd:  this.datetimeparse(this.timeVal.getTime(), 'yy-MM-dd') + ' ' + 15 + ':' + 33 + ':' + 40,
            isPreauthorize: this.isPreauthorize ? 1 : '',
            paidModeAndStatus: this.statusCurrent ? this.statusCurrent : '',
            keyWord: this.searchString,
            ...this.filterObj
          },
          onsuccess: body => {
              console.log('body.data',body.data.data);
            this.loadingShow = false;
            if (body.data.code == 0) {
              this.paymentLists = body.data.data.data;
              if (this.paymentLists.length == 0 && this.searchString != '') {
                this.noTime = true;
              }else {
                this.noTime = false;
              }
              this.payMoney = '';
              this.total = body.data.data.total;
            }
            this.showList = true;
          },
          onfail: (body, headers) => {
            this.loadingShow = false;
          },
          onerror: body => {
            this.loadingShow = false;
          }
        })
      },

      // 预授权pms异常我知道了
      showPmsAbnormalKnow() {
        this.showPmsAbnormal_= false;
        this.payTig = false;
        this.channelDetail = false;
        this.paymentList(this.page);
      },

      // 獲取詳情
      detailTig(id,tradeType,payFlowId,source) {
        this.loadingShow = true;
        this.payMoney = '';
        this.source = source;
        if (source == 3) {
          this.getConfigList();
        }
        let data = {};
        if (tradeType) {
          data = {
            orderId: id,
            isRefund: tradeType == 'refund' ? true : false,
            payFlowId: payFlowId
          }
        }else {
          data = {
            orderId: id,
            payFlowId: payFlowId
          }
        }
        this.paymentAndUnfinish({
          data: data,
          onsuccess: (body) => {
            this.loadingShow = false;
            if(body.data.code == 0){
              if (body.data.data != null) {
                this.detailVal = body.data.data;
                if (this.detailVal.channel == 4 || this.detailVal.channel == 5 || this.detailVal.channel == 6) {
                  this.channelDetail = true;
                }else {
                  this.channelDetail1 = true;
                }
                document.body.addEventListener('touchmove',this.bodyScroll,false);
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
                this.sweepingTig = false;
                this.sweepingTig_ = false;
              }else {
                this.sweepingTig = true;
                this.sweepingTig_ = true;
                this.testOpenBarCode();
              }
            }
          },
          onfail: (body, headers) => {
            this.loadingShow = false;
          },
          onerror: body => {
            this.loadingShow = false;
          }
        });
      },

      // 关闭弹框
      closeTip(type) {
          if (type == 1) {
              this.channelDetail=false;
              this.payMoney = '';
          }else if (type == 2) {
              this.channelDetail1 = false;
          }else if (type == 3) {
              this.payTig = false;
              this.payMoney = '';
          }else if (type == 4) {
              this.showPmsAbnormal = false;
              this.payMoney = '';
          }else if (type == 5) {
              this.showBalance = false;
          }else if (type == 6) {
              this.countinuedQuit = false;
              this.payTig = true;
          }else if (type == 7) {
              this.payCancle = false;
              this.accountItem = {};
              this.cancleLoading = false;
          }else if (type == 8) {
              this.secoundTip = false;
              this.payMoney = '';
          }else if (type == 9) {
              this.secoundTip1 = false;
              this.payMoney = '';
          }
          document.body.removeEventListener('touchmove',this.bodyScroll,false);
          document.body.style.position = 'initial';
          document.body.style.width = 'auto';
      },

      // 撤销确认
      accountCancelSure() {
        this.isScreen = true;
        this.loadingShow = true;
        this.cancleLoading = true;
        if (this.source != 3) {
          this.canclePreAuthorizedDeposit({
            data: {
              orderId: this.detailVal.outTradeNo || '',
              remark: '',
              payFlowId: this.detailVal.payFlowId
            },
            onsuccess: body => {
              this.loadingShow = false;
              this.cancleLoading = false;
              if (body.data.code == 0) {
                this.channelDetail = false;
                this.payCancle = false;
                this.paymentList(this.page);
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
              this.loadingShow = false;
              this.cancleLoading = false;
            },
            onerror: body => {
              this.loadingShow = false;
              this.cancleLoading = false;
            }
          });
        }else {
          this.resciendCancel({
            data: {
              flowId: this.detailVal.payFlowId,
              pmsRecord : true
            },
            onsuccess: body => {
              if (body.data.code == 0 ||body.data.errcode == 0) {
                this.$toast({
                  message: '撤销成功',
                  iconClass: 'icon ',
                });
                this.loadingShow = false;
                this.channelDetail = false;
                this.paymentList(this.page);
              }else {
                this.$toast({
                  message: body.data.msg,
                  iconClass: 'icon ',
                });
              }
              this.rescindTip = false;
              this.cancleLoading = false;
              this.rescindLoading_ = false;
            },
            onfail: body => {
              this.loadingShow = false;
              this.cancleLoading = false;
            },
            onerror: body => {
              this.loadingShow = false;
              this.cancleLoading = false;
            }
          })
        }
      },

      // 撤销预授权
      accountCancelSure1(item) {
        this.channelDetail = false;
        this.accountItem = item;
        this.payCancle = true;
      },


      // 结算
      refund() {
        this.accountFeeInfo({
          orderId: this.detailVal.outTradeNo || '',
          payFlowId: this.detailVal.payFlowId,
          onsuccess: body => {
            if (body.data.code == 0 && body.data.data) {
              this.chargeRecordObj = body.data.data
            }
            this.payMoney = body.data.data.refundFee ? body.data.data.refundFee <= 0 ? '' : (body.data.data.refundFee/100).toFixed(2) : 0;
            this.unionPayInfo({
              payFlowId: this.detailVal.payFlowId,
              onsuccess: body => {
                if (body.data.code == 0) {
                  if (body.data.data) {
                    this.payType = true;
                  }else {
                    this.payType = false;
                  }
                }
                this.payTig = true;
                this.channelDetail1 = false;
                this.payTigStatus = 1;
              }
            });
          }
        })
      },

      // 快速结算
      accounts() {
        this.accountFeeInfo({
          orderId: this.detailVal.outTradeNo || '',
          payFlowId: this.detailVal.payFlowId,
          onsuccess: body => {
            if (body.data.code == 0 && body.data.data) {
              this.chargeRecordObj = body.data.data
            }
            this.payMoney = body.data.data.consumeFee ? body.data.data.consumeFee <= 0 ? '' : (body.data.data.consumeFee/100).toFixed(2) : 0;
            this.unionPayInfo({
              payFlowId: this.detailVal.payFlowId,
              onsuccess: body => {
                if (body.data.code == 0) {
                  if (body.data.data) {
                    this.payType = true;
                  }else {
                    this.payType = false;
                  }
                }
                this.channelDetail = false;
                this.payTig = true;
                this.infoLoading = false;
                this.payTigStatus = 2;
              }
            });
          }
        });

      },

      //继续退房
      continuedCheckOutRoom(){
        this.showPmsAbnormal = false;
        this.showPmsAbnormalLoading = true;
        this.checked = true;
        this.quitTig();
      },

      // 退款事件
      refundMoney () {
        let regPos = /^\d+(\.\d+)?$/; //非负浮点数
          console.log('this.detailVal',this.detailVal);
        this.infoLoading = true;
        if (!regPos.test(this.payMoney)) {
          this.$toast({
            message: '请输入正确的退款金额!',
            iconClass: 'icon ',
          });
          this.infoLoading = false;
        }else if (((this.payMoney * 100) > this.detailVal.totalFee) && this.tradeManager) {
          this.infoLoading = false;
          this.$toast({
            message: '注意：不能大于总金额',
            iconClass: 'icon ',
          });
        }else if (((this.payMoney * 100) <= this.detailVal.totalFee) && ((this.payMoney * 100) > parseFloat(this.detailVal.refundFeeStr*100)) && this.tradeManager && this.source != 3) {
          this.infoLoading = false;
          this.payTig = false;
          this.countinuedQuit = true;
        }else if (((this.payMoney * 100) > parseFloat(this.detailVal.refundFeeStr*100)) && !this.tradeManager && this.source != 3) {
          this.infoLoading = false;
          this.$toast({
            message: '注意：不能大于押金金额',
            iconClass: 'icon ',
          });
        }else {
          this.secoundTip1 = true;
          this.infoLoading = false;
          this.countinuedQuitSureLoading = false;
          this.countinuedQuit = false;
          this.payTig = false;
        }
      },

      // 二次确认
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
        if (this.source != 3) {
          this.reimburse({
            data:{
              orderId: this.detailVal.outTradeNo,
              refundfee: this.payMoney,
              checked: this.checked,
              ischeckOut: false,
              payFlowId: this.detailVal.payFlowId
            },
            onsuccess: (body) => {
              this.infoLoading = false;
              this.isScreen = false;
              this.countinuedQuit = false;
              this.countinuedQuitSureLoading = false;
              this.countinuedSureLoading1 = false;
              if(body.data.code == 0){
                this.payTig = false;
                this.secoundTip1 = false;
                this.isScreen = true;
                this.loadingShow = true;
                this.page = 1;
                this.paymentList(1);
              }else if(body.data.code == 20003){
                this.showPmsAbnormal = true;
                this.secoundTip1 = false;
              }else if (body.data.code == 10006) {
                this.$toast({
                  message: body.data.msg,
                  iconClass: 'icon ',
                });
              }else if (body.data.code == 100049 || body.data.code == 100036) {
                this.showBalance = true;
                this.secoundTip1 = false;
              }
              this.checked = '';
              this.payTig = false;
              this.secoundTip1 = false;
              this.showPmsAbnormalLoading = false;
            },
            onfail: (body, headers) => {
              this.infoLoading = false;
              this.countinuedQuit = false;
              this.isScreen = false;
              this.showPmsAbnormalLoading = false;
              this.countinuedSureLoading1 = false;
              this.countinuedQuitSureLoading = false;
            },
            onerror: error => {
              this.infoLoading = false;
              this.countinuedQuit = false;
              this.isScreen = false;
              this.showPmsAbnormalLoading = false;
              this.countinuedSureLoading1 = false;
              this.countinuedQuitSureLoading = false;
            }
          });
        }else {
          this.refundpos({
            data: {
              amount: parseFloat(this.payMoney)*100,
              flowId: this.detailVal.payFlowId,
              pmsRecord : true
            },
            onsuccess: body => {
              if (body.data.code == 0 || body.data.errcode == 0) {
                this.$toast({
                  message: '退款成功',
                  iconClass: 'icon ',
                });
                this.payTig = false;
                this.secoundTip1 = false;
                this.isScreen = true;
                this.loadingShow = true;
                this.page = 1;
                this.paymentList(1)
              }else {
                this.$toast({
                  message: body.data.msg,
                  iconClass: 'icon ',
                });
              }
              this.checked = '';
              this.payTig = false;
              this.secoundTip1 = false;
              this.showPmsAbnormalLoading = false;
              this.infoLoading = false;
              this.isScreen = false;
              this.countinuedQuit = false;
              this.countinuedQuitSureLoading = false;
            },
            onfail: body => {
              this.infoLoading = false;
              this.countinuedQuit = false;
              this.isScreen = false;
              this.showPmsAbnormalLoading = false;
              this.countinuedQuitSureLoading = false;
            },
            onerror: body => {
              this.infoLoading = false;
              this.countinuedQuit = false;
              this.isScreen = false;
              this.showPmsAbnormalLoading = false;
              this.countinuedQuitSureLoading = false;
            }
          })
        }
      },

      // 结算接口
      accountMoney() {
        this.infoLoading = true;
        let regPos = /^\d+(\.\d+)?$/; //非负浮点数
        if (this.payMoney == 0) {
//          this.$message('请输入正确的消费金额!');
          this.$toast({
            message: '请输入正确的消费金额!',
            iconClass: 'icon ',
          });
          this.infoLoading = false;
        }else if (!regPos.test(this.payMoney)) {
          this.$toast({
            message: '请输入正确的消费金额!',
            iconClass: 'icon ',
          });
          this.infoLoading = false;
        }else if ((this.payMoney * 100) > this.detailVal.totalFee) {
          this.infoLoading = false;
//          this.$message('退款金额大于总额');
          this.$toast({
            message: '消费金额大于总额',
            iconClass: 'icon ',
          });
        }else {
          this.payTig = false;
          this.secoundTip = true;
          this.infoLoading = false;
        }
      },

      syqContentFun() {
        this.countinuedSureLoading = true;
        if (this.source != 3) {
          this.depositConsume({
            data: {
              orderId: this.detailVal.outTradeNo || '',
              amount: this.payMoney,
              remark: '',
              payFlowId: this.detailVal.payFlowId
            },
            onsuccess: body => {
              this.infoLoading = false;
              this.isScreen = false;
              if (body.data.code == 0) {
                this.payTig = false;
                this.countinuedSureLoading = false;
                this.secoundTip = false;
                this.isScreen = true;
                this.loadingShow = true;
                this.page = 1;
                this.paymentList(1);
              }else if(body.data.code == 20003){
                this.secoundTip = false;
                this.showPmsAbnormal_ = true;
              }else if (body.data.code == 100049 || body.data.code == 100036) {
                this.secoundTip = false;
                this.showBalance = true;
              }else if (body.data.code == 10006) {
                this.secoundTip = false;
                this.payTig = false;
                this.$toast({
                  message: body.data.msg,
                  iconClass: 'icon ',
                });
                this.isScreen = true;
                this.countinuedSureLoading = false;
                this.loadingShow = true;
                this.page = 1;
                this.paymentList(1);
              }else {
                this.$toast({
                  message: body.data.msg,
                  iconClass: 'icon ',
                });
              }
              this.countinuedSureLoading = false;
            },
            onfail: (body, headers) => {
              this.infoLoading = false;
              this.countinuedSureLoading = false;
              this.isScreen = false;
            },
            onerror: error => {
              this.infoLoading = false;
              this.countinuedSureLoading = false;
              this.isScreen = false;
            }
          });
        }else {
          this.consume({
            data: {
              amount: parseFloat(this.payMoney)*100,
              flowId: this.detailVal.payFlowId,
              pmsRecord : true
            },
            onsuccess: body => {
              if (body.data.code == 0 ||body.data.errcode == 0) {
                this.payTig = false;
                this.countinuedSureLoading = false;
                this.secoundTip = false;
                this.isScreen = true;
                this.loadingShow = true;
                this.page = 1;
                this.paymentList(1);
                this.infoLoading = false;
                this.isScreen = false;
              }else {
                this.$toast({
                  message: body.data.msg,
                  iconClass: 'icon ',
                });
              }
              this.sureTip = false;
              this.countinuedSureLoading = false;
              this.secoundTip = false;
              this.sureVal = '';
              this.changeInput(this.sureVal);
              this.inquiryLoading = false;
            },
            onfail: body => {
              this.infoLoading = false;
              this.countinuedSureLoading = false;
              this.isScreen = false;
            },
            onerror: body => {
              this.infoLoading = false;
              this.countinuedSureLoading = false;
              this.isScreen = false;
            }
          })
        }
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

      // 取消弹框
      channelDetailCancle () {
        this.channelDetail = false;
      },


      // 扫码结算
      sweepingClick() {
        this.sweepingTig = true;
        this.sweepingTig_ = false;
        this.testOpenBarCode();
      },

      // 接受A屏返回的订单orderId
      getSweepingSettlementOrderId (orderId) {
        console.log('A屏过来的orderId', orderId);
        if (!orderId || orderId == null) {
          this.sweepingTig = true;
          this.sweepingTig_ = true;
          this.testOpenBarCode();
        }else {
          if (orderId.indexOf('-') != -1) {
            this.detailTig(orderId.split('-')[0], '', orderId.split('-')[1]);
          }else {
            this.detailTig(orderId, '', '');
          }
          if (sessionStorage.getItem('pmsPayDetail')) {
            setTimeout(() => {
              sessionStorage.removeItem('pmsPayDetail');
            },600);
          }else {
            this.testCloseBarCode();
          }
        }
      },

      // 获取权限
      getConfigList() {
        this.configList({
          onsuccess: body => {
            console.log('1111', body);
            if (body.data.errcode == 0 || body.data.code == 0) {
              let noConfig = false; // 判断是否有权限
              if (body.data.data.authorities.length != 0) {
                body.data.data.authorities.forEach(item =>{
                  if (item.authority == 'independent_trade_receipt') {
                    noConfig = true;
                  }
                  if (item.authority == 'independent_trade_deposit') {
                    this.configList_.trandeDeposit = true;
                    noConfig = true;
                  }
                  if (item.authority == 'independent_trade_trading_record') {
                    this.configList_.trandeRecord = true;
                    noConfig = true;
                  }
                });
              }
              if (!noConfig) {
                this.$toast({
                  message: '当前账号无easypos权限',
                  iconClass: 'icon ',
                });
              }
            }
            this.loadingShow = false;
          },
          onfail: body => {
            this.loadingShow = false;
          },
          onerror: body => {
            this.loadingShow = false;
          }
        })
      },

      // 关闭扫码弹框
      closeSweeping () {
        document.body.removeEventListener('touchmove',this.bodyScroll,false);
        document.body.style.position = 'initial';
        document.body.style.width = 'auto';
        this.sweepingTig = false;
        this.testCloseBarCode();
      },

      // 扫码请求A屏操作
      testOpenBarCode() {
        jsObj.OpenBarCode("");
      },

      // 关闭小票扫码 客户端点击关闭操作
      testCloseBarCode() {
        jsObj.CloseBarCode();
      }

    },

    watch: {
      pmsOrderIdChange: function (val) {
        if (sessionStorage.getItem('pmsPayDetail')) {
          this.getSweepingSettlementOrderId(sessionStorage.getItem('pmsPayDetail'));
        }
      }
    },

    mounted () {
      this.loadingShow = true;
      this.timeVal = new Date(new Date(new Date().toLocaleDateString()).getTime());
      let list = JSON.parse(sessionStorage.getItem('subPermissions'));
      this.windowUrl = window.location.href.split('#')[0];
      list.forEach(item => {
        if (item.tag == 'sp_trade_manager') {
          this.tradeManager = true;
        }else if (item.tag == 'sp_trade_bills') {
          this.spTradeBills = true;
        }
      });
      this.paymentList(1);
      window.getSweepingSettlementOrderId = this.getSweepingSettlementOrderId;
      if (sessionStorage.getItem('pmsPayDetail')) {
        this.getSweepingSettlementOrderId(sessionStorage.getItem('pmsPayDetail'));
      }
      window.getDeviceId = this.getDeviceId;
    },
    beforeRouteLeave (to, from, next) {
      this.loadingShow = false;
      next();
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>

  .paymentIndex {
    padding-top: 100px;
    width: 100vw;
    .changeItem {
      display: flex;
      align-items: center;
      padding: 22px 40px;
      text-align: left;
      position: relative;
      span {
        color: #303133;
        font-size: 20px;
      }
      .time_change {
        background-color: #FFFFFF;
        border-radius: 40px;
        box-shadow: 0 8px 22px 0 rgba(0, 0, 0, 0.1);
        width: 354px;
        height: 56px;
        margin: 0 30px;
        /*padding: 0 40px;*/
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        .noTime {
          position: absolute;
          left: 55px;
          top: 0;
          width: 244px;
          height: 56px;
          line-height: 56px;
          color: #303133;
          font-size: 20px;
          text-align: center;
          background-color: #fff;
        }
        i {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          display: inline-flex;
          align-items: center;
          z-index: 10;
          img {
            width: 15px;
          }
        }
        i:first-of-type {
          left: 25px;
        }
        i:last-of-type {
          right: 25px;
        }
        .ivu-icon-ios-close-circle {
          display: none;
        }
        .ivu-date-picker {
          width: 480px;
          height: 56px;
        }
        .ivu-input {
          height: 56px;
          border: none;
          color: #303133;
          font-size: 20px;
          padding-left: 30px;
          outline: none;
          text-align: center;
          box-shadow: none;
          font-weight: bold;
        }
        .ivu-select-dropdown {
          left: 112px !important;
        }
        .ivu-input:hover {
          border: none;
        }
        .ivu-input-suffix {
          display: none;
        }
        .ivu-input-suffix i {
          font-size: 32px;
          line-height: 72px;
        }
        .ivu-picker-panel-icon-btn i {
          font-size: 32px;
        }
        .ivu-date-picker-cells span {
          width: 56px;
          height: 56px;
          line-height: 56px;
          text-align: center;
          margin: 5px 2px 2px 2px;
        }
        .ivu-date-picker-cells {
          width: 420px;
          margin: 28px;
        }
        .ivu-picker-panel-icon-btn {
          width: 74px;
          height: 48px;
        }
        .ivu-date-picker-header {
          height: 48px;
          line-height: 48px;
        }
        .ivu-btn-small {
          font-size: 32px;
        }
        .ivu-picker-confirm-time {
          display: none;
        }
        .ivu-picker-panel-content .ivu-picker-panel-content .ivu-time-picker-cells-list {
          width: 239px;
          max-height: 546px;
        }
        .ivu-picker-panel-content .ivu-picker-panel-content .ivu-time-picker-cells-list ul li {
          padding: 0;
          text-align: center;
        }
        .ivu-btn-default {
          display: none;
        }
      }
      .selectTab {
        .el-select {
          width: 35%;
          margin-right: 30px;
          /deep/ .el-input__inner {
            background: #FFFFFF;
            box-shadow: 0 8px 22px 0 rgba(0,0,0,0.10);
            border-radius: 40px;
            height: 56px;
            line-height: 56px;
            padding: 0 40px;
            cursor: pointer;
            font-size: 20px;
            font-weight: 700;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
          }
          /deep/ .el-input__inner:-moz-placeholder {
            color: #606266;
            font-weight: 700;
            font-size: 20px;
          }
          /deep/ .el-input__inner:-ms-input-placeholder {
            color: #606266;
            font-weight: 700;
            font-size: 20px;
          }
          /deep/ .el-input__inner::-moz-placeholder {
            color: #606266;
            font-weight: 700;
            font-size: 20px;
          }
          /deep/ .el-input__inner::-webkit-input-placeholder {
            color: #606266;
            font-weight: 700;
            font-size: 20px;
          }
          /deep/ .el-input__suffix {
            padding-right: 15px;
          }
          /deep/ .el-icon-arrow-up:before {
            font-size: 30px;
          }
        }
      }
      .change_item {
        background: #FFFFFF;
        box-shadow: 0 8px 22px 0 rgba(0,0,0,0.10);
        border-radius: 40px;
        height: 56px;
        line-height: 56px;
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
      .sweeping {
        position: absolute;
        right: 520px;
        top: 50%;
        transform: translateY(-50%);
        color: #1AAD19;
      }
    }
    .paymentAll {
      width: 100%;
    }
    .paymentLists {
      width: -moz-calc(100% - 480px);
      width: -webkit-calc(100% - 480px);
      width: calc(100% - 480px);
      padding: 0 40px 115px;
      .list {
        padding: 0 40px;
        background: #FFFFFF;
        box-shadow: 0 8px 16px 0 rgba(0,0,0,0.10);
        border-radius: 6px;
        text-align: left;
        margin-bottom: 20px;
        .list_header {
          border-bottom: 1px solid #E5E5E5;
          padding: 15px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          span {
            color: #909399;
            font-size: 20px;
            span:first-of-type {
              margin-right: 30px;
            }
            /deep/ .el-button--primary {
              background-color: transparent;
              border: none;
              padding: 0;
              span {
                margin-right: 0;
                font-size: 20px;
                color: #1AAD19;
                display: flex;
                align-items: center;
              }
              img {
                width: 40px;
                margin-right: 10px;
              }
            }
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
                width: 105px;
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
        .tip {
          font-size: 20px;
          color: #6F5F2D;
          background-image: linear-gradient(90deg, #FBECC3 1%, #EDD59D 100%);
          box-shadow: 0 8px 16px 0 rgba(0,0,0,0.10);
          padding: 10px 40px;
          width: calc(100% + 80px);
          margin-left: -40px;
          border-radius: 0 0 6px 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          .blueColor {
            font-size: 20px;
            color: #1AAD19;
            padding: 10px 30px;
            border-radius: 30px;
            box-shadow: none;
            background-color: #ffffff;
            border: none;
            outline: none;
          }
        }
      }
    }
    .order_fr {
      width: 480px;
      background-color: #fff;
      .corporation {
        text-align: center;
        padding: 10px 0;
        font-size: 24px;
        background-color: #4A90E2;
        color: #fff;
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
      }
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
          padding: 10px 0;
          display: inline-block;
          position: relative;
          color: #909399;
          font-size: 20px;
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
        padding: 0 15px;
        .tab {
          .input {
            padding: 30px 0;
            position: relative;
            input {
              border: 1px solid #9A9A9A;
              border-radius: 44px;
              padding-left: 30px;
              padding-right: 60px;
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
    .order_fr>div {
      position: fixed;
      top: 100px;
      right: 0;
      width: 480px;
      height: calc(100vh - 100px);
      background-color: #fff;
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
          font-size: 28px;
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
          width: 680px;
          margin: 0 auto;
          .content_title {
            color: #303133;
            font-size: 28px;
            position: relative;
            padding: 30px 40px;
          }
          .payTig_input {
            input {
              width: 678px;
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
            width: 100%;
            font-size: 28px;
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
          font-size: 28px;
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
          font-size: 24px;
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
              font-size: 20px;
              color: #000;
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
            font-size: 28px;
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
    .sweepingTig {
      .shadow {
        position: fixed;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .6);
      }
      .sweeping_content {
        background: #FFFFFF;
        border-radius: 20px;
        width: 800px;
        position: fixed;
        z-index: 12;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        .title {
          position: relative;
          img {
            position: absolute;
            right: 40px;
            top: 40px;
            display: block;
            width: 24px;
            height: 24px;
            cursor: pointer;
          }
        }
        .content {
          p {
            color: #303133;
            font-size: 20px;
            text-align: center;
            padding: 40px 0;
          }
          .waringTig {
            color: #F5222D;
          }
        }
      }
    }
    .countinuedQuit, .payCancle ,.secoundTip {
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
        transform: translate(-50%, -50%);
        .quit_title {
          padding: 50px 30px;
          border-bottom: 1px solid #D8D8D8;
          color: #0B0B0B;
          font-size: 20px;
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
            font-size: 28px;
            text-align: center;
            color: #909399;
          }
          .sure {
            background-color: inherit;
            border-width: 0;
            border-radius: 20px;
            color: #1AAD19;
            font-size: 28px;
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
          font-size: 28px;
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
            font-size: 20px;
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
          font-size: 28px;
          color: #fff;
        }
      }
    }
    .secoundTip {
      .secoundTip_content {
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
          font-size: 28px;
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
            font-size: 20px;
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
          font-size: 20px;
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
          font-size: 28px;
          color: #fff;
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
        font-size: 28px;
        position: relative;
        padding: 30px 40px;
        border-bottom: 1px solid #D8D8D8;
      }
      .lists {
        padding: 0 40px;
        .list {
          padding: 24px 0;
          font-size: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #000;
        }
      }
      p {
        color:#F5222D;
        font-size: 20px;
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
          font-size: 28px;
          color:#F5222D;
          background-color: #fff;
        }
        .btn {
          background: #1AAD19;
          border-radius: 44px;
          width: 380px;
          height: 78px;
          text-align: center;
          font-size: 28px;
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
            font-size: 28px;
            margin-bottom: 33px;
            text-align: left;
          }
          .content {
            color: #303133;
            font-size: 20px;
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
        font-size: 28px;
        margin-bottom: 33px;
      }
      .content {
        color: #303133;
        font-size: 20px;
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

  /deep/ .el-date-editor.el-input {
    /*background-color: #FFFFFF;*/
    width: 100%;
    padding: 0 40px;
    border-radius: 40px;
    /*padding-left: 40px;*/
    /*width: 235px;*/
  }

  /deep/ .ivu-date-picker-focused input {
    box-shadow: none;
  }

  /deep/ .el-input__icon {
    font-size: 20px;
    line-height: 56px;
  }

  /deep/ .el-input__prefix {
    left: 26px;
  }

  /deep/ .el-input--prefix .el-input__inner {
    line-height: 56px;
    height: 56px;
    border: none;
    font-size: 20px;
    padding: 0;
    outline: none;
    text-align: center;
    box-shadow: none;
    font-weight: 700;
    border-radius: 40px;
  }

  /deep/ .el-date-editor.el-input .el-range-input, .el-date-editor.el-input .el-range-separator {
    font-size: 20px;
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
      font-size: 20px;
      margin-top: 20px;
    }
  }

  .el-pagination {
    padding: 30px 0;
    position: fixed;
    width: calc(100vw - 480px);
    bottom: 0;
    left: 0;
    z-index: 1;
    background-color: #DEE7F8;
  }
  .el-pager li {
    background: rgba(0, 0, 0, .3);
    color: #fff;
    margin: 0 10px;
    font-size: 20px;
    height: 44px;
    line-height: 44px;
    min-width: 44px;
    font-family: '黑体';
  }
  .el-pagination__total {
    font-size: 20px !important;
    line-height: 44px !important;
    height: 44px !important;
  }
  .el-pager li.active {
    background-color: #1AAD19;
    color: #fff;
  }
  .el-pagination button {
    height: 44px;
  }

  /deep/ .el-date-editor .el-icon-circle-close {
    display: none;
  }

  /deep/ .el-date-picker .el-picker-panel__content {
    width: 400px;
  }

  /deep/ .el-picker-panel {
    left: 112px !important;
  }
  /deep/ .el-date-picker__header {
    height: 48px;
    line-height: 48px;
  }
  /deep/ .el-picker-panel__icon-btn {
    width: 36px;
    height: 48px;
    color: #303133;
    font-size: 20px;
    font-weight: 700;
    margin-top: 0;
  }
  /deep/ .el-date-picker__header-label {
    color: #303133;
    font-size: 20px;
    font-weight: 700;
    line-height: 48px;
  }
  /deep/ .el-date-picker {
    width: 482px;
  }
  /deep/ .el-date-picker .el-picker-panel__content {
    width: 420px;
    margin: 28px;
  }
  /deep/ .el-date-table th , .el-date-table td{
    color: #303133;
    font-size: 20px;
    font-weight: 700;
    width: 56px;
    height: 56px;
    line-height: 56px;
    text-align: center;
    margin: 5px 2px 2px;
  }
  /deep/ .el-date-table td.next-month, .el-date-table td.prev-month {
    color: #c5c8ce;
  }
  /deep/ .el-popper .popper__arrow, .el-popper .popper__arrow::after {
    display: none;
  }
  /deep/ .el-icon-date:before {
    display: none;
  }

  .el-scrollbar {
    .el-select-dropdown__wrap {
      max-height: 350px;
      .el-select-dropdown__list {
        .el-select-dropdown__item {
          display: block;
          font-size: 20px;
          padding: 15px 20px;
          height: auto;
          line-height: inherit;
        }
      }
    }
  }

</style>
