<template>
    <div class="statistics" v-if="showList">
        <el-row :gutter="20">
          <el-col :span="7">
            <div class="datesBox">
              <div class="title">选择日期</div>
              <div class="tabs">
                <span :class="dateIndex == 1 ? 'active' : ''" @click="dateTab(1)">按日</span>
                <span :class="dateIndex == 2 ? 'active' : ''" @click="dateTab(2)">按周</span>
                <span :class="dateIndex == 3 ? 'active' : ''" @click="dateTab(3)">按月</span>
                <span :class="dateIndex == 4 ? 'active' : ''" @click="dateTab(4)">自定义</span>
              </div>
              <div class="time_change" v-if="dateIndex == 1">
                <i @click="preDay"><img src="../../assets/ic_chevron_left.png" alt=""></i>
                <el-date-picker
                  ref="date1"
                  type="date"
                  v-model="dayTime"
                  value-format="yyyy/MM/dd"
                  placeholder="选择日期"
                  @change="datePicker"
                >
                </el-date-picker>
                <i @click="nextDay"><img src="../../assets/ic_chevron_right.png" alt=""></i>
              </div>
              <div class="time_change" v-else-if="dateIndex == 2">
                <i @click="preDay"><img src="../../assets/ic_chevron_left.png" alt=""></i>
                <el-date-picker
                  ref="date2"
                  type="week"
                  v-model="weekTime"
                  value-format="yyyy/MM/dd"
                  format="yyyy 第 WW 周"
                  placeholder="选择日期"
                  @change="datePicker"
                >
                </el-date-picker>
                <i @click="nextDay"><img src="../../assets/ic_chevron_right.png" alt=""></i>
              </div>
              <div class="time_change" v-else-if="dateIndex == 3">
                <i @click="preDay"><img src="../../assets/ic_chevron_left.png" alt=""></i>
                <el-date-picker
                  ref="date3"
                  type="month"
                  v-model="monthTime"
                  placeholder="选择日期"
                  @change="datePicker"
                >
                </el-date-picker>
                <i @click="nextDay"><img src="../../assets/ic_chevron_right.png" alt=""></i>
              </div>
              <div class="time_change" v-else>
                <!--<i @click="preDay"><img src="../../assets/ic_chevron_left.png" alt=""></i>-->
                <el-date-picker
                  ref="date4"
                  type="daterange"
                  v-model="timeVal"
                  placeholder="选择日期"
                  @change="datePicker"
                  :default-time="['00:00:00', '23:59:59']"
                >
                </el-date-picker>
                <!--<i @click="nextDay"><img src="../../assets/ic_chevron_right.png" alt=""></i>-->
              </div>
            </div>
            <div class="ractangle">
              <div class="title">自助入住与自助退房统计</div>
              <div id="rectangle"></div>
            </div>
          </el-col>
          <el-col :span="7">
            <div class="liveInTable">
              <div class="title">入住统计</div>
              <div class="tabs">
                <span @click="liveBtn(0)" :class="liveIndex == 0 ? 'active' : ''">全部</span>
                <span @click="liveBtn(1)" :class="liveIndex == 1 ? 'active' : ''">walkin</span>
                <span @click="liveBtn(2)" :class="liveIndex == 2 ? 'active' : ''">散客</span>
                <span @click="liveBtn(3)" :class="liveIndex == 3 ? 'active' : ''">团队</span>
              </div>
              <el-table
                :data="dataList"
                stripe
                ref="tableHeight"
                height="calc(100% - 290px)"
                style="width: 100%" >
                <el-table-column
                  label="姓名" >
                  <template slot-scope="scope" >
                    <div class="ownImg">
                      <img src="../../assets/ic_man.png" alt="">
                      <span>{{ scope.row.name }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="roomNumber"
                  label="房间数">
                </el-table-column>
                <el-table-column
                  label="占比"  >
                  <template slot-scope="scope">
                    <span>{{ scope.row.percent }}%</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-col>
          <el-col :span="10">
            <div class="echartsBox">
              <div class="paymentBox">
                <div class="title">
                  <div class="title_left">
                    <div class="name">交易金额</div>
                    <div class="value">¥{{ pieData.totalFee ? parseFloat(pieData.totalFee/100).toFixed(2) : 0 }}</div>
                  </div>
                  <div class="title_right">
                    <el-button><img src="../../assets/ic_print.png" alt=""></el-button>
                  </div>
                </div>
                <div id="pie1"></div>
              </div>
              <div class="paymentBox">
                <div class="title">
                  <div class="title_left">
                    <div class="name">预授权冻结</div>
                    <div class="value">¥{{ pieData.totalDepositFee ? parseFloat(pieData.totalDepositFee/100).toFixed(2) : 0 }}</div>
                  </div>
                </div>
                <div id="pie2"></div>
              </div>
            </div>
          </el-col>
        </el-row>
    </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex';
  import ElCol from "element-ui/packages/col/src/col";
  import loadingList from './loading.vue'
  // 引入基本模板
  import echarts from 'echarts'
  require('echarts/lib/chart/bar');
  // 引入提示框和title组件
  require('echarts/lib/component/tooltip');
  require('echarts/lib/component/title');
  require('echarts/lib/component/legend');

  export default {
    name: 'statistics',
    components: {ElCol, loadingList},
    data () {
      return {
        loadingShow: false,  // loading
        loadingText: '加载中...', // loading text
        showList: true,
        dateIndex: 1,         // 日期tab选择
        dayTime: '',          // 日
        weekTime: '',         // 周
        monthTime: '',         // 月
        timeVal: [],          // 自定义
        liveIndex: 0,         // 入住tab 选择
        dataList: [
          {
            name: '小郑',
            roomNumber: 20,
            percent: 20
          },
          {
            name: '小郑',
            roomNumber: 20,
            percent: 20
          },
          {
            name: '小郑',
            roomNumber: 20,
            percent: 20
          },
          {
            name: '小郑',
            roomNumber: 20,
            percent: 20
          },
          {
            name: '小郑',
            roomNumber: 20,
            percent: 20
          },
          {
            name: '小郑',
            roomNumber: 20,
            percent: 20
          }
        ],         // 统计list
        pieData: {
          totalFee: '',    // 总交易金额
          weixinPayNum: '',   // 交易微信数量
          weixinPayFee: '',   // 交易微信金额
          aliPayNum: '',   // 交易支付宝数量
          aliPayFee: '',   // 交易支付宝金额
          totalDepositFee: '',    // 总预授权金额
          weixinDepositNum: '',    // 微信预授权数量
          weixinDepositFee: '',    // 微信预授权金额
          aliDepositNum: '',    // 支付宝预授权数量
          aliDepositFee: '',    // 支付宝预授权金额
        },    // pie data
      }
    },
    filters: {

    },
    watch: {

    },
    methods: {
      ...mapActions(['payAnalysisPie']),

      // 选择日期tab
      dateTab(index) {
        this.dateIndex = index;
        if (index == 1 && this.dayTime === '') {
          this.dayTime = new Date().toLocaleDateString();
        }else if (index == 2 && this.weekTime === '') {
          this.weekTime = new Date().toLocaleDateString();
        }else if (index == 3 && this.monthTime === '') {
          this.monthTime = new Date().toLocaleDateString();
        }else if (index == 4 && this.timeVal.length === 0) {
          this.timeVal.push(new Date().toLocaleDateString(), new Date().toLocaleDateString())
        }
        this.payAnalysis();
      },

      // 日期选择
      datePicker(val) {
        console.log(val);
        if (this.dateIndex == 1) {
            console.log(new Date(val).getTime(), new Date(val).getTime()+(24*60*60*1000)-1000);
        }else if (this.dateIndex == 2) {
            console.log(new Date(val).getTime() - (24*60*60*1000), new Date(val).getTime()+(24*60*60*1000*6)-1000);
        }else if (this.dateIndex == 3) {
            console.log(new Date(val).getTime());
            let year = this.datetimeparse(new Date(val).getTime(), 'yy');
            let month = this.datetimeparse(new Date(val).getTime(), 'MM');
            let day = new Date(year,month,0).getDate();
            console.log(new Date(year+'/'+month+'/'+day).getTime()+(24*60*60*1000)-1000);
        }else {
            console.log(new Date(val[0]).getTime(), new Date(val[1]).getTime());
        }
      },

      // pre Time
      preDay() {
        if (this.dateIndex == 1) {
          this.dayTime = new Date(this.dayTime.getTime() - 24 * 60 * 60 * 1000)
        }else if (this.dateIndex == 2) {
          this.weekTime = new Date(this.weekTime.getTime() - 24 * 60 * 60 * 1000 * 6)
        }else if (this.dateIndex == 3) {
          let nowdate = new Date(this.monthTime);
          nowdate.setMonth(nowdate.getMonth()-1);
          let y = nowdate.getFullYear();
          let m = nowdate.getMonth()+1;
          let d = nowdate.getDate();
          this.monthTime = new Date(y+'/'+m+'/'+d);
        }
      },

      // next time
      nextDay() {
        if (this.dateIndex == 1) {
          this.dayTime = new Date(this.dayTime.getTime() + 24 * 60 * 60 * 1000)
        }else if (this.dateIndex == 2) {
          this.weekTime = new Date(this.weekTime.getTime() + 24 * 60 * 60 * 1000 * 6)
        }else if (this.dateIndex == 3) {
          let nowdate = new Date(this.monthTime);
          nowdate.setMonth(nowdate.getMonth()+1);
          let y = nowdate.getFullYear();
          let m = nowdate.getMonth()+1;
          let d = nowdate.getDate();
          this.monthTime = new Date(y+'/'+m+'/'+d);
        }
      },

      // 柱形图
      echartsRectangle() {
        let chartRect = echarts.init(document.getElementById('rectangle'));
        chartRect.clear();
        let option = {
          legend: {},
          tooltip: {},
          xAxis: {
            "show" : true,
            "type": 'category',
            "boundaryGap": true,
            "data" : ['自助入住','自助退房'],
            "axisLine": {
              "show": false
            },
            "axisLabel": {
              margin: 14,
              textStyle: {
                color: '#888',
                fontSize: 24
              }
            }
          },
          yAxis: {
            "axisTick":{       //y轴刻度线
              "show":false
            },
            "splitLine": {     //网格线
              "show": false
            },
            "axisLine":{       //y轴
              "show":false

            },
            "show": false,
            "type": 'value'
          },
          // Declare several bar series, each will be mapped
          // to a column of dataset.source by default.
          series: [
            {
              type: 'bar',
              label: {
                show: true,
                position: 'top',
                textStyle: {
                  color: '#888',
                  fontSize: 32
                }
              },
              data:[
                {
                  value:200,
                  itemStyle:{
                    normal:{ color: '#669BFF'}
                  }
                },
                {
                  value:300,
                  itemStyle:{
                    normal:{ color: '#74CCFF'}
                  }
                },
              ],
              itemStyle: {
                //柱形图圆角，鼠标移上去效果，如果只是一个数字则说明四个参数全部设置为那么多
                emphasis: {
                  barBorderRadius: 30
                },
                normal: {
                  //柱形图圆角，初始化效果
                  barBorderRadius: [12, 12, 0, 0],
                }
              }
            }
          ]
        };
        chartRect.setOption(option);
      },

      // 入住统计tab选择
      liveBtn(index) {
          this.liveIndex = index;
      },

      // 环形图
      echartsBar() {
        let bar1 = echarts.init(document.getElementById('pie1'));
        let bar2 = echarts.init(document.getElementById('pie2'));
        bar1.clear();
        bar2.clear();
        let option = {
          tooltip: {},
          series: [
            {
              name: '交易金额',
              type: 'pie',
              radius: ['25%', '55%'],
              center: ['50%', '65%'],
              color:['#5690FF','#D1F5E8'],
              avoidLabelOverlap: false,
              silent: false,

              labelLine: {
                normal: {
//                  length: 60,
                  length2: 150,
                }
              },
              label: {
                normal: {
                  formatter: function (params) {
                    return '{b|'+params.data.name+'}  {ped|'+params.data.total+'笔 }\n {c|¥'+params.data.value+'\n\n\n}'
                  },
                  borderWidth: 20,
                  borderRadius: 4,
                  padding: [0, -80],
                  rich: {
                    a: {
                      color: '#5690FF',
                      fontSize: 28,
                      lineHeight: 20
                    },
                    b: {
                      fontSize: 28,
                      lineHeight: 36,
                      align: 'left'
                    },
                    c: {
                      fontSize: 28,
                      color: '#888888',
                      align: 'left'
                    },
                    ped: {
                      fontSize: 28,
                      lineHeight: 36,
                      align: 'left'
                    },
                  }
                }
              },
              data: [
                {
                  value: this.data.pieData.aliPayFee ? parseFloat(this.data.pieData.aliPayFee/100).toFixed(2) : 0,
                  name: '支付宝',
                  total: this.data.pieData.aliPayNum,
                },
                {
                  value: this.data.pieData.weixinPayFee ? parseFloat(this.data.pieData.weixinPayFee/100).toFixed(2) : 0,
                  name: '微信',
                  total: this.data.pieData.weixinPayNum
                }
              ]
            }
          ]
        };
        let option2 = {
          tooltip: {},
          series: [
            {
              name: '预授权冻结',
              type: 'pie',
              radius: ['25%', '55%'],
              center: ['50%', '65%'],
              color:['#5690FF','#D1F5E8'],
              avoidLabelOverlap: false,
              silent: false,

              labelLine: {
                normal: {
//                  length: 60,
                  length2: 150,
                }
              },
              label: {
                normal: {
                  formatter: function (params) {
                    return '{b|'+params.data.name+'}  {ped|'+params.data.total+'笔 }\n {c|¥'+params.data.value+'\n\n\n}'
                  },
                  borderWidth: 20,
                  borderRadius: 4,
                  padding: [0, -80],
                  rich: {
                    a: {
                      color: '#5690FF',
                      fontSize: 28,
                      lineHeight: 20
                    },
                    b: {
                      fontSize: 28,
                      lineHeight: 36,
                      align: 'left'
                    },
                    c: {
                      fontSize: 28,
                      color: '#888888',
                      align: 'left'
                    },
                    ped: {
                      fontSize: 28,
                      lineHeight: 36,
                      align: 'left'
                    },
                  }
                }
              },
              data: [
                {
                  value: this.data.pieData.aliDepositFee ? parseFloat(this.data.pieData.aliDepositFee/100).toFixed(2) : 0,
                  name: '支付宝',
                  total: this.data.pieData.aliDepositNum,
                },
                {
                  value: this.data.pieData.weixinDepositFee ? parseFloat(this.data.pieData.weixinDepositFee/100).toFixed(2) : 0,
                  name: '微信',
                  total: this.data.pieData.weixinDepositNum
                }
              ]
            }
          ]
        };
        bar1.setOption(option);
        bar2.setOption(option2);
      },

      // 环形图接口
      payAnalysis() {
        let startTime, endTime;
        if (this.dateIndex == 1) {
          startTime = new Date(this.dayTime).getTime();
          endTime = new Date(this.dayTime).getTime() + (24*60*60*1000)-1000;
        }else if (this.dateIndex == 2) {
          startTime = new Date(this.weekTime).getTime() - (24*60*60*1000);
          endTime = new Date(this.weekTime).getTime() + (24*60*60*1000*6)-1000;
        }else if (this.dateIndex == 3) {
          let year = this.datetimeparse(new Date(this.monthTime).getTime(), 'yy');
          let month = this.datetimeparse(new Date(this.monthTime).getTime(), 'MM');
          let day = new Date(year,month,0).getDate();
          startTime = new Date(this.monthTime).getTime();
          endTime = new Date(year+'/'+month+'/'+day).getTime() + (24*60*60*1000)-1000;
        }else {
          startTime = new Date(this.timeVal[0]).getTime();
          endTime = new Date(this.timeVal[0]).getTime();
        }
        let data = {
          startTime: startTime,
          endTime: endTime
        };
        this.payAnalysisPie({
          data: data,
          onsuccess: body => {
            if (body.data.errcode == 0) {
              this.data.pieData.totalFee = body.data.data.totalFee;
              this.data.pieData.weixinPayNum = body.data.data.weixinPayNum;
              this.data.pieData.weixinPayFee = body.data.data.weixinPayFee;
              this.data.pieData.aliPayNum = body.data.data.aliPayNum;
              this.data.pieData.aliPayFee = body.data.data.aliPayFee;
              this.data.pieData.totalDepositFee = body.data.data.totalDepositFee;
              this.data.pieData.weixinDepositNum = body.data.data.weixinDepositNum;
              this.data.pieData.weixinDepositFee = body.data.data.weixinDepositFee;
              this.data.pieData.aliDepositNum = body.data.data.aliDepositNum;
              this.data.pieData.aliDepositFee = body.data.data.aliDepositFee;
              this.$nextTick(() => {
                this.echartsBar();
              })
            }
            this.loadingShow = false;
          },
          onfail: body => {
            this.loadingShow = false;
          },
          onerror: body => {
            this.loadingShow = false;
          }
        })
      },

    },
    beforeMount () {
      this.loadingShow = true;
      this.dateTab(1);
    },
    mounted () {
      this.echartsRectangle();
    },

    beforeRouteEnter(to,from,next){
      next();
    },
    beforeRouteLeave (to, from, next) {
      this.loadingShow = false;
      next();
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>

  .statistics {
    padding: 140px 40px 40px;
    height: 100vh;
    .datesBox {
      background: #85ACF7;
      border-radius: 18px;
      padding: 55px 0 85px 50px;
      margin-bottom: 25px;
      .title {
        font-size: 28px;
        color: #FFFFFF;
        margin-bottom: 42px;
        text-align: left;
      }
      .tabs {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: 75px;
        span {
          margin-right: 16px;
          padding: 11px 19px;
          background: rgba(255, 255, 255, .6);
          border-radius: 25px;
          font-size: 24px;
          color: #888888;
        }
        .active {
          background: #FFFFFF;
          box-shadow: 0 1px 8px 0 rgba(0,0,0,0.12);
        }
      }
      .time_change {
        padding-right: 50px;
        display: flex;
        align-items: center;
        justify-content: space-between;

      }
    }
    .ractangle {
      background: #FFFFFF;
      box-shadow: 0 3px 16px 0 rgba(0,0,0,0.08);
      border-radius: 18px;
      .title {
        padding: 57px 0 57px 52px;
        text-align: left;
        font-size: 28px;
        color: #333333;
      }
      #rectangle {
        height: 320px;
      }
    }
    .liveInTable {
      height: calc(100vh - 180px);
      background: #FFFFFF;
      box-shadow: 0 3px 16px 0 rgba(0,0,0,0.08);
      border-radius: 18px;
      .title {
        padding: 57px 0 42px 50px;
        text-align: left;
        font-size: 28px;
        color: #333333;
      }
      .tabs {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: flex-start;
        padding-left: 50px;
        margin-bottom: 62px;
        span {
          background: #F7F7F7;
          border-radius: 25px;
          margin-right: 16px;
          padding: 11px 21px;
          font-size: 24px;
          color: #888888;
        }
        .active {
          background: #4C88FF;
          box-shadow: 0 1px 7px 0 rgba(53,138,255,0.63);
          color: #fff;
        }
      }
      /deep/ .el-table__body {
        width: 100% !important;
      }
      /deep/ .el-table th {
        background: #F7F7F7;
        padding: 39px 0;
        font-size: 28px;
        color: #888888;
        font-weight: normal;
      }
      /deep/ .el-table td:first-of-type .cell, /deep/ .el-table th:first-of-type>.cell {
        padding-left: 60px;
      }
      /deep/ .el-table td {
        padding: 40px 0;
      }
      /deep/ .el-table td .cell {
        font-size: 28px;
      }
      /deep/ .el-table td:nth-of-type(2) .cell {
        color: #888888;
      }
      /deep/ .el-table td:last-of-type .cell {
        color: #4C88FF;
      }
      /deep/ .el-table td:nth-of-type(n+2) .cell, /deep/ .el-table th:nth-of-type(n+2) .cell {
        text-align: center;
      }
      /deep/ .el-table__empty-text {
        font-size: 28px;
      }
      .ownImg {
        display: inline-flex;
        align-items: center;
        color: #333333;
        span {
          margin-left: 16px;
        }
      }
    }
    .echartsBox {
      height: calc(100vh - 180px);
      background: #FFFFFF;
      box-shadow: 0 3px 16px 0 rgba(0,0,0,0.08);
      border-radius: 18px;
      .paymentBox:first-of-type {
        border-bottom: 1px solid #eee;
        padding-bottom: 40px;
      }
      .paymentBox:last-of-type {
        .title {
          padding-top: 47px;
        }
      }
      .title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 55px 62px 0 68px;
        .title_left {
          text-align: left;
          .name {
            font-size: 28px;
            color: #888888;
            margin-bottom: 16px;
          }
          .value {
            font-size: 42px;
            color: #333333;
          }
        }
        .title_right {
          button {
            padding: 0;
            border: none;
            cursor: pointer;
          }
        }
      }
      #pie1, #pie2 {
        height: 240px;
      }
    }
  }

  /deep/ .el-date-picker {
    z-index: 10;
  }
  /deep/ .el-date-editor.el-input {
    width: auto;
  }
  /deep/ .el-date-editor.el-input {
    background-color: transparent;
  }
  /deep/ .el-input__inner {
    background-color: #85ACF7;
    border: none;
    font-size: 32px;
    color: #FFFFFF;
    text-align: center;
  }
  /deep/ .el-range-editor {
    width: 100%;
    padding: 0;
  }
  /deep/ .el-range-editor .el-range-input {
    border: none;
    background-color: #85ACF7;
    font-size: 32px;
    color: #FFFFFF;
    text-align: center;
  }
  /deep/ .el-date-editor .el-range-separator {
    width: 10%;
    color: #fff;
  }
  /deep/ .el-icon-date:before {
    display: none;
  }


</style>
