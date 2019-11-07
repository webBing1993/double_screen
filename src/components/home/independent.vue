<template>
  <div>
    <div class="independent">
      <iframe :src="src" frameborder="0"></iframe>
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
        src: "https://wqt.fortrun.cn" + sessionStorage.getItem('windowUrl') + 'independent_collection/#'+"?token=" + sessionStorage.session_id
      }
    },
    filters: {

    },
    methods: {
      ...mapActions([

      ]),


    },

    mounted () {
//      this.loadingShow = true;

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
