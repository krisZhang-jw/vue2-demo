<template>
  <div>
    <el-input-number
      v-model="num"
      :precision="2"
      :step="0.1"
      :max="10"
    ></el-input-number>
  </div>
  
</template>
<script>
// import ElInputNumber from 'element-ui/packages/input-number/index';
export default {
  // components: {
  //   ElInputNumber,
  // },
  data() {
    return {
      num: 1,
    };
  },
};
</script>
