<template>
  <div>
    <div class="check_out" v-show="checkOutShow">
      <div class="bgCheckTop"></div>
      <div class="check_fl_content">
        <div class="checkTop">
          <div @click="gobanck" class="goback">
            <img src="../../assets/fanhui1.png" alt="">
            <span>返回</span>
          </div>
          <div class="roomNo">302/303</div>
          <div class="replayList" @click="">
            <img src="../../assets/tongbu.png" alt="">
            <span>刷新</span>
          </div>
        </div>
        <div class="check_content">
          <!-- 微前台收款-->
          <div class="payInfo">
            <div class="header">
              <div class="lists">
                <div class="list">微前台收款</div>
                <div class="list">金额</div>
                <div class="list">操作</div>
              </div>
            </div>
            <div class="content">
              <div class="lists">
                <div class="list">
                  <span>房费</span>
                  <span>微信支付 2019/09/09 18:00</span>
                </div>
                <div class="list">
                  <span class="red">300.00元</span>
                </div>
                <div class="list">
                  <el-button type="primary" :loading="true" class="btn green">结账</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bgCheckTop"></div>
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
    name: 'checkOut',
    data () {
      return {
        loadingShow: false,  // loading
        loadingText: '加载中...', // loading text
        checkOutShow: true,  // 模板显示隐藏
        payInfoList: [],     // 收款列表
      }
    },
    methods: {
      ...mapActions([

      ]),

      // 返回上一页
      gobanck() {
        this.$router.go(-1);
      },


    },

    mounted () {
//      this.loadingShow = true;

    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .check_out {
    padding: 100px 40px 0;
    width: 100vw;
    .bgCheckTop {
      height: 20px;
      background-color: #DEE7F8;
    }
    .check_fl_content {
      width: 100%;
      min-height: calc(100vh - 140px);
      box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.10);
      background-color: #fff;
      .checkTop {
        text-align: left;
        padding: 24px 0 24px 60px;
        position: relative;
        div {
          display: inline-flex;
          align-items: center;
        }
        .goback {
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
        .roomNo {
          font-size: 30px;
          color: #000;
          margin-left: 117px;
        }
        .replayList {
          position: absolute;
          top: 50%;
          right: 74px;
          transform: translateY(-50%);
          font-size: 28px;
          color: #1AAD19;
          padding: 0 30px;
          img {
            display: inline-block;
            width: 44px;
            height: 44px;
            margin-right: 7px;
          }
        }
      }
      .check_content {
        width: 100%;
        .header {
          background: #F8F8F8;
          .lists {
            padding: 25px 80px 25px 60px;
            .list {
              color: #000;
              font-size: 30px;
            }
          }
        }
        .list {
          display: inline-flex;
        }
        .list:first-of-type {
          width: 25%;
        }
        .list:nth-of-type(2) {
          width: 62%;
          justify-content: center;
        }
        .list:last-of-type {
          width: 200px;
          justify-content: center;
        }
        .content {
          .lists {
            padding: 20px 80px 20px 60px;
            border-bottom: 1px solid #ccc;
            .list {
              display: inline-flex;
              align-items: center;
              span {
                display: block;
                width: 100%;
              }
              span:first-of-type {
                font-size: 26px;
                color: #000;
              }
              span:nth-of-type(2) {
                font-size: 24px;
                color: #909399;
                margin-top: 20px;
              }
              span:first-of-type.red {
                color: #F55825;
              }
              span:first-of-type.green {
                color: #1AAD19;
              }
              .btn {
                width: 200px;
                height: 80px;
                background-color: #1AAD19;
                color: #fff;
                font-size: 24px;
                border-radius: 10px;
              }
            }
          }
        }
      }
    }
  }

</style>
