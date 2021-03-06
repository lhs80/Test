import axios from 'axios'
import qs from 'qs'
import store from '@/store'
import router from '@/router/router'
import {getToken, setToken, removeToken, getCookie} from '@/utils/auth'
import {Message} from 'element-ui'
import errorCode from '@/common/constant/errorCode'
import NProgress from 'nprogress'
import {rootUrl, baseURL} from '@/common/constant/constant'

import urlCol from '@/common/urlCol'
// progress bar
import 'nprogress/nprogress.css'
// progress bar style
// 超时时间
axios.defaults.timeout = 300000000000

// 跨域请求，允许保存cookie
axios.defaults.withCredentials = true

// axios.defaults.baseURL = "/api";
axios.defaults.baseURL = 'http://m.gongjiangsht.com'

NProgress.configure({
  showSpinner: false
})
//NProgress 进度条的设置
// axios.interceptors.request.use(
//   config => {
//     NProgress.start();
//     let shuTokenStore = store.getters.access_token;
//     if (shuTokenStore) {
//       config.headers["shu-token"] = shuTokenStore; // 让每个请求携带token--['X-Token']为自定义key 请根据实际情况自行修改
//     }
//     config.credentials = true;
//     config.method === "post"
//       ? (config.data = qs.stringify({ ...config.data }))
//       : (config.params = { ...config.params });
//     config.headers["Content-Type"] =
//       "application/x-www-form-urlencoded;charset=utf-8";
//     return config;
//   },
//   error => {
//     return Promise.reject(error);
//   }
// );
//ajax返回请求拦截 拦截
axios.interceptors.response.use(data => {
    // ajax 返回状态
    NProgress.done()

    const res = data.data

    // 状态不为200的时候
    if (res.code === 40101) {
      Message({
        message: res.msg,
        type: 'error',
        // duration: 5 * 1000,
      })
      router.push({
        path: '/login'
      })
    } else {
      // if (!res.data) return 'null'
      return data
    }
  },
  error => {
    NProgress.done()
    const errMsg = error.toString()
    const code = errMsg.substr(errMsg.indexOf('code') + 5)
    Message({
      message: errorCode[code] || errorCode['default'],
      type: 'error'
    })

    if (parseInt(code) === 40101) {
      store.dispatch('FedLogOut').then(() => {
        router.push({
          path: '/admin/poilist'
        })
      })
    }
    return Promise.reject(error)
  }
)

export default axios
