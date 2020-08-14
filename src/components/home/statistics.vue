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
              <div class="time_change" v-show="dateIndex == 1">
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
              <div class="time_change" v-show="dateIndex == 2">
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
              <div class="time_change" v-show="dateIndex == 3">
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
              <div class="time_change" v-show="dateIndex == 4">
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
              <div class="title">使用量统计</div>
              <div id="rectangle"></div>
            </div>
          </el-col>
          <el-col :span="7">
            <div class="liveInTable">
              <div class="title">账号统计</div>
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
                      <span>{{ scope.row.userName ? scope.row.userName : '未知账号' }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="amount"
                  label="房间数"
                  width="150">
                </el-table-column>
                <el-table-column
                  label="占比"  width="160">
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
                  <!--<div class="title_right">-->
                    <!--<el-button @click="printBtn"><img src="../../assets/ic_print.png" alt=""></el-button>-->
                  <!--</div>-->
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

        <!-- 打印-->
        <div class="printTig" ref="printTig">
          <div class="tig_title">自助机交易汇总</div>
          <div class="lists">
            <div class="list">
              <span class="name">门店名称：</span>
              <span class="value">{{ pieData.hotelName }}</span>
            </div>
            <div class="list">
              <span class="name">打印人：</span>
              <span class="value">{{ pieData.userName }}</span>
            </div>
            <div class="list">
              <span class="name">打印时间：</span>
              <span class="value">{{ datetimeparse(pieData.printTime, 'yy/MM/dd hh:mm') }}</span>
            </div>
            <div class="list">
              <span class="name">交易时间：</span>
              <span class="value">{{ dateIndex == 1 ? datetimeparse(pieData.inTime, 'yy/MM/dd') : datetimeparse(pieData.inTime, 'yy/MM/dd') + '-' + datetimeparse(pieData.outTime, 'yy/MM/dd') }}</span>
            </div>
          </div>
          <div class="lists">
            <div class="list">
              <span class="name">总交易金额：</span>
              <span class="value">¥{{ parseFloat(pieData.totalFee/100).toFixed(2) }}</span>
            </div>
            <div class="list">
              <span class="name">总交易笔数：</span>
              <span class="value">{{ pieData.weixinPayNum + pieData.aliPayNum }}笔</span>
            </div>
            <div class="list">
              <span class="name">支付宝支付：</span>
              <span class="value">¥{{ parseFloat(pieData.aliPayNum/100).toFixed(2)+'/'+pieData.aliPayNum }}笔</span>
            </div>
            <div class="list">
              <span class="name">微信支付：</span>
              <span class="value">¥{{ parseFloat(pieData.weixinPayFee/100).toFixed(2)+'/'+pieData.weixinPayNum }}笔</span>
            </div>
          </div>
          <div class="lists">
            <div class="list">
              <span class="name">总预授权金额：</span>
              <span class="value">¥{{ parseFloat(pieData.totalDepositFee/100).toFixed(2) }}</span>
            </div>
            <div class="list">
              <span class="name">总预授权笔数：</span>
              <span class="value">{{ pieData.weixinDepositNum + pieData.aliDepositNum }}笔</span>
            </div>
            <div class="list">
              <span class="name">支付宝支付：</span>
              <span class="value">¥{{ parseFloat(pieData.aliDepositFee/100).toFixed(2)+'/'+pieData.aliDepositNum }}笔</span>
            </div>
            <div class="list">
              <span class="name">微信支付：</span>
              <span class="value">¥{{ parseFloat(pieData.weixinDepositFee/100).toFixed(2)+'/'+pieData.weixinDepositNum }}笔</span>
            </div>
          </div>
        </div>
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
        dataList: [],         // 统计list
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
          hotelName: sessionStorage.hotel_Name,
          userName: sessionStorage.getItem('name'),
          printTime: new Date().getTime(),
          inTime: '',
          outTime: '',
        },    // pie data
        checkinData: {
          checkInCount: '',
          checkOutCount: ''
        },      // check in/out data
      }
    },
    filters: {

    },
    watch: {

    },
    methods: {
      ...mapActions(['payAnalysisPie', 'getStatisticNum']),

      // 选择日期tab
      dateTab(index) {
        this.dateIndex = index;
        if (index == 1 && this.dayTime === '') {
          this.dayTime = new Date().toLocaleDateString();
        }else if (index == 2 && this.weekTime === '') {
          this.weekTime = new Date();
        }else if (index == 3 && this.monthTime === '') {
          this.monthTime = new Date().toLocaleDateString();
        }else if (index == 4 && this.timeVal.length === 0) {
          this.timeVal.push(new Date().toLocaleDateString(), new Date().toLocaleDateString())
        }
        this.statisticNum();
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
        this.statisticNum();
        this.payAnalysis();
      },

      // pre Time
      preDay() {
        if (this.dateIndex == 1) {
          this.dayTime = new Date(new Date(this.dayTime).getTime() - 24 * 60 * 60 * 1000);
        }else if (this.dateIndex == 2) {
          this.weekTime = new Date(new Date(this.weekTime).getTime() - 24 * 60 * 60 * 1000 * 6);
        }else if (this.dateIndex == 3) {
          let nowdate = new Date(this.monthTime);
          nowdate.setMonth(nowdate.getMonth()-1);
          let y = nowdate.getFullYear();
          let m = nowdate.getMonth()+1;
          let d = nowdate.getDate();
          this.monthTime = new Date(y+'/'+m+'/'+d);
        }
        this.statisticNum();
        this.payAnalysis();
      },

      // next time
      nextDay() {
        if (this.dateIndex == 1) {
          this.dayTime = new Date(new Date(this.dayTime).getTime() + 24 * 60 * 60 * 1000);
        }else if (this.dateIndex == 2) {
          this.weekTime = new Date(new Date(this.weekTime).getTime() + 24 * 60 * 60 * 1000 * 6);
        }else if (this.dateIndex == 3) {
          let nowdate = new Date(this.monthTime);
          nowdate.setMonth(nowdate.getMonth()+1);
          let y = nowdate.getFullYear();
          let m = nowdate.getMonth()+1;
          let d = nowdate.getDate();
          this.monthTime = new Date(y+'/'+m+'/'+d);
        }
        this.statisticNum();
        this.payAnalysis();
      },

      // 打印
      printBtn() {
        this.$print(this.$refs.printTig);
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
              "show": false,
            },
            axisTick: {
              show: false
            },
            "axisLabel": {
              margin: 14,
              textStyle: {
//                color: '#333',
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
              barWidth: 120,
              label: {
                show: true,
                position: 'top',
                textStyle: {
                  color: '#888',
                  fontSize: 24
                }
              },
              data:[
                {
                  value: this.checkinData.checkInCount ? this.checkinData.checkInCount : 0,
                  itemStyle:{
                    normal:{ color: '#669BFF'}
                  }
                },
                {
                  value: this.checkinData.checkOutCount ? this.checkinData.checkOutCount : 0,
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
        this.statisticNum();
        this.payAnalysis();
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
              radius: ['38%', '68%'],
              center: ['50%', '65%'],
              color:['#5690FF','#61E2B4'],
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
                    return '{b|'+params.data.name+'}  {ped|'+params.data.total+'笔 }\n {c|¥'+params.data.value+'\n\n\n\n}'
                  },
                  borderWidth: 20,
                  borderRadius: 4,
                  padding: [0, -80],
                  rich: {
                    a: {
                      color: '#5690FF',
                      fontSize: 24,
                      lineHeight: 20
                    },
                    b: {
                      fontSize: 24,
                      lineHeight: 36,
                      align: 'left'
                    },
                    c: {
                      fontSize: 24,
                      color: '#888888',
                      align: 'left'
                    },
                    ped: {
                      fontSize: 24,
                      lineHeight: 36,
                      align: 'left'
                    },
                  }
                }
              },
              data: [
                {
                  value: this.pieData.aliPayFee ? parseFloat(this.pieData.aliPayFee/100).toFixed(2) : 0,
                  name: '支付宝',
                  total: this.pieData.aliPayNum,
                },
                {
                  value: this.pieData.weixinPayFee ? parseFloat(this.pieData.weixinPayFee/100).toFixed(2) : 0,
                  name: '微信',
                  total: this.pieData.weixinPayNum
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
              radius: ['38%', '68%'],
              center: ['50%', '65%'],
              color:['#5690FF','#61E2B4'],
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
                    return '{b|'+params.data.name+'}  {ped|'+params.data.total+'笔 }\n {c|¥'+params.data.value+'\n\n\n\n}'
                  },
                  borderWidth: 20,
                  borderRadius: 4,
                  padding: [0, -80],
                  rich: {
                    a: {
                      color: '#5690FF',
                      fontSize: 26,
                      lineHeight: 20
                    },
                    b: {
                      fontSize: 26,
                      lineHeight: 36,
                      align: 'left'
                    },
                    c: {
                      fontSize: 26,
                      color: '#888888',
                      align: 'left'
                    },
                    ped: {
                      fontSize: 26,
                      lineHeight: 36,
                      align: 'left'
                    },
                  }
                }
              },
              data: [
                {
                  value: this.pieData.aliDepositFee ? parseFloat(this.pieData.aliDepositFee/100).toFixed(2) : 0,
                  name: '支付宝',
                  total: this.pieData.aliDepositNum,
                },
                {
                  value: this.pieData.weixinDepositFee ? parseFloat(this.pieData.weixinDepositFee/100).toFixed(2) : 0,
                  name: '微信',
                  total: this.pieData.weixinDepositNum
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
          endTime = new Date(this.timeVal[1]).getTime();
        }
        let data = {
          startTime: startTime,
          endTime: endTime
        };
        this.payAnalysisPie({
          data: data,
          onsuccess: body => {
            if (body.data.code == 0) {
              this.pieData.totalFee = body.data.data.totalFee;
              this.pieData.weixinPayNum = body.data.data.weixinPayNum;
              this.pieData.weixinPayFee = body.data.data.weixinPayFee;
              this.pieData.aliPayNum = body.data.data.aliPayNum;
              this.pieData.aliPayFee = body.data.data.aliPayFee;
              this.pieData.totalDepositFee = body.data.data.totalDepositFee;
              this.pieData.weixinDepositNum = body.data.data.weixinDepositNum;
              this.pieData.weixinDepositFee = body.data.data.weixinDepositFee;
              this.pieData.aliDepositNum = body.data.data.aliDepositNum;
              this.pieData.aliDepositFee = body.data.data.aliDepositFee;
              this.pieData.inTime = startTime;
              this.pieData.outTime = endTime;
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

      // 人员，使用量统计
      statisticNum() {
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
          endTime = new Date(this.timeVal[1]).getTime();
        }
        let data = {
          beginDate: startTime,
          endDate: endTime
        };
        if (this.liveIndex != 0) {
            data.orderType = this.liveIndex == 1 ? 2 : this.liveIndex == 2 ? 1 : 0
        }
        this.getStatisticNum({
          data: data,
          onsuccess: body => {
              if (body.data.code == 0) {
                this.checkinData.checkInCount = body.data.data.checkInCount;
                this.checkinData.checkOutCount = body.data.data.checkOutCount;
                this.dataList = body.data.data.statisticVoList ? body.data.data.statisticVoList : [];
                this.echartsRectangle();
              }
          },
          onfail: body => {

          },
          onerror: body => {

          }
        })
      },

    },
    beforeMount () {
      this.loadingShow = true;
      this.dateTab(1);
    },
    mounted () {

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
        font-size: 26px;
        color: #FFFFFF;
        margin-bottom: 42px;
        text-align: left;
        font-weight: bold;
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
          font-size: 20px;
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
      padding-bottom: 34px;
      .title {
        padding: 57px 0 57px 52px;
        text-align: left;
        font-size: 26px;
        color: #333333;
        font-weight: bold;
      }
      #rectangle {
        height: 300px;
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
        font-size: 26px;
        color: #333333;
        font-weight: bold;
      }
      .tabs {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: flex-start;
        padding-left: 50px;
        margin-bottom: 40px;
        span {
          background: #F7F7F7;
          border-radius: 25px;
          margin-right: 16px;
          padding: 11px 21px;
          font-size: 20px;
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
        padding: 30px 0;
        font-size: 24px;
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
        font-size: 22px;
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
        font-size: 24px;
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
            font-size: 26px;
            color: #888;
            margin-bottom: 6px;
            font-weight: bold;
          }
          .value {
            font-size: 38px;
            color: #333333;
            font-weight: bold;
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

  .printTig {
    display: none;
    .tig_title {
      text-align: center;
      padding: 20px 0;
      color: #000;
      font-size: 18px;
    }
    .lists {
      border-bottom: 1px solid #eee;
      padding: 20px 0;
      .list {
        padding: 0 10px;
        margin-bottom: 15px;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .list:last-of-type {
        margin-bottom: 0;
      }
    }
    .lists:last-of-type {
      border-bottom: none;
    }
  }

  @media print {
    .printTig {
      display: block;
    }
    .tig_title {
      text-align: center;
    }
  }

  @page {
    size: auto;
    margin: 0;
    padding: 0;
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
    font-size: 24px;
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
    font-size: 24px;
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
  /deep/ .el-input__icon {
    display: none;
  }
  /deep/ .el-table--scrollable-y .el-table__body-wrapper::-webkit-scrollbar {
    display: none;
  }


</style>
