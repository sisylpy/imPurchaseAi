
const globalData = getApp().globalData;

var load = require('../../../../lib/load.js');


import {

  sellerGetPurchaseBatch,
  

} from '../../../../lib/apiDepOrder'

Page({

  onShow(){
      // 推荐直接用新API
      let windowInfo = wx.getWindowInfo();
      let globalData = getApp().globalData;
      this.setData({
        windowWidth: windowInfo.windowWidth * globalData.rpxR,
        windowHeight: windowInfo.windowHeight * globalData.rpxR,
        statusBarHeight: globalData.statusBarHeight  * globalData.rpxR,
      });
  
     
    this._initData()

  },
 
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
    this.setData({
        sellUserId: options.sellUserId,
        disId: options.disId,

    })
  

    this._initData();
  
  },

  _initData(){
    var data ={
      disId: this.data.disId,
      userId:  this.data.sellUserId,
    }
   
    load.showLoading("获取数据中...")
    sellerGetPurchaseBatch(data)
    .then(res => {
      load.hideLoading();
      if(res.result.code == 0){
        console.log(res.result.data)
        this.setData({
          billArr: res.result.data.month,
          unSettleSubtotal: res.result.data.unSettle,
          gbDis: res.result.data.gbDis,
        })
      }
    })
  },



  downLoadExcel(e){
    wx.showToast({
      title: 'download....',
    })
  },

  toGbOrderBatch(e){
    wx.navigateTo({
      url: '../disOrderBatchDetail/disOrderBatchDetail?batchId=' + e.currentTarget.dataset.id
      +'&retName=' + this.data.gbDis.gbDistributerName ,
    })
  },


  toLogin() {
    wx.redirectTo({
      url: '../../jinriListWithLogin/jinriListWithLogin',
    })
    },
  
  toBack(){
   wx.redirectTo({
     url: '../../seller/customerList/customerList?nxDisId=-1&gbDisId=' + this.data.disId,
   })
  }
  








})