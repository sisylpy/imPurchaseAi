var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
var dateUtils = require('../../../../utils/dateUtil');

import apiUrl from '../../../../config.js'

import {
  purUserGetStars
} from '../../../../lib/apiDepOrder.js'

Page({

  onShow(){
    if(this.data.update){
      
      var myDate = wx.getStorageSync('myDate');
      if(myDate){
        this.setData({
          startDate: dateUtils.getDateRange(myDate.name).startDate,
          stopDate: dateUtils.getDateRange(myDate.name).stopDate,
          dateType: myDate.dateType,
        })
      }else{
        this.setData({
          dateType: 'month',
          startDate: dateUtils.getFirstDateInMonth(),
          stopDate: dateUtils.getArriveDate(0),
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
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      url: apiUrl.server,
      purUserId: options.purUserId,
      goodsId: options.goodsId,
      from: options.from
    
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
    console.log("options",options)

      this._getInitData();
    
  },

  _getInitData() {
    var data = {
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      purUserId: this.data.purUserId,
      goodsId: -1
      
    }
    load.showLoading("获取数据中");
    purUserGetStars(data)
      .then(res => {
        load.hideLoading();
        console.log(res.result.data)
        if (res.result.code == 0) {
          this.setData({
            arr: res.result.data.arr,
            purUserInfo: res.result.data.purUserInfo,
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
    if(this.data.from == 'staff'){
      wx.navigateBack({
        delta: 1,
      })
      
    }else{
      wx.redirectTo({
        url: '../../../../pages/index/index',
      })
    }
   
  },

  onUnload(){
    
  }

})