const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');
var dateUtils = require('../../../../utils/dateUtil');
import apiUrl from '../../../../config.js'

import {
  disGetDinghuoByDate,
  disGetDepPurchaserGoodsByDate
} from '../../../../lib/apiDepOrder'

//
Page({

  onShow(){
    
    


  },

  /**
   * 页面的初始数据
   */
  data: {
    openIndex: -1
    
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
      value: options.value,
      date: options.day,
      type: options.type,
     
    })
    var depInfoValue = wx.getStorageSync('depItem');
    this.setData({
      depInfo: depInfoValue,
      depFatherId: depInfoValue.gbDepartmentId,
      depId: depInfoValue.gbDepartmentId,
    })
    if(options.type !== '2'){
      this._initData();
    }else{
      this._initPurGoods()
    }

 
    
    
    
  },

  _initData() {
   
    var data = {
      type: this.data.type,
      depId: this.data.depId,
      date: this.data.date,
    }
    load.showLoading("获取数据中")
    disGetDinghuoByDate(data)
      .then(res => {
        if (res.result.code == 0) {
          load.hideLoading();
          console.log(res.result.data);
          this.setData({
            arr: res.result.data,
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


  openBatchDetail(e){
    wx.navigateTo({
      url: '../../../../subPackage/pages/supplier/myPurchaseDetail/myPurchaseDetail?batchId=' + e.currentTarget.dataset.id,
    })
  },



  openFather(e) {
    var fatherIndex = e.currentTarget.dataset.fatherindex;
    var fatherOpen = this.data.purArr[fatherIndex].isSelected;
    var purData = "purArr[" + fatherIndex + "].isSelected";
    if (fatherOpen) {
      this.setData({
        [purData]: false
      })
    } else {
      var arr = this.data.purArr;
      for (var i = 0; i < arr.length; i++) {
        var purData = "purArr[" + i + "].isSelected";
        if (fatherIndex == i) {
          this.setData({
            [purData]: true,
            openIndex: fatherIndex,
          })
        } else {
          this.setData({
            [purData]: false
          })
        }
      }
    }
  },



  
  _initPurGoods(e){
    var data = {
      
      depId: this.data.depId,
      date: this.data.date,
    }
    load.showLoading("获取数据中")
     console.log(data)
    disGetDepPurchaserGoodsByDate(data).then(res =>{
      load.hideLoading();
      if(res.result.code == 0){
        this.setData({
          purArr: res.result.data,
        })
      }
    })
  },


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




})