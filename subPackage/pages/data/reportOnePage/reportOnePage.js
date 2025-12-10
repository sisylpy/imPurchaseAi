var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import apiUrl from '../../../../config.js'
var dateUtils = require('../../../../utils/dateUtil');


import {
  getEveryGoodsFatherMangement,
  getDisUserInfo
} from '../../../../lib/apiDistributer.js'


Page({

  
  onShow(){


    // 推荐直接用新API
    let windowInfo = wx.getWindowInfo();
    let globalData = getApp().globalData;
    this.setData({
      windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
    });

   
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
      url: apiUrl.server,
      startDate: options.startDate,
      stopDate: options.stopDate,
      dateType: options.dateType,
      userId: options.userId,
    })

    var disInfo = wx.getStorageSync('disInfo');
    if (disInfo) {
      this.setData({
        disInfo: disInfo,
        mendianArr: disInfo.mendianDepartmentList,
        stockArr: disInfo.stockDepartmentList,
        purArr: disInfo.purDepartmentList,
        appArr: disInfo.appSupplierDepartment.appSupplierList,

      })
    }
    // this._getDisInfo();
  },



  openList(e) {
    var openIndex = this.data.openIndex;
    if (e.currentTarget.dataset.index == openIndex) {
      this.setData({
        openIndex: '-1'
      })
    } else {
      this.setData({
        openIndex: e.currentTarget.dataset.index
      })
    }
  },

  toMyDate(){
    this.setData({
      updateMyDate: false,
      update: false
    })
    wx.navigateTo({
      url: '../../../../pages/sel/myDate/myDate',
    })
  },

  
  toDatePage(){
    wx.navigateTo({
      url: '../../../../pages/sel/dateReport/dateReport?startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType + '&userId=' + this.data.userInfo.gbDepartmentUserId,
    })
  },

  toTwoPage(e) {
 
    wx.navigateTo({
      url: '../reportTwoPage/reportTwoPage?id=' + e.currentTarget.dataset.id +
        '&type=' + e.currentTarget.dataset.type + '&name=' + e.currentTarget.dataset.name + '&startDate=' + this.data.startDate +
        '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },

  toTwoPageNx(e) {

    wx.navigateTo({
      url: '../reportTwoPageNx/reportTwoPageNx?id=' + e.currentTarget.dataset.id +
        '&type=' + e.currentTarget.dataset.type + '&name=' + e.currentTarget.dataset.name + '&startDate=' + this.data.startDate +
        '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },

  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

})