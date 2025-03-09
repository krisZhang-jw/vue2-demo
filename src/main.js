import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import BinCodeEditor from "bin-code-editor";
import "bin-code-editor/lib/styles/index.css";

Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.use(BinCodeEditor);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
