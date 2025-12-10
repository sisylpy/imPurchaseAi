const globalData = getApp().globalData;
var load = require('../../../lib/load.js');
import apiUrl from '../../../config.js'
var app = getApp();

import {
 
  markGbPurGoodsFinish, // 未采购
  finishPurGoodsToStock,
  purUserGetPurGoodsInfo
  
} from '../../../lib/apiDistributer'


Page({

  /**
   * 页面的初始数据
   */
  data: {
    focusIndex: -1,
    foucusPrice: false,
    foucusWeight: false,

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
    
    })
    var disInfo = wx.getStorageSync('disInfo');
    if (disInfo) {
      this.setData({
        disInfo: disInfo,
        disId: disInfo.gbDistributerId,
        depId: disInfo.purDepartmentList[0].gbDepartmentId,
      })
    } 
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        userId: userInfo.gbDepartmentUserId,
      })
    }


    var purArr = wx.getStorageSync('purArr');
    if(purArr){
      // 保存原始数据，用于弹出窗口和后台接口
      this.setData({
        purArr: purArr
      })
      
      // 创建显示用的数据，只显示被选中的订单
      var displayPurArr = purArr.map(item => {
        var displayItem = JSON.parse(JSON.stringify(item)); // 深拷贝
        if (displayItem.gbDistributerGoodsEntity && displayItem.gbDistributerGoodsEntity.gbDepartmentOrdersEntities) {
          // 过滤订单，只保留被选中的订单（isNotice为true）
          var filteredOrders = displayItem.gbDistributerGoodsEntity.gbDepartmentOrdersEntities.filter(order => order.isNotice === true);
          displayItem.gbDistributerGoodsEntity.gbDepartmentOrdersEntities = filteredOrders;
        }
        return displayItem;
      });
      
      // 过滤掉没有选中订单的商品
      displayPurArr = displayPurArr.filter(item => {
        return item.gbDistributerGoodsEntity && 
               item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities && 
               item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities.length > 0;
      });
      
      this.setData({
        displayPurArr: displayPurArr
      })
    }

  },



  showInputOrder(e) {
    
    console.log(e);
    var item = e.currentTarget.dataset.item;
    
    // 从原始数据中找到对应的完整商品数据（包含所有订单）
    var originalItem = null;
    if (this.data.purArr) {
      originalItem = this.data.purArr.find(original => 
        original.gbDistributerPurchaseGoodsId === item.gbDistributerPurchaseGoodsId
      );
    }
    
    // 使用完整数据，但在显示时过滤掉未选择的订单
    var fullItem = originalItem || item;
    
    // 创建显示用的数据，过滤掉未选择的订单，并设置hasChoice字段
    var displayItem = JSON.parse(JSON.stringify(fullItem));
    if (displayItem.gbDistributerGoodsEntity && displayItem.gbDistributerGoodsEntity.gbDepartmentOrdersEntities) {
      // 过滤订单，只保留被选中的订单（isNotice为true）
      var filteredOrders = displayItem.gbDistributerGoodsEntity.gbDepartmentOrdersEntities.filter(order => order.isNotice === true);
      
      // 将isNotice字段映射为hasChoice字段，供inputOrder组件使用
      filteredOrders.forEach(order => {
        order.hasChoice = order.isNotice;
      });
      
      displayItem.gbDistributerGoodsEntity.gbDepartmentOrdersEntities = filteredOrders;
    }
  
    var data = {
      purUserId: this.data.userId,
      disGoodsId: fullItem.gbDpgDisGoodsId,
    }
    purUserGetPurGoodsInfo(data).then(res =>{
      console.log("resss", res.result.data);
      var that  = this;
      if(res.result.code == 0){
     
        displayItem.gbDpgBuyPrice = res.result.data;
         var orderArr = displayItem.gbDistributerGoodsEntity.gbDepartmentOrdersEntities;
         var goodsStandard = displayItem.gbDistributerGoodsEntity.gbDgGoodsStandardname;
         var hasPriceCount = 0;
         var buySubtotal = 0;
         if(orderArr.length > 0){
           var arrList = [];
           for(var i = 0; i < orderArr.length; i++){
             console.log("standna",goodsStandard  )
             if(orderArr[i].gbDoStandard == goodsStandard){
               var order = orderArr[i];
               order.gbDoPrice = res.result.data;
               console.log("standna",order  )

               order.gbDoWeight = order.gbDoQuantity;
               var subtotal = (Number(order.gbDoQuantity) * Number(res.result.data)).toFixed(1);
               order.gbDoSubtotal = subtotal;
               console.log("standna",subtotal  )
               arrList.push(order);
               hasPriceCount += 1;
               buySubtotal = Number(buySubtotal) + Number(subtotal);
             }
           }
         }
         displayItem.gbDistributerGoodsEntity.gbDepartmentOrdersEntities = arrList;
         displayItem.gbDpgBuySubtotal = buySubtotal;
        that.setData({
          item: displayItem,
          fullItem: fullItem, // 保存完整数据用于后台接口
          show: true,
          foucusWeight:true,
          foucusPrice: false,
         windowHeight: this.data.windowHeight,
        })
        if(hasPriceCount == displayItem.gbDistributerGoodsEntity.gbDepartmentOrdersEntities.length){
          this.setData({
            canSave: true,
          })
        }else{
          this.setData({
            canSave: false,
          })
        }
      }else{
        that.setData({
          item: displayItem,
          fullItem: fullItem, // 保存完整数据用于后台接口
          show: true,
          foucusWeight:false,
          foucusPrice: true,
          canSave: false,
      windowHeight: this.data.windowHeight,
        })
      }
    })
  
  },

  confirm(e) {
    // 使用保存的完整数据（包含所有订单）进行后台接口调用
    var fullItem = this.data.fullItem || e.detail.item;
    
    // 将用户在弹出窗口中修改的数据同步到完整数据中
    var item = e.detail.item;
    if (fullItem.gbDistributerGoodsEntity && fullItem.gbDistributerGoodsEntity.gbDepartmentOrdersEntities) {
      fullItem.gbDpgBuyPrice = item.gbDpgBuyPrice;
      fullItem.gbDpgBuySubtotal = item.gbDpgBuySubtotal;
      
      // 确保hasChoice字段正确设置（基于isNotice字段）
      var fullOrders = fullItem.gbDistributerGoodsEntity.gbDepartmentOrdersEntities;
      fullOrders.forEach(order => {
        order.hasChoice = order.isNotice;
      });
      
      // 同步订单数据
      var displayOrders = item.gbDistributerGoodsEntity.gbDepartmentOrdersEntities;
      
      for (var i = 0; i < fullOrders.length; i++) {
        for (var j = 0; j < displayOrders.length; j++) {
          if (fullOrders[i].gbDoId === displayOrders[j].gbDoId) {
            fullOrders[i].gbDoPrice = displayOrders[j].gbDoPrice;
            fullOrders[i].gbDoWeight = displayOrders[j].gbDoWeight;
            fullOrders[i].gbDoSubtotal = displayOrders[j].gbDoSubtotal;
            break;
          }
        }
      }
    }
    
    fullItem.gbDpgPurUserId = this.data.userInfo.gbDepartmentUserId;
    fullItem.gbDpgPurchaseDepartmentId = this.data.userInfo.gbDuDepartmentId
    console.log(fullItem);
    load.showLoading("保存数据")
    finishPurGoodsToStock(fullItem).then(res => {
      load.hideLoading();
      if (res.result.code == 0) {
        this.setData({
          show: false,
        })
        this._updateArr();
      }
    })
  },

 _updateArr(){
  var arr = this.data.purArr;
  var item = this.data.item;
  if(arr.length > 0){
    arr = arr.filter(obj => obj.gbDistributerPurchaseGoodsId !== item.gbDistributerPurchaseGoodsId);
    this.setData({
      purArr: arr,
    })
    
    // 同时更新显示数组
    var displayArr = this.data.displayPurArr;
    if(displayArr.length > 0){
      displayArr = displayArr.filter(obj => obj.gbDistributerPurchaseGoodsId !== item.gbDistributerPurchaseGoodsId);
      this.setData({
        displayPurArr: displayArr,
      })
    }
  }

 },
  cancle() {
    this.setData({
      show: false,
      item: ""
    })
  },




  toBack(){
    wx.navigateBack({
      delta: 1
    })
  },

  onUnload(){

    wx.removeStorageSync('purArr')
  }





})