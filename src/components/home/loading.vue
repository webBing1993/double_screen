<template>
    <div>
      <div class="loading" ref="loading">
        <img src="../../assets/loading.gif" alt="">
        <p>{{loadingText}}</p>
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
<style scoped lang="less">

  .loading {
    position: absolute;
    z-index: 99999999;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    img {
      width: 180px;
      display: block;
    }
    p {
      font-size: 26px;
      color: #000;
      text-align: center;
      height: 30px;
    }
  }

</style>
