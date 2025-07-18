import * as echarts from '../../../../ec-canvas/echarts'
const globalData = getApp().globalData;
import load from '../../../../lib/load';
import apiUrl from '../../../../config.js'

import {
  getGbDisPurchaseDepartment, 
   
} from  '../../../../lib/apiDepOrder'


Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      statusBarHeight: globalData.statusBarHeight  * globalData.rpxR,
       type: options.type,
       url: apiUrl.server
    })
    var disInfo = wx.getStorageSync('disInfo');
    if(disInfo){
      this.setData({
        disInfo: disInfo,
        disId: disInfo.gbDistributerId,
        appSupplierDepId: disInfo.appSupplierDepartment.gbDepartmentId,
        // purDepArr: disInfo.purDepartmentList,
        // stockDepArr: disInfo.stockDepartmentList,
        // kitchenDepArr: disInfo.kitchenDepartmentList,
        // peisongDepArr: disInfo.appSupplierDepartment.appSupplierList,
      })
    }
     this._getStockManagmentData();
  },


  _getStockManagmentData(){
    getGbDisPurchaseDepartment(this.data.disId)
    .then(res =>{
      if(res.result.code == 0){
        console.log(res.result.data);
        this.setData({
          stockDepArr: res.result.data.stock,
          mendianArr: res.result.data.mendian,
          purDepArr: res.result.data.purchase,
          kitchenDepArr: res.result.data.kitchen,

        })
      }
    })
  },

  toNext(e){
    console.log(e)
    if(this.data.type == "bill"){
      wx.setStorageSync('depItem', e.currentTarget.dataset.item);
      var type = e.currentTarget.dataset.type;
      var id = e.currentTarget.dataset.id;
      console.log(e.currentTarget.dataset.type);
      var nxDisId = "";
      var depId = "";
      if(type == "dep"){
       nxDisId = -1;
       depId = id;
      }else{
       nxDisId = id;
       depId = -1;
      }
      wx.navigateTo({
        url: '../purchaseBills/purchaseBills?depId='
         +  depId + '&nxDisId=' + nxDisId,
      })
    } else if(e.currentTarget.dataset.type == "supplier"){
      console.log(e)
      wx.navigateTo({
        url: '../../supplier/index/index?depId=' + e.currentTarget.dataset.id + '&depName=' + 
        e.currentTarget.dataset.item.gbDepartmentName,
      })
    }
  },


  toNxDis(e){
    wx.navigateTo({
      url: '../../yishang/settleAccount/settleAccount?nxDisId=' + e.currentTarget.dataset.id + "&gbDisId=" + this.data.disInfo.gbDistributerId,
    })

  },

  myNxDistributerBillPay(e) {
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: '../../yishang/nxDistributerDetail/nxDistributerDetail?nxDisId=' + id +
        '&name=' + name + '&toDepId=' + this.data.appSupplierDepId + '&gbDisId=' + this.data.disInfo.gbDistributerId ,
    })
  },



  toBack(){
    wx.navigateBack({
      delta: 0,
    })
  },


  
})