import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';


import 'element-ui/lib/theme-chalk/index.css';
Vue.config.productionTip = false
Vue.use(ElementUI);


// 路由守卫
import Bus from '@/utils/bus.js'
Vue.use(Bus)

// 全局变量
import global from "./global";
Vue.prototype.global = global;


// 注册全局 filter
import * as filter from './filter'

Object.keys(filter).forEach(key =>{
  Vue.filter(key,filter[key])
})

// echarts
import * as echarts from 'echarts';

Vue.prototype.$echarts = echarts

export default new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')