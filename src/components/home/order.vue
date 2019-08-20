<template>
  <div>
    <div class="orderIndex">
      <div class="order_fl">
        <div class="header">
          <div class="tabs">
            <span :class="tabIndex == 1 ? 'active tab' : 'tab'" @click="tabClick(1, 1)">散客订单</span>
            <span :class="tabIndex == 2 ? 'active tab' : 'tab'" @click="tabClick(1, 2)">团队订单</span>
            <span :class="tabToDay ? 'active tab' : 'tab'" @click="tabClick(2, 1)">今日预抵</span>
          </div>
          <div class="synchronismReplay">
            <div class="synchronism" @click="getRefreshList" v-if="pmsFlag">
              <span>批量同步</span>
            </div>
            <div class="replayList" @click="replayList">
              <img src="../../assets/tongbu.png" alt="">
              <span>刷新</span>
            </div>
          </div>
        </div>
        <div class="content">
          <!--<div class="order_table">-->
            <!--<span class="table_cell">预订人</span>-->
            <!--<span class="table_cell">入离时间</span>-->
            <!--<span class="table_cell">房间信息</span>-->
          <!--</div>-->
          <div class="order_lists" v-if="showList">
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
                  <el-button type="primary" class="banli_status" :loading="item.loadingBanli"  @click="checkGoIn(item)"  v-if="pmsFlag">办理入住</el-button>
                </div>
              </div>
              <div class="remark">备注：{{item.remark ? item.remark : '-'}}</div>
            </div>
          </div>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="page"
            :page-size="4"
            layout="total, prev, pager, next"
            :total="total" v-if="orderLists.length != 0 && showList_">
          </el-pagination>
          <div class="noMsg" v-if="orderLists.length == 0 && showList">
            <div class="img"><img src="../../assets/zanwuneirong.png" alt=""></div>
            <p>暂无内容</p>
          </div>
        </div>

        <!-- 开始办理弹框-->
        <div class="teamTig" v-if="teamTig">
          <div class="shadow"></div>
          <div class="tigContent">
            <div class="title">
              请确认订单支付状态
              <!--<img src="../../assets/guanbi.png" alt="" @click="teamTig = false;">-->
              <span @click="teamTig = false;">关闭</span>
            </div>
            <div class="tigLists">
              <div class="tig_list">
                <div class="list_title_total">
                  <div class="list_title">总房费：</div>
                  <div class="list_total">{{(roomFeeShow/100).toFixed(2)}}元</div>
                </div>
                <div class="list_tabs">
                  <div class="list_tab" @click="payModeChange(1)">
                    <img src="../../assets/xuanzhongle.png" alt="" v-if="payMode == 1">
                    <img src="../../assets/weixuan.png" alt="" v-else>
                    当面付
                  </div>
                  <div class="list_tab" @click="payModeChange(2)">
                    <img src="../../assets/xuanzhongle.png" alt="" v-if="payMode == 2">
                    <img src="../../assets/weixuan.png" alt="" v-else>
                    已预付
                  </div>
                  <div class="list_tab" @click="payModeChange(3)">
                    <img src="../../assets/xuanzhongle.png" alt="" v-if="payMode == 3">
                    <img src="../../assets/weixuan.png" alt="" v-else>
                    后付/挂账
                  </div>
                </div>
              </div>
              <div class="tig_list">
                <div class="list_title_total">
                  <div class="list_title">押金：</div>
                  <div class="list_total">{{(cashFee/100).toFixed(2)}}元</div>
                </div>
                <div class="list_tabs">
                  <div class="list_tab" @click="changeFreeDeposit(1)">
                    <img src="../../assets/xuanzhongle.png" alt="" v-if="cashFeeTrue || changeItem.isFreeDeposit">
                    <img src="../../assets/weixuan.png" alt="" v-esle>
                    免押金
                  </div>
                  <div class="list_tab" @click="changeFreeDeposit(2)" v-if="!cashFeeTrue">
                    <img src="../../assets/xuanzhongle.png" alt="" v-if="!changeItem.isFreeDeposit">
                    <img src="../../assets/weixuan.png" alt="" v-else>
                    收押金
                  </div>
                </div>
              </div>
              <p class="tigRemark" v-if="changeItem.remark">订单备注：{{changeItem.remark}}</p>
            </div>
            <el-button type="primary" class="tig_btn" :loading="loadingCheckIn"  @click="teamCheckIn()" v-if="payMode != 0">开始办理</el-button>
            <el-button type="info" disabled class="tig_btn tig_info" :loading="loadingCheckIn"  v-else>开始办理</el-button>
          </div>
        </div>

        <!-- 是否分房-->
        <div class="isShowScreen" v-if="isShowScreen">
          <div class="shadow"></div>
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
                <input type="text" placeholder="请输入预订人姓名的首字母查询" v-model="searchString1">
                <img src="../../assets/close.png" alt="" @click="clearSearch" v-if="searchString1.length > 0">
              </div>
              <div class="keyBoard">
                <span v-for="item in keyBords1" @click="keyEntry($event, item, 1)">{{item}}</span>
                <span @click="keyCancel($event, 1)"><img src="../../assets/shanchuanniu.png" alt=""></span>
              </div>
            </div>
            <div class="tab" v-else>
              <div class="input">
                <input type="text" placeholder="请输入预订人手机号查询" v-model="searchString2" maxlength="11">
                <img src="../../assets/close.png" alt="" @click="clearSearch1" v-if="searchString2.length > 0">
              </div>
              <div class="keyBoard2">
                <span v-for="item in keyBords2" @click="item == '清除' ? clear($event) : keyEntry($event, item, 2)">{{item}}</span>
                <span @click="keyCancel($event, 2)"><img src="../../assets/shanchuanniu.png" alt=""></span>
              </div>
            </div>
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
    </div>
  </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex';
  import ElCol from "element-ui/packages/col/src/col";
  import loadingList from './loading.vue'

  let today=new Date().getTime();
  export default {
    name: 'order',
    components: {ElCol, loadingList},
    data () {
      return {
        loadingShow: false,  // loading
        loadingText: '同步中...', // loading text
        showList: false,
        showList_: false,
        tabIndex: 1,  // tab切换
        tabToDay: true,  // tab今日预抵
        searchString: '',  // 搜索
        searchString1: '',  // 字母搜索
        searchString2: '',  // 数字搜索
        page: 1,      // 页数
        total: 0,      // 总数
        orderLists: [], // 总数据
        changeItem: {},  // 接受临时数据
        teamTig: false,   // 办理入住提示框
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
        loadingCheckIn: false,  // 判断是否办理 加载中
        tigTeamShow: false,     // 团队主单入住后
        startTime: '',  // 开始时间
        endTime: '',  // 结束时间
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
        'goto', 'replaceto', 'getQueryByPage', 'refreshList', 'getRefreshTime', 'getOrderFree', 'sendCheck', 'updatePaidMode', 'getPmsFlag', 'refreshOne'
      ]),

      // tab切换
      tabClick (type, index) {
        this.loadingText = '加载中...';
        this.loadingShow = true;
        this.showList = false;
        this.showList_ = false;
        if (type == 1) {
          this.tabIndex = index;
          sessionStorage.setItem('tabIndex_', this.tabIndex);
        }else {
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

      //办理入住
      checkGoIn(item) {
        item.loadingBanli = true;
        // 判断是否为今日订单
        this.sendCheck({
            id: item.id,
            subOrderId: '',
            onsuccess: body => {
              if (body.data.code == 0) {
                if (item.type == 1) {
                  this.getOrderFree({
                    data: {
                      orderId: item.id
                    },
                    onsuccess: body => {
                      console.log('body.code',body.data);
                      if (body.data.code == 0) {
                        this.loadingShow = false;
                        if (body.data.data == null || !body.data.data) {
                          this.$message({
                            message: '订单已取消',
                            type: 'warning'
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
                          if (body.data.data.needPayFeeShow != 0 && !this.ispaid) {
//                            this.teamTig = true;
                            sessionStorage.setItem('changeItem', JSON.stringify(item));
                            sessionStorage.setItem('currentChange', this.page);
                            sessionStorage.setItem('gotoCheckIn', true);
                            this.$emit('gocheckIn', item.id);
                          }else {
                            this.page = 1;
                            this.getPreOrder(1);
                            this.OpenExternalScreen('SendMessage@'+item.id+'')
                          }
                          this.changeItem = item;
                        }

                      }else {
                        this.loadingShow = false;
                      }
                      item.loadingBanli = false;
                    },
                    onfail: (body, headers) => {
                      item.loadingBanli = false;
                      this.loadingShow = false;
                    }
                  });
                }else {
                  // 团队订单办理入住进行跳转
                  this.loadingShow = false;
                  item.loadingBanli = false;
                  sessionStorage.setItem('changeItem', JSON.stringify(item));
                  sessionStorage.setItem('currentChange', this.page);
                  sessionStorage.setItem('gotoCheckIn', true);
                  this.$emit('gocheckIn', item.id);
                }
              }else if (body.data.code == 888000) {
                this.loadingShow = false;
                item.loadingBanli = false;
                this.changeItem = item;
                this.tigTeamShow = true;
              }else {
                item.loadingBanli = false;
                this.loadingShow = false;
              }
            },
            onfail: (body, headers) => {
              console.log('body',body.data);
              item.loadingBanli = false;
              if (body.data.code == 89000 || body.data.code == 79000 || body.data.code == 69000) {
                this.page = 1;
                this.getPreOrder(1);
              }else {
                this.loadingShow = false;
              }
            }
        });
      },
      teamCheckIn(){
        this.loadingCheckIn = true;
        this.updatePaidMode({
          orderId: this.changeItem.id,
          isFreeDeposit: this.changeItem.isFreeDeposit,
          modeId: this.payMode,
          onsuccess: body => {
            this.loadingShow = false;
            if (body.data.code == 0) {
              this.teamTig = false;
              this.page = 1;
              this.getPreOrder(1);
              this.loadingCheckIn = false;
              this.OpenExternalScreen('SendMessage@'+this.changeItem.id+'')
            }
          },
          onfail: (body, headers) => {
            this.loadingShow = false;
          }
        });

      },

      OpenExternalScreen(type) {
        document.title = new Date().getSeconds() + "@" + type;
      },

      // 请先将团队主单入住后才能操作 我知道了
      tigTeamKnow() {
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
            this.$message({
              message: "同步超时，请稍后再试",
              type: 'error'
            });
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
          onsuccess:body=>{
            if (body.data.data == '同步成功') {
              this.page = 1;
              this.getPreOrder(1);
              this.initRefreshTime();
            }else {
              this.loadingShow = false;
            }
            this.$message({
              message: body.data.data,
              type: 'success'
            });
          },
          onfail: (body, headers) => {
            this.loadingShow = false;
          },
          onerror: error => {
            this.loadingShow = false;
            this.$message({
              message: "同步超时，请稍后再试",
              type: 'error'
            });
            this.page = 1;
            this.getPreOrder(1);
          }
        });
      },

      // 刷新
      replayList () {
        this.page = 1;
        this.showList = false;
        this.showList_ = false;
        this.loadingText = '加载中...';
        this.loadingShow = true;
        this.getPreOrder(1);
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
        this.getQueryByPage({
          data: {
            start: this.startTime,
            end: this.endTime,
            page: page,
            pageSize: 4,
            payMode: '',
            precheckinStatus: '',
            status: "1",
            type: this.tabIndex == 1 ? 1 : 0,
            searchString: this.searchString
          },
          onsuccess: body => {
            this.loadingShow = false;
            if (body.data.code == 0 && body.data.data.list) {
              body.data.data.list.forEach(item => {
                item.loadingTongbu = false;
                item.loadingBanli = false;
              });
              this.orderLists = body.data.data.list;
              this.total = body.data.data.total;
              this.showList = true;
              this.showList_ = true;
            }
          },
          onfail: (body, headers) => {
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
      if (this.tabToDay) {
        this.startTime = this.datetimeparse(today,'YYYY-MM-DD')+' 00:00:00';
        this.endTime = this.datetimeparse(today,'YYYY-MM-DD')+' 23:59:59';
      }else {
        this.startTime = '';
        this.endTime = '';
      }
      this.getPreOrder(this.page);
      this.$route.meta.isBack = false;
    },
    beforeRouteEnter(to,from,next){
      if(from.name == 'checkIn'){
        to.meta.isBack = true;
      }
      next();
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

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
            background: #FFFFFF;
            box-shadow: 0 8px 22px 0 rgba(0,0,0,0.10);
            border-radius: 40px;
            color: #303133;
            font-size: 20px;
            margin-right: 30px;
            font-weight: bold;
          }
          .active {
            background-color: #C8E1C8;
            border: 1px solid #1AAD19;
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
            font-weight: bold;
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
                width: 48%;
                position: relative;
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
          }
        }
      }
    }
    .order_fr {
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
          padding: 10px 0;
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
        padding: 0 15px;
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
          font-size: 36px;
          position: relative;
          padding: 60px 50px;
          font-weight: bold;
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
          font-size: 32px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.04);
        }
      }
    }
    .teamTig {
      .shadow {
        position: fixed;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .6);
      }
      .tigContent {
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
          padding: 30px 50px;
          font-weight: bold;
          span {
            position: absolute;
            right: 50px;
            top: 50%;
            transform: translateY(-50%);
            display: block;
            cursor: pointer;
            font-size: 30px;
            color: #1AAD19;
          }
          img {
            position: absolute;
            right: 50px;
            top: 50%;
            transform: translateY(-50%);
            display: block;
            width: 24px;
            height: 24px;
            cursor: pointer;
          }
        }
        .tigLists {
          margin: 30px 0;
          padding: 0 50px;
          position: relative;
          .tig_list {
            margin-bottom: 60px;
            width: 100%;
            .list_title_total {
              width: 100%;
              display: inline-flex;
              justify-content: flex-start;
              margin-bottom: 20px;
              .list_title {
                color: #303133;
                font-size: 28px;
                font-weight: bold;
              }
              .list_total {
                font-size: 30px;
                font-weight: bold;
                color: #F55825;
              }
            }
            .list_tabs {
              width: 100%;
              display: inline-flex;
              justify-content: flex-start;
              .list_tab {
                position: relative;
                font-size: 22px;
                color: #000;
                font-weight: bold;
                line-height: 80px;
                width: 233px;
                text-align: center;
                margin-right: 84px;
                img {
                  position: absolute;
                  z-index: -1;
                  width: 233px;
                  height: 80px;
                  left: 0;
                  top: 0;
                }
              }
              .list_tab:last-of-type {
                margin-right: 0;
              }
            }
          }
          .tigRemark {
            text-align: left;
            font-size: 30px;
            color: #000;
          }
        }
        .tigLists:before {
          position: absolute;
          top: -30px;
          left: 50px;
          display: inline-block;
          content: '';
          width: calc(100% - 100px);
          height: 1px;
          background-color: #D8D8D8;
        }
        .tig_btn {
          background: #1AAD19;
          border-radius: 44px;
          width: 340px;
          height: 68px;
          /*line-height: 68px;*/
          color: #fff;
          font-size: 20px;
          cursor: pointer;
          text-align: center;
          margin: 30px auto;
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        }
        .tig_info {
          background-color: #d7d7d7;
          color: #a4a4a4;
          border: none;
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
          font-size: 18px;
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
            font-size: 16px;
            text-align: center;
            color: #1AAD19;
            cursor: pointer;
          }
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
      font-size: 26px;
      margin-top: 20px;
    }
  }

  /deep/ .el-pagination {
    padding: 30px 0;
    position: fixed;
    width: calc(100vw - 480px);
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
  /deep/ .el-pagination .btn-next .el-icon, .el-pagination .btn-prev .el-icon {
    font-size: 20px;
  }
  /deep/ .el-pagination .btn-prev .el-icon {
    font-size: 20px;
  }
</style>
