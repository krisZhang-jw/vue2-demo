import Vue from "vue";
import VueRouter from "vue-router";
import HomeView from "../views/HomeView.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },
  // {
  //   path: "/elementui",
  //   name: "elementui",
  //   children: [
  //     {
  //       path: "/input",
  //       name: "input",
  //       component: () => import(/* webpackChunkName: "elementui" */ '../views/ElementUI/input.vue')
  //     },
  //     {
  //       path: "input-number",
  //       name: "input-number",
  //       component: () =>
  //         import(
  //           /* webpackChunkName: "elementui" */ "../views/ElementUI/input-number.vue"
  //         ),
  //     },
  //   ],
  // },
  {
    path: "/input",
    name: "input",
    component: () =>
      import(
        /* webpackChunkName: "bin-code-editor" */ "../views/ElementUI/input.vue"
      ),
  },
  {
    path: "/input2",
    name: "input2",
    component: () =>
      import(
        /* webpackChunkName: "bin-code-editor" */ "../views/ElementUI/input2.vue"
      ),
  },
  {
    path: "/input-number",
    name: "input-number",
    component: () =>
      import(
        /* webpackChunkName: "bin-code-editor" */ "../views/ElementUI/input-number.vue"
      ),
  },
  {
    path: "/code-editor",
    name: "code-editor",
    component: () =>
      import(
        /* webpackChunkName: "bin-code-editor" */ "../views/CodeEditor/index.vue"
      ),
  },
  {
    path: "/fabricjs",
    name: "fabricjs",
    component: () => import("../views/fabricjs/index.vue"),
  },
  {
    path: "/fabricjs-by-line",
    name: "fabricjsByLine",
    component: () => import("../views/fabricjs/byLine.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
