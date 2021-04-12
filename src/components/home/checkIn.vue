<template>
  <div>
    <div class="checkIn" v-show="checkInShow">
      <div class="check_fl">
        <div class="check_fl_content">
          <div class="goback">
            <div @click="gobanck">
              <img src="../../assets/ic_back.png" alt="">
              <span>返回</span>
            </div>
          </div>
          <div class="checkInChange">
            <div class="checkIn_header">
              <div class="order_info">
                <div class="order_person">
                  <span class="name">预订人</span>
                  <span class="value">{{ changeItem.owner }} {{ changeItem.ownerTel }}</span>
                </div>
                <div class="order_remark">
                  <span class="name">备&nbsp;&nbsp;&nbsp;注</span>
                  <span class="value">
                    <span class="remark_content">{{ changeItem.remark ? cutstr(changeItem.remark, 42) : '-' }}</span>
                    <span class="remarkLook" @click="remarkLook" v-if="changeItem.remark && changeItem.remark.length >= 42">查看更多</span>
                  </span>
                </div>
              </div>
            </div>
            <div class="h6"></div>
            <div class="checkIn_content checkIn_content1" v-if="changeItem.type == 0">
              <div class="checkIn_money">
                <span class="money_list">
                  <span class="name">总房费</span>
                  <span class="value">¥{{(changeItem.totalfee/100).toFixed(2)}}</span>
                </span>
              </div>
              <div class="lists">
                <div class="list">
                  <div class="title">请选择支付方式</div>
                  <div class="tabs">
                    <div class="item_tab" @click="changePayStatus(0)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="payStatus == 0">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span :class="payStatus == 0 ? 'active' : ''">已预付</span>
                    </div>
                    <div class="item_tab" @click="changePayStatus(1)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="payStatus == 1">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span :class="payStatus == 1 ? 'active' : ''">统一支付</span>
                    </div>
                    <div class="item_tab" @click="changePayStatus(2)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="payStatus == 2">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span :class="payStatus == 2 ? 'active' : ''">分房支付</span>
                    </div>
                  </div>
                </div>
                <div class="h6"></div>
                <div class="list">
                  <div class="title">请选择入住配置</div>
                  <div class="tabs">
                    <div class="item_tab" @click="changeStatus(1)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="isfaka">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span :class="isfaka ? 'active' : ''">发卡</span>
                    </div>
                    <div class="item_tab" @click="changeStatus(2)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="isrcpdf">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span :class="isrcpdf ? 'active' : ''">RC单</span>
                    </div>
                    <div class="item_tab" @click="changeStatus(3)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="isphone">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span :class="isphone ? 'active' : ''">房间手机号</span>
                    </div>
                  </div>
                </div>
                <div class="h6"></div>
                <div class="list">
                  <div class="title"><span>应付押金</span></div>
                  <div class="tabs">
                    <div class="item_tab" @click="changeFreeDeposit(1)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="isFreeDeposit == 1">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span :class="isFreeDeposit == 1 ? 'active' : ''">不收押金</span>
                    </div>
                    <div class="item_tab" @click="changeFreeDeposit(2)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="isFreeDeposit == 2">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span :class="isFreeDeposit == 2 ? 'active' : ''">收押金</span>
                    </div>
                    <div class="item_tab"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="checkIn_content checkIn_content_" v-else>
              <div class="lists1">
                <div class="list">
                  <div class="title"><span>总房费</span><span>¥{{(roomFeeShow/100).toFixed(2)}}</span></div>
                </div>
                <div class="list">
                  <div class="title"><span>入账房费</span><span>¥{{((parseFloat(paidFeeShow))/100).toFixed(2)}}</span></div>
                </div>
              </div>
              <div class="h6"></div>
              <div class="lists">
                <div class="list">
                  <div class="title"><span>应付房费</span><span class="value">¥{{(needPayRoomFeeShow/100).toFixed(2)}}</span></div>
                  <div class="tabs"  v-if="needPayRoomFeeShow != 0">
                    <div class="item_tab" @click="payModeChange(2)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="payMode == 2">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span :class="payMode == 2 ? 'active' : ''">已预付</span>
                    </div>
                    <div class="item_tab" @click="payModeChange(3)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="payMode == 3">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span :class="payMode == 3 ? 'active' : ''">挂账</span>
                    </div>
                    <div class="item_tab" @click="payModeChange(1)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="payMode == 1">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span :class="payMode == 1 ? 'active' : ''">在线收款</span>
                    </div>
                  </div>
                </div>
                <div class="list">
                  <div class="title"><span>应付押金</span><span class="value">¥{{(cashFee/100).toFixed(2)}}</span></div>
                  <div class="tabs" v-if="cashFee != 0">
                    <div class="item_tab" @click="changeFreeDeposit(1)">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="cashFeeTrue || isFreeDeposit == 1">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span :class="(cashFeeTrue || isFreeDeposit == 1) ? 'active' : ''">不收押金</span>
                    </div>
                    <div class="item_tab" @click="changeFreeDeposit(2)"  v-if="!cashFeeTrue">
                      <img src="../../assets/xuanzhongle.png" alt="" v-if="isFreeDeposit == 2">
                      <img src="../../assets/weixuan.png" alt="" v-else>
                      <span :class="isFreeDeposit == 2 ? 'active' : ''">收押金</span>
                    </div>
                    <div class="item_tab"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="check_fr">
        <div class="check_fr_content" ref="checkFr">
          <div class="tabs" ref="tabs">
            <span :class="tabIndex_ == -1 ? 'tab active' : 'tab'" @click="roomTypeChange(-1)">全部</span>
            <span  v-for="(item, index) in rooms" :class="tabIndex_ == index ? 'tab active' : 'tab'" @click="roomTypeChange(index)">
            {{ item.roomTypeName }}({{ item.count }})
            </span>
          </div>
          <div class="roomLists">
            <div class="lists" ref="roomList">
              <el-row :gutter="38">
                <el-col :span="8" v-for="(item, index) in rooms_" v-bind:key="index" class="list">
                  <div class="list_lis">
                    <div class="list_title">
                      <span>{{ item.roomNo ? item.roomNo : '待排房' }}</span>
                    </div>
                    <div class="list_content">
                      <div class="li">
                        {{ datetimeparse(item.inTime, "MMDD") | timeChange }}{{ item.inTime | isToday }}-{{ datetimeparse(item.outTime, "MMDD") | timeChange }}
                    </div>
                      <div class="li">
                        {{ item.breakfast == 0 ? '无早' : '早餐×' + item.breakfast }}
                      </div>
                    </div>
                    <i v-if="item.dirtyRoom" class="dirtyRoom">脏</i>
                  </div>
                </el-col>
              </el-row>
            </div>
            <div class="scrollTip" v-if="scrollTip && rooms_.length >= 6">上拉加载更多</div>
          </div>
          <div class="btns" v-if="changeItem.type == 0">
            <!--<button type="info" class="printBtn" @click="printTipShow">打印二维码</button>-->
            <el-button type="primary" class="checkInBtn" :loading="loadingSure" @click="checkIn()">开始办理</el-button>
          </div>
          <div class="btns" v-else>
            <el-button type="primary" class=" checkInBtn" round :loading="loadingSure" @click="checkIn()" v-if="changeItem.type == 1 && payMode != 0">开始办理</el-button>
            <el-button type="primary" class="checkInBtn" round :loading="loadingSure" v-else-if="changeItem.type == 1 && payMode == 0">开始办理</el-button>
          </div>
        </div>
        <div class="roomsData" v-if="!roomsDataLate">正在获取房间列表，请稍后...</div>
      </div>
      <loadingList v-if="loadingShow" :loadingText="loadingText"  style="width: 100vw"></loadingList>

      <!-- 团队二维码-->
      <div class="bodyContent" ref="print">
        <div class="li" v-for="(item, index) in dataCode.subOrderVos" >
          <p class="page">#{{index+1}}</p>
          <div class="pageTitle">入住码</div>
          <div class="content">
            <div class="lists">
              <div class="list">
                <span>团队名称：</span>
                <span>{{dataCode.owner}}</span>
              </div>
              <div class="list">
                <span>入住房型：</span>
                <span>{{item.roomTypeName}}</span>
              </div>
              <div class="list">
                <span>入住时间：</span>
                <span style="font-size: 16px">{{ datetimeparse(item.inTime, 'yy/MM/dd')}}</span>
              </div>
            </div>
            <div :id="'qrcode'+index" class="qrcode"></div>
            <div class="tig">
              <p>温馨提示</p>
              <p>本二维码请在自助设备办理入住时使用，需入住日期当日使用，过期无效</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 选择打印类型-->
      <div class="printTip" v-if="printTip">
        <div class="shadow"></div>
        <div class="tip_content">
          <div class="title">请选择打印类型</div>
          <div class="lists">
            <div class="list" v-for="item in tipLists">
              <el-radio v-model="tipStatus" :label="item.id" border size="medium">{{ item.label }}</el-radio>
            </div>
          </div>
          <div class="btns">
            <button type="info" @click="tipCancel">取消</button>
            <el-button type="primary" @click="doPrint()">确认</el-button>
          </div>
        </div>
      </div>

      <!-- 订单备注tip-->
      <div class="remarkTip" v-if="remarkTip">
        <div class="shadow"></div>
        <div class="tip_content">
          <div class="title">订单备注</div>
          <div class="lists">
            {{ changeItem.remark }}
          </div>
          <div class="btns">
            <button type="primary" @click="tipCancel">我知道了</button>
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
  import QRCode from 'qrcodejs2'
  export default {
    components: {ElCol, loadingList},
    name: 'checkIn',
    data () {
      return {
        loadingShow: false,  // loading
        loadingText: '加载中...', // loading text
        payStatus: -1,    // 支付方式
        payStatus_: -1,   // 临时
        isfaka: false,   // 是否发卡
        isfaka_: false,   // 临时
        isrcpdf: false,  // 是否需要RC单
        isrcpdf_: false,  // 临时
        isphone: false,  // 是否需要手机号
        isphone_: false,  // 临时
        loadingCancel: false, // 取消办理按钮加载状态
        loadingSure: false,  // 办理入住按钮加载状态
        changeItem: '',   // 临时数据
        checkInShow: false,  // 模块显示隐藏
        roomFeeShow: 0,  // 总房费
        needPayRoomFeeShow: 0,  // 应付房费
        paidFeeShow: 0,  // 已付房费
        cashFee: 0,      // 押金
        cashFeeTrue: false,  // 判断是否有无押金配置
        isFreeDeposit: 1,
        payMode: 0,  // 判断房费支付状态
        payMode_: 0, // 临时的
        cardShow: false,  // 发卡dab权限
        rcShow: false,    // rc单dab权限
        tabIndex_: -1,    // 房型选择
        rooms: [],  // 房间号列表
        rooms_: [],   // 房间list过滤
        dataCode: [],   // 二维码列表
        roomsDataLate: false,
        scrollTip: true,    // 上拉加载更多tip
        printTip: false,     // 打印二维码选择tip
        tipStatus: 1,        // 打印选择
        tipLists: [
          {
            id: 1,
            label: '订单二维码'
          },
          {
            id: 2,
            label: '房间二维码'
          }
        ],       // 打印tip
        remarkTip: false,    // 订单备注tip
        androidScreen: false,   // 判断是否是Android的双屏
      }
    },
    filters: {
      timeChange: function(value) {
        return value.split('/')[0] + '.' + value.split('/')[1]
      },
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
         'getcodeList', 'checkInTeamGetOptions', 'checkInTeamPostOptions', 'getOrderFree', 'updatePaidMode', 'cardRule', 'getRooms'
      ]),

      // 查看备注
      remarkLook() {
          this.remarkTip = true;
      },

      // tip cancel
      tipCancel() {
          this.printTip = false;
          this.remarkTip = false;
          this.tipStatus = 1;
      },

      doPrint() {
        this.$print(this.$refs.print);
      },

      // 返回上一页
      gobanck() {
//        this.$router.go(-1);
        this.$router.replace({name:'order'})
      },

      // 选择支付方式
      changePayStatus(index) {
          this.payStatus_ = index;
          this.checkCommon();
      },

      // 房型选择
      roomTypeChange(num) {
          this.tabIndex_ = num;
          let arr = [];
          if (this.rooms.length != 0) {
            this.rooms.forEach(item => {
                if (item.roomList) {
                    item.rooms.forEach(i => {
                        if (num == -1) {
                          arr.push(i);
                        }else {
                          if (i.roomTypeName == this.rooms[num].roomTypeName) {
                            arr.push(i);
                          }
                        }
                    })
                }
            });
            if (arr.length != 0) {
                this.rooms_ = this.sortBykey(arr, 'roomNo');
            }else {
                this.rooms_ = [];
            }
            console.log('this.rooms_', this.rooms_);
            this.$nextTick(() => {
                this.$refs.roomList.style.height = (this.$refs.checkFr.offsetHeight - this.$refs.tabs.offsetHeight - 246) + 'px';
                this.$refs.roomList.addEventListener('scroll', () => {
                    if (this.$refs.roomList.scrollTop == 0) {
                        this.scrollTip = true;
                    }else {
                        this.scrollTip = false
                    }
                })
            })
          }
      },

      // 排序
      sortBykey(ary, key) {
        return ary.sort(function (a, b) {
          let x = a[key];
          let y = b[key];
          return ((x < y) ? -1 : (x > y) ? 1 : 0)
        })
      },

      // 办理选择
      changeStatus(type) {
        if (type == 1) {
          this.isfaka_ = !this.isfaka;
        }else if (type == 2) {
          this.isrcpdf_ = !this.isrcpdf;
        }else {
          this.isphone_ = !this.isphone;
        }
        this.checkCommon();
      },

      // 房费更改
      payModeChange(index) {
        this.payMode_ = index;
        this.checkCommon();
      },

      // 选择是否免押金
      changeFreeDeposit(num) {
        if (num == 1) {
          this.changeItem.isFreeDeposit = true;
        }else {
          this.changeItem.isFreeDeposit = false;
        }
        this.isFreeDeposit = num;
        this.checkCommon();
      },

      // 打印二维码tip show
      printTipShow() {
          this.printTip = true;
      },

      // 开始办理
      checkIn() {
        if (this.changeItem.type == 0) {
          this.SendTeamOrderMsg(this.changeItem.id, this.changeItem.subOrderId, this.isfaka, this.isrcpdf, this.isphone, false);
        }else {
          this.SendParameter(this.changeItem.id);
        }
        this.gobanck();
      },

      // 状态修改common
      checkCommon() {
        if (this.changeItem.type == 0) {
          this.checkInTeamPostOptions({
            data: {
              orderId: this.$route.params.id,
              sendCard: this.isfaka_,
              printRc: this.isrcpdf_,
              needMobile: this.isphone_,
              hotelId: sessionStorage.hotel_id,
              payAll: this.payStatus_ == 1 ? true : false,
              needPay: this.payStatus_ != 0 ? true : false,
              deposit: this.isFreeDeposit == 2 ? true : false,
            },
            onsuccess: body => {
              if (body.data.code == 0) {
                if (body.data.data) {
                  this.payStatus = this.payStatus_;
                  this.isphone = this.isphone_;
                  this.isrcpdf = this.isrcpdf_;
                  this.isfaka = this.isfaka_;
                }else {
                  this.$toast({
                    message: '修改失败',
                    iconClass: 'icon ',
                  });
                }
              }
            },onfail: body => {
            },
            onerror: body => {
            }
          });
        }else {
          this.updatePaidMode({
            orderId: this.changeItem.id,
            isFreeDeposit: this.isFreeDeposit == 1 ? true : false,
            modeId: this.payMode_,
            onsuccess: body => {
              if (body.data.code == 0) {
                  if (body.data.data) {
                    this.payMode = this.payMode_;
                  }else {
                    this.$toast({
                      message: '修改失败',
                      iconClass: 'icon ',
                    });
                  }
              }
            },
            onfail: (body, headers) => {
            },
            onerror: body => {
            }
          });
        }
      },

      SendParameter(type) {
        if (this.androidScreen) {
          jsObj.SendMessage(type);
        }else {
          jsObj.sendParameter = new Date().getSeconds() + "@SendMessage@" + type + '';
          jsObj.SendMessage();
        }
      },

      SendTeamOrderMsg(orderId, subOrderId, fakaStatus, rcStatus, phoneStatus, status) {
        if (this.androidScreen) {
          jsObj.SendTeamOrderMessage(orderId, subOrderId, fakaStatus, phoneStatus, rcStatus, status);
        }else {
          jsObj.sendParameter = new Date().getSeconds() + "@SendTeamOrderMessage@" + orderId + '@' + subOrderId + '@' + fakaStatus + '@' + phoneStatus + '@' + rcStatus + '@' + status;
          jsObj.SendTeamOrderMessage();
        }
      },

      // 初始化获取设置列表
      getCheckList() {
          this.checkInTeamGetOptions({
            orderId: this.$route.params.id,
            onsuccess: body => {
              this.$emit('checkOutLoading', 1);
              if (body.data.code == 0) {
                 if (body.data.data != null) {
                    this.isfaka = body.data.data.sendCard ? body.data.data.sendCard : false;
                    this.isrcpdf = body.data.data.printRc ? body.data.data.printRc : false;
                    this.isphone = body.data.data.needMobile ? body.data.data.needMobile : false;
                    this.payStatus = body.data.data.needPay ? body.data.data.payAll ? 1 : 2 : 0;
                    this.isFreeDeposit = body.data.data.deposit ? 2 : 1;
                    this.isfaka_ = this.isfaka;
                    this.isrcpdf_ = this.isrcpdf;
                    this.isphone_ = this.isphone;
                    this.payStatus_ = this.payStatus;
                 }
              }
              this.checkInShow = true;
//              this.loadingShow = false;
            },onfail: body => {
              this.checkInShow = true;
              this.loadingShow = false;
              this.$emit('checkOutLoading', 1);
            },
            onerror: error => {
              this.checkInShow = true;
              this.loadingShow = false;
              this.$emit('checkOutLoading', 1);
            }
          })
      },

      // 散客
      getOrderFreeList() {
        this.getOrderFree({
          data: {
            orderId: this.changeItem.id
          },
          onsuccess: body => {
            this.$emit('checkOutLoading', 1);
            console.log('body.code',body.data);
            if (body.data.code == 0) {
//              this.loadingShow = false;
              if (body.data.data.cashFeeShow == '免押') {
                this.cashFee = 0;
                this.cashFeeTrue = true;
                this.isFreeDeposit = 1;
              }else {
                this.cashFeeTrue = false;
                this.cashFee = body.data.data.cashFeeShow;
                this.isFreeDeposit = 2;
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
              this.paidFeeShow = body.data.data.paidFeeShow;
              this.needPayRoomFeeShow = parseFloat(this.roomFeeShow) - parseFloat(this.paidFeeShow);
              if (this.needPayRoomFeeShow < 0) {
                this.needPayRoomFeeShow = 0;
              }
              this.payMode = body.data.data.payMode != null ? body.data.data.payMode : 0;
              this.payMode_ = this.payMode;
              this.checkInShow = true;
            }else {
              this.checkInShow = true;
//              this.loadingShow = false;
            }
          },
          onfail: (body, headers) => {
            this.$emit('checkOutLoading', 1);
            this.checkInShow = true;
            this.loadingShow = false;
          },
          onerror: body => {
            this.$emit('checkOutLoading', 1);
            this.loadingShow = false;
          }
        });
      },

      // 获取权限
      getCard(cardStatus) {
        this.cardRule({
          cardStatus: cardStatus,
          onsuccess: body => {
            if (cardStatus == 'support_room_card' && body.data.code == 0 && body.data.data == 'true') {
                this.cardShow = true;
            }
            if (cardStatus == 'rc_status' && body.data.code == 0 && body.data.data == 'true') {
                this.rcShow = true;
            }
          }
        })
      },

      // 展开隐藏房号列表
      roomListShow(item) {
        item.roomList = !item.roomList;
      },

      // 获取房间号列表
      getRoomsList() {
        this.getRooms({
          orderId: this.changeItem.id,
          onsuccess: body => {
            if (body.data.code == 0 && body.data.data) {
              body.data.data.forEach((item, index) => {
                item.roomList = true;
              });
              this.roomsDataLate = true;
              this.rooms = body.data.data;
              this.roomTypeChange(-1);
            }
            this.checkInShow = true;
            this.loadingShow = false;
          },
          onfail: body => {
            this.loadingShow = false;
            this.checkInShow = true;
          },
          onerror: body => {
            this.loadingShow = false;
            this.checkInShow = true;
          }
        })
      },

      // 打印二维码获取列表
      getCode() {
        this.getcodeList({
          orderId: this.$route.params.id,
          onsuccess: body => {
            if (body.data.code == 0) {
              this.dataCode = body.data.data;
              if(this.dataCode.subOrderVos) {
                this.$nextTick(() => {
                  this.dataCode.subOrderVos.forEach((item, index) => {
                    let qrcode = new QRCode("qrcode"+index+"");
                    qrcode.makeCode('td;'+item.orderId+';'+item.id);
                  });
                })
              }
            }
          }
        })
      },

    },

    mounted () {
      this.loadingShow = true;
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
      this.checkInShow = false;
      this.getCard('support_room_card');
      this.getCard('rc_status');
      this.changeItem = JSON.parse(sessionStorage.getItem('changeItem'));
      this.roomsDataLate = false;
      this.getRoomsList();
      if (this.changeItem.type == 0) {
        if (this.changeItem.isFreeDeposit) {
          this.isFreeDeposit = 1;
        }else {
          this.isFreeDeposit = 2;
        }
        this.getCheckList();
//        this.getCode();
      }else {
        this.getOrderFreeList();
      }
    },
    beforeRouteLeave (to, from, next) {
      this.loadingShow = false;
      next();
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">

  .checkIn {
    width: 100vw;
    padding-top: 120px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    .check_fl {
      padding: 0 10px 0 40px;
      width: 818px;
      .bgCheckTop {
        height: 20px;
        background-color: #DEE7F8;
      }
      .check_fl_content {
        width: 100%;
        height: calc(100vh - 140px);
        box-shadow: 0 8px 16px 0 rgba(0,0,0,0.10);
        background-color: #fff;
        border-radius: 16px 0 0 16px;
        .goback {
          padding-left: 56px;
          text-align: left;
          position: relative;
          div {
            padding: 42px 0;
            display: inline-flex;
            align-items: center;
            img {
              width: 18px;
              height: 22px;
              display: inline-flex;
              margin-right: 7px;
            }
            span {
              color: #888;
              font-size: 20px;
            }
          }
          .doPrint {
            background: none;
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            font-size: 26px;
            color: #1AAD19;
            border: none;
            cursor: pointer;
          }
        }
        .checkInChange {
          .checkIn_header {
            padding: 0 50px;
            text-align: left;
            .order_info {
              padding: 18px 0 10px 10px;
              .order_person, .order_remark {
                display: inline-flex;
                align-items: flex-start;
                justify-content: flex-start;
                margin-bottom: 30px;
                width: 100%;
                .name {
                  font-size: 20px;
                  color: #888888;
                  margin-right: 28px;
                  width: 84px;
                }
                .value {
                  font-size: 20px;
                  color: #333333;
                  width: calc(100% - 76px);
                  span.remark_content {
                    overflow : hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                  }
                  span.remarkLook {
                    color: #1BAC18;
                    cursor: pointer;
                  }
                }
              }
            }
          }
          .h6 {
            width: 100%;
            height: 6px;
            background: #F7F7F7;
          }
          .checkIn_content {
            padding: 40px 0;
            .checkIn_money {
              padding: 8px 62px 0 57px;
              .money_list {
                border-bottom: 1px solid #EEEEEE;
                padding-bottom: 30px;
                display: flex;
                width: 100%;
                align-items: center;
                justify-content: flex-start;
                .name {
                  font-size: 20px;
                  color: #888888;
                  margin-right: 19px;
                }
                .value {
                  font-size: 20px;
                  color: #333333;
                }
              }
            }
            .lists1 {
              display: flex;
              align-items: center;
              justify-content: flex-start;
              padding: 0 60px;
              .list {
                display: flex;
                align-items: center;
                margin-bottom: 40px;
                .title {
                  color: #303133;
                  font-weight: bold;
                  font-size: 20px;
                  color: #333333;
                  text-shadow: 0 2px 3px rgba(0, 0, 0, 0.04);
                  text-align: left;
                  span:first-of-type {
                    display: inline-block;
                    font-size: 20px;
                    color: #888888;
                    font-weight: normal;
                  }
                }
              }
              .list:first-of-type {
                margin-right: 100px;
              }
            }
            .lists {
              .list {
                padding: 38px 0 58px;
                .title {
                  font-size: 20px;
                  color: #888888;
                  padding-left: 60px;
                  text-align: left;
                  .value {
                    font-weight: bold;
                    font-size: 20px;
                    color: #333333;
                  }
                }
                .tabs {
                  padding: 0 60px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-top: 25px;
                  .item_tab {
                    position: relative;
                    font-size: 20px;
                    color: #888;
                    line-height: 80px;
                    height: 80px;
                    width: 182px;
                    text-align: center;
                    img {
                      position: absolute;
                      z-index: 1;
                      width: 182px;
                      height: 80px;
                      left: 0;
                      top: 0;
                    }
                    span {
                      position: absolute;
                      left: 50%;
                      top: 50%;
                      z-index: 2;
                      transform: translate(-50%, -50%);
                      width: 100%;
                      display: block;
                    }
                    span.active {
                      color: #1BAC18;
                      font-weight: bold;
                    }
                  }
                }
              }
            }
            .btns {
              padding: 0 60px;
              text-align: left;
              .el-button {
                width: 390px;
                height: 80px;
                border-radius: 50px;
                font-size: 20px;
                color: #fff;
                -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
              }

              .btn_button_danger {
                background-color: #F5222D;
                margin-right: 60px;
              }

              .btn_button_primary {
                background-color: #1AAD19;
              }
              .el-button--primary {
                background-color: #1AAD19;
              }
              .tig_info {
                background-color: #d7d7d7;
                color: #a4a4a4;
                border: none;
              }
            }
          }
          .checkIn_content1 {
            padding: 22px 0;
            .lists {
              .list {
                padding: 25px 0;
              }
            }
          }
        }
      }
    }
    .check_fr {
      width: calc(100vw - 828px);
      padding-right: 40px;
      position: relative;
      .check_fr_content {
        height: calc(100vh - 140px);
        border-radius: 0 16px 16px 0;
        background-color: #fff;
        .tabs {
          padding: 40px 84px;
          text-align: left;
          .tab {
            font-size: 20px;
            color: #888888;
            margin-right: 60px;
          }
          .active {
            color: #1BAC18;
            font-weight: bold;
          }
        }
        .roomLists {
          padding: 26px 84px 60px;
          position: relative;
          .lists {
            height: calc(100vh - 508px);
            overflow-y: scroll;
            -webkit-overflow-scrolling: touch;
            .list {
              .list_lis {
                background: #F7F7F7;
                border-radius: 16px;
                padding: 22px 23px 25px;
                position: relative;
                margin-bottom: 24px;
                .list_title {
                  font-weight: bold;
                  font-size: 28px;
                  color: #1BAC18;
                  text-align: left;
                }
                .list_content {
                  margin-top: 9px;
                  .li {
                    margin-top: 7px;
                    font-size: 20px;
                    color: #888888;
                    text-align: left;
                  }
                }
                .dirtyRoom {
                  position: absolute;
                  right: 0;
                  top: 0;
                  background: #FF5870;
                  border-radius: 0 16px 0 16px;
                  width: 46px;
                  height: 41px;
                  text-align: center;
                  line-height: 41px;
                  font-size: 20px;
                  color: #FFFFFF;
                }
              }
            }
          }
          .scrollTip {
            position: absolute;
            bottom: 15px;
            left: 50%;
            transform: translateX(-50%);
            color: #888;
            font-size: 20px;
          }
        }
        .btns {
          padding: 30px 84px 50px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          .printBtn {
            background: #FFFFFF;
            border: none;
            box-shadow: 0 2px 13px 0 rgba(0,0,0,0.08);
            border-radius: 60px;
            width: 400px;
            height: 68px;
            font-size: 24px;
            color: #666666;
            letter-spacing: 4px;
            outline: none;
          }
          .checkInBtn {
            outline: none;
            width: 400px;
            height: 68px;
            background: #1BAC18;
            border-radius: 60px;
            font-size: 24px;
            color: #FFFFFF;
            letter-spacing: 4px;
            margin: 0 auto;
          }
        }
      }
      .roomsData {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        color: #303133;
        font-size: 24px;
        width: 100%;
      }
    }
    .roomLists .lists::-webkit-scrollbar {
      display: none; // 隐藏滚动条
    }
    .bodyContent {
      display: none;
    }
    .printTip {
      .shadow {
        position: fixed;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .6);
      }
      .tip_content {
        background: #FFFFFF;
        border-radius: 13.2px;
        width: 750px;
        padding: 67px 74px 60px;
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 12;
        .title {
          font-size: 28px;
          color: #333333;
          letter-spacing: 3.27px;
          margin-bottom: 71px;
        }
        .lists {
          padding: 0 9px;
          .list {
            margin-bottom: 23px;
            /deep/ .el-radio.is-bordered {
              padding: 35px 72px 39px;
              background: #F7F7F7;
              border-radius: 10.4px;
              height: auto;
              width: 100%;
              text-align: left;
            }
            /deep/ .el-radio__label {
              font-size: 20px;
              letter-spacing: 2px;
              color: #666666;
              margin-left: 42px;
            }
            /deep/ label {
              display: flex;
              align-items: center;
            }
            /deep/ .el-radio--medium.is-bordered .el-radio__inner {
              width: 27px;
              height: 27px;
            }
            /deep/ .el-radio.is-bordered.is-checked {
              border: 1px solid #1AAD19;
              color:  #1AAD19;
              background: #F5FFF5;
            }
            /deep/ .el-radio__input.is-checked .el-radio__inner {
              background: #1AAD19;
              border-color: #1AAD19;
            }
            /deep/ .el-radio__input.is-checked+.el-radio__label {
              color:  #1AAD19;
            }
          }
        }
        .btns {
          margin-top: 80px;
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          button {
            width: 278px;
            height: 68px;
            border-radius: 45px;
            font-size: 24px;
            letter-spacing: 4.04px;
            border: none;
            outline: none;
          }
          button:first-of-type {
            background: #EEEEEE;
            color: #666666;
          }
          button:last-of-type {
            background: #1AAD19;
            box-shadow: 0 3px 16px 0 rgba(26,173,25,0.64);
            color: #FFFFFF;
          }
        }
      }
    }
    .remarkTip {
      .shadow {
        position: fixed;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .6);
      }
      .tip_content {
        background: #FFFFFF;
        border-radius: 13.2px;
        width: 750px;
        padding: 67px 74px 60px;
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 12;
        .title {
          font-size: 28px;
          color: #333333;
          letter-spacing: 3.27px;
          margin-bottom: 71px;
        }
        .lists {
          padding: 0 9px;
          font-size: 20px;
          color: #666;
          text-align: left;
        }
        .btns {
          margin-top: 80px;
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: center;
          button {
            width: 278px;
            height: 80px;
            border-radius: 45px;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 4.04px;
            border: none;
            outline: none;
            background: #1AAD19;
            box-shadow: 0 3px 16px 0 rgba(26,173,25,0.64);
            color: #FFFFFF;
          }
        }
      }
    }
  }

  @media print {
    .bodyContent {
      border-bottom: 1px solid #eee;
      /*display: none;*/
      width: 200vw;
    }
    .li {
      page-break-after: always;
      width: 200vw;
    }
    .page {
      text-align: left;
      padding: 15px 30px;
      font-size: 20px;
      color: #000;
    }
    .pageTitle {
      margin-top: 10px;
      margin-bottom: 40px;
      text-align: left;
      font-size: 20px;
      color: #000;
      border-bottom: 1px solid #eee;
    }
    .content {
      padding: 40px 0;
    }
    .lists .list {
      margin-bottom: 15px;
      color: #000;
      font-size: 16px;
      display: block;
    }
    .qrcode {
      margin: 30px 10px;
      text-align: center;
    }
    img {
      width: 200px;
      height: 200px;
      display: block;
      margin: 30px 0;
    }
    .tig {
      margin: 10px;
      width: 100vw;
      display: block;
    }
    .tig p:first-of-type {
      font-size: 16px;
      color: #000;
      text-align: center;
      margin-bottom: 15px;
    }
    .tig:last-of-type {
      font-size: 18px;
      color: #000;
      page-break-after: always
    }
  }

  @page {
    size: auto;
    margin: 0;
    padding: 0;
  }

</style>
