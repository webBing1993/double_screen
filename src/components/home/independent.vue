<template>
  <div>
    <div class="independent">
      <iframe :src="src" frameborder="0" ref="iframe" v-show="iframeShow"></iframe>
      <loadingList v-if="loadingShow" :loadingText="loadingText"  style="width: 100vw"></loadingList>
    </div>
  </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex';
  import ElCol from "element-ui/packages/col/src/col";
  import loadingList from './loading.vue'

  export default {
    name: 'independent',
    components: {ElCol, loadingList},
    data () {
      return {
        loadingShow: false,  // loading
        loadingText: '加载中...', // loading text
        src: '',
        iframeWin: null,
        iframeShow: false,
      }
    },
    filters: {

    },
    methods: {
      ...mapActions([

      ]),


      getSweepingSettlementOrderId(orderId, deviceId, timeVal) {
          console.log('orderId', orderId);
        if (orderId == '') {
          return
        }else {
          // 给iframe传参
          this.iframeWin.postMessage({
            cmd: 'getParams', // cmd 用来判断触发的是什么事件
            params: {
              key: orderId,
              deviceId: deviceId,
              timeVal: timeVal
            }
          }, '*');
          setTimeout(() => {
            orderId = '';
          },100)
        }
      },

      // 获取deviceId
      getDeviceId(deviceId) {
        console.log('getDeviceId', deviceId);
        this.src = "https://wqt.fortrun.cn" + sessionStorage.getItem('windowUrl') + 'independent_collection/#'+"?token=" + encodeURIComponent(sessionStorage.session_id+'/'+deviceId)
      },

      sonPageClick (params){
        if (params == 0) {
          window.getSweepingSettlementOrderId = '';
        }else {
          window.getSweepingSettlementOrderId = this.getSweepingSettlementOrderId;
        }
      }
    },

    mounted () {
      this.loadingShow = true;
      jsObj.getDeviceId();
      setTimeout(() => {
        this.loadingShow = false;
        this.iframeShow = true;
        this.iframeWin = this.$refs.iframe.contentWindow;
      }, 600);
      window.getDeviceId = this.getDeviceId;

      window.sonPageClick = this.sonPageClick;
    },
    beforeRouteLeave (to, from, next) {
      this.loadingShow = false;
      next();
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">

  .independent {
    width: 100vw;
    min-height: calc(100vh - 100px);
    padding-top: 100px;
    iframe {
      width: 100%;
      min-height: calc(100vh - 100px);
    }
  }


</style>
