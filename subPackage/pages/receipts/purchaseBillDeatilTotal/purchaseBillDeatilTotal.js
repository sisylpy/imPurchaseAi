const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');
var dateUtils = require('../../../../utils/dateUtil');
import apiUrl from '../../../../config.js'

import {
  disGetDinghuoByDate,
  disGetNxDistributerPurGoodsDate
} from '../../../../lib/apiDepOrder'


Page({

  onShow(){
    // this._getSearchDepIds();
    if(this.data.update){
      var myDate = wx.getStorageSync('myData');
      if(myDate){
        this.setData({
          startDate: myDate.startDate,
          stopDate: myDate.stopDate,
          dateType: myDate.dateType,
        })
      }
      this._initData();
    }
   
  },

  /**
   * 页面的初始数据
   */
  data: {
    openIndex: -1,
    ifFirstLoad: true,
    searchDepId: -1,
    
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
      value: options.value,
      date: options.day,
      type: options.type,
      startDate: options.day,
      stopDate: options.day,
      dateType: "day"
    
    })
    this._initData();
  },
  

  _initData() {
    var ids = [];
    var arr = this.data.disInfo.mendianDepartmentList;
    for(var i = 0 ;i < arr.length; i++){
      ids.push(arr[i].gbDepartmentId)
    }
    var data = {
      type: this.data.type,
      disId: this.data.disId,
      searchDepIds: -1,
      searchDepId: this.data.searchDepId,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate
    }
    load.showLoading("获取数据中")
    disGetDinghuoByDate(data)
      .then(res => {
        if (res.result.code == 0) {
          load.hideLoading();
          console.log(res.result.data);
          this.setData({
            arr: res.result.data.arr,
            // resultDepList: res.result.data.depArr,
          })
        } else {
          load.hideLoading();
          wx.showToast({
            title: res.result.msg,
            icon: 'none'
          })
        }

      })
  },





  toDatePage(){
    console.log("todate")
     wx.navigateTo({
       url: '../../sel/date/date?startDate=' + this.data.startDate
        + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
     })
   },


  openBatchDetail(e){
    wx.navigateTo({
      url: '../../../../subPackage/pages/supplier/myPurchaseDetail/myPurchaseDetail?batchId=' + e.currentTarget.dataset.id,
    })
  },

  openAccountBill(e){
    var id = e.currentTarget.dataset.id;
    var depId = e.currentTarget.dataset.depid;
    wx.setStorageSync('nxDisItem', e.currentTarget.dataset.dis);
   
    wx.navigateTo({
      url: '../../yishang/issuePage/issuePage?billId='+ id + '&depFatherId=' + depId,
    })
},
//

  toJudhSupplier(e){
    wx.navigateTo({
      url: '../../../../subPackage/pages/supplier/supplierDetail/supplierDetail?supplierId=' + e.currentTarget.dataset.id +'&supplierName=' + e.currentTarget.dataset.name,
    })
  },



  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },


//

})