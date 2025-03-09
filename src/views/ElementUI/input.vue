<template>
  <el-input
    v-model="inputValue"
    :max="max"
    :min="min"
    placeholder=""
    @input="validateNumericInput"
  ></el-input>
</template>

<script>
export default {
  data() {
    return {
      inputValue: "",
    };
  },
  props: {
    max: {
      type: Number,
      default: Infinity,
    },
    min: {
      type: Number,
      default: -Infinity,
    },
    value: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
  },
  mounted() {
    this.inputValue = this.value;
  },
  watch: {
    inputValue(val) {
      this.$emit("update:value", val);
    },
  },
  methods: {
    validateNumericInput(event) {
      const numericRegex = /^[0-9]*$/;
      if (!numericRegex.test(event.target.value)) {
        event.target.value = this.inputValue;
      } else {
        this.inputValue = event.target.value;
      }
    },
  },
};
</script>
