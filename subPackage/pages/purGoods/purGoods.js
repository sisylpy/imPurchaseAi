const globalData = getApp().globalData;
var load = require('../../../lib/load.js');
import apiUrl from '../../../config.js'
var app = getApp();

import {
 
  markGbPurGoodsFinish, // 未采购
  finishPurGoodsToStock,
  
} from '../../../lib/apiDistributer'


Page({

  /**
   * 页面的初始数据
   */
  data: {
    focusIndex: -1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      url: apiUrl.server,
    
    })
    var disInfo = wx.getStorageSync('disInfo');
    if (disInfo) {
      this.setData({
        disInfo: disInfo,
        disId: disInfo.gbDistributerId,
        depId: disInfo.purDepartmentList[0].gbDepartmentId,
      })
    } 
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        userId: userInfo.gbDepartmentUserId,
      })
    }


    var purArr = wx.getStorageSync('purArr');
    if(purArr){
      this.setData({
        purArr: purArr
      })
    }

  },



  showInputOrder(e) {
    console.log(e);
    var item = e.currentTarget.dataset.item;
    item.gbDpgBuyPrice = "";
    if (item.gbDpgBuyScale !== null && item.gbDpgBuyScale > 0) {
      this.setData({
        scaleInput: true,
      })
    }

    this.setData({
      show: true,
      item: item,
      windowHeight: this.data.windowHeight,
    })
  },

  confirm(e) {
    var item = e.detail.item;
    item.gbDpgPurUserId = this.data.userInfo.gbDepartmentUserId;
    item.gbDpgPurchaseDepartmentId = this.data.userInfo.gbDuDepartmentId
    console.log(item);
    load.showLoading("保存数据")
    finishPurGoodsToStock(item).then(res => {
      load.hideLoading();
      if (res.result.code == 0) {
        this.setData({
          show: false,
        })
        this._updateArr();
      }
    })
  },

 _updateArr(){
  var arr = this.data.purArr;
  var item = this.data.item;
  if(arr.length > 0){
    arr = arr.filter(obj => obj.gbDistributerPurchaseGoodsId !== item.gbDistributerPurchaseGoodsId);
    this.setData({
      purArr: arr,
    })
  }

 },
  cancle() {
    this.setData({
      show: false,
      item: ""
    })
  },



  markGbPurGoodsFinish(e) {
  
    var item = e.currentTarget.dataset.item;
    this.setData({
      item: item,
    })
    item.gbDpgPurUserId = this.data.userInfo.gbDepartmentUserId;
    item.gbDpgPurchaseDepartmentId = this.data.depId;
    console.log(item);
    markGbPurGoodsFinish(item).then(res => {
      if (res.result.code == 0) {
        this.setData({
          show: false,
        })
        this._updateArr();
      
      }
    })
  },


  toBack(){
    wx.navigateBack({
      delta: 1
    })
  },





})