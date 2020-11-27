<template>
  <div>
    <div class="doSthIndex">
      <div class="header">
        <div class="header_fl">
          <div class="changeScreen" @click="goto('/home')">
            <span>&nbsp;&nbsp;&nbsp;&nbsp;返回&nbsp;&nbsp;&nbsp;&nbsp;</span>
          </div>
          <div class="tabs">
            <span>操作日志</span>
          </div>
        </div>
        <div class="header_fr">
          <div class="myInfo" @click="myInfoClick">
            <img :src="myInfo.img" alt="" onerror="this.myInfo.src='../../assets/morentouxiang.png'">
            <span>{{myInfo.name}}</span>
          </div>
          <div class="tuichu">
            <el-dropdown trigger="click">
                <span class="el-dropdown-link">
                  更多
                </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item icon="el-icon-tickets"  @click.native="goto('/opertaionLog')">操作日志</el-dropdown-item>
                <el-dropdown-item icon="el-icon-switch-button" @click.native="quit=true;">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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
          <div class="doSthLists" > <!--v-if="showList"-->
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
        quit: false,
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

      // 点击头像调用A屏事件
      myInfoClick() {
        jsObj.WalkInConfig();
      },

      // 退出弹框
      quitTipShow() {
        document.body.addEventListener('touchmove',this.bodyScroll,false);
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        this.quit = true;
      },

      // 退出事件
      sure() {
        document.body.removeEventListener('touchmove',this.bodyScroll,false);
        document.body.style.position = 'initial';
        document.body.style.width = 'auto';
        this.quit = false;
//        window.location.href = this.windowUrl;
        this.logOut();
      },

      // 退出弹框消失
      quitTipClose() {
        document.body.removeEventListener('touchmove',this.bodyScroll,false);
        document.body.style.position = 'initial';
        document.body.style.width = 'auto';
        this.quit = false;
      },

      logOut() {
        jsObj.LogOut();
      },

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
      this.dateArr.push(new Date(new Date(new Date().getTime() - 3600 * 1000 * 24 * 30).toLocaleDateString()), new Date(new Date().toLocaleDateString()));
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
      .header_fr {
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .myInfo {
          margin: 0 60px 0 80px;
          display: flex;
          align-items: center;
          height: 100%;
          cursor: pointer;
          img {
            display: inline-block;
            width: 68px;
            height: 68px;
            margin-right: 15px;
            border-radius: 50%;
          }
          span {
            color: #4A4A4A;
            font-size: 18px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 80px;
          }
        }
        .tuichu {
          margin-right: 20px;
          .el-dropdown {
            border: 1px solid #9A9A9A;
            padding: 12px 22px;
            font-size: 26px;
            border-radius: 10px;
            color: #1AAD19;
            font-weight: bold;
            letter-spacing: 2px;
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
            font-size: 28px;
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
            font-size: 24px;
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
            font-size: 24px;
            color: #333333;
          }
          .widthOnce {
            overflow: hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
            background: none;
            border: none;
            font-size: 24px;
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
    .quit {
      .shadow {
        position: fixed;
        z-index: 999999999;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .6);
      }
      .quit_content {
        background: #FFFFFF;
        border-radius: 20px;
        width: 375px;
        position: fixed;
        z-index: 9999999999;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        .quit_title {
          padding: 50px 30px;
          border-bottom: 1px solid #D8D8D8;
          color: #0B0B0B;
          font-size: 26px;
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
            font-size: 24px;
            text-align: center;
          }
          span:first-of-type {
            color: #909399;
          }
          span:last-of-type {
            color: #1AAD19;
          }
          span:first-of-type:after {
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
    /deep/ .el-input--prefix .el-input__inner {
      padding: 8px 67px 8px 91px;
      height: auto;
      background: #F7F7F7;
      border-radius: 31px;
    }
    /deep/ .el-input__icon {
      margin-left: 50px;
      line-height: 60px;
    }
    /deep/ .el-input__suffix {
      right: 15px;
    }
    /deep/ .el-input__clear {
      font-size: 24px;
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
      font-size: 24px;
      color: #1BAC18;
      padding: 14px 0;
      height: auto;
    }
    /deep/ .el-range-separator {
      width: 10%;
      font-size: 24px;
    }
  }


</style>
