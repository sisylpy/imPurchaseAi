const globalData = getApp().globalData;

var load = require('../../../../lib/load.js');
import apiUrl from '../../../../config.js'
var dateUtils = require('../../../../utils/dateUtil');

import {
  depGetSupplier,
  getDepUsersByFatherIdGb
} from '../../../../lib/apiDistributer'

import {
  
  saveReportCost
} from '../../../../lib/apiDepOrder.js'



Page({


  onShow: function () {

    // 推荐直接用新API
    let windowInfo = wx.getWindowInfo();
    let globalData = getApp().globalData;
    this.setData({
      windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
    });

  },
  /**
   * 页面的初始数据
   */
  data: {
    searchSubDeps: [],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      startDate: options.startDate,
      stopDate: options.stopDate,
      url: apiUrl.server,
    })
   
    var disInfo = wx.getStorageSync('disInfo');
    if(disInfo){
      this.setData({
        disInfo: disInfo,
        disId: disInfo.gbDistributerId,
        depId: disInfo.purDepartmentList[0].gbDepartmentId,
      })
    }
    var disUserInfo = wx.getStorageSync('userInfo');
    if(disUserInfo){
      this.setData({
        userInfo: disUserInfo
      })
    }

    this._initData();
    this._initDataP();
    
  },

  _initDataP(){
    var data  = {
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      depId: this.data.userInfo.gbDuDepartmentId
    }
    getDepUsersByFatherIdGb(data).then(res =>{
      if(res.result.code == 0){
        // 为每个采购员添加isSelected属性
        const userArr = res.result.data.map(user => ({
          ...user,
          isSelected: false
        }));
        
        this.setData({
          userArr: userArr,
        })
      }
    })
  },
  

_initData(){
  var data  = {
    startDate: this.data.startDate,
    stopDate: this.data.stopDate,
    depId: this.data.depId
  }
  depGetSupplier(data).then(res => {
    load.showLoading("获取库房")
    if (res.result.code == 0) {
      load.hideLoading();
      // 为每个供货商添加isSelected属性
      const supplierArr = res.result.data.map(supplier => ({
        ...supplier,
        isSelected: false
      }));
      
      this.setData({
        supplierArr: supplierArr,
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


  // 选择供货商方法
  selectSupplier(e) {
    console.log('selectSupplier 被调用了');
    const index = e.currentTarget.dataset.index;
    console.log('点击的索引:', index);
    const supplierArr = this.data.supplierArr;
    const userArr = this.data.userArr || [];
    
    console.log('点击前的状态:', supplierArr[index].isSelected);
    
    // 先取消所有供货商的选中状态
    supplierArr.forEach(supplier => {
      supplier.isSelected = false;
    });
    
    // 取消所有采购员的选中状态
    userArr.forEach(user => {
      user.isSelected = false;
    });
    
    // 选中当前点击的供货商
    supplierArr[index].isSelected = true;
    
    console.log('选择供货商:', supplierArr[index].nxJrdhsSupplierName, 'isSelected:', supplierArr[index].isSelected);
    
    this.setData({
      supplierArr: supplierArr,
      userArr: userArr,
      type: "purSupplier"
    });
  },

  selectPurchaser(e) {
    console.log('selectPurchaser 被调用了');
    const index = e.currentTarget.dataset.index;
    console.log('点击的索引:', index);
    const userArr = this.data.userArr;
    const supplierArr = this.data.supplierArr || [];
    
    console.log('点击前的状态:', userArr[index].isSelected);
    
    // 先取消所有采购员的选中状态
    userArr.forEach(user => {
      user.isSelected = false;
    });
    
    // 取消所有供货商的选中状态
    supplierArr.forEach(supplier => {
      supplier.isSelected = false;
    });
    
    // 选中当前点击的采购员
    userArr[index].isSelected = true;
    
    console.log('选择采购员:', userArr[index].gbDuWxNickName, 'isSelected:', userArr[index].isSelected);
    
    this.setData({
      userArr: userArr,
      supplierArr: supplierArr,
      type: "purDepUser"
    });
  },
  
  toSave(e){  
   
    var ids = "";
    if(this.data.type == 'purDepUser'){
      const userArr = this.data.userArr;
      const selectedUser = userArr.filter(user => user.isSelected);
      if(selectedUser.length > 0){
        ids = selectedUser[0].gbDepartmentUserId;
      } else {
        wx.showToast({
          title: '请选择一个采购员',
          icon: 'none'
        });
        return;
      }
    }else{
      const supplierArr = this.data.supplierArr;
      const selectedSuppliers = supplierArr.filter(supplier => supplier.isSelected);
      if(selectedSuppliers.length > 0){
        ids = selectedSuppliers[0].nxJrdhSupplierId;
      } else {
        wx.showToast({
          title: '请选择一个供货商',
          icon: 'none'
        });
        return;
      }
    }
    
    var data ={
     gbRepDisUserId: this.data.userInfo.gbDepartmentUserId,
      gbRepIds: ids,
      gbRepType: this.data.type,
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



  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

})