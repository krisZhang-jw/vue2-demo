<template>
  <div>
    <b-code-editor
      ref="editor"
      v-model="jsonStr"
      :indent-unit="4"
      height="auto"
      @on-blur="blurCode"
    />
  </div>
</template>
<script>
export default {
  data() {
    return {
      jsonStr: "",
      temp: "",
      testData: `{"title":"测试json数据","children":[{"name":"子项名称", "desc":"子项说明" },{"name":"子项名称1", "desc":"子项说明1" }]}`,
    };
  },
  methods: {
    blurCode() {
      let code = this.$refs.editor.getValue?.();
      console.log("changeCode ", code, this.temp);
      if (this.temp !== code) {
        this.temp = code;
        this.$refs.editor.formatCode();
      }
    },
  },
};
</script>
