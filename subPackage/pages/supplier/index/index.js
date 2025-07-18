

var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import apiUrl from '../../../../config.js'

import {
  depGetSupplier,
  deleteGbDisSuppler,
  
} from '../../../../lib/apiDistributer.js'

Page({


  
  data: {
    
    supplierArr:[]
  },

  onShow(){
   
  },

  onLoad(options) {


    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight  * globalData.rpxR,
      depName: options.depName,
      url: apiUrl.server,
    })

    var disInfo = wx.getStorageSync('disInfo');
    if(disInfo){
      this.setData({
        disInfo: disInfo,
        depId: disInfo.purDepartmentList[0].gbDepartmentId,
    })
  }
    this._initData();

  },

_initData(){

  depGetSupplier(this.data.depId).then(res => {
    load.showLoading("获取库房")
    if (res.result.code == 0) {
      load.hideLoading();
      this.setData({
        supplierArr: res.result.data,

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


openOperation(e) {   
  this.setData({
    showOperation: true,
    supplierItem: e.currentTarget.dataset.item,
  })
  this.chooseSezi();

},


hideMask() {
 
  this.setData({
    showOperation: false,
  })
  this.hideModal()
},

chooseSezi: function (e) {
  // 用that取代this，防止不必要的情况发生
  var that = this;
  // 创建一个动画实例
  var animation = wx.createAnimation({
    // 动画持续时间
    duration: 100,
    // 定义动画效果，当前是匀速
    timingFunction: 'linear'
  })
  // 将该变量赋值给当前动画
  that.animation = animation
  // 先在y轴偏移，然后用step()完成一个动画
  animation.translateY(200).step()
  // 用setData改变当前动画
  that.setData({
    // 通过export()方法导出数据
    animationData: animation.export(),
    // 改变view里面的Wx：if
    chooseSize: true
  })
  // 设置setTimeout来改变y轴偏移量，实现有感觉的滑动
  setTimeout(function () {
    animation.translateY(0).step()
    that.setData({
      animationData: animation.export()
    })
  }, 20)
},

hideModal: function (e) {
  var that = this;
  var animation = wx.createAnimation({
    duration: 1000,
    timingFunction: 'linear'
  })
  that.animation = animation
  animation.translateY(200).step()
  that.setData({
    animationData: animation.export()

  })
  setTimeout(function () {
    animation.translateY(0).step()
    that.setData({
      animationData: animation.export(),
      chooseSize: false
    })
  }, 200)
},


toSupplierDetail(e) {
 
  this.hideMask();
  wx.setStorageSync('supplierItem', this.data.supplierItem);
  wx.navigateTo({
    url: '../supplierBills/supplierBills',
  })
},


toSupplierGoods(){
 
  this.hideMask();
  wx.setStorageSync('supplierItem', this.data.supplierItem);
  wx.navigateTo({
    url: '../supplierGoods/supplierGoods',
  })
},


toDeleteSupplier(){
  load.showLoading("删除订货商");
  deleteGbDisSuppler(this.data.supplierItem.nxJrdhSupplierId).then(res =>{
    if(res.result.code == 0){
      load.hideLoading();
      
      this._initData();
      this.setData({
        showOperation: false,
        supplierItem: ""
      })
    }else{
     
      wx.showToast({
        title: res.result.msg,
        icon: 'none'
      })
    }
  })
},


toSupplierFenxi(){
  this.hideMask();

  wx.navigateTo({
    url: '../jrdhGoodsFenxi/jrdhGoodsFenxi?id=' + this.data.supplierItem.nxJrdhSupplierId + '&disId=' + this.data.disInfo.gbDistributerId ,
  })
},


toSupplierStars(){
  this.hideMask();

  wx.navigateTo({
    url: '../jrdhGoodsStars/jrdhGoodsStars?supplierId=' + this.data.supplierItem.nxJrdhSupplierId +'&goodsId=-1' + '&from=navigate',
  })
},

toBack() {
  wx.navigateBack({
    delta: 1,
  })
},


onUnload(){
  wx.removeStorageSync('supplierItem');
  
}





})