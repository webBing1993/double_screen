<template>
  <div>
    <div class="orderIndex">
      <div class="order_fl">
        <div class="header">
          <div class="tabs">
            <span :class="tabIndex == 1 ? 'active tab' : 'tab'" @click="tabClick(1, 1)" :style="tabIndex == 1 ? tabImg[1] : tabImg[0]">散客订单</span>
            <span :class="tabIndex == 2 ? 'active tab' : 'tab'" @click="tabClick(1, 2)" :style="tabIndex == 2 ? tabImg[1] : tabImg[0]">团队订单</span>
            <span :class="tabToDay ? 'active tab' : 'tab'" @click="tabClick(2, 1)" :style="tabToDay ? tabImg[1] : tabImg[0]">今日预抵</span>
          </div>
          <div class="synchronismReplay">
            <div class="synchronism" @click="getRefreshList" v-if="pmsFlag">
              <span>批量同步</span>
            </div>
            <div class="replayList" @click="replayList">
              <span>拉取订单</span>
            </div>
          </div>
        </div>
        <div class="content">
          <!--<div class="order_table">-->
            <!--<span class="table_cell">预订人</span>-->
            <!--<span class="table_cell">入离时间</span>-->
            <!--<span class="table_cell">房间信息</span>-->
          <!--</div>-->
          <div class="order_lists" v-if="orderLists.length != 0 && showList">
            <div class="list" v-for="item in orderLists">
              <div class="list_header">
                <div class="list_origin">订单来源：{{item.channel ? item.channel : '-'}}</div>
                <div class="list_time">更新时间：{{dateDiff(item.updateTime) >= 60 ? datetimeparse(item.updateTime, 'MM-dd hh:mm') : dateDiff(item.updateTime)+'分钟前'}}</div>
              </div>
              <div class="list_content">
                <div class="list_cell">
                  <div class="img"><img src="../../assets/renyuan.png" alt=""></div>
                  <div class="listCell">
                    <p class="name">{{item.owner}}</p>
                    <p class="phone">{{item.ownerTel}}</p>
                  </div>
                </div>
                <div class="list_cell">
                  <div class="img"><img src="../../assets/riqi.png" alt=""></div>
                  <div class="listCell">
                    <p>{{datetimeparse(item.inTime,"MMDD")}}<span>{{item.inTime | isToday}}</span>-{{datetimeparse(item.outTime,"MMDD hh:mm")}}</p>
                    <p>共{{item.totalDays}}晚</p>
                  </div>
                </div>
                <div class="list_cell">
                  <div class="img"><img src="../../assets/fangjian.png" alt=""></div>
                  <div class="listCell">
                    <p v-for="(room,index) in item.rooms" :key="index">
                      {{room.roomTypeName}} &nbsp; *{{room.count}}间
                    </p>
                  </div>
                  <el-button type="primary" class="tongbu_status" :loading="item.loadingTongbu"  @click="getRefresh(item)"  v-if="pmsFlag">同步</el-button>
                  <el-button type="primary" class="daiSure_status" :loading="item.loadingdaiSure" v-if="item.payMode == 0 && item.type == 1"  @click="changeStatus(item)" >待确认</el-button>
                  <el-button type="primary" class="banli_status" :loading="item.loadingBanli" v-else  @click="checkGoIn(item)" >办理入住</el-button>
                </div>
              </div>
              <div class="remark">备注：{{item.remark ? item.remark : '-'}}</div>
            </div>
          </div>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="page"
            :page-size="3"
            layout="total, prev, pager, next"
            :total="total" v-if="orderLists.length != 0 && showList_">
          </el-pagination>
          <div class="noMsg" v-if="orderLists.length == 0 && showList">
            <div class="img"><img src="../../assets/zanwuneirong.png" alt=""></div>
            <p>暂无内容</p>
          </div>
        </div>

        <!-- 是否分房-->
        <div class="isShowScreen" v-if="isShowScreen">
          <div class="shadow" @click="isShowScreen=false"></div>
          <div class="isShowScreen_content">
            <div class="isShowScreen_title">请先对房间进行分房，才可办理入住</div>
            <div class="isShowScreen_tabs">
              <span class="cancel" @click="isShowScreen=false">我知道了</span>
            </div>
          </div>
        </div>
        <loadingList v-if="loadingShow" :loadingText="loadingText" style="width: calc(100vw - 480px)"></loadingList>
      </div>
      <div class="order_fr">
        <div>
          <div class="fast_title">
            <img src="../../assets/xiantiao.png" alt="">
            快速筛选
          </div>
          <div class="changTabs">
            <span :class="changeTabString == 1 ? 'active' : ''" @click="changeTabClick(1)">预订人</span>
            <span :class="changeTabString == 2 ? 'active' : ''" @click="changeTabClick(2)">手机号</span>
          </div>
          <div class="change_tabs">
            <div class="tab" v-if="changeTabString == 1">
              <div class="input">
                <input type="text" placeholder="请输入预订人姓名的首字母查询" v-model="searchString1" @input="changeKeyBords">
                <img src="../../assets/close.png" alt="" @click="clearSearch" v-if="searchString1.length > 0">
              </div>
              <div class="keyBoard">
                <span v-for="item in keyBords1" @click="keyEntry($event, item, 1)">{{item}}</span>
                <span @click="keyCancel($event, 1)"><img src="../../assets/shanchuanniu.png" alt=""></span>
              </div>
            </div>
            <div class="tab" v-else>
              <div class="input">
                <input type="text" placeholder="请输入预订人手机号查询" v-model="searchString2" maxlength="11" @input="changeKeyBords">
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

      <!-- 请先将团队主单入住后才能操作-->
      <div class="tigTeamShow" v-if="tigTeamShow">
        <div class="shadow"></div>
        <div class="tig_content">
          <div class="tig_title">
            请先将团队主单入住后才能操作
          </div>
          <div class="tig_btns">
            <span @click="tigTeamKnow">我知道了</span>
          </div>
        </div>
      </div>

      <!-- 判断A屏是否有订单在操作-->
      <div class="tigTeamShow" v-if="tigOrderShow">
        <div class="shadow"></div>
        <div class="tig_content">
          <div class="tig_title">
            <p>外屏正在办理中，请查看外屏对订单【退出办理】后重新尝试</p>
          </div>
          <div class="tig_btns">
            <span class="cancel" @click="tigOrderShow=false;changeItem.loadingBanli = false;">取消</span>
            <span class="sure" @click="openScreen">查看外屏</span>
          </div>
        </div>
      </div>

      <!-- 修改状态-->
      <div class="checkIn_tip" v-if="checkInTip">
        <div class="shadow" @click="checkInTip = false;"></div>
        <div class="checkIn_content">
          <div class="checkIn_title">
            <span>请确认订单支付状态</span>
            <div class="checkIn_close" @click="closeTip">关闭</div>
          </div>
          <div class="lists">
            <div class="list">
              <div class="title"><span>应付房费：</span><span>{{(roomFeeShow/100).toFixed(2)}}元</span></div>
              <div class="changeItem" >
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
                <div class="item_tab" @click="payModeChange(1)">
                  <img src="../../assets/xuanzhongle.png" alt="" v-if="payMode == 1">
                  <img src="../../assets/weixuan.png" alt="" v-else>
                  <span>在线收款</span>
                </div>
              </div>
            </div>
            <div class="list">
              <div class="title"><span>应付押金：</span><span>{{(cashFee/100).toFixed(2)}}元</span></div>
              <div class="changeItem" v-if="cashFee != 0">
                <div class="item_tab" @click="freeDepositChange(1)">
                  <img src="../../assets/xuanzhongle.png" alt="" v-if="cashFeeTrue || isFreeDeposit == 1">
                  <img src="../../assets/weixuan.png" alt="" v-else>
                  <span>不收押金</span>
                </div>
                <div class="item_tab" @click="freeDepositChange(2)"  v-if="!cashFeeTrue">
                  <img src="../../assets/xuanzhongle.png" alt="" v-if="isFreeDeposit == 2">
                  <img src="../../assets/weixuan.png" alt="" v-else>
                  <span>收押金</span>
                </div>
              </div>
            </div>
          </div>
          <div class="btns">
            <el-button type="primary" :class="payMode != 0 ? 'btn_button_primary' : 'btn_button_disabled'" :disabled="payMode == 0" round :loading="loadingCheckInSure" @click="checkInSure()">完成</el-button>
          </div>
        </div>
      </div>

      <!-- 拉去订单-->
      <div class="searchBox" v-if="searchBox">
        <div class="shadow"></div>
        <div class="searchBoxContent">
          <div class="searchTabs">
            <div class="searchTabLeft">
              <span :class="tabIndex_ == 1 ? 'active tab' : 'tab'" @click="tabClick_(1)" :style="tabIndex_ == 1 ? tabImg[1] : tabImg[0]">散客订单</span>
              <span :class="tabIndex_ == 2 ? 'active tab' : 'tab'" @click="tabClick_(2)" :style="tabIndex_ == 2 ? tabImg[1] : tabImg[0]">团队订单</span>
            </div>
            <div class="searchTabRight">
              <span @click="cancleSearch">取消</span>
            </div>
          </div>
          <div class="searchContent">
            <div class="searchInput">
              <img src="../../assets/Icon-search.png" alt="">
              <input type="text" placeholder="请输入预订人姓名\手机号\订单号" ref="searchBoxInput" v-model="searchString3" @focus="searchBoxFocus" @input="boxInput" @blur="searchBoxBlur">
            </div>
            <div class="searchBtn">
              <button  type="primary" :loading="searchSureLoading" :disabled="searchDisabled" @click="searchSureBtn">{{ searchBtnText }}</button>
            </div>
          </div>
          <div class="noDataTip" v-if="noData">
            *订单不存在，请检查输入的条件
          </div>
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
    name: 'order',
    components: {ElCol, loadingList},
    data () {
      return {
        loadingShow: false,  // loading
        loadingText: '同步中...', // loading text
        showList: false,
        showList_: false,
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
        tabIndex: 1,  // tab切换
        tabToDay: true,  // tab今日预抵
        searchString: '',  // 搜索
        searchString1: '',  // 字母搜索
        searchString2: '',  // 数字搜索
        page: 1,      // 页数
        total: 0,      // 总数
        orderLists: [], // 总数据
        changeItem: {},  // 接受临时数据
        changeTabString: 1,  // 右侧筛选tab切换
        keyBords1: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K','L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],     // 字母键盘
        keyBords2: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '清除', '0'],   // 数字键盘
        roomFeeShow: 0,  // 总房费
        paidFeeShow: 0,  // 已付房费
        cashFee: 0,      // 押金
        cashFeeTrue: false,  // 判断是否有无押金配置
        ispaid: false,  // 判断是否付过款了
        payMode: 0,  // 判断房费支付状态
        isShowScreen: false, // 是否分房
        pmsFlag: true,   // 判断是否对接pms
        tigTeamShow: false,     // 团队主单入住后
        startTime: '',  // 开始时间
        endTime: '',  // 结束时间
        tigOrderShow: false, // 判断A屏是否有订单在操作
        isFreeDeposit: 1,
        loadingCheckInSure: false,    // 修改订单状态loading
        checkInTip: false,      // 修改支付状态弹框
        searchBox: false,        // 拉去订单tip
        tabIndex_: 1,           // tip tab
        searchSureLoading: false,
        searchDisabled: false,
        searchString3: '',      // tip input
        searchBtnText: '确认查询',       // tip button text
        noData: false,
        isPms: false,         // 判断是否是pms拉取的
        dwimeX: null,         // 键盘
        wherePrint: 2,        // 1A屏2B屏
      }
    },
    filters: {
      isToday:function(value) {
        if (new Date(value).toDateString() === new Date().toDateString()) {
          return   '(今日)'
        }else{
          return '';
        }
      }
    },
    methods: {
      ...mapActions([
        'goto', 'replaceto', 'getQueryByPage', 'refreshList', 'getRefreshTime', 'getOrderFree', 'sendCheck', 'updatePaidMode', 'getPmsFlag', 'refreshOne', 'getOrderFree', 'updatePaidMode'
      ]),

      // tab切换
      tabClick (type, index) {
        this.loadingText = '加载中...';
        this.loadingShow = true;
        this.showList = false;
        this.showList_ = false;
        this.isPms = false;
        if (type == 1) {
          this.tabIndex = index;
          this.tabIndex_ = index;
          sessionStorage.setItem('tabIndex_', this.tabIndex);
        }else {
          let today=new Date().getTime();
          this.tabToDay = !this.tabToDay;
          sessionStorage.setItem('tabToDay', this.tabToDay);
          if (this.tabToDay) {
            this.startTime = this.datetimeparse(today,'YYYY-MM-DD')+' 00:00:00';
            this.endTime = this.datetimeparse(today,'YYYY-MM-DD')+' 23:59:59';
          }else {
            this.startTime = '';
            this.endTime = '';
          }
        }
        this.page = 1;
        this.getPreOrder(1);
      },

      tabClick_ (index) {
        this.dwimeX.SendCmd("close");
        this.tabIndex = index;
        this.tabIndex_ = index;
      },

      // 取消
      cancleSearch() {
          this.searchString3 = '';
          this.searchBtnText = '确认查询';
          this.searchBox = false;
          this.searchSureLoading = false;
          this.searchDisabled = false;
          this.dwimeX.SendCmd("close");
          if (this.orderLists.length == 0) {
            this.isPms = false;
            this.searchString = '';
            this.page = 1;
            this.getPreOrder(1);
          }
      },

      // blur input
      searchBoxBlur () {
        this.$refs.searchBoxInput.focus();
      },

      // search tip input focus
      searchBoxFocus() {
        let x;
        if (this.wherePrint == 2) {
            x = 1920;
        }else {
            x = 0;
        }
        let y = document.body.clientHeight - 420;

        if (this.searchBox) {
          this.dwimeX.SendCmd("pos(" + x + "," + y +")/show");
        }else {
          this.dwimeX.SendCmd("close");
        }
      },

      boxInput(val) {
          if (val.target.value == '') {
            this.noData = false;
          }
      },

      // 调用键盘 api
      dwimeXFun() {
        this.url = "http://127.0.0.1:1606/";

        // 调用无参数 api
        this.SendCmd = function(param) {

          var xhr = new XMLHttpRequest();
          xhr.open("POST", this.url + param, true);

          try {
            xhr.send(null);
          } catch(e) {
            return null;
          }

          // 获取数据后的处理程序
          xhr.onreadystatechange = function ()
          {
            if (xhr.readyState == 4 && xhr.status == 200)
            {
              var json = JSON.parse(xhr.responseText);
              return json["result"];
            }
          };

          return null;
        };
      },

      // 确认查询
      searchSureBtn() {
        this.dwimeX.SendCmd("close");
        if (this.searchString3 !== '') {
          this.searchBtnText = '查询中';
          this.isPms = true;
          this.searchSureLoading = true;
          this.searchDisabled = true;
          this.searchString = this.searchString3;
          this.page = 1;
          this.getPreOrder(1);
        }else {
          this.noData = false;
        }
      },

      // 键盘事件
      changeKeyBords () {
        this.isPms = false;
        if (this.changeTabString == 1) {
          this.searchString = this.searchString1;
          this.page = 1;
          this.getPreOrder(1);
        }else {
          this.searchString = this.searchString2;
          if (this.searchString2.length == 11) {
            this.page = 1;
            this.getPreOrder(1);
          }else if (this.searchString2.length == 0) {
            this.page = 1;
            this.getPreOrder(1);
          }
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
        this.getPreOrder(1);
      },

      keyCancel (event, type) {
        event.preventDefault();
        if (type == 1) {
          if (this.searchString1.length > 0) {
            this.searchString1 = this.searchString1.substr(0, this.searchString1.length - 1);
            this.searchString = this.searchString1;
//            this.loadingText = '加载中...';
//            this.loadingShow = true;
//            this.showList = false;
            this.page = 1;
            this.getPreOrder(1);
          }
        }else {
          if (this.searchString2.length > 0) {
            this.searchString2 = this.searchString2.substr(0, this.searchString2.length - 1);
            this.searchString = this.searchString2;
            if (this.searchString2.length == 0) {
//              this.loadingText = '加载中...';
//              this.loadingShow = true;
//              this.showList = false;
              this.page = 1;
              this.getPreOrder(1);
            }
          }
        }
      },

      // 键盘清除事件
      clear (event) {
        event.preventDefault();
        this.searchString2 = '';
        this.searchString = '';
//        this.loadingText = '加载中...';
//        this.loadingShow = true;
//        this.showList = false;
        this.page = 1;
        this.getPreOrder(1);
      },

      // 字母键盘事件
      keyEntry(event, item,type) {
        event.preventDefault();
        if (type == 1) {
          this.searchString1 += item;
          this.searchString = this.searchString1;
//          this.loadingText = '加载中...';
//          this.loadingShow = true;
//          this.showList = false;
          this.tabToDay = false;
          this.page = 1;
          this.getPreOrder(1);
        }else {
          if (this.searchString2.length < 11) {
            this.searchString2 += item;
            if (this.searchString2.length == 11) {
//              this.loadingText = '加载中...';
//              this.loadingShow = true;
//              this.showList = false;
              this.searchString = this.searchString2;
              this.tabToDay = false;
              this.page = 1;
              this.getPreOrder(1);
            }
          }else {
            return;
          }
        }
      },

      // 键盘删除事件
      clearSearch() {
        this.searchString1 = '';
        this.searchString = this.searchString1;
//        this.loadingText = '加载中...';
//        this.loadingShow = true;
//        this.showList = false;
        this.page = 1;
        this.getPreOrder(1);
      },
      clearSearch1() {
        this.searchString2 = '';
        this.searchString = this.searchString2;
//        this.loadingText = '加载中...';
//        this.loadingShow = true;
//        this.showList = false;
        this.page = 1;
        this.getPreOrder(1);
      },

      // 关闭
      closeTip() {
        this.checkInTip = false;
        document.body.removeEventListener('touchmove',this.bodyScroll,false);
        document.body.style.position = 'initial';
        document.body.style.width = 'auto';
      },

      // 选择框完成事件
      checkInSure() {
        this.loadingCheckInSure = true;
        this.updatePaidMode({
          orderId: this.changeItem.id,
          isFreeDeposit: this.isFreeDeposit == 1 ? true : false,
          modeId: this.payMode,
          onsuccess: body => {
            this.loadingCheckInSure = false;
            if (body.data.code == 0) {
              this.checkInTip = false;
              this.getPreOrder(this.page);
            }
          },
          onfail: (body, headers) => {
            this.loadingCheckInSure = false;
          },
          onerror: body => {
            item.loadingCheckInSure = false;
          }
        });
      },

      // 房费更改
      payModeChange(index) {
        this.payMode = index;
      },

      // 选择是否免押金
      freeDepositChange(num) {
        if (num == 1) {
          this.changeItem.isFreeDeposit = true;
        }else {
          this.changeItem.isFreeDeposit = false;
        }
        this.isFreeDeposit = num;
      },

      // 待确认选择
      changeStatus(item) {
        item.loadingdaiSure = true;
        this.changeItem = item;
        this.getOrderFree({
          data: {
            orderId: item.id
          },
          onsuccess: body => {
            if (body.data.code == 0) {
              this.loadingShow = false;
              if (this.changeItem.isFreeDeposit) {
                this.isFreeDeposit = 1;
              }else {
                this.isFreeDeposit = 2;
              }
              if (body.data.data == null || !body.data.data) {
                this.$toast({
                  message: "订单已取消",
                  iconClass: 'icon ',
                });
                this.page = 1;
                this.getPreOrder(1);
              }else {
                if (body.data.data.cashFeeShow == '免押') {
                  this.cashFee = 0;
                  this.cashFeeTrue = true;
                } else {
                  this.cashFeeTrue = false;
                  this.cashFee = body.data.data.cashFeeShow;
                }
                if (body.data.data.roomFeeShow == '预付房费') {
                  if (body.data.data.cashFeeShow == '免押') {
                    this.roomFeeShow = body.data.data.totalFeeShow;
                  } else {
                    this.roomFeeShow = parseFloat(body.data.data.totalFeeShow) - parseFloat(body.data.data.cashFeeShow);
                  }
                } else {
                  this.roomFeeShow = body.data.data.roomFeeShow;
                }
                this.paidFeeShow = body.data.data.paidFeeShow;
                this.needPayRoomFeeShow = parseFloat(this.roomFeeShow) - parseFloat(this.paidFeeShow);
                if (this.needPayRoomFeeShow < 0) {
                  this.needPayRoomFeeShow = 0;
                }
                this.payMode = body.data.data.payMode != null ? body.data.data.payMode : 0;
                item.loadingdaiSure = false;
                this.checkInTip = true;
                document.body.addEventListener('touchmove', this.bodyScroll, false);
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
              }
            }else {
              item.loadingdaiSure = false;
            }
          },
          onfail: (body, headers) => {
            item.loadingdaiSure = false;
          },
          onerror: body => {
            item.loadingdaiSure = false;
          }
        });
      },

      //办理入住
      checkGoIn(item) {
        item.loadingBanli = true;
        this.changeItem = item;
        // 先判断A屏正在办理ing
        this.getOrderProcess();
//        this.showOrderInfo(true);
        this.$nextTick(() => {
          setTimeout(() => {
            item.loadingBanli = false;
          },5000)
        })
      },

      getOrderProcess() {
        jsObj.GetOrderProcess();
      },

      // 接收A屏判断是否正在办理入住的结果
      showOrderInfo (isTrue) {
        console.log('isTrue__', isTrue);
        if (isTrue != 'true') {
          // 判断是否为今日订单
          this.sendCheck({
            id: this.changeItem.id,
            subOrderId: '',
            onsuccess: body => {
              if (body.data.code == 0) {
                if (this.changeItem.type == 1) {
                  this.getOrderFree({
                    data: {
                      orderId: this.changeItem.id
                    },
                    onsuccess: body => {
                      if (body.data.code == 0) {
                        this.loadingShow = false;
                        if (body.data.data == null || !body.data.data) {
                          this.$toast({
                            message: "订单已取消",
                            iconClass: 'icon ',
                          });
                          this.page = 1;
                          this.getPreOrder(1);
                        }else {
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
                          this.ispaid = body.data.data.paid;
                          sessionStorage.setItem('changeItem', JSON.stringify(this.changeItem));
                          sessionStorage.setItem('currentChange', this.page);
                          sessionStorage.setItem('gotoCheckIn', true);
                          this.$emit('gocheckIn', this.changeItem.id);
                        }

                      }else {
                        this.loadingShow = false;
                      }
                      this.changeItem.loadingBanli = false;
                    },
                    onfail: (body, headers) => {
                      this.changeItem.loadingBanli = false;
                      this.loadingShow = false;
                    },
                    onerror: error => {
                      this.changeItem.loadingBanli = false;
                      this.loadingShow = false;
                    }
                  });
                }else {
                  // 团队订单办理入住进行跳转
                  this.loadingShow = false;
                  this.changeItem.loadingBanli = false;
                  sessionStorage.setItem('changeItem', JSON.stringify(this.changeItem));
                  sessionStorage.setItem('currentChange', this.page);
                  sessionStorage.setItem('gotoCheckIn', true);
                  this.$emit('gocheckIn', this.changeItem.id);
                }
              }else if (body.data.code == 888000) {
                this.loadingShow = false;
                this.changeItem.loadingBanli = false;
                this.tigTeamShow = true;
                document.body.addEventListener('touchmove',this.bodyScroll,false);
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
              }else {
                this.changeItem.loadingBanli = false;
                this.loadingShow = false;
              }
            },
            onfail: (body, headers) => {
              this.changeItem.loadingBanli = false;
              if (body.data.code == 89000 || body.data.code == 79000 || body.data.code == 69000) {
                this.page = 1;
                this.getPreOrder(1);
              }else {
                this.loadingShow = false;
              }
            },
            onerror: error => {
              this.changeItem.loadingBanli = false;
              this.loadingShow = false;
            }
          });
        }else {
          this.tigOrderShow = true;
        }
      },

      openScreen () {
        this.openExternalScreen();
        this.tigOrderShow = false;
        this.getPreOrder(this.page);
      },

      // 查看外屏
      openExternalScreen() {
        jsObj.OpenExternalScreen();
      },

      SendParameter(type) {
        jsObj.sendParameter = new Date().getSeconds() + "@" + type;
        jsObj.SendMessage();
      },

      // 请先将团队主单入住后才能操作 我知道了
      tigTeamKnow() {
        document.body.removeEventListener('touchmove',this.bodyScroll,false);
        document.body.style.position = 'initial';
        document.body.style.width = 'auto';
        this.tigTeamShow = false;
        sessionStorage.setItem('changeItem', JSON.stringify(this.changeItem));
        sessionStorage.setItem('currentChange', this.page);
        sessionStorage.setItem('gotoCheckIn', true);
        this.$emit('gocheckIn', this.changeItem.id);
      },

      // 单个订单同步
      getRefresh(item) {
        item.loadingTongbu = true;
        this.refreshOne({
          orderId: item.id,
          onsuccess: body => {
            if (body.data.data == '同步成功') {
              this.getPreOrder(this.page);
            }else {
              this.loadingShow = false;
            }
            this.$message({
              message: body.data.data,
              type: 'success'
            });
          },onfail: (body, headers) => {
            this.loadingShow = false;
          },
          onerror: error => {
            this.loadingShow = false;
            this.getPreOrder(this.page);
          }
        })
      },

      //同步订单
      getRefreshList(){
        this.showList = false;
        this.showList_ = false;
        this.loadingText = '同步中...';
        this.loadingShow = true;
        this.refreshList({
          pmsType: 1,
          onsuccess:body=>{
            if (body.data.data == '同步成功') {
              this.searchString = this.searchString2 = this.searchString1 = '';
              this.page = 1;
              this.getPreOrder(1);
              this.initRefreshTime();
            }else {
              this.orderLists = [];
              this.loadingShow = false;
            }
            this.$message({
              message: body.data.data,
              type: body.data.data == '同步成功' ? 'success' : 'error'
            });
          },
          onfail: (body, headers) => {
            this.loadingShow = false;
          },
          onerror: error => {
            this.loadingShow = false;
            let hint = '';
            if (error.status === 401) {
              hint = '登录失效!'
            } else if (error.status === 1) {
              hint = '请求超时!';
            } else {
              hint = '请求失败'
            }
            if (hint != '') {
              this.$message({
                message: hint,
                type: 'error'
              });
            }
            this.page = 1;
            this.getPreOrder(1);
          }
        });
      },

      // 拉取订单
      replayList () {
        this.noData = false;
        this.searchBox = true;
        setTimeout(() => {
          this.$refs.searchBoxInput.focus();
        }, 500)
      },

      //获得同步时间
      initRefreshTime(){
        this.getRefreshTime({
          onsuccess:body=>{
            this.updateTime=body.data.pmsUpdateTime;
          }
        });
      },

      // 订单列表
      getPreOrder (page) {
        document.body.removeEventListener('touchmove',this.bodyScroll,false);
        document.body.style.position = 'initial';
        document.body.style.width = 'auto';
        if (this.tabToDay) {
          let today=new Date().getTime();
          this.startTime = this.datetimeparse(today,'YYYY-MM-DD')+' 00:00:00';
          this.endTime = this.datetimeparse(today,'YYYY-MM-DD')+' 23:59:59';
        }else {
          this.startTime = '';
          this.endTime = '';
        }
        this.getQueryByPage({
          data: {
            start: this.startTime,
            end: this.endTime,
            page: page,
            pageSize: 3,
            payMode: '',
            precheckinStatus: '',
            status: "1",
            type: this.tabIndex == 1 ? 1 : 0,
            searchString: this.searchString,
            pms: this.isPms
          },
          onsuccess: body => {
            this.loadingShow = false;
            if (body.data.code == 0 && body.data.data) {
              if (body.data.data.list) {
                if (body.data.data.list.length == 0) {
                  this.searchBtnText = '确认查询';
                  this.searchSureLoading = false;
                  this.searchDisabled = false;
                  this.noData = true;
                  if (this.page > 1) {
                    this.page--;
                    this.getPreOrder(this.page);
                  }else {
                    this.orderLists = [];
                    this.total = body.data.data.total;
                  }
                }else {
                  body.data.data.list.forEach(item => {
                    item.loadingTongbu = false;
                    item.loadingBanli = false;
                    item.loadingdaiSure = false;
                  });
                  body.data.data.list.forEach(item => {
                    if (item.updateTime) {

                    }else {
                      item.updateTime = item.createTime;
                    }
                  });
                  if (this.isPms) {
                    if(this.searchBox) {
                      this.$toast({
                        message: "订单拉取成功",
                        iconClass: 'icon ',
                      });
//                    this.cancleSearch();
                    }
                    this.searchString1 = body.data.data.list ? body.data.data.list[0].ownerInitials : '';
                  }
                }

                if (this.searchBox) {
                  this.searchBoxFocus();
                }

                this.orderLists = body.data.data.list;

                if (this.orderLists.length != 0) {
                  this.cancleSearch();
                }
                this.total = body.data.data.total;
              }

            }else {
                if (this.searchBox) {
                  this.searchBtnText = '确认查询';
                  this.searchSureLoading = false;
                  this.searchDisabled = false;
                  this.noData = true;
                }
            }
            this.showList = true;
            this.showList_ = true;
          },
          onfail: (body, headers) => {
            this.loadingShow = false;
            this.showList = false;
            this.showList_ = false;
          },
          onerror: error => {
            this.loadingShow = false;
            this.showList = false;
            this.showList_ = false;
          }
        })
      },

      // 分页
      handleSizeChange (val) {

      },

      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.loadingText = '加载中...';
        this.loadingShow = true;
        this.showList = false;
        this.showList_ = true;
        this.getPreOrder(val);
      },

      // 判断是否是对接pms
      initPmsFlag(){
        this.getPmsFlag({
          onsuccess: (body)=>{
            if(body.data.code==0 && body.data.data!=null){
              this.pmsFlag = body.data.data;
              sessionStorage.setItem('pmsFlag', this.pmsFlag)
            }
          },
        });
      },

      // 距离现在相差几分钟
      dateDiff(outTime) {
        let newTime = new Date().getTime();
        let totalSecs = Math.abs(newTime - outTime) / 1000;
        let mins = Math.floor(totalSecs / 60);
        if (mins == 0) {
            mins = 1;
        }
        return mins;
      },

    },
    beforeMount() {
      this.dwimeX = new this.dwimeXFun();
      this.wherePrint = sessionStorage.getItem('getAppLocation') ? sessionStorage.getItem('getAppLocation') : 2;
    },

    mounted () {
      this.initPmsFlag();
      this.loadingText = '加载中...';
      this.loadingShow = true;
      this.showList = false;
      this.showList_ = false;
      if(!this.$route.meta.isBack || sessionStorage.getItem('gotoCheckIn') == 'false'){
        this.page = 1;
      }else {
        this.tabIndex = sessionStorage.getItem('tabIndex_') != null ? sessionStorage.getItem('tabIndex_') : 1;
        this.tabToDay = sessionStorage.getItem('tabToDay') == 'false' ? false : true;
        this.page = sessionStorage.getItem('currentChange') != null ? parseInt(sessionStorage.getItem('currentChange')) : 1;
      }
      let today = new Date().getTime();
      if (this.tabToDay) {
        this.startTime = this.datetimeparse(today,'YYYY-MM-DD')+' 00:00:00';
        this.endTime = this.datetimeparse(today,'YYYY-MM-DD')+' 23:59:59';
      }else {
        this.startTime = '';
        this.endTime = '';
      }
      this.getPreOrder(this.page);
      this.$route.meta.isBack = false;
      window.showOrderInfo = this.showOrderInfo;
      window.startUpDevice = this.startUpDevice;
    },
    beforeRouteEnter(to,from,next){
      if(from.name == 'checkIn'){
        to.meta.isBack = true;
      }
      next();
    },
    beforeRouteLeave (to, from, next) {
      this.loadingShow = false;
      next();
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">

  .orderIndex {
    width: 100vw;
    padding-top: 100px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .order_fl {
      padding: 0 40px;
      width: -moz-calc(100% - 480px);
      width: -webkit-calc(100% - 480px);
      width: calc(100% - 480px);
      position: relative;
      min-height: calc(100vh - 100px);
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .tabs {
          padding: 40px 0;
          .tab {
            padding: 18px 30px;
            /*background: #FFFFFF;*/
            /*box-shadow: 0 8px 22px 0 rgba(0,0,0,0.10);*/
            /*border-radius: 40px;*/
            color: #909399;
            font-size: 20px;
            margin-right: 30px;
          }
          .active {
            font-weight: bold;
            /*background-color: #C8E1C8;*/
            /*border: 1px solid #1AAD19;*/
            color: #1AAD19;
          }
        }
        .synchronismReplay {
          display: inline-flex;
        }
        .synchronism, .replayList {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 146px;
          height: 56px;
          line-height: 56px;
          margin-left: 30px;
          background: #FFFFFF;
          box-shadow: 0 8px 22px 0 rgba(0,0,0,0.10);
          border-radius: 40px;
          cursor: pointer;
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
          img {
            display: inline-block;
            width: 36px;
            height: 36px;
          }
          span {
            color: #1AAD19;
            font-size: 20px;
          }
        }
      }
      .content {
        .order_table {
          background: #FFFFFF;
          box-shadow: 0 4px 11px 0 rgba(0,0,0,0.10);
          border-radius: 6px;
          padding: 0 40px;
          height: 64px;
          line-height: 64px;
          width: calc(100% - 80px);
          .table_cell {
            width: 25%;
            display: inline-table;
            font-size: 20px;
            color: rgba(0, 0, 0, 1);
            text-align: left;
            font-weight: bold;
          }
          .table_cell:last-of-type {
            width: 48%;
          }
        }
        .order_lists {
          padding-bottom: 115px;
          .list {
            background: #FFFFFF;
            box-shadow: 0 4px 11px 0 rgba(0,0,0,0.10);
            border-radius: 6px;
            margin-bottom: 20px;
            padding: 0 40px;
            position: relative;
            .list_header {
              border-bottom: 1px solid #D5D5D5;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 15px 0 15px;
              div {
                color: #909399;
                font-size: 20px;
              }
            }
            .list_content {
              border-bottom: 1px solid #E5E5E5;
              padding: 15px 0;
              .list_cell {
                width: 19%;
                display: inline-flex;
                text-align: left;
                .img {
                  display: inline-block;
                  margin-right: 16px;
                  img {
                    width: 24px;
                    height: 24px;
                    display: inline-block;
                  }
                }
                .listCell {
                  p {
                    font-size: 20px;
                    color: #000;
                    margin-bottom: 5px;
                  }
                }
              }
              .list_cell:nth-of-type(2) {
                width: 30%;
                margin-left: 20px;
              }
              .list_cell:last-of-type {
                width: 47%;
                position: relative;
                .listCell {
                  width: 42%;
                }
              }
            }
            .remark {
              color: rgba(0, 0, 0, 1);
              font-size: 20px;
              padding: 15px 0;
              text-align: left;
            }
            .tongbu_status {
              position: absolute;
              right: 164px;
              top: 0;
              background: linear-gradient(141deg, #7BAEEF 0%, #4378BA 100%);;
              box-shadow: 0 4px 10px 0 rgba(0,0,0,0.17);
              border-radius: 29.63px;
              width: 146px;
              padding: 17px 0;
              text-align: center;
              font-size: 20px;
              color: #fff;
              cursor: pointer;
              -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
            }
            .banli_status {
              position: absolute;
              right: 0;
              top: 0;
              background: #1AAD19;
              box-shadow: 0 4px 10px 0 rgba(0,0,0,0.17);
              border-radius: 29.63px;
              width: 146px;
              padding: 17px 0;
              text-align: center;
              font-size: 20px;
              color: #fff;
              cursor: pointer;
              -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
            }
            .daiSure_status {
              position: absolute;
              right: 0;
              top: 0;
              background: #F5222D;
              box-shadow: 0 4px 10px 0 rgba(0,0,0,0.17);
              border-radius: 29.63px;
              border-color: #F5222D;
              width: 146px;
              padding: 17px 0;
              text-align: center;
              font-size: 20px;
              color: #fff;
              cursor: pointer;
              -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
            }
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
              padding-right: 60px;
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
    .order_fr>div {
      position: fixed;
      top: 100px;
      right: 0;
      width: 480px;
      height: calc(100vh - 100px);
      background-color: #fff;
    }
    .tigTeamShow {
      .shadow {
        position: fixed;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .6);
      }
      .tig_content {
        background: #FFFFFF;
        border-radius: 20px;
        width: 960px;
        padding: 0 25px;
        position: fixed;
        z-index: 12;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        .tig_title {
          color: #0B0B0B;
          font-size: 28px;
          position: relative;
          padding: 60px 50px;
          font-weight: bold;
          p {
            width : auto;  // 必设
            display : inline-block; // 不能设置为block
            text-align : left; // 居左显示
          }
          img {
            position: absolute;
            right: 10px;
            top: 25%;
            transform: translateY(-50%);
            display: block;
            width: 24px;
            height: 24px;
            cursor: pointer;
          }
        }
        .tig_btns {
          border-top: 1px solid #D8D8D8;
          color:#4378BA;
          padding: 38px 0;
          font-size: 28px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.04);
          display: flex;
          justify-content: space-between;
          align-items: center;
          span:only-child {
            text-align: center;
            width: 100%;
            display: block;
          }
          .cancel {
            color: #000;
            width: 50%;
            position: relative;
          }
          .cancel:after {
            content: '';
            display: inline-block;
            width: 1px;
            height: 56px;
            background-color: #D8D8D8;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            position: absolute;
          }
          .sure {
            width: 50%;
          }
        }
      }
    }
    .isShowScreen {
      .shadow {
        position: fixed;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .6);
      }
      .isShowScreen_content {
        background: #FFFFFF;
        border-radius: 20px;
        width: 375px;
        position: fixed;
        z-index: 12;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        .isShowScreen_title {
          padding: 30px 10px;
          border-bottom: 1px solid #D8D8D8;
          color: #0B0B0B;
          font-size: 20px;
          text-align: center;
          font-weight: bold;
        }
        .isShowScreen_tabs {
          display: flex;
          justify-content: center;
          span {
            display: inline-block;
            width: 100%;
            position: relative;
            padding: 15px 0;
            font-size: 20px;
            text-align: center;
            color: #1AAD19;
            cursor: pointer;
          }
        }
      }
    }
    .checkIn_tip {
      .shadow {
        position: fixed;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .6);
      }
      .checkIn_content {
        background: #FFFFFF;
        border-radius: 20px;
        position: fixed;
        z-index: 12;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        padding: 0 60px 50px;
        .checkIn_title {
          text-align: center;
          position: relative;
          padding: 40px 0;
          border-bottom: 1px solid #D8D8D8;
          color: #303133;
          font-size: 28px;
          font-family: PingFangSC-Semibold;
          .checkIn_close {
            position: absolute;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            font-size: 24px;
            color: #1AAD19;
          }
        }
        .lists {
          margin-bottom: 40px;
          padding: 40px 0;
          .list {
            margin-bottom: 40px;
            .title {
              color: #303133;
              font-weight: bold;
              font-size: 20px;
              text-shadow: 0 2px 3px rgba(0,0,0,0.04);
              width: 358px;
              text-align: left;
              margin-bottom: 40px;
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
              width: 100%;
              .item_tab {
                position: relative;
                font-size: 20px;
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
                  width: 100%;
                  display: block;
                }
              }
            }
          }
        }
        .btns {
          text-align: center;
          .el-button {
            width: 390px;
            height: 80px;
            border-radius: 50px;
            font-size: 28px;
            color: #fff;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
          }
          .btn_button_primary {
            background-color: #1AAD19;
            border-color: #1AAD19;
          }
          .btn_button_disabled {
            background-color: #d7d7d7;
            border-color: #d7d7d7
          }
        }
      }
    }
    .searchBox {
      .shadow {
        position: fixed;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .6);
      }
      .searchBoxContent {
        position: fixed;
        z-index: 12;
        left: 0;
        top: 0;
        padding: 0 40px;
        width: calc(100% - 480px);
        min-height: calc(100vh - 100px);
        .searchTabs {
          padding-top: 121px;
          padding-bottom: 18px;
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          .searchTabLeft {
            display: inline-flex;
            align-items: center;
            .tab {
              padding: 18px 30px;
              color: #303133;
              font-size: 20px;
              margin-right: 30px;
            }
            .active {
              font-weight: bold;
              color: #1AAD19;
            }
          }
          .searchTabRight {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 146px;
            height: 56px;
            line-height: 56px;
            margin-left: 30px;
            background: #FFFFFF;
            box-shadow: 0 8px 22px 0 rgba(0,0,0,0.10);
            border-radius: 40px;
            cursor: pointer;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
            span {
              color: #1AAD19;
              font-size: 20px;
              font-weight: bold;
            }
          }
        }
        .searchContent {
          width: 100%;
          background: #EFF7EF;
          border-radius: 9px;
          padding: 20px 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          .searchInput {
            display: inline-flex;
            align-items: center;
            width: 70%;
            img {
              width: 32px;
              height: 32px;
            }
            input {
              margin-left: 30px;
              width: 80%;
              font-family: SourceHanSansCN-Normal;
              font-size: 20px;
              color: #000000;
              border: none;
              background-color: transparent;
              -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
              outline: none
            }
          }
          .searchBtn {
            button {
              background: #1AAD19;
              border-radius: 50.76px;
              width: 146px;
              line-height: 56px;
              font-family: SourceHanSansCN-Regular;
              font-size: 20px;
              color: #FFFFFF;
              letter-spacing: 3px;
              outline: none;
              box-shadow: none;
              border: none;
            }
          }
        }
        .noDataTip {
          background: #FFD6DC;
          padding: 20px 35px;
          font-family: SourceHanSansCN-Normal;
          font-size: 20px;
          color: #FB2142;
          text-align: left;
          margin-top: -4px;
        }
      }
    }
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

</style>
