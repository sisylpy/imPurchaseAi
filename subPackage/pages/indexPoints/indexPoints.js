const globalData = getApp().globalData;
var load = require('../../../lib/load.js');
import apiUrl from '../../../config.js'
var dateUtils = require('../../../utils/dateUtil')
import utils from '../../../utils/util'


import {
  gbLogin,
  addAppPointsWithUserId
} from '../../../lib/apiDistributer'


Page({
  data: {
    showLoading: false,
    showSuccess: false,
    successMessage: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    if (options.q) {
      console.log("opeoieiiee",options)
      //获取二维码的携带的链接信息
       let qrUrl = decodeURIComponent(options.q)
       this.setData({
         //获取链接中的参数信息
         userId: utils.getQueryString(qrUrl, 'userId'),
         points: utils.getQueryString(qrUrl, 'points'),
       })
      }

    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      userId: 1,
      points: 300,
     

    })
   
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        userId: userInfo.gbDepartmentUserId,
      })

      var disInfo = wx.getStorageSync('disInfo');
      if (disInfo) {
        this.setData({
          disInfo: disInfo,
          disId: disInfo.gbDistributerId,
          depId: disInfo.purDepartmentList[0].gbDepartmentId,

        })
      }

      this._savePoints();

    } else {
      this._userLogin()
    }

  },


//swiper one before
_userLogin() {
  wx.login({
    success: (resLogin) => {
      gbLogin(resLogin.code)
        .then((res) => {
          if (res.result.code !== -1) {
            console.log("lgoososososoosso")
            console.log(res.result.data)
            this.setData({
              disInfo: res.result.data.disInfo,
              userInfo: res.result.data.depUserInfo,
              disId: res.result.data.disInfo.gbDistributerId,
              depId: res.result.data.disInfo.purDepartmentList[0].gbDepartmentId,
            })
            wx.setStorageSync('disInfo', res.result.data.disInfo);
            wx.setStorageSync('userInfo', res.result.data.depUserInfo);
            this._savePoints();
            //跳转到首页
          } else {
            wx.redirectTo({
              url: '../tro/tro',
            })
          }
        })
    }
  })
},


_savePoints(){
  // 显示加载蒙版
  this.setData({
    showLoading: true
  })

  var data = {
    userId: this.data.userId,
    points: this.data.points,
    disId: this.data.disId
  }
  addAppPointsWithUserId(data).then(res =>{
    // 隐藏加载蒙版
    this.setData({
      showLoading: false
    })
    
    if(res.result.code == 0){
      // 显示成功蒙版
      this.setData({
        showSuccess: true,
        successMessage: `充值成功，获得 ${this.data.points} 点数`
      })
    }
  })


},

// 点击成功蒙版跳转
handleSuccessClick(){
  wx.redirectTo({
    url: '../../../pages/index/index',
  })
},





})