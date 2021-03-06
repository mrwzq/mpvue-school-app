import _config from '../config'
import _store from '../store'

// import {
//   $Toast,
//   $Message
// } from '../assets/iview/base/index'

let isIphoneX = false

const resSystemInfo = wx.getSystemInfoSync()
console.log(resSystemInfo)
if (resSystemInfo.model.indexOf('iPhone X') != -1) {
  isIphoneX = true
}


const formatNumber = (n) => {
  const str = n.toString()
  return str[1] ? str : `0${str}`
}

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}
const formatTime = (date) => {

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const t1 = formatDate(date)
  const t2 = [hour, minute, second].map(formatNumber).join(':')

  return `${t1} ${t2}`
}

const sleep = (callback, time = 1000) => {
  setTimeout(callback, time)
}

// 校验方法
const validate = {
  test(str, regexp, msg) {
    if (!regexp.test(str)) {
      showMsg(msg)
      return true
    } else {
      return false
    }
  },
  isEmpty(str, name) {
    // 当name第一个字符为$时不会补充文字--请输入
    let txt = name[0] == '$' ? name.slice(1) : `请输入${name}`
    return this.test(str, /^.+$/, txt)
  },
  notPhone(str) {
    return this.test(str, /^1[0-9]{10}$/, `手机号码输入有误`)
  },
  notPassword(str) {
    return this.test(str, /^[0-9a-zA-Z]{6,16}$/, `密码为6-16位英文和数字组合`)
  }
}

const showMsg = msg => {
  log(msg)
  wx.showToast({
    title: msg,
    icon: 'none',
    duration: 1500
  })
}

const showSuccess = (msg, callback) => {
  log(msg)
  wx.showToast({
    title: msg,
    icon: 'success',
    duration: 1500
  })

  callback && setTimeout(() => {
    callback()
  }, 1500)

}

const showLoading = (text = '加载中') => {
  wx.showLoading({
    title: text,
  })
}
const hideLoading = () => {
  wx.hideLoading()
}

const log = (...args) => {
  _config.env != 'production' && console.log(...args)
}


// const isLoading = false

// 请求拦截状态
let blockStatus = {}

const ajax = ({
  action,
  method = 'GET',
  data = {},
  loading = false,
  loadingText = '加载中',
  block = false,
  success = () => {},
  fail = () => {},
  complete = () => {}
}) => {
  // 所有post都会有拦截功能
  method == 'POST' && (block = true)
  if (block) {
    if (blockStatus[action]) {
      return
    } else {
      blockStatus[action] = true
    }
  }

  loading && showLoading(loadingText)

  // 登陆后的请求都需要token
  let header = {
    token: wx.getStorageSync('token') || ''
  }


  // 加载速度太快会导致页面抖动
  // if (isLoading) {
  //   isLoading = true
  //   wx.showNavigationBarLoading()
  // }

  log(`%c${action}(input)`, `color:#29bb7b`, data)
  wx.request({
    url: _config.domain + action,
    method,
    data,
    header,
    success(res) {
      log(`%c${action}(res)`, `color:#5b8de2`, res.data)
      loading && hideLoading()

      if (res.data.code == 9002) {

        let pages = getCurrentPages() //获取加载的页面
        let currentPage = pages[pages.length - 1] //获取当前页面的对象
        let url = currentPage.route //当前页面url
        // let options = currentPage.options //如果要获取url中所带的参数可以查看options

        if (url !== 'pages/login/index/main') {

          wx.reLaunch({
            url: '/pages/login/index/main'
          })
        }
        return
      }

      if (res.data.code != 0) {
        showMsg(res.data.message)
      }

      success(res.data)
    },
    fail(e) {
      loading && hideLoading()
      log(e)
      fail(e)
    },
    complete() {
      if(block) {
        setTimeout(() => {
          blockStatus[action] = false
        }, 200)
      }
      // block && (blockStatus[action] = false)
      complete()
    }
  })
}

export default {
  _config,
  _store,
  // $Toast,
  // $Message,
  isIphoneX,

  formatNumber,
  formatDate,
  formatTime,

  sleep,

  validate,

  showMsg,
  showSuccess,
  showLoading,
  hideLoading,
  log,

  ajax,

}
