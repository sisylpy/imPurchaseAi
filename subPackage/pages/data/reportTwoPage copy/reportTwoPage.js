var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import apiUrl from '../../../../config.js'
var dateUtils = require('../../../../utils/dateUtil');


import {
  saveReportCost
} from '../../../../lib/apiDepOrder.js'

import {
  getDisGoodsCata,
  getFatherGoods,

} from '../../../../lib/apiDistributer'

Page({

  onShow(){
   
    if(this.data.updateMyDate){
      var myDate = wx.getStorageSync('myDate');
      if(myDate){
        this.setData({
          startDate: myDate.startDate,
          stopDate: myDate.stopDate,
          dateType: myDate.dateType,
        })
      }
    }
    var fil = wx.getStorageSync('myDate');
    if(fil){
      this.setData({
        filterShow: true
      })
    }else{
      this.setData({
        filterShow: false
      })
    }

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
      id: options.id,
      name: options.name,
      type: options.type,
      startDate: options.startDate,
      stopDate: options.stopDate
     
    })

    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        disId: userInfo.gbDuDistributerId,

      })
    }

    this._initData()
   },


   showDownLoad(e) {
     var fatherId = e.currentTarget.dataset.id;
    getFatherGoods(fatherId)
      .then(res => {
        if (res.result.code == 0) {
          this.setData({
            fatherArr: res.result.data,
            showOperation: true,
            showDownLoad: true,
          })
        }
      })
  },
  
_initData(){
  getDisGoodsCata(this.data.disId)
  .then(res =>{
    console.log(res)
    if(res.result.code == 0){
      this.setData({
        myIbooklist: res.result.data,
      })
    }
  })
},

hideMask(){
  this.setData({
    showOperation:false,
  })
},


   openList(e){
     var openIndex = this.data.openIndex;
     if(e.currentTarget.dataset.index == openIndex){
      this.setData({
        openIndex: '-1'
      })
     }else{
      this.setData({
        openIndex: e.currentTarget.dataset.index
      })
     }
   },

   saveReport(e){  
     var id = "";
     var type = "";
     if(this.data.type == 'goodsSales' || this.data.type == 'goodsCost' || this.data.type == 'goodsProfit' || this.data.type == 'goodsFresh' || this.data.type == 'goodsPrice'  || this.data.type == 'goodsByDepartment'){
       id  =  e.currentTarget.dataset.id;
       type = this.data.type;
     }else{
       id = this.data.id;
       type = e.currentTarget.dataset.type;
     }
     var data ={
      gbRepDisUserId: this.data.userInfo.gbDepartmentUserId,
       gbRepIds: id,
       gbRepType: type,
       gbRepStartDate: this.data.startDate,
       gbRepStopDate: this.data.stopDate
     }

     saveReportCost(data).then(res =>{
       if(res.result.code == 0){
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 3]; //上一个页面
        //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
        prevPage.setData({
          update: true
        })
          wx.navigateBack({
            delta: 2,
          })
        
       } 
     })
   },


  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

})