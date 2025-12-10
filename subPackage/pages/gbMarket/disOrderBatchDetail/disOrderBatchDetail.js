var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import apiUrl from '../../../../config.js'


import {
  getDisPurchaseGoodsBatchGb,

} from '../../../../lib/apiDepOrder'
import dateUtil from '../../../../utils/dateUtil';


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

   
    this._getInitData();

   
  },

  /**
   * 页面的初始数据
   */
  data: {
    
    bottomHeight: 300,
    formHeight: 450,
    formHeightBuyer: 520,
    headerHeight: 80,
   
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      url: apiUrl.server,
      avatarUrl: "",
      batchId: options.batchId,
      retName: options.retName,
      disId: options.disId,
      buyUserId: options.buyUserId,
    })
   


  },


  _getInitData() {
    load.showLoading("获取订货商品")
    var that = this;
    getDisPurchaseGoodsBatchGb(this.data.batchId)
      .then(res => {
        console.log(res)
        load.hideLoading();
        if (res.result.code == 0) {
          that.setData({
            batch: res.result.data,
            batchStatus: res.result.data.gbDpbStatus,
          })

          if (res.result.data.gbDpbStatus == -1 && that.data.fromBuyer == 0) {
            that._shareUserRead();
          }

        } else {
          wx.showToast({
            title: '没有订货',
            icon: 'none'
          })

        }
      })
  },

  toBack(){
    wx.navigateBack({delta: 1});
  },





})