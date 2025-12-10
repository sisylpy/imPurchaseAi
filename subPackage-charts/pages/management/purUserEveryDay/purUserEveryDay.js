const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');
var dateUtils = require('../../../../utils/dateUtil');
import apiUrl from '../../../../config.js'

import {
  disGetPurUserDate,
  
} from '../../../../lib/apiDepOrder'


Page({

  onShow(){
   
   if(this.data.update){
    var myDate = wx.getStorageSync('myDate');
    if(myDate){
      this.setData({
        startDate: dateUtils.getDateRange(myDate.name).startDate,
        stopDate: dateUtils.getDateRange(myDate.name).stopDate,
        dateType: myDate.dateType,
        hanzi:  myDate.hanzi,
      })

    }
    
    this._initData();
   }
    
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var value = wx.getStorageSync('disInfo');
    if (value) {
      this.setData({
        disId: value.gbDistributerId,
        disInfo: value,
      })
    }

  

    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      url: apiUrl.server,
      purUserId: options.purUserId,
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

    var purUserItem = wx.getStorageSync('purUserItem');
    if(purUserItem){
      this.setData({
        purUserItem: purUserItem
      })
    }

   

     this._initData();
   
  },
  



  _initData() {
  

    var data = {
      disId: this.data.disId,
      purUserId: this.data.purUserId,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
    }
    
    console.log('请求参数:', data);
    
    load.showLoading("获取数据中")
    disGetPurUserDate(data)
      .then(res => {
        if (res.result.code == 0) {
          load.hideLoading();
          console.log('API返回数据:', res.result.data);
           this.setData({
             zicaiArr: res.result.data
           })
         
        } else {
          load.hideLoading();
          wx.showToast({
            title: res.result.msg || '获取数据失败',
            icon: 'none'
          })
        }
      })
      .catch(error => {
        load.hideLoading();
        console.error('API调用失败:', error);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
      })
  },


  toDetail(e) {
    var day = e.currentTarget.dataset.item.day;
    var value = e.currentTarget.dataset.item.zicai;
    wx.navigateTo({
      url: '../purUserDayDeatil/purUserDayDeatil?date=' + day + '&value=' + value +'&purUserId=' + this.data.purUserId,
    })
  },




  toDatePage() {
    this.setData({
      update: false,
    })
    wx.navigateTo({
      url: '../../sel/date/date?startDate=' + this.data.startDate +
        '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },


  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

  onUnload(){
    wx.removeStorageSync('supplierItem');
    wx.removeStorageSync('purUserItem');
  },


//

})