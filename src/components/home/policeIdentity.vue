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
        <div class="changTabs">
          <span :class="changeTabString == 1 ? 'active' : ''" @click="changeTabClick(1)">待处理</span>
          <span :class="changeTabString == 2 ? 'active' : ''" @click="changeTabClick(2)">已处理</span>
        </div>
        <div class="identityList" v-if="showList && changeTabString == 1">
          <div class="list" v-for="item in unhandleList">
            <div class="list_header">
              核验时间：{{datetimeparse(item.createdTime, 'yy/MM/dd hh:mm')}}
            </div>
            <div class="list_content">
              <div class="lis">
                <div class="li">
                  <span>姓名：</span>
                  <span>{{item.name}}</span>
                </div>
                <div class="li">
                  <span>身份证：</span>
                  <span>{{item.idCard}}</span>
                </div>
                <div class="li">
                  <span>相似度：</span>
                  <span class="blue">{{item.similarity}}</span>
                </div>
              </div>
            </div>
          </div>
          <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="page"
          :page-size="4"
          layout="total, prev, pager, next"
          :total="total" v-if="unhandleList.length != 0">
          </el-pagination>
          <div class="noMsg" v-if="unhandleList.length == 0">
            <div class="img"><img src="../../assets/zanwuneirong.png" alt=""></div>
            <p>暂无内容</p>
          </div>
        </div>
        <div class="identityList" v-if="showList && changeTabString == 2">
          <div class="list" v-for="item in handleList">
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
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange1"
            :current-page.sync="page1"
            :page-size="4"
            layout="total, prev, pager, next"
            :total="total1" v-if="handleList.length != 0">
          </el-pagination>
          <div class="noMsg" v-if="handleList.length == 0">
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
        changeTabString: 1,  // tab选中
        page: 1,  // 当前页数
        page1: 1,  // 当前页数
        total: 1, // 总条数
        total1: 1, // 总条数
        unhandleList: [],  // 代办未处理列表
        handleList: [],  //代办已处理列表
      }
    },
    filters: {

    },
    methods: {
      ...mapActions([
        'goto', 'newIdentityList'
      ]),

      // tab
      changeTabClick(index) {
        this.changeTabString = index;
        this.page = 1;
        this.page1 = 1;
      },

      // 分页
      handleSizeChange (val) {

      },

      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.loadingShow = true;
        this.page = val;
        this.policeIdentityList(JSON.stringify(["NONE","PENDING","FAILED"]), val, 1);
      },
      handleCurrentChange1(val) {
        console.log(`当前页: ${val}`);
        this.loadingShow = true;
        this.page1 = val;
        this.policeIdentityList(val, 1, 2);
      },

      // 获取列表
      policeIdentityList(reportInStatuses, page, type) {
        this.newIdentityList ({
          data: {
            createTimeStart: '',
            createTimeEnd: '',
            reportInStatuses: JSON.parse(reportInStatuses),//需要的入住上报旅业状态
            desc: true,
            name: ''  // 搜索
          },
          limit: 4,
          offset: page,
          onsuccess: (body, headers) => {
            if (body.errcode == 0) {
              if (type == 1) {
                this.total = headers['x-total-count'];
                this.unhandleList = [...this.unhandleList, ...body.data.content];
              }else {
                this.total1 = headers['x-total-count'];
                this.handleList = [...this.handleList, ...body.data.content];
              }
            }
            this.loadingShow = false;
            this.showList = true;
          },
          onfail: (body, headers) => {
            this.loadingShow = false;
          }
        })
      },

    },

    mounted () {
      this.loadingShow = true;
      this.page = 1;
      this.page1 = 1;
      this.policeIdentityList(JSON.stringify(["NONE","PENDING","FAILED"]), this.page, 1);
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .doSthIndex {
    width: 100vw;
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
            color: #000;
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
          padding: 15px 30px;
          background: #FFFFFF;
          box-shadow: 0 8px 22px 0 rgba(0, 0, 0, 0.1);
          border-radius: 40px;
          color: #303133;
          font-size: 20px;
          margin-right: 30px;
          font-weight: bold;
          cursor: pointer;
        }
        span.active {
          color: #1AAD19;
          border: 1px solid #1AAD19;
        }
      }
      .identityList {
        padding: 0 40px;
        .list {
          padding: 0 30px;
          background: #FFFFFF;
          box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.10);
          border-radius: 6px;
          text-align: left;
          margin-bottom: 20px;
          .list_header {
            border-bottom: 1px solid #E5E5E5;
            padding: 25px 0;
            font-size: 24px;
            color: #909399;
          }
          .list_content {
            position: relative;
            .lis {
              padding: 20px 0;
              .li {
                margin-bottom: 20px;
                span {
                  color: #000;
                  font-size: 24px;
                }
                span:first-of-type {
                  width: 120px;
                }
                .blue {
                  color: #1AAD19;
                }
              }
            }
          }
        }
      }
    }
  }

  .noMsg {
    padding-top: 400px;
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
