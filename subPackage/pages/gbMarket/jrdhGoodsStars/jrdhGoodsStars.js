var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
var dateUtils = require('../../../../utils/dateUtil');

import apiUrl from '../../../../config.js'

import {
  supplierGetStars
} from '../../../../lib/apiDepOrder.js'

Page({

  onShow(){

    // 推荐直接用新API
    let windowInfo = wx.getWindowInfo();
    let globalData = getApp().globalData;
    this.setData({
      windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      statusBarHeight: globalData.statusBarHeight * globalData.rpxR,
    });

    if(this.data.update){
      
      var myDate = wx.getStorageSync('myDate');
      console.log("showowowow", myDate)
      if(myDate){
        this.setData({
          startDate: myDate.startDate,
          stopDate: myDate.stopDate,
          dateType: myDate.dateType,
        })
      }
      this._getInitData();
     
    }
    
  },
  
  /**
   * 页面的初始数据
   */
  data: {

    type: "goods",
    typeString: "",
    showSearch: false

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      url: apiUrl.server,
      supplierId: options.id,
      from: options.from,
    
    })
    var myDate = wx.getStorageSync('myDate');
    if(myDate){
      this.setData({
        startDate: dateUtils.getDateRange(myDate.name).startDate,
        stopDate: dateUtils.getDateRange(myDate.name).stopDate,
        dateType: myDate.dateType,
        hanzi:  myDate.hanzi,
      })
    }else{
      this.setData({
        dateType: 'month',
        startDate: dateUtils.getFirstDateInMonth(),
        stopDate: dateUtils.getArriveDate(0),
        hanzi:  "本月",
      })
    }


   var jrdhUserInfo = wx.getStorageSync('jrdhUserInfo');
   if(jrdhUserInfo){
     this.setData({
      jrdhUserInfo: jrdhUserInfo
     })
   }
      this._getInitData();
    
  },

  _getInitData() {
    var data = {
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      supplierId: this.data.supplierId,
      goodsId: -1,
    
      
    }
    load.showLoading("获取数据中");
    supplierGetStars(data)
      .then(res => {
        load.hideLoading();
        console.log(res.result.data)
        if (res.result.code == 0) {
          this.setData({
            arr: res.result.data.arr,
            tuihuoSubtotal: res.result.data.tuihuoSubtotal,
            tuihuoCount: res.result.data.tuihuoCount,
          })
        }
      }) 
  },


  toDatePage(){
    this.setData({
      update: true,
    })
    wx.navigateTo({
      url: '../../sel/date/date?startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },


  showDialogBtn(e){
    this.setData({
      showStarDialage: true,
      showGoods: e.currentTarget.dataset.item,
    })
  },

  cancle(){
    this.setData({
      showStarDialage: false,
      showGoods: "",
    })
  },
  

  toBack() {
    if(this.data.from == 'supplier'){

      wx.navigateBack({
        delta: 1,
      })
      
    }else{
     
      wx.redirectTo({
        url: '../../jinriListWithLogin/jinriListWithLogin',
      })
    }
   
  },


  onUnload(){
    
  }

})