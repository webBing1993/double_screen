<template>
  <div>
    <div class="liveIn">
      <div class="order_fl">
        <div class="header">
          <div class="tabs">
            <el-select v-model="orderByFiled" placeholder="排序方式" @change="tabSelect">
              <el-option
                v-for="item in statusLists"
                :key="item.value"
                :label="item.name"
                :value="item.value">
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
            <span :class="tabIndex ? 'active tab' : 'tab'" @click="tabClick()" :style="tabIndex ? tabImg[1] : tabImg[0]">脏房预入住</span>
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
          <div class="order_lists" v-if="orderLists.length != 0 && showList">
            <div class="list" v-for="item in orderLists">
              <div class="list_header">
                <div class="list_origin">预订人：{{item.orderOwner ? item.orderOwner : '-'}}</div>
                <div class="list_header_right">
                  <div class="fkNum">自助发卡：{{ item.roomCardCount ? item.roomCardCount : 0 }}</div>
                  <div class="list_time" v-if="item.status == 'CHECKIN' && item.partnership">同住码：{{ item.partnership }}</div>
                  <div class="list_red" v-if="item.status != 'CHECKIN'">脏房预入住</div>
                </div>
              </div>
              <div class="list_content">
                <div class="list_cell">
                  <div class="img"><img src="../../assets/fangjian.png" alt=""></div>
                  <div class="listCell">
                    <p>{{item.roomName}}</p>
                    <p>{{item.roomType}}</p>
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
                  <div class="img"><img src="../../assets/renyuan.png" alt=""></div>
                  <div class="listCell">
                    <p class="name">
                      <span v-for="(i, index) in item.guestList">{{i.name}}/{{i.gender}}/{{i.idCardNo | idCard}}</span>
                    </p>
                    <el-button type="primary" class="tongbu_status" :loading="item.tongbuLoading"  v-if="item.guestList.length < item.maxGuest && item.guestList.length < 4 && item.status == 'CHECKIN' "  @click="add(item)">添加同住人</el-button>
                    <div class="tongbu_status add_status" v-else-if="(item.guestList.length >= item.maxGuest || item.guestList.length >= 4) && item.status == 'CHECKIN'">人数已满</div>
                    <el-button type="primary" class="banli_status" :loading="item.quitLoading"  @click="gotoCheckOut(item)">详单</el-button>
                  </div>
                </div>
              </div>
              <!--<div class="remark">备注：{{item.remark ? item.remark : '-'}}</div>-->
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

        <loadingList v-if="loadingShow" :loadingText="loadingText" style="width: calc(100vw - 480px)"></loadingList>
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
            <div class="tab" v-if="changeTabString == 1">
              <div class="input">
                <input type="text" placeholder="请输入入住人房间号查询" v-model="searchString2"  @input="changeKeyBords">
                <img src="../../assets/close.png" alt="" @click="clearSearch1" v-if="searchString2.length > 0">
              </div>
              <div class="keyBoard2">
                <span v-for="item in keyBords2" @click="item == '清除' ? clear($event) : keyEntry($event, item, 2)">{{item}}</span>
                <span @click="keyCancel($event, 2)"><img src="../../assets/shanchuanniu.png" alt=""></span>
              </div>
            </div>
            <div class="tab" v-else>
              <div class="input">
                <input type="text" placeholder="请输入入住人姓名的首字母查询" v-model="searchString1"  @input="changeKeyBords">
                <img src="../../assets/close.png" alt="" @click="clearSearch" v-if="searchString1.length > 0">
              </div>
              <div class="keyBoard">
                <span v-for="item in keyBords1" @click="keyEntry($event, item, 1)">{{item}}</span>
                <span @click="keyCancel($event, 1)"><img src="../../assets/shanchuanniu.png" alt=""></span>
              </div>
            </div>
          </div>
          <div class="corporation">
            <p>复创客服电话 4001-690-890</p>
            <p>技术支持电话 021-62593690</p>
          </div>
        </div>
      </div>

      <!-- 发卡选择提示框-->
      <div class="fakaTig" v-if="fakaTig">
        <div class="shadow"></div>
        <div class="tig_content">
          <div class="tig_title">
            是否确认发卡？
            <img src="../../assets/guanbi.png" alt="" @click="fakaTig = false;">
          </div>
          <div class="tig_btns">
            <span @click="btnCancel">不发卡</span>
            <span @click="btnSure">发卡</span>
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
            <span class="cancel" @click="tigOrderShow=false;changeItem.tongbuLoading = false;">取消</span>
            <span class="sure" @click="openScreen">查看外屏</span>
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
        tigOrderShow: false,
        statusLists: [
          {
            name: '按房号排',
            value: 'room_no ASC',
          },
          {
            name: '按离店时间',
            value: 'out_time ASC',
          }
        ],
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
        tabIndex: false,  // tab切换
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
        pmsFlag: true,   // 判断是否对接pms
        orderByFiled: 'room_no ASC',  // 筛选方式
        fakaTig: false,   // 发卡提示选择
        timer: null,
        cardShow: false,  // 发卡dab配置
        androidScreen: false,   // 判断是否是Android的双屏
      }
    },
    filters: {
      isToday:function(value) {
        if (new Date(value).toDateString() === new Date().toDateString()) {
          return   '(今日)'
        }else{
          return '';
        }
      },
      idCard: function (value) {
        return value.substr(-4)
      }
    },
    methods: {
      ...mapActions([
        'replaceto', 'getNoPmsQueryCheckInList', 'refreshList', 'getRefreshTime', 'guestCount', 'cardRule', 'sendCardRule', 'getChargeRecard'
      ]),

      // 获取权限
      getCard(cardStatus) {
        this.cardRule({
          cardStatus: cardStatus,
          onsuccess: body => {
            if (cardStatus == 'support_room_card' && body.data.code == 0 && body.data.data == 'true') {
              this.cardShow = true;
            }
          }
        })
      },

      // tab下拉
      tabSelect (val) {
        this.loadingText = '加载中...';
        this.loadingShow = true;
        this.showList = false;
        this.showList_ = false;
        this.page = 1;
        this.getPreOrder(1);
      },

      tabClick () {
        this.tabIndex = !this.tabIndex;
        this.loadingText = '加载中...';
        this.loadingShow = true;
        this.showList = false;
        this.showList_ = false;
        this.page = 1;
        this.getPreOrder(1);
      },

      // 键盘事件
      changeKeyBords () {
        if (this.changeTabString == 1) {
          this.searchString = this.searchString2;
          this.page = 1;
          this.getPreOrder(1);
        }else {
          this.searchString = this.searchString1;
          this.page = 1;
          this.getPreOrder(1);
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
            this.page = 1;
            this.getPreOrder(1);
          }
        }else {
          if (this.searchString2.length > 0) {
            this.searchString2 = this.searchString2.substr(0, this.searchString2.length - 1);
            this.searchString = this.searchString2;
            this.page = 1;
            this.getPreOrder(1);
          }
        }
      },

      // 键盘清除事件
      clear (event) {
        event.preventDefault();
        this.searchString2 = '';
        this.searchString = '';
        this.page = 1;
        this.getPreOrder(1);
      },

      // 字母键盘事件
      keyEntry(event, item,type) {
        event.preventDefault();
        if (type == 1) {
          this.searchString1 += item;
          this.searchString = this.searchString1;
          this.page = 1;
          this.getPreOrder(1);
        }else {
          this.searchString2 += item;
          this.searchString = this.searchString2;
          this.page = 1;
          this.getPreOrder(1);
        }
      },

      // 键盘删除事件
      clearSearch() {
        this.searchString1 = '';
        this.searchString = this.searchString1;
        this.page = 1;
        this.getPreOrder(1);
      },
      clearSearch1() {
        this.searchString2 = '';
        this.searchString = this.searchString2;
        this.page = 1;
        this.getPreOrder(1);
      },

      // 同步订单
      getRefreshList(){
        this.showList = false;
        this.showList_ = false;
        this.loadingText = '同步中...';
        this.loadingShow = true;
        this.refreshList({
          pmsType: 2,
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
              type: 'success'
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

      // 刷新
      replayList () {
        this.page = 1;
        this.showList = false;
        this.showList_ = false;
        this.loadingText = '加载中...';
        this.loadingShow = true;
        this.searchString = this.searchString2 = this.searchString1 = '';
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
        document.body.removeEventListener('touchmove',this.bodyScroll,false);
        document.body.style.position = 'initial';
        document.body.style.width = 'auto';
        this.getNoPmsQueryCheckInList({
          data: {
            start:"",
            end:"",
            page: page,
            pageSize: 4,
            statusList:'4',
            orderByClause: this.orderByFiled||'',
            checkInStatus: this.tabIndex ? 'CHECKIN_TEMP' : 'IN',
            hotelId: sessionStorage.hotel_id,
            searchString: this.searchString,
          },
          onsuccess: body => {
            this.loadingShow = false;
            if (body.data.code == 0) {
              if (body.data.data.list.length != 0) {
                body.data.data.list.forEach(item => {
                  item.quitLoading = false;
                  item.tongbuLoading = false;
                });
                this.orderLists = body.data.data.list;
                this.total = body.data.data.total;
              }else {
                  if (page > 1) {
                    this.page--;
                    this.getPreOrder(this.page);
                  }
                  else {
                    this.orderLists = body.data.data.list;
                    this.total = body.data.data.total;
                  }
              }
              this.showList = true;
              this.showList_ = true;
            }
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
        sessionStorage.setItem('currentChange', val);
        this.loadingText = '加载中...';
        this.loadingShow = true;
        this.showList = false;
        this.showList_ = true;
        this.page = val;
        this.getPreOrder(val);
      },

      // 添加同住人
      add (item) {
        this.changeItem = item;
        item.tongbuLoading = true;
        // 先判断A屏正在办理ing
        this.getOrderProcess();
//        this.showOrderInfo(true);
      },

      getOrderProcess() {
        jsObj.GetOrderProcess();
      },

      // 接收A屏判断是否正在办理入住的结果
      showOrderInfo (isTrue) {
        if (isTrue != 'true') {
          // 判断是否满住
          this.guestCount({
            subOrderId: this.changeItem.subOrderId,
            onsuccess: body => {
              if (body.data.code == 0) {
                if (body.data.data.status == 4 && body.data.data.orderGuestVos) {
                  if (body.data.data.orderGuestVos.length < body.data.data.maxCheckinCount && body.data.data.orderGuestVos.length < 4) {
                    if (this.cardShow) {
                      this.fakaTig = true;
                      document.body.addEventListener('touchmove',this.bodyScroll,false);
                      document.body.style.position = 'fixed';
                      document.body.style.width = '100%';
                    }else {
                      this.goAdd(0);
                    }
                  }else {
                    this.$toast({
                      message: '该房间已住满',
                      iconClass: 'icon ',
                    });
                    this.page = 1;
                    this.getPreOrder(1);
                  }
                }else {
                  this.$toast({
                    message: '该房间已离店',
                    iconClass: 'icon ',
                  });
                  this.page = 1;
                  this.getPreOrder(1);
                }
              }
              this.changeItem.tongbuLoading = false;
            },
            onfail: body => {
              this.changeItem.tongbuLoading = false;
            },
            onerror: body => {
              this.changeItem.tongbuLoading = false;
            }
          });
        }else {
          this.tigOrderShow = true;
          document.body.addEventListener('touchmove',this.bodyScroll,false);
          document.body.style.position = 'fixed';
          document.body.style.width = '100%';
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

      // 不发卡
      btnCancel () {
        this.fakaTig = false;
        this.goAdd(0);
      },

      // 发卡
      btnSure () {
        this.fakaTig = false;
        this.goAdd(1);
      },

      goAdd (isTrue) {
        let istrue = null;
        if (isTrue == 0) {
            istrue = false;
        }else {
            istrue = true;
        }
        this.sendCardRule({
          subOrderId: this.changeItem.subOrderId,
          sendCard: istrue,
          onsuccess: body => {
            if (body.data.code == 0) {
              this.page = 1;
              this.getPreOrder(1);
              this.SendTeamOrderMsg(this.changeItem.orderId, this.changeItem.subOrderId, istrue, false, false, true);
            }
          }
        });
      },

      SendTeamOrderMsg(orderId, subOrderId, fakaStatus, rcStatus, phoneStatus, status) {
        if (this.androidScreen) {
          jsObj.SendTeamOrderMessage(orderId, subOrderId, fakaStatus, phoneStatus, rcStatus, status);
        }else {
          jsObj.sendParameter = new Date().getSeconds() + "@SendTeamOrderMessage@" + orderId + '@' + subOrderId + '@' + fakaStatus + '@' + phoneStatus + '@' + rcStatus + '@' + status;
          jsObj.SendTeamOrderMessage();
        }
      },

      // 退房跳转
      gotoCheckOut(item) {
        sessionStorage.setItem('checkOutItem', JSON.stringify(item));
        sessionStorage.setItem('liveInPage', this.page);
        this.$emit('goToCheckOut', item.orderId);
      },

    },

    mounted () {
      let userAgentInfo = navigator.userAgent;
      console.log('userAgentInfo:',userAgentInfo);
      let Agents = ["Android-DualScreen"];
      let this_ = this;
      for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) != -1) {
          this_.androidScreen = true;
          break;
        }
      }
      this.pmsFlag = sessionStorage.getItem('pmsFlag') == 'true' ? true : false;
      this.loadingText = '加载中...';
      this.getCard('support_room_card');
      this.loadingShow = true;
      this.showList = false;
      this.showList_ = false;
      this.page = sessionStorage.getItem('liveInPage') ? sessionStorage.getItem('liveInPage') : 1;
      this.getPreOrder(this.page);
      window.showOrderInfo = this.showOrderInfo;
    },
    beforeRouteEnter(to,from,next){
      if(from.name == 'checkOut'){

      }else {
        sessionStorage.removeItem('liveInPage');
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

  .liveIn {
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
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          .el-select {
            width: 35%;
            margin-right: 30px;
            /deep/ .el-input {
              .el-select__caret {
                line-height: 56px;
              }
            }
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
          .tab {
            padding: 13px 30px;
            background: #FFFFFF;
            box-shadow: 0 8px 22px 0 rgba(0,0,0,0.10);
            border-radius: 40px;
            color: #909399;
            font-size: 20px;
            margin-right: 30px;
          }
          .active {
            font-weight: bold;
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
              .list_red {
                color:#F5222D;
              }
              .list_header_right {
                display: inline-flex;
                align-items: center;
                div {
                  margin-left: 30px;
                }
              }
            }
            .list_content {
              border-bottom: 1px solid #E5E5E5;
              padding: 25px 0;
              .list_cell {
                width: 18%;
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
                  width: 100%;
                  p {
                    font-size: 20px;
                    color: #000;
                    margin-bottom: 5px;
                  }
                  .name {
                    width: 42%;
                    span {
                      display: block;
                    }
                  }
                }
              }
              .list_cell:nth-of-type(2) {
                width: 26%;
              }
              .list_cell:last-of-type {
                width: 55%;
                position: relative;
              }
            }
            .remark {
              color: rgba(0, 0, 0, 1);
              font-size: 20px;
              padding: 10px 0;
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
              display: inline-block;
              padding: 17px 0;
              text-align: center;
              font-size: 20px;
              color: #fff;
              cursor: pointer;
              -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
            }
            .add_status {
              background: #d7d7d7;
              color: #a4a4a4;
              box-shadow: none;
              padding: 13px 0;
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
        padding: 0 30px;
        .tab {
          .input {
            padding: 30px 0;
            position: relative;
            input {
              background-color: #f7f7f7;
              border: none;
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
          font-size: 24px;
          line-height: 56px;
          text-align: center;
          font-weight: bold;
          margin: 0 30px 22px 0;
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
          width: 180px;
          margin-right: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          img {
            width: 44px;
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
          font-size: 24px;
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
          font-size: 20px;
          color: #666;
        }
        span:last-of-type {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          img {
            width: 44px;
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
        width: 540px;
        padding: 0 25px;
        position: fixed;
        z-index: 12;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        .tig_title {
          color: #0B0B0B;
          font-size: 24px;
          position: relative;
          padding: 120px 50px;
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
          font-size: 20px;
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
    .fakaTig {
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
        width: 620px;
        padding: 0 25px;
        position: fixed;
        z-index: 12;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        .tig_title {
          color: #0B0B0B;
          font-size: 20px;
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
          display: flex;
          align-items: center;
          span {
            position: relative;
            width: 49.3%;
            padding: 38px 0;
            font-size: 20px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.04);
          }
          span:first-of-type {
            color: #909399;
          }
          span:last-of-type {
            color: #1AAD19;
          }
          span:first-of-type:after {
            position: absolute;
            content: '';
            width: 1px;
            background-color: #D8D8D8;
            height: 72px;
            right: 0;
            top: 1px;
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
      font-size: 20px;
      margin-top: 20px;
    }
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
        .el-select-dropdown__item.selected {
          color: #1AAD19;
        }
      }
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
