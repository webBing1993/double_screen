<template>
    <div style="position: fixed;z-index: 99999999;left: 0;top: 50%;transform: translate(0, -50%);">
      <div class="loading" ref="loading">
        <img src="../../assets/loading.gif" alt="">
        <p></p>  <!--{{loadingText}}-->
      </div>
    </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex';

  export default {
    props: ['loadingText'],
    data () {
      return {

      }
    },
    watch: {
      loadingText: function (val) {
        console.log(val);   // 接收父组件的值
      },
    },
    methods: {
      ...mapActions([

      ]),

    },

    mounted () {

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">

  .loading {
    width: 100%;

    img {
      width: 180px;
      display: block;
      margin: 0 auto;
    }
    p {
      font-size: 26px;
      color: #000;
      text-align: center;
      height: 30px;
    }
  }

</style>
