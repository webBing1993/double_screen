<template>
  <div>
    <div class="checkIn" v-show="checkInShow">
      <div class="bgCheckTop"></div>
      <div class="goback">
        <div @click="gobanck">
          <img src="../../assets/fanhui1.png" alt="">
          <span>返回</span>
        </div>
      </div>
      <div class="checkInChange">
        <div class="checkIn_header">
          <!--<div class="order_origin">-->
            <!--订单来源：{{changeItem.sourceId ? changeItem.sourceId : '-'}}-->
          <!--</div>-->
          <div class="order_info">
            <div class="order_person">
              <img src="../../assets/renyuan.png" alt="">
              <span>{{changeItem.owner}}</span>
              <span>{{changeItem.ownerTel}}</span>
            </div>
            <div class="order_remark">备注：{{changeItem.remark ? changeItem.remark : '-'}}</div>
          </div>
        </div>
        <div class="checkIn_content">
          <div class="lists">
            <div class="list">
              <div class="title">是否发卡：</div>
              <div class="changeItem">
                <div class="item_tab" @click="changeStatus(1, 1)">
                  <img src="../../assets/xuanzhongle.png" alt="" v-if="isfaka">
                  <img src="../../assets/weixuan.png" alt="" v-else>
                  <span>发卡</span>
                </div>
                <div class="item_tab" @click="changeStatus(2, 1)">
                  <img src="../../assets/xuanzhongle.png" alt="" v-if="!isfaka">
                  <img src="../../assets/weixuan.png" alt="" v-else>
                  <span>不发卡</span>
                </div>
              </div>
            </div>
            <div class="list">
              <div class="title">是否需要RC单：</div>
              <div class="changeItem">
                <div class="item_tab" @click="changeStatus(1, 2)">
                  <img src="../../assets/xuanzhongle.png" alt="" v-if="isrcpdf">
                  <img src="../../assets/weixuan.png" alt="" v-else>
                  <span>需要</span>
                </div>
                <div class="item_tab" @click="changeStatus(2, 2)">
                  <img src="../../assets/xuanzhongle.png" alt="" v-if="!isrcpdf">
                  <img src="../../assets/weixuan.png" alt="" v-else>
                  <span>不需要</span>
                </div>
              </div>
            </div>
            <div class="list">
              <div class="title">是否需要手机号：</div>
              <div class="changeItem">
                <div class="item_tab" @click="changeStatus(1, 3)">
                  <img src="../../assets/xuanzhongle.png" alt="" v-if="isphone">
                  <img src="../../assets/weixuan.png" alt="" v-else>
                  <span>需要</span>
                </div>
                <div class="item_tab" @click="changeStatus(2, 3)">
                  <img src="../../assets/xuanzhongle.png" alt="" v-if="!isphone">
                  <img src="../../assets/weixuan.png" alt="" v-else>
                  <span>不需要</span>
                </div>
              </div>
            </div>
          </div>
          <div class="btns">
            <el-button type="danger" round :loading="loadingCancel" @click="gobanck()">取消办理</el-button>
            <el-button type="primary" round :loading="loadingSure" @click="checkIn()">开始办理</el-button>
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
    components: {ElCol, loadingList},
    name: 'checkIn',
    data () {
      return {
        loadingShow: false,  // loading
        loadingText: '加载中...', // loading text
        isfaka: false,   // 是否发卡
        isrcpdf: false,  // 是否需要RC单
        isphone: false,  // 是否需要手机号
        loadingCancel: false, // 取消办理按钮加载状态
        loadingSure: false,  // 办理入住按钮加载状态
        changeItem: '',   // 临时数据
        checkInShow: false,  // 模块显示隐藏
      }
    },
    methods: {
      ...mapActions([
         'checkInGetOptions', 'checkInPostOptions'
      ]),

      // 返回上一页
      gobanck() {
        this.$router.go(-1);
      },

      // 办理选择
      changeStatus(status, type) {
        if (type == 1) {
          if (status == 1) {
              this.isfaka = true;
          }else {
              this.isfaka = false;
          }
        }else if (type == 2) {
          if (status == 1) {
            this.isrcpdf = true;
          }else {
            this.isrcpdf = false;
          }
        }else {
          if (status == 1) {
            this.isphone = true;
          }else {
            this.isphone = false;
          }
        }
      },

      // 开始办理
      checkIn() {
        this.loadingSure = true;
        this.checkInPostOptions({
          orderId: this.$route.params.id,
          data: {
            sendCard: this.isfaka,
            printRc: this.isrcpdf,
            needPhoneNum: this.isphone,
            hotelId: sessionStorage.hotel_id
          },
          onsuccess: body => {
            if (body.data.code == 0) {
              this.SendTeamOrderMessage(this.changeItem.id, this.changeItem.subOrderId, this.isfaka, this.isrcpdf, this.isphone, false)
            }
            this.loadingSure = false;
          },onfail: body => {
            this.loadingSure = false;
          }
        });
      },

      SendTeamOrderMessage(orderId, subOrderId, fakaStatus, rcStatus, phoneStatus, status) {
        document.title = new Date().getSeconds() + "@SendTeamOrderMessage@" + orderId + '@' + subOrderId + '@' + fakaStatus + '@' + rcStatus + '@' + phoneStatus + '@' + status;
      },

      // 初始化获取设置列表
      getCheckList() {
          this.checkInGetOptions({
            orderId: this.$route.params.id,
            onsuccess: body => {
              if (body.data.code == 0) {
                 if (body.data.data != null) {
                    this.isfaka = body.data.data.sendCard ? body.data.data.sendCard : false;
                    this.isrcpdf = body.data.data.printRc ? body.data.data.printRc : false;
                    this.isphone = body.data.data.needPhoneNum ? body.data.data.needPhoneNum : false;
                 }
              }
              this.checkInShow = true;
              this.loadingShow = false;
            },onfail: body => {
              this.checkInShow = true;
              this.loadingShow = false;
            }
          })
      },

    },

    mounted () {
      this.loadingShow = true;
      this.changeItem = JSON.parse(sessionStorage.getItem('changeItem'));
      this.getCheckList();
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .checkIn {
    background-color: #fff;
    min-height: calc(100vh - 28px);
    width: calc(100vw - 80px);
    padding-top: 100px;
    margin-left: 40px;
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.10);
    .bgCheckTop {
      width: 100vw;
      height: 20px;
      background-color: #DEE7F8;
    }
    .goback {
      padding-left: 60px;
      text-align: left;
      div {
        padding: 24px 0;
        display: inline-flex;
        align-items: center;
        img {
          width: 18px;
          height: 30px;
          display: inline-flex;
          margin-right: 10px;
        }
        span {
          color: #1AAD19;
          font-size: 30px;
        }
      }
    }
    .checkInChange {
      .checkIn_header {
        padding: 0 50px;
        background: #F8F8F8;
        border-top: 1px solid #D5D5D5;
        text-align: left;
        .order_origin {
          padding: 30px 0 20px 10px;
          font-size: 24px;
          color: #909399;
          border-bottom: 1px solid #D5D5D5;
        }
        .order_info {
          padding: 30px 0 30px 10px;
          .order_person {
            display: inline-flex;
            align-items: center;
            margin-bottom: 30px;
            img {
              width: 24px;
              height: 24px;
              margin-right: 16px;
            }
            span {
              font-size: 24px;
              color: #000;
            }
            span:first-of-type {
              margin-right: 32px;
            }
          }
        }
        .order_remark {
          color: #303133;
          font-size: 24px;
        }
      }
      .checkIn_content {
        padding: 40px 60px;
        .lists {
          .list {
            display: flex;
            align-items: center;
            margin-bottom: 40px;
            .title {
              color: #303133;
              font-weight: bold;
              font-size: 26px;
              text-shadow: 0 2px 3px rgba(0,0,0,0.04);
              width: 358px;
              text-align: left;
            }
            .changeItem {
              display: inline-flex;
              justify-content: flex-start;
              .item_tab {
                position: relative;
                font-size: 22px;
                color: #000;
                line-height: 64px;
                height: 64px;
                width: 172px;
                text-align: center;
                margin-right: 44px;
                img {
                  position: absolute;
                  z-index: 1;
                  width: 172px;
                  height: 64px;
                  left: 0;
                  top: 0;
                }
                span {
                  position: absolute;
                  left: 50%;
                  top: 50%;
                  z-index: 2;
                  transform: translate(-50%, -50%);
                }
              }
            }
          }
        }
        .btns {
          margin-top: 110px;
          text-align: left;
          /deep/ button {
            width: 390px;
            height: 80px;
            border-radius: 50px;
            font-size: 28px;
            color: #fff;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
          }

          /deep/ .el-button--danger {
            background-color: #F5222D;
            margin-right: 60px;
          }

          /deep/ .el-button--primary {
            background-color: #1AAD19;
          }
        }
      }
    }
  }

</style>
