import Vue from 'vue'
import VueRouter from 'vue-router'
const Dashboard = () => import('../views/redisDashboard/Dashboard')
const redisList = () => import('../views/redisList/redis')
const redisDetail = () => import('../views/redisList/redisDetail')
const Monitor = () => import('../views/redisMonitor/Monitor')
const Operation = () => import('../views/redisOperation/Operation')
//
Vue.use(VueRouter)

const routes = [
  { path: '', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/redis/list', name: 'redisList', component: redisList },
  { path: '/redis/redisDetail', name: 'redisDetail', component: redisDetail },
  { path: '/redis/monitor', name: 'Monitor', component: Monitor },
  { path: '/redis/operation', name: 'Operation', component: Operation },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
