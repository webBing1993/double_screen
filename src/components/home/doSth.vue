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
        <div class="doSthLists" v-if="changeTabString == 1">
          <div class="list" v-for="item in doSthLists">
            <div class="list_header">
              <div>
                <span class="title">{{item.doSthTitle}}</span>
                <span>{{datetimeparse(item.createTime,"yy/MM/dd hh:mm")}}</span>
              </div>
            </div>
            <div class="list_content" v-if="item.doSthTitle=='发卡失败'">
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
                <div class="rooms"><span>预订人：</span>{{item.contactName}} {{item.contactPhone}}</div>
                <div class="roomIn"><span>入账金额：</span>{{item.totalFeeStr}}</div>
              </div>
              <div class="list_fr">
                <span @click="pmsPay(item.id)">处理完成</span>
              </div>
            </div>
            <div class="list_content" v-else>
              <div class="list_fl">
                <div class="rooms"><span>预订人：</span>{{item.contactName}} {{item.contactPhone}}</div>
                <div class="roomIn"><span>入账金额：</span>{{item.totalFeeStr}}</div>
              </div>
              <div class="list_fr">
                <span @click="nativepay(item.id)">处理完成</span>
              </div>
            </div>
          </div>
          <!--<el-pagination-->
            <!--@size-change="handleSizeChange"-->
            <!--@current-change="handleCurrentChange"-->
            <!--:current-page.sync="page"-->
            <!--:page-size="10"-->
            <!--layout="total, prev, pager, next"-->
            <!--:total="total" v-if="doSthLists.length != 0">-->
          <!--</el-pagination>-->
          <div class="noMsg" v-if="doSthLists.length == 0">
            <div class="img"><img src="../../assets/zanwuneirong.png" alt=""></div>
            <p>暂无内容</p>
          </div>
        </div>
        <!--<div class="doSthLists" v-if="changeTabString == 2">
          <div class="list" v-for="item in doSthLists1">
            <div class="list_header">
              <div>
                <span class="title">{{item.title}}</span>
                <span>{{datetimeparse(item.timeEnd,"yy/MM/dd hh:mm")}}</span>
              </div>
              <div>
                处理人：{{item.founder}} {{datetimeparse(item.timeEnd,"yy/MM/dd hh:mm")}}
              </div>
            </div>
            <div class="list_content">
              <div class="list_fl">
                <div class="rooms"><span>房间号：</span>{{item.roomNo}}</div>
                <div class="roomIn"><span>住客信息：</span>{{item.contactName}}</div>
              </div>
              <div class="list_fr">
                <span>处理完成</span>
              </div>
            </div>
          </div>
          &lt;!&ndash;<el-pagination&ndash;&gt;
            &lt;!&ndash;@size-change="handleSizeChange"&ndash;&gt;
            &lt;!&ndash;@current-change="handleCurrentChange1"&ndash;&gt;
            &lt;!&ndash;:current-page.sync="page1"&ndash;&gt;
            &lt;!&ndash;:page-size="10"&ndash;&gt;
            &lt;!&ndash;layout="total, prev, pager, next"&ndash;&gt;
            &lt;!&ndash;:total="total1" v-if="doSthLists.length != 0">&ndash;&gt;
          &lt;!&ndash;</el-pagination>&ndash;&gt;
          <div class="noMsg" v-if="doSthLists.length == 0">
            <div class="img"><img src="../../assets/zanwuneirong.png" alt=""></div>
            <p>暂无内容</p>
          </div>
        </div>-->
      </div>
    </div>
  </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex';
  import ElCol from "element-ui/packages/col/src/col";

  export default {
    name: 'doSth',
    components: {ElCol},
    data () {
      return {
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
        'goto', 'getTodoList', 'getFaka', 'updateCheckinfailedStatus', 'updateWechatPay'
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
        this.doSthList(val, 1);
      },
      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.doSthList(val, 2);
      },

      // 获取列表
      doSthList() {
        this.getTodoList({
          onsuccess: body => {
            if (body.data.code == 0) {
              let faka = [];   // 发卡代办
              let pmscheckin = [];  // pms入住失败代办
              let pmspay = [];   // pms入账失败
              let nativepay = [];  // 前台支付
              faka = body.data.data.faka;
              pmscheckin = body.data.data.pmscheckin;
              pmspay = body.data.data.pmspay;
              nativepay = body.data.data.nativepay;
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
              this.doSthLists = faka.concat(pmscheckin, pmspay, nativepay);
              this.doSthLists.sort(this.compare('createTime'));
              console.log('this.doSthLists',this.doSthLists);
            }
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
        this.getFaka({
          id: id,
          onsuccess: body => {
            if (body.data.code == 0) {
              this.doSthList();
            }
          }
        })
      },

      // pms 入住失败处理事件
      pmsCheckIn(id) {
        this.updateCheckinfailedStatus({
          id: id,
          status: 0,
          onsuccess:(body)=>{
            if (body.data.code == 0) {
              this.doSthList();
            }
          }
        });
      },

      // pms入账失败处理事件
      pmsPay(id) {
        this.updateWechatPay({
          data:{
            orderId: id
          },
          onsuccess: (body) => {
            if(body.data.code == 0){
              this.doSthList();
            }
          },
          onfail: body => {}
        });
      },

      // 前台支付
      nativepay(id){

      },
    },

    mounted () {
        console.log(333333);
      this.doSthList();
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .doSthIndex {
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
            color: #909399;
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
            dis:last-of-type {
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
                  width: 110px;
                  display: inline-block;
                }
                span:last-of-type {
                  width: auto;
                }
                span:only-child {
                  width: 110px;
                  display: inline-block;
                }
              }
            }
            .list_fr {
              span {
                cursor: pointer;
                width: 110px;
                height: 44px;
                line-height: 44px;
                background-color: #1AAD19;
                font-size: 20px;
                color: #fff;
                text-align: center;
                display: inline-block;
                border-radius: 32px;
              }
            }
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
