<template>
  <div>
    <div class="doSthIndex" v-show="showPoliceIdentity">
      <div class="doSthContent">
        <div class="changTabs">
          <span :class="changeTabString == 1 ? 'active' : ''" @click="changeTabClick(1)">待处理</span>
          <span :class="changeTabString == 2 ? 'active' : ''" @click="changeTabClick(2)" v-if="showHandledList">已处理</span>
        </div>
        <div class="identityList" v-if="showList && changeTabString == 1">
          <div class="list" v-for="item in unhandleList"  @click="unhandleClick(item)">
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
                  <span>{{idnumber(item.idCard)}}</span>
                </div>
                <div class="li"  v-if="hotelConfig.show_similarity==='true'">
                  <span>相似度：</span>
                  <span class="blue">{{item.similarity}}</span>
                </div>
              </div>
              <el-button type="primary" class="tig_btn" :loading="item.unhandleLoading">立即处理</el-button>
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
          <div class="list" v-for="item in handleList"  @click="unhandleClick(item)">
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
                  <span>{{idnumber(item.idCard)}}</span>
                </div>
                <div class="li">
                  <span>房间号：</span>
                  <span class="blue">{{item.roomNumber}}</span>
                </div>
              </div>
              <el-button type="primary" class="tig_btn" :loading="item.unhandleLoading">立即处理</el-button>
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
    name: 'policeIdentity',
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
        showHandledList: true,  // 是否显示已处理
        showPoliceIdentity: false,  // 是否显示模板
        hotelConfig: {},  // 权限
      }
    },
    filters: {

    },
    methods: {
      ...mapActions([
         'newIdentityList', 'getShowPoliceConfigs'
      ]),

      // 已处理按钮是否显示
      getConfig(){
        this.getShowPoliceConfigs({
          onsuccess:(body)=> {
            if (body.data.data=='true') {
              this.showHandledList = true;
            }else {
              this.showHandledList = false;
            }
            this.showPoliceIdentity = true;
          },
          onfail: body => {
            this.showPoliceIdentity = true;
          }
        });
      },

      // tab
      changeTabClick(index) {
        this.changeTabString = index;
        this.showList = false;
        this.loadingShow = true;
        this.page = 1;
        this.page1 = 1;
        if (index == 1) {
          this.policeIdentityList(JSON.stringify(["NONE","PENDING","FAILED"]), this.page, 1);
        }else {
          this.policeIdentityList(JSON.stringify(["SUCCESS","UNREPORTED"]), this.page1, 2);
        }
      },

      // 分页
      handleSizeChange (val) {

      },

      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.showList = false;
        this.loadingShow = true;
        this.page = val;
        this.policeIdentityList(JSON.stringify(["NONE","PENDING","FAILED"]), val, 1);
      },
      handleCurrentChange1(val) {
        console.log(`当前页: ${val}`);
        this.showList = false;
        this.loadingShow = true;
        this.page1 = val;
        this.policeIdentityList(JSON.stringify(["SUCCESS","UNREPORTED"]), val, 2);
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
          offset: (page-1)*4,
          onsuccess: (body, headers) => {
            if (body.errcode == 0 && body.data.content) {
              body.data.content.forEach(item => {
                  item.unhandleLoading = false;
              });
              if (type == 1) {
                this.total = parseFloat(headers['x-total-count']);
                this.unhandleList = [ ...body.data.content];
                this.hotelConfig = body.data.config;
              }else {
                this.total1 = parseFloat(headers['x-total-count']);
                this.handleList = [ ...body.data.content];
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

      // 立即处理
      unhandleClick (item) {
        item.unhandleLoading = true;
        sessionStorage.setItem('changeTabString', this.changeTabString);
        this.$emit('gotoDtail', item.lvyeReportRecordId);
      },

    },

    mounted () {
      this.loadingShow = true;
      this.getConfig();
      this.page = 1;
      this.page1 = 1;
      this.changeTabString = sessionStorage.getItem('changeTabString') ? sessionStorage.getItem('changeTabString') : 1;
      if (this.changeTabString == 1) {
        this.policeIdentityList(JSON.stringify(["NONE","PENDING","FAILED"]), this.page, 1);
      }else {
        this.policeIdentityList(JSON.stringify(["SUCCESS","UNREPORTED"]), this.page1, 2);
      }
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
        padding: 0 40px 115px;
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
                  display: inline-block;
                }
                span:first-of-type {
                  width: 120px;
                }
                .blue {
                  color: #1AAD19;
                }
              }
            }
            .tig_btn {
              position: absolute;
              bottom: 20px;
              right: 30px;
              background-color: #1AAD19;
              width: 184px;
              height: 64px;
              border-radius: 32px;
              text-align: center;
              box-shadow: 0 4px 10px 0 rgba(0,0,0,0.17);
              font-size: 24px;
              color: #fff;
              -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
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
  /deep/ .el-pagination .btn-next .el-icon, .el-pagination .btn-prev .el-icon {
    font-size: 20px;
  }
  /deep/ .el-pagination .btn-prev .el-icon {
    font-size: 20px;
  }

</style>
