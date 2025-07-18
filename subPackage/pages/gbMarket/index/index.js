const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');
import apiUrl from '../../../../config.js'

import {
 
  //swiper -2
  purUserGetBuyingGoods,
  
  disGetPurchasingBatch,
  deleteDisPurBatchGbItem,
  disFinishPurchaseBatch,

} from '../../../../lib/apiDepOrder'

Page({

  onShow() {
 // 推荐直接用新API
 let windowInfo = wx.getWindowInfo();
 let globalData = getApp().globalData;
 this.setData({
   windowWidth: windowInfo.windowWidth * globalData.rpxR,
   windowHeight: windowInfo.windowHeight * globalData.rpxR,
   navBarHeight: globalData.navBarHeight * globalData.rpxR,
 });
  },


  /**
   * 页面的初始数据
   */
  data: {
    

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      url: apiUrl.server,
     
    })

    var userInfo = wx.getStorageSync('userInfo');
    if(userInfo){
      this.setData({
        userInfo: userInfo,
        userId: userInfo.nxJrdhGbDepartmentUserId,
        disId: userInfo.nxJrdhGbDistributerId
      })
    }
   this._getInitData();
 
  },



  //swiper two 
  _getInitData() {
    load.showLoading("获取订货订单")
    purUserGetBuyingGoods(this.data.userId)
      .then(res => {
        load.hideLoading();
        console.log(res.result.data)
        if (res.result.code == 0) {
          this.setData({
            batchArr: res.result.data,
          })
          //创建节点选择器
         
        } else {
          this.setData({
            purArr: [],
            batchSize: 0,
            finishSize: 0,
            selectedArr: []
          })
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          })
          this.setData({
            purArr: []
          })
        }
      })
  },


  toBack(){
    wx.redirectTo({
      url: '../../jinriListWithLogin/jinriListWithLogin',
    })
  },


  cancelDisBatchItem(e) {
    deleteDisPurBatchGbItem(e.currentTarget.dataset.id)
      .then(res => {
        if (res.result.code == 0) {
          this._getPurchasingBatch()
        }
      })
  },







})