<template>
  <div>
    <div class="policeIndex" v-show="showPoliceIdentity">
      <div class="police_fl">
        <div class="doSthContent">
          <div class="changTabs">
            <span :class="changeTabString == 1 ? 'active' : ''" @click="changeTabClick(1)" :style="changeTabString == 1 ? tabImg[1] : tabImg[0]">待处理{{total != 0 ? "("+total+")" : ''}}</span>
            <!--<span :class="changeTabString == 2 ? 'active' : ''" @click="changeTabClick(2)" :style="changeTabString == 2 ? tabImg[1] : tabImg[0]">处理中{{total2 != 0 ? "("+total2+")" : ''}}</span>-->
            <span :class="changeTabString == 3 ? 'active' : ''" @click="changeTabClick(3)" v-if="showHandledList" :style="changeTabString == 3 ? tabImg[1] : tabImg[0]">已处理{{total1 != 0 ? "("+total1+")" : ''}}</span>
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
                    <span :class="item.similarity == 0 ? 'red' : 'blue'">{{item.similarity}}%</span>
                  </div>
                </div>
                <el-button type="primary" class="tig_btn" :loading="item.unhandleLoading" v-if="item.reportInStatus != 'PENDING'">立即处理</el-button>
                <el-button type="primary" class="tig_btn tig_btning" :loading="item.unhandleLoading" v-else>处理中</el-button>
              </div>
            </div>
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page.sync="page"
              :page-size="5"
              layout="total, prev, pager, next"
              :total="total" v-if="unhandleList.length != 0">
            </el-pagination>
            <div class="noMsg" v-if="unhandleList.length == 0">
              <div class="img"><img src="../../assets/zanwuneirong.png" alt=""></div>
              <p>暂无内容</p>
            </div>
          </div>
          <div class="identityList" v-if="showList && changeTabString == 2">
            <div class="list" v-for="item in handleingList"  @click="unhandleClick(item)">
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
                    <span :class="item.similarity == 0 ? 'red' : 'blue'">{{item.similarity}}%</span>
                  </div>
                </div>
                <el-button type="primary" class="tig_btn" :loading="item.unhandleLoading" v-if="item.reportInStatus != 'PENDING'">立即处理</el-button>
                <el-button type="primary" class="tig_btn tig_btning" :loading="item.unhandleLoading" v-else>处理中</el-button>
              </div>
            </div>
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange2"
              :current-page.sync="page2"
              :page-size="5"
              layout="total, prev, pager, next"
              :total="total2" v-if="handleingList.length != 0">
            </el-pagination>
            <div class="noMsg" v-if="handleingList.length == 0">
              <div class="img"><img src="../../assets/zanwuneirong.png" alt=""></div>
              <p>暂无内容</p>
            </div>
          </div>
          <div class="identityList" v-if="showList && changeTabString == 3">
            <div class="list" v-for="item in handleList"  @click="unhandleClick(item)">
              <div class="list_header list_header_">
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
                    <span class="blue">{{item.roomNumber ? item.roomNumber : '无'}}</span>
                  </div>
                </div>
              </div>
            </div>
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange1"
              :current-page.sync="page1"
              :page-size="5"
              layout="total, prev, pager, next"
              :total="total1" v-if="handleList.length != 0">
            </el-pagination>
            <div class="noMsg" v-if="handleList.length == 0">
              <div class="img"><img src="../../assets/zanwuneirong.png" alt=""></div>
              <p>暂无内容</p>
            </div>
          </div>
        </div>
        <loadingList v-if="loadingShow" :loadingText="loadingText" style="width: calc(100vw - 480px)"></loadingList>
      </div>
      <div class="police_fr">
        <div>
          <div class="fast_title">
            <img src="../../assets/xiantiao.png" alt="">
            快速筛选
          </div>
          <!--<div class="changTabs">-->
            <!--<span :class="changeTabFr == 1 ? 'active' : ''" @click="changeTabClick(1)">预订人</span>-->
            <!--<span :class="changeTabFr == 2 ? 'active' : ''" @click="changeTabClick(2)">手机号</span>-->
          <!--</div>-->
          <div class="change_tabs">
            <div class="tab" v-if="changeTabFr == 1">
              <div class="input">
                <input type="text" placeholder="请输入姓名的首字母查询" v-model="searchString1"  @input="changeKeyBords">
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
                <img src="../../assets/close.png" alt="" @click="clearSearch1" v-if="searchString2 > 0">
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
  </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex';
  import ElCol from "element-ui/packages/col/src/col";
  import loadingList from './loading.vue'

  export default {
    name: 'policeIdentity',
    components: {ElCol, loadingList},
    props: ['searchVal'],
    data () {
      return {
        loadingShow: false,  // loading
        loadingText: '加载中...', // loading text
        showList: false,
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
        changeTabString: 1,  // tab选中
        page: 1,  // 当前页数
        page1: 1,  // 当前页数
        page2: 1,  // 当前页数
        total: 0, // 总条数
        total2: 0, // 总条数
        total1: 0, // 总条数
        unhandleList: [],  // 未处理列表
        handleingList: [],  // 处理中列表
        handleList: [],  // 已处理列表
        showHandledList: true,  // 是否显示已处理
        showPoliceIdentity: false,  // 是否显示模板
        hotelConfig: {},  // 权限
        changeTabFr: 1,  // 右侧筛选tab切换
        keyBords1: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K','L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],     // 字母键盘
        keyBords2: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '清除', '0'],   // 数字键盘
        searchString: '',  // 搜索
        searchString1: '',  // 字母搜索
        searchString2: '',  // 数字搜索
        timer: null,
        todayStart: '',  // 今日起始时间
        todayEnd: '',    // 今日结束时间
      }
    },
    filters: {

    },
    watch: {
      searchVal: function (val) {
        console.log(val);   // 接收父组件的值
        this.page = 1;
        this.page1 = 1;
        this.page2 = 1;
        if (this.changeTabString == 1) {
          this.total1 = 0;
          this.total2 = 0;
          this.policeIdentityList(JSON.stringify(["NONE","FAILED"]), '', '', this.page, 1);
        }else if (this.changeTabString == 2) {
          this.total1 = 0;
          this.total = 0;
          this.policeIdentityList(JSON.stringify(["PENDING"]), '', '', this.page2, 2);
        }else {
          this.total = 0;
          this.total1 = 0;
          this.policeIdentityList(JSON.stringify(["SUCCESS","PENDING","UNREPORTED"]), this.todayStart, this.todayEnd, this.page1, 3);
        }
      }
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
        this.page2 = 1;
        if (index == 1) {
          this.total1 = 0;
          this.total2 = 0;
          this.policeIdentityList(JSON.stringify(["NONE","FAILED"]), '', '', this.page, 1);
        }else if (index == 2) {
          this.total = 0;
          this.total1 = 0;
          this.policeIdentityList(JSON.stringify(["PENDING"]), '', '', this.page2, 2);
        }else {
          this.total = 0;
          this.total2 = 0;
          this.policeIdentityList(JSON.stringify(["SUCCESS","PENDING","UNREPORTED"]), this.todayStart, this.todayEnd, this.page1, 3);
        }
        this.$emit('getMessage', index);
      },

      // 键盘事件
      changeKeyBords () {
        this.page = 1;
        this.page1 = 1;
        this.page2 = 1;
        this.searchString = this.searchString1;
        if (this.changeTabString == 1) {
          this.policeIdentityList(JSON.stringify(["NONE","FAILED"]), '', '', this.page, 1);
        }else if (this.changeTabString == 2) {
          this.policeIdentityList(JSON.stringify(["PENDING"]), '', '', this.page2, 2);
        }else {
          this.policeIdentityList(JSON.stringify(["SUCCESS","PENDING","UNREPORTED"]), this.todayStart, this.todayEnd, this.page1, 3);
        }
      },

      // 右侧筛选tab切换
      changeTabFrClick(index) {
        this.changeTabFr = index;
        if (index == 1) {
          this.searchString2 = '';
        }else {
          this.searchString1 = '';
        }
        this.searchString = '';
      },

      keyCancel (event, type) {
        event.preventDefault();
        this.loadingShow = true;
        this.showList = false;
        this.page = 1;
        this.page1 = 1;
        this.page2 = 1;
        if (type == 1) {
          if (this.searchString1.length > 0) {
            this.searchString1 = this.searchString1.substr(0, this.searchString1.length - 1);
            this.searchString = this.searchString1;
            if (this.changeTabString == 1) {
              this.policeIdentityList(JSON.stringify(["NONE","FAILED"]), '', '', this.page, 1);
            }else if (this.changeTabString == 2) {
              this.policeIdentityList(JSON.stringify(["PENDING"]), '', '', this.page2, 2);
            }else {
              this.policeIdentityList(JSON.stringify(["SUCCESS","PENDING","UNREPORTED"]), this.todayStart, this.todayEnd, this.page1, 3);
            }
          }
        }else {
          if (this.searchString2.length > 0) {
            this.searchString2 = this.searchString2.substr(0, this.searchString2.length - 1);
            this.searchString = this.searchString2;
            if (this.changeTabString == 1) {
              this.policeIdentityList(JSON.stringify(["NONE","FAILED"]), '', '', this.page, 1);
            }else if (this.changeTabString == 2) {
              this.policeIdentityList(JSON.stringify(["PENDING"]), '', '', this.page2, 2);
            }else {
              this.policeIdentityList(JSON.stringify(["SUCCESS","PENDING","UNREPORTED"]), this.todayStart, this.todayEnd, this.page1, 3);
            }
          }
        }
      },

      // 键盘清除事件
      clear (event) {
        event.preventDefault();
        this.searchString2 = '';
        this.searchString = '';
        this.loadingShow = true;
        this.showList = false;
        this.page = 1;
        this.page1 = 1;
        this.page2 = 1;
        if (this.changeTabString == 1) {
          this.policeIdentityList(JSON.stringify(["NONE","FAILED"]), '', '', this.page, 1);
        }else if (this.changeTabString == 2) {
          this.policeIdentityList(JSON.stringify(["PENDING"]), '', '', this.page2, 2);
        }else {
          this.policeIdentityList(JSON.stringify(["SUCCESS","PENDING","UNREPORTED"]), this.todayStart, this.todayEnd, this.page1, 3);
        }
      },

      // 字母键盘事件
      keyEntry(event, item,type) {
        event.preventDefault();
        clearTimeout(this.timer);
        this.loadingShow = true;
        this.showList = false;
        this.page = 1;
        this.page1 = 1;
        this.page2 = 1;
        if (type == 1) {
          this.searchString1 += item;
          this.searchString = this.searchString1;
          if (this.changeTabString == 1) {
            this.policeIdentityList(JSON.stringify(["NONE","FAILED"]), '', '', this.page, 1);
          }else if (this.changeTabString == 2) {
            this.policeIdentityList(JSON.stringify(["PENDING"]), '', '', this.page2, 2);
          }else {
            this.policeIdentityList(JSON.stringify(["SUCCESS","PENDING","UNREPORTED"]), this.todayStart, this.todayEnd, this.page1, 3);
          }
        }else {
          this.searchString2 += item;
          this.searchString = this.searchString2;
          this.timer = setTimeout(() => {
            if (this.changeTabString == 1) {
              this.policeIdentityList(JSON.stringify(["NONE","FAILED"]), '', '', this.page, 1);
            }else if (this.changeTabString == 2) {
              this.policeIdentityList(JSON.stringify(["PENDING"]), '', '', this.page2, 2);
            }else {
              this.policeIdentityList(JSON.stringify(["SUCCESS","PENDING","UNREPORTED"]), this.todayStart, this.todayEnd, this.page1, 3);
            }
          },1500)
        }
      },

      // 键盘删除事件
      clearSearch() {
        this.searchString1 = '';
        this.searchString = this.searchString1;
        this.loadingShow = true;
        this.showList = false;
        this.page = 1;
        this.page1 = 1;
        this.page2 = 1;
        if (this.changeTabString == 1) {
          this.policeIdentityList(JSON.stringify(["NONE","FAILED"]), '', '', this.page, 1);
        }else if (this.changeTabString == 2) {
          this.policeIdentityList(JSON.stringify(["PENDING"]), '', '', this.page2, 2);
        }else {
          this.policeIdentityList(JSON.stringify(["SUCCESS","PENDING","UNREPORTED"]), this.todayStart, this.todayEnd, this.page1, 3);
        }
      },
      clearSearch1() {
        this.searchString2 = '';
        this.searchString = this.searchString2;
        this.loadingShow = true;
        this.showList = false;
        this.page = 1;
        this.page1 = 1;
        this.page2 = 1;
        if (this.changeTabString == 1) {
          this.policeIdentityList(JSON.stringify(["NONE","FAILED"]), '', '', this.page, 1);
        }else if (this.changeTabString == 2) {
          this.policeIdentityList(JSON.stringify(["PENDING"]), '', '', this.page2, 2);
        }else {
          this.policeIdentityList(JSON.stringify(["SUCCESS","PENDING","UNREPORTED"]), this.todayStart, this.todayEnd, this.page1, 3);
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
        this.policeIdentityList(JSON.stringify(["NONE","FAILED"]), '', '', val, 1);
      },
      handleCurrentChange1(val) {
        console.log(`当前页: ${val}`);
        this.showList = false;
        this.loadingShow = true;
        this.page1 = val;
        this.policeIdentityList(JSON.stringify(["SUCCESS","PENDING","UNREPORTED"]), this.todayStart, this.todayEnd, val, 3);
      },
      handleCurrentChange2(val) {
        console.log(`当前页: ${val}`);
        this.showList = false;
        this.loadingShow = true;
        this.page2 = val;
        this.policeIdentityList(JSON.stringify(["PENDING"]), '', '', val, 2);
      },

      // 获取列表
      policeIdentityList(reportInStatuses, startTime, endTime, page, type) {
        this.newIdentityList ({
          data: {
            createTimeStart: startTime,
            createTimeEnd: endTime,
            reportInStatuses: JSON.parse(reportInStatuses),//需要的入住上报旅业状态
            desc: true,
            name: this.searchString  // 搜索
          },
          limit: 5,
          offset: (page-1)*5,
          onsuccess: (body, headers) => {
            if (body.errcode == 0) {
                if (body.data.content.length != 0) {
                  body.data.content.forEach(item => {
                    item.unhandleLoading = false;
                  });
                  if (type == 1) {
                    this.total = parseFloat(headers['x-total-count']);
                    this.unhandleList = [ ...body.data.content];
                    this.hotelConfig = body.data.config;
                    this.$emit('unhandleNumFun', this.total);
                  }else if (type == 2) {
                    this.total2 = parseFloat(headers['x-total-count']);
                    this.handleingList = [ ...body.data.content];
                  }else {
                    this.total1 = parseFloat(headers['x-total-count']);
                    this.handleList = [ ...body.data.content];
                  }
                }else {
                  if (type == 1) {
                      if (page > 1) {
                        this.page--;
                        this.policeIdentityList(JSON.stringify(["NONE","FAILED"]), '', '', this.page, 1);
                      }else {
                        this.total = parseFloat(headers['x-total-count']);
                        this.unhandleList = [ ...body.data.content];
                        this.hotelConfig = body.data.config;
                        this.$emit('unhandleNumFun', this.total);
                      }
                  }else if (type == 2) {
                    if (page > 1) {
                      this.page2--;
                      this.policeIdentityList(JSON.stringify(["PENDING"]), '', '', this.page2, 2);
                    }else {
                      this.total2 = parseFloat(headers['x-total-count']);
                      this.handleingList = [...body.data.content];
                    }
                  }else {
                    if (page > 1) {
                      this.page1--;
                      this.policeIdentityList(JSON.stringify(["SUCCESS","PENDING","UNREPORTED"]), this.todayStart, this.todayEnd, this.page1, 3);
                    }else {
                      this.total1 = parseFloat(headers['x-total-count']);
                      this.handleList = [...body.data.content];
                    }
                  }
                }
            }
            this.loadingShow = false;
            this.showList = true;
          },
          onfail: (body, headers) => {
            this.loadingShow = false;
          },
          onerror: error => {
            this.loadingShow = false;
          }
        })
      },

      // 立即处理
      unhandleClick (item) {
        item.unhandleLoading = true;
        sessionStorage.setItem('changeTabString', this.changeTabString);
        if (this.changeTabString == 1) {
          sessionStorage.setItem('policeIdentityPage',this.page);
        }else if (this.changeTabString == 2) {
          sessionStorage.setItem('policeIdentityPage',this.page2);
        }else {
          sessionStorage.setItem('policeIdentityPage',this.page1);
        }
        this.$emit('gotoDtail', item.lvyeReportRecordId);
      },

    },

    mounted () {
      this.loadingShow = true;
      this.getConfig();
      this.changeTabString = sessionStorage.getItem('changeTabString') ? sessionStorage.getItem('changeTabString') : 1;
      if (this.changeTabString == 1) {
        this.page = sessionStorage.getItem('policeIdentityPage') ? sessionStorage.getItem('policeIdentityPage') : 1;
      }else if (this.changeTabString == 2) {
        this.page2 = sessionStorage.getItem('policeIdentityPage') ? sessionStorage.getItem('policeIdentityPage') : 1;
      }else {
        this.page1 = sessionStorage.getItem('policeIdentityPage') ? sessionStorage.getItem('policeIdentityPage') : 1;
      }
      this.todayStart = this.timeFetch().todayStart;
      this.todayEnd = this.timeFetch().todayEnd;
      if (this.changeTabString == 1) {
        this.policeIdentityList(JSON.stringify(["NONE","FAILED"]), '', '', this.page, 1);
      }else if (this.changeTabString == 2) {
        this.policeIdentityList(JSON.stringify(["PENDING"]), '', '', this.page2, 2);
      }else {
        this.policeIdentityList(JSON.stringify(["SUCCESS","PENDING","UNREPORTED"]), this.todayStart, this.todayEnd, this.page1, 3);
      }
    },

    beforeRouteEnter(to,from,next){
      if(from.name == 'policeIdentityDetail'){

      }else {
        sessionStorage.removeItem('policeIdentityPage');
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

  .policeIndex {
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
    .police_fl {
      width: calc(100vw - 480px);
      .doSthContent {
        padding-top: 100px;
        .changTabs {
          padding: 40px;
          text-align: left;
          span {
            padding: 18px 30px;
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
            background-color: #C8E1C8;
            border: 1px solid #1AAD19;
            color: #1AAD19;
          }
        }
        .identityList {
          padding: 0 40px 0;
          .list {
            padding: 0 30px;
            background: #FFFFFF;
            box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.10);
            border-radius: 6px;
            text-align: left;
            margin-bottom: 20px;
            .list_header {
              border-bottom: 1px solid #E5E5E5;
              padding: 15px 0;
              font-size: 20px;
              color: #909399;
              width: 82%;
            }
            .list_header_ {
              width: 100%;
            }
            .list_content {
              position: relative;
              display: flex;
              justify-content: space-between;
              .lis {
                padding: 15px 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 76%;
                .li {
                  margin-bottom: 15px;
                  span {
                    color: #000;
                    font-size: 20px;
                    display: inline-block;
                  }
                  span:first-of-type {
                    width: 90px;
                  }
                  .blue {
                    color: #1AAD19;
                  }
                  .red {
                    color: #F5222D;
                  }
                }
                .li:first-of-type {
                  width: 220px;
                }
                .li:last-of-type {
                  width: 186px;
                }
              }
              .tig_btn {
                position: absolute;
                bottom: 48px;
                right: 30px;
                background-color: #1AAD19;
                width: 160px;
                padding: 17px 0;
                border-radius: 32px;
                text-align: center;
                box-shadow: 0 4px 10px 0 rgba(0,0,0,0.17);
                font-size: 20px;
                color: #fff;
                -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
              }
              .tig_btning {
                background-color: #8CD58B;
                border-color: #8CD58B;
              }
            }
          }
        }
      }
    }
    .police_fr {
      width: 480px;
      background-color: #fff;
      .corporation {
        text-align: center;
        padding: 10px 0;
        font-size: 30px;
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
    .police_fr>div {
      position: fixed;
      top: 100px;
      right: 0;
      width: 480px;
      height: calc(100vh - 100px);
      background-color: #fff;
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


</style>
