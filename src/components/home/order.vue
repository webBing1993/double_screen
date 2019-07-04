<template>
  <div>
    <div class="orderIndex">
      <div class="order_fl">
        <div class="header">
          <div class="tabs">
            <span :class="tabIndex == 1 ? 'active tab' : 'tab'" @click="tabClick(1)">散客订单</span>
            <span :class="tabIndex == 2 ? 'active tab' : 'tab'" @click="tabClick(2)">团队订单</span>
          </div>
          <div class="synchronism" @click="getRefreshList">
            <img src="../../assets/tongbu.png" alt="">
            <span>同步订单</span>
          </div>
        </div>
        <div class="content">
          <div class="order_table">
            <span class="table_cell">预订人</span>
            <span class="table_cell">入离时间</span>
            <span class="table_cell">房间信息</span>
          </div>
          <div class="order_lists">
            <div class="list" v-for="item in orderLists">
              <div class="list_content">
                <div class="list_cell">
                  <p class="name">{{item.owner}}</p>
                  <p class="phone">{{item.ownerTel}}</p>
                </div>
                <div class="list_cell">
                  <p>{{datetimeparse(item.inTime,"MMDD")}}<span>{{item.inTime | isToday}}</span>-{{datetimeparse(item.outTime,"MMDD hh:mm")}}</p>
                  <p>{{item.totalDays}}晚</p>
                </div>
                <div class="list_cell">
                  <p v-for="(room,index) in item.rooms" :key="index">
                    {{room.roomTypeName}} &nbsp; *{{room.count}}间
                  </p>
                  <div class="banli_status" @click="checkGoIn(item)">办理入住</div>
                </div>
              </div>
              <div class="remark">备注：{{item.remark ? item.remark : '-'}}</div>
            </div>
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page.sync="page"
              :page-size="10"
              layout="total, prev, pager, next"
              :total="total" v-if="orderLists.length != 0">
            </el-pagination>
            <div class="noMsg" v-else>
              <div class="img"><img src="../../assets/zanwuneirong.png" alt=""></div>
              <p>暂无内容</p>
            </div>
          </div>
        </div>

        <!-- 开始办理弹框-->
        <div class="teamTig" v-if="teamTig">
          <div class="shadow"></div>
          <div class="tigContent">
            <div class="title">
              请确认订单支付状态
              <img src="../../assets/guanbi.png" alt="" @click="teamTig = false;">
            </div>
            <div class="tigLists">
              <div class="tig_list">
                <div class="list_title_total">
                  <div class="list_title">总房费：</div>
                  <div class="list_total">{{roomFeeShow}}元</div>
                </div>
                <div class="list_tabs">
                  <div class="list_tab" @click="payModeChange(1)">
                    <img src="../../assets/xuanzhong.png" alt="" v-if="changeItem.payMode == 1">
                    <img src="../../assets/weixuan.png" alt="" v-else>
                    到店付
                  </div>
                  <div class="list_tab" @click="payModeChange(2)">
                    <img src="../../assets/xuanzhong.png" alt="" v-if="changeItem.payMode == 2">
                    <img src="../../assets/weixuan.png" alt="" v-else>
                    已预付
                  </div>
                  <div class="list_tab" @click="payModeChange(3)">
                    <img src="../../assets/xuanzhong.png" alt="" v-if="changeItem.payMode == 3">
                    <img src="../../assets/weixuan.png" alt="" v-else>
                    后付/挂账
                  </div>
                </div>
              </div>
              <div class="tig_list">
                <div class="list_title_total">
                  <div class="list_title">押金：</div>
                  <div class="list_total">{{cashFee}}元</div>
                </div>
                <div class="list_tabs">
                  <div class="list_tab" @click="changeFreeDeposit(1)">
                    <img src="../../assets/xuanzhong.png" alt="" v-if="cashFeeTrue || changeItem.isFreeDeposit">
                    <img src="../../assets/weixuan.png" alt="" v-esle>
                    免押金
                  </div>
                  <div class="list_tab" @click="changeFreeDeposit(2)" v-if="!cashFeeTrue">
                    <img src="../../assets/xuanzhong.png" alt="" v-if="!changeItem.isFreeDeposit">
                    <img src="../../assets/weixuan.png" alt="" v-else>
                    收押金
                  </div>
                </div>
              </div>
            </div>
            <div class="tig_btn" @click="teamCheckIn()">开始办理</div>
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
                <input type="text" placeholder="请输入预定人姓名的首字母查询" v-model="searchString1">
                <img src="../../assets/close.png" alt="" @click="clearSearch" v-if="searchString1.length > 0">
              </div>
              <div class="keyBoard">
                <span v-for="item in keyBords1" @click="keyEntry(item,1)">{{item}}</span>
                <span @click="keyCancel(1)"><img src="../../assets/shanchuanniu.png" alt=""></span>
              </div>
            </div>
            <div class="tab" v-else>
              <div class="input">
                <input type="text" placeholder="请输入预订人手机号查询" v-model="searchString2">
                <img src="../../assets/close.png" alt="" @click="clearSearch1" v-if="searchString2 > 0">
              </div>
              <div class="keyBoard2">
                <span v-for="item in keyBords2" @click="item == '清除' ? clear() : keyEntry(item,2)">{{item}}</span>
                <span @click="keyCancel(2)"><img src="../../assets/shanchuanniu.png" alt=""></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex';
  import ElCol from "element-ui/packages/col/src/col";

  export default {
    name: 'order',
    components: {ElCol},
    data () {
      return {
        tabIndex: 1,  // tab切换
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
        isShowScreen: false, // 是否分房
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
        'goto', 'replaceto', 'getQueryByPage', 'refreshList', 'getRefreshTime', 'getOrderFree', 'sendCheck', 'updatePaidMode'
      ]),

      // tab切换
      tabClick (index) {
        this.tabIndex = index;
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
      },

      keyCancel (type) {
          if (type == 1) {
            if (this.searchString1.length > 0) {
              this.searchString1 = this.searchString1.substr(0, this.searchString1.length - 1);
              this.searchString = this.searchString1;
              this.getPreOrder(1);
            }
          }else {
            if (this.searchString2.length > 0) {
              this.searchString2 = this.searchString2.substr(0, this.searchString2.length - 1);
              this.searchString = this.searchString2;
              this.getPreOrder(1);
            }
          }
      },

      // 键盘清除事件
      clear () {
        this.searchString2 == '';
        this.searchString == '';
        this.getPreOrder(1);
      },

      // 字母键盘事件
      keyEntry(item,type) {
        if (type == 1) {
          this.searchString1 += item;
          this.searchString = this.searchString1;
          this.getPreOrder(1);
        }else {
          this.searchString2 += item;
          if (this.searchString2.length == 11) {
            this.searchString = this.searchString2;
            this.getPreOrder(1);
          }
        }
      },

      // 键盘删除事件
      clearSearch() {
        this.searchString1 = '';
        this.searchString = this.searchString1;
        this.getPreOrder(1);
      },
      clearSearch1() {
        this.searchString2 = '';
        this.searchString = this.searchString2;
        this.getPreOrder(1);
      },

      //办理入住
      checkGoIn(item) {
        // 判断是否为今日订单
        this.sendCheck({
            id: item.id,
            subOrderId: '',
            onsuccess: body => {
              if (body.data.code == 0) {
                if (item.screen) {
                  this.getOrderFree({
                    data: {
                      orderId: item.id
                    },
                    onsuccess: body => {
                      console.log('body.code',body.data);
                      if (body.data.code == 0) {
                        if (body.data.data.cashFeeShow == '免押') {
                          this.cashFee = 0;
                          this.cashFeeTrue = true;
                        }else {
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
                        this.teamTig = true;
                        this.changeItem = item;
                      }
                    }
                  });
                }else {

                }
              }
            }
        });
      },
      teamCheckIn(){
        this.updatePaidMode({
          orderId: this.changeItem.id,
          isFreeDeposit: this.changeItem.isFreeDeposit,
          modeId: this.changeItem.payMode,
          onsuccess: body => {
            if (body.data.code == 0) {
              this.teamTig = false;
              this.OpenExternalScreen('SendMessage@'+this.changeItem.id+'')
            }
          }
        });

      },

      OpenExternalScreen(type) {
        document.title = new Date().getSeconds() + "@" + type;
      },

      //同步订单
      getRefreshList(){
        this.refreshList({
          onsuccess:body=>{
            if (body.data.data == '同步成功') {
              this.getPreOrder(1);
              this.initRefreshTime();
            }
            this.$message({
              message: body.data.data,
              type: 'success'
            });
          }
        });
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
            start: '',
            end: '',
            page: page,
            pageSize: 10,
            payMode: '',
            precheckinStatus: '',
            status: "1",
            type: this.tabIndex == 1 ? 1 : 0,
            searchString: this.searchString
          },
          onsuccess: body => {
            if (body.data.code == 0 && body.data.data.list) {
              this.orderLists = body.data.data.list;
              this.total = body.data.data.total;
            }
          }
        })
      },

      // 分页
      handleSizeChange (val) {

      },

      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.getPreOrder(val);
      },

      // 房费更改
      payModeChange(index) {
        this.changeItem.payMode = index;
      },

      // 选择是否免押金
      changeFreeDeposit(num) {
        if (num == 1) {
          this.changeItem.isFreeDeposit = true;
        }else {
          this.changeItem.isFreeDeposit = false;
        }
      },

    },

    mounted () {
      this.getPreOrder(1);
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .orderIndex {
    padding-top: 100px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .order_fl {
      padding: 0 40px;
      width: calc(100% - 560px);
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .tabs {
          padding: 40px 0;
          .tab {
            padding: 15px 30px;
            background: #FFFFFF;
            box-shadow: 0 8px 22px 0 rgba(0,0,0,0.10);
            border-radius: 40px;
            color: #303133;
            font-size: 20px;
            margin-right: 30px;
          }
          .active {
            color: #1AAD19;
            border: 1px solid #1AAD19;
          }
        }
        .synchronism {
          display: inline-flex;
          align-items: center;
          padding: 10px 30px;
          background: #FFFFFF;
          box-shadow: 0 8px 22px 0 rgba(0,0,0,0.10);
          border-radius: 40px;
          cursor: pointer;
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
            width: 30%;
            display: inline-table;
            font-size: 18px;
            color: rgba(0, 0, 0, .4);
            text-align: left;
          }
          .table_cell:last-of-type {
            width: 38%;
          }
        }
        .order_lists {
          .list {
            background: #FFFFFF;
            box-shadow: 0 4px 11px 0 rgba(0,0,0,0.10);
            border-radius: 6px;
            margin-top: 20px;
            padding: 0 40px;
            width: calc(100% - 80px);
            position: relative;
            .list_content {
              border-bottom: 1px solid #E5E5E5;
              padding: 10px 0 30px;
              .list_cell {
                width: 30%;
                display: inline-table;
                text-align: left;
                p {
                  font-size: 18px;
                  color: #000;
                }
              }
              .list_cell:last-of-type {
                width: 38%;
                position: relative;
              }
            }
            .remark {
              color: rgba(0, 0, 0, .5);
              font-size: 15px;
              padding: 10px 0;
              text-align: left;
            }
            .banli_status {
              position: absolute;
              right: 0;
              top: 0;
              background: #1AAD19;
              box-shadow: 0 4px 10px 0 rgba(0,0,0,0.17);
              border-radius: 29.63px;
              padding: 10px 20px;
              font-size: 15px;
              color: #fff;
              cursor: pointer;
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
        font-size: 26px;
        color: #303133;
        text-align: center;
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
              font-size: 16px;
              color: #333;
              height: 64px;
              line-height: 64px;
              width: calc(100% - 30px);
              outline: none;
            }
            input:-moz-placeholder {
              font-size: 16px;
              color: #606266;
            }
            input:-ms-input-placeholder {
              font-size: 16px;
              color: #606266;
            }
            input::-moz-placeholder {
              font-size: 16px;
              color: #606266;
            }
            input::-webkit-input-placeholder {
              font-size: 16px;
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
          border: 1px solid #C0C4CC;
          border-radius: 12px;
          width: 78px;
          height: 56px;
          font-size: 36px;
          line-height: 56px;
          text-align: center;
          font-weight: bold;
          margin: 0 42px 22px 0;
          cursor: pointer;
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
            height: 24px;
            display: inline-block;
          }
        }
      }
      .keyBoard2 {
        span {
          border-radius: 3.6px;
          width: 110px;
          height: 78px;
          line-height: 78px;
          text-align: center;
          background-color: #D8D8D8;
          font-size: 34px;
          margin: 0 25px 25px 0;
          cursor: pointer;
          display: inline-block;
          font-weight: bold;
        }
        span:nth-of-type(3n) {
          margin-right: 0;
        }
        span:nth-of-type(10) {
          font-size: 28px;
        }
        span:last-of-type {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          img {
            width: 50px;
            height: 24px;
            display: inline-block;
          }
        }
      }
    }
    .order_fr>div {
      position: fixed;
      top: 115px;
      right: 0;
      width: 480px;
      background-color: #fff;
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
        width: 426px;
        position: fixed;
        z-index: 12;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        .title {
          color: #303133;
          font-size: 26px;
          position: relative;
          padding: 20px 30px;
          font-weight: bold;
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
        .tigLists {
          margin: 20px 0;
          padding: 0 30px;
          position: relative;
          .tig_list {
            margin-bottom: 20px;
            width: 100%;
            .list_title_total {
              width: 100%;
              display: inline-flex;
              justify-content: flex-start;
              margin-bottom: 20px;
              .list_title {
                color: #303133;
                font-size: 24px;
              }
              .list_total {
                font-size: 26px;
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
                opacity: .8;
                line-height: 45px;
                width: 116px;
                text-align: center;
                margin-right: 15px;
                img {
                  position: absolute;
                  z-index: -1;
                  width: 116px;
                  height: 45px;
                  left: 0;
                  top: 0;
                }
              }
              .list_tab:last-of-type {
                margin-right: 0;
              }
            }
          }
        }
        .tigLists:before {
          position: absolute;
          top: -20px;
          left: 30px;
          display: inline-block;
          content: '';
          width: calc(100% - 60px);
          height: 1px;
          background-color: #D8D8D8;
        }
        .tig_btn {
          background: #1AAD19;
          border-radius: 44px;
          width: 220px;
          height: 56px;
          line-height: 56px;
          color: #fff;
          font-size: 20px;
          cursor: pointer;
          text-align: center;
          margin: 30px auto;
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
    margin: 30px 0;
  }
  /deep/ .el-pager li {
    background: rgba(0, 0, 0, .3);
    color: #999;
    margin: 0 10px;
    font-size: 16px;
  }
  /deep/ .el-pagination__total {
    font-size: 16px !important;
  }
  /deep/ .el-pager li.active {
    background-color: #1AAD19;
    color: #fff;
  }
</style>
