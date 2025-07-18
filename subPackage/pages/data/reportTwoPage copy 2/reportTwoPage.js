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


   /**
   * 页面的初始数据
   */
  data: {
    searchDepIds: -1,
  },



  onShow(){
   
    
  
      var serdep = wx.getStorageSync('searchDep');
      if(serdep){
        this.setData({
          searchDepIds: serdep.gbDepartmentId,
          name: serdep.gbDepartmentName,
          type: "dep"
         })
      }
      
    
  
},
  

  /**
   * 生命周期函数--监听页面加载id=61&type=dep&name=小碗菜&startDate=2025-03-01&stopDate=2025-03-15&dateType=month
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
      stopDate: options.stopDate,
      dateType: options.dateType,
    
     
    })

    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        disId: userInfo.gbDuDistributerId,

      })
    }

    // this._initData()
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
       if(e.currentTarget.dataset.type == 'disPurGoods' || e.currentTarget.dataset.type == 'disPurSupplier' || e.currentTarget.dataset.type == 'disCost' || e.currentTarget.dataset.type == 'disStockNow' || e.currentTarget.dataset.type == 'disLoss' || e.currentTarget.dataset.type == 'disWaste' || e.currentTarget.dataset.type == 'disReturn'){
        id = this.data.disId;
       }else{
        id = this.data.searchDepIds;
       }
      
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
        var prevPage = pages[pages.length - 2]; //上一个页面
        //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
        prevPage.setData({
          update: true
        })
          wx.navigateBack({
            delta: 1,
          })
        
       } 
     })
   },


   delSearch(){
    this.setData({
      type: 'dis',
      searchDepIds: -1,
      name: "",
      openIndex: -1,
    })
    wx.removeStorageSync('searchDep')
   },

   toDate(){
    wx.navigateTo({
      url: '../../sel/date/date?startDate=' + this.data.startDate
       + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
   },


   toMendian(){
    wx.navigateTo({
      url: '../filterMendianDepartment/filterMendianDepartment',
    })
   },


   onUnload(){
    wx.removeStorageSync('myDate');
    wx.removeStorageSync('searchDep')
   },
   
  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

})