<template>
  <z-input-number
    v-model="num"
    :precision="2"
    :step="0.1"
    :max="10"
    :need-zero="false"
  />
</template>

<script>
import zInputNumber from "./z-input-number.vue";

export default {
  data() {
    return {
      num: 1,
    };
  },
  components: {
    zInputNumber,
  },
};
</script>
