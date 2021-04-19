import axios from 'axios'; // 引入axios
import { Message } from 'element-ui';
import context from '@/main.js'
const service = axios.create({
  // baseURL: 'http://127.0.0.1:9991/',
  baseURL: `${process.env.VUE_APP_API_HOST}`,
  timeout: 99999
})
let acitveAxios = 0
let timer
const showLoading = () => {
  acitveAxios++
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
    if (acitveAxios > 0) {
      context.$bus.emit("showLoading")
    }
  }, 400);
}

const closeLoading = () => {
  acitveAxios--
  if (acitveAxios <= 0) {
    clearTimeout(timer)
    context.$bus.emit("closeLoading")
  }
}
//http request 拦截器
service.interceptors.request.use(
  config => {
    if (!config.donNotShowLoading) {
      showLoading()
    }

    config.data = JSON.stringify(config.data);
    config.headers = {
      'Content-Type': 'application/json',
    }
    return config;
  },
  error => {
    closeLoading()
    Message({
      showClose: true,
      message: error,
      type: 'error'
    })
    return error;
  }
);


//http response 拦截器
service.interceptors.response.use(
  response => {
    closeLoading()

    if (response.data.code == 0 || response.headers.success === "true") {
      return response.data
    } else {
      Message({
        showClose: true,
        message: response.data.msg || decodeURI(response.headers.msg),
        type: response.headers.msgtype||'error',
      })

      return response.data.msg ? response.data : response
    }
  },
  error => {
    closeLoading()
    Message({
      showClose: true,
      message: error,
      type: 'error'
    })
    return error
  }
)

export default service
