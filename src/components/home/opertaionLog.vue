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
            <span>操作日志</span>
          </div>
        </div>
      </div>
      <div class="doSthContent">
        <div class="logContent">
          <div class="searchBox">
            <div v-for="(item, index) in daterangeList" v-if="index == daterangeList.length-1">
                <el-date-picker
                v-model="dateArr"
                type="daterange"
                @change="inputChange_"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
              </el-date-picker>
            </div>
            <div>
              <el-input
                @input="inputChange"
                placeholder="请输入操作员/功能/内容"
                clearable
                @focus="searchBoxFocus"
                @blur="searchBoxBlur"
                v-model="queryString">
                <i slot="prefix" class="el-input__icon el-icon-search"></i>
              </el-input>
            </div>
          </div>
          <div class="doSthLists" v-if="showList">
            <el-table
              :data="dataLists"
              stripe
              style="width: 100%">
              <el-table-column
                label="操作时间">
                <template slot-scope="scope">
                  <span>{{ datetimeparse(scope.row.operTime, 'yy/MM/dd hh:mm:ss') }}</span>
                </template>
              </el-table-column>
              <el-table-column
                label="操作员">
                <template slot-scope="scope">
                  <span>{{ scope.row.operUserName }} {{ scope.row.operUserPhone ? '/'+scope.row.operUserPhone : '' }}</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="deviceName"
                label="设备">
              </el-table-column>
              <el-table-column
                prop="operType"
                label="功能">
              </el-table-column>
              <el-table-column
                label="内容">
                <template slot-scope="scope">
                  <el-popover
                    placement="left"
                    title=""
                    width="400"
                    trigger="click"
                    :content="scope.row.operContent">
                    <el-button slot="reference" class="widthOnce">{{ scope.row.operContent }}</el-button>
                  </el-popover>
                  <!--<el-tooltip class="item" effect="dark" :content="scope.row.operContent" placement="left">-->
                    <!--<el-button class="widthOnce">{{ scope.row.operContent }}</el-button>-->
                  <!--</el-tooltip>-->
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page.sync="page"
              :page-size="pageSize"
              layout="total, prev, pager, next"
              :total="total" v-if="dataLists.length != 0">
            </el-pagination>
            <div class="noMsg" v-if="dataLists.length == 0 && showList">
              <div class="img"><img src="../../assets/zanwuneirong.png" alt=""></div>
              <p>暂无内容</p>
            </div>
          </div>
        </div>
      </div>
      <!-- 退出弹框提示-->
      <div class="quit" v-if="quit">
        <div class="shadow"></div>
        <div class="quit_content">
          <div class="quit_title">是否确认退出？</div>
          <div class="quit_tabs">
            <span class="cancel" @click="quitTipClose">取消</span>
            <span class="sure" @click="sure">确认</span>
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
        myInfo: {
          img: sessionStorage.getItem('avatar') ? sessionStorage.getItem('avatar') : require('../../assets/morentouxiang.png'),
          name: sessionStorage.getItem('name')
        },      // 获取个人头像和姓名
        showList: false,
        page: 1,  // 当前页数
        pageSize: 5, // 每页条数
        total: 1, // 总条数
        dataLists: [],
        dateArr: [],
        queryString: '',
        dwimeX: null,         // 键盘
        wherePrint: 2,        // 1A屏2B屏
        daterangeList: [''],
      }
    },
    filters: {

    },
    methods: {
      ...mapActions([
        'goto', 'getoperationLog'
      ]),

      // 分页
      handleSizeChange (val) {

      },

      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.loadingShow = true;
        this.getLog(val, 1);
      },

      // input
      inputChange(val) {
          this.page = 1;
          this.getLog();
      },

      inputChange_(val) {
        this.loadingShow = true;
        this.daterangeList.push('');
        this.page = 1;
        this.getLog();
      },

      // blur input
      searchBoxBlur () {
        this.dwimeX.SendCmd("close");
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

        this.dwimeX.SendCmd("pos(" + x + "," + y +")/show");
      },

      // 日志list
      getLog() {
          this.getoperationLog({
            data: {
              beginDate: new Date(this.dateArr[0]).getTime(),
              endDate: new Date(this.dateArr[1]).getTime() + 24 * 60 * 60 * 1000 -1,
              pageNo: this.page,
              pageSize: this.pageSize,
              queryString: this.queryString
            },
            onsuccess: body => {
                if (body.data.code == 0) {
                  this.total = body.data.data.total;
                  this.dataLists = [...body.data.data.list];
                }
                this.showList = true;
                this.loadingShow = false;
            },
            onfail: body => {
              this.loadingShow = false;
              this.showList = true;
            },
            onerror: body =>{
              this.loadingShow = false;
              this.showList = true;
            }
          })
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

    },
    beforeMount() {
      this.dwimeX = new this.dwimeXFun();
      this.wherePrint = sessionStorage.getItem('getAppLocation') ? sessionStorage.getItem('getAppLocation') : 2;
    },
    mounted () {
      this.loadingShow = true;
      this.dateArr.push(new Date(new Date().toLocaleDateString()), new Date(new Date().toLocaleDateString()));
      this.getLog();
    },
    beforeRouteLeave (to, from, next) {
      this.loadingShow = false;
      next();
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>

  .doSthIndex {
    width: 100vw;
    padding-top: 100px;
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
      z-index: 5;
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
            width: 18px;
            height: 22px;
            margin-right: 7px;
          }
          span {
            font-size: 20px;
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
            font-size: 20px;
            display: inline-flex;
            align-items: center;
          }
        }
      }
    }
    .doSthContent {
      padding: 20px 20px 20px;
      .logContent {
        background-color: #fff;
        min-height: calc(100vh - 140px);
        padding-bottom: 70px;
        border-radius: 20px;
        .searchBox {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 40px 30px;
          .el-input {
            margin-left: 30px;
            font-size: 24px;
            color: #999999;
            display: inline-flex;
            width: 464px;
          }
        }
        .doSthLists {
          padding: 0 30px 115px;
          /deep/ .el-table th {
            border-bottom: 0;
            background-color: #4A90E2;
            font-size: 20px;
            color: #FFFFFF;
            font-weight: bold;
          }
          /deep/ .el-table th .cell {
            padding: 18px 10px;
          }
          /deep/ .el-table thead tr {
            background-color: #4A90E2;
          }
          /deep/ .el-table .cell {
            line-height: normal;
          }
          /deep/ .el-table th:first-of-type>.cell, /deep/ .el-table td:first-of-type>.cell {
            padding-left: 58px;
          }
          /deep/ .el-table td .cell {
            font-size: 20px;
            color: #333333;
            padding: 32px 10px;
          }
          /deep/ .el-table td, /deep/ .el-table th {
            padding: 0;
          }
          /deep/ .el-table--striped .el-table__body tr.el-table__row--striped td {
            background-color: #f7f7f7;
          }
          /deep/ .el-table__empty-text {
            font-size: 20px;
            color: #333333;
            display: none;
          }
          .widthOnce {
            overflow: hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
            background: none;
            border: none;
            font-size: 20px;
            color: #333333;
            display: block;
            width: 100%;
            text-align: left;
            padding: 0;
          }
          .el-pagination {
            padding: 30px 0;
            position: fixed;
            width: calc(100vw - 40px);
            bottom: 20px;
            left: 20px;
            z-index: 1;
            border-radius: 0 0 20px 20px;
            background-color: #fff;
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
    /deep/ .el-input--prefix .el-input__inner {
      padding: 7px 67px 7px 91px;
      height: auto;
      background: #F7F7F7;
      border-radius: 31px;
      font-size: 20px;
      border: none;
    }
    /deep/ .el-input__icon {
      margin-left: 50px;
      line-height: 60px;
    }
    /deep/ .el-input__suffix {
      right: 15px;
    }
    /deep/ .el-input__clear {
      font-size: 20px;
    }
    /deep/ .el-date-editor .el-range__icon, /deep/ .el-date-editor .el-range__close-icon {
      display: none;
    }
    /deep/ .el-range-editor.el-input__inner {
      padding: 0;
      border: none;
    }
    /deep/ .el-date-editor--daterange.el-input__inner {
      width: auto;
    }
    /deep/ .el-range-editor .el-range-input {
      background: #F7F7F7;
      border-radius: 31px;
      width: 182px;
      font-size: 20px;
      color: #1BAC18;
      padding: 14px 0;
      height: auto;
    }
    /deep/ .el-range-separator {
      width: 10%;
      font-size: 20px;
    }
  }


</style>
