var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import apiUrl from '../../../../config.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedPurUserId: '', // 选中的采购员ID
    selectedSupplierId: '', // 选中的供货商ID
    selectedPurUserName: '', // 已选择的采购员名称（从上一页传入）
    selectedSupplierNameFromPrev: '', // 已选择的供货商名称（从上一页传入）
    currentPurUserId: '', // 当前已选择的采购员ID（从上一页传入）
    currentSupplierId: '', // 当前已选择的供货商ID（从上一页传入）
    hasPurUserSelected: false, // 是否选择了采购员
    hasSupplierSelected: false, // 是否选择了供货商
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('filterData onLoad options:', options);
    
    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight  * globalData.rpxR,
      url: apiUrl.server,
      currentPurUserId: String(options.purUserIds || options.purUserId || '-1'),
      currentSupplierId: String(options.supplierIds || options.supplierId || '-1'),
    })
    
    // 初始化数据
    this._initPurUser();
    this._initSupplierData();
   

  },

  /**
   * 页面显示时触发
   */
  onShow() {
    // 页面显示时不需要额外处理
  },



  _initPurUser(){
    console.log('开始初始化采购员数据，从缓存获取');
    
    // 从缓存获取采购员列表
    const purUserList = wx.getStorageSync('purUserList') || [];
    console.log('从缓存获取采购员列表:', purUserList);
    
    if (purUserList && purUserList.length > 0) {
      // 为每个采购员添加选中状态
      const updatedPurUserList = purUserList.map(item => {
        let isSelected = false;
        
        // 检查当前采购员是否被选中
        if (this.data.currentPurUserId && this.data.currentPurUserId !== '-1') {
          isSelected = this.data.currentPurUserId === item.gbDepartmentUserId.toString();
        }
        
        return {
          ...item,
          isSelected: isSelected
        };
      });
      
      this.setData({
        purUserList: updatedPurUserList,
      })
      
      // 更新选择状态
      this._updateSelectionState();
    } else {
      this.setData({
        purUserList: [],
      })
    }
  },

  _initSupplierData(){
    console.log('开始初始化供货商数据');
    // 从缓存获取供货商列表
    const supplierList = wx.getStorageSync('supplierList') || [];
    console.log('从缓存获取供货商列表:', supplierList);
    
    if (supplierList && supplierList.length > 0) {
      // 为每个供货商添加选中状态
      const supplierArr = supplierList.map(item => {
        let isSelected = false;
        
        // 检查当前供货商是否被选中
        if (this.data.currentSupplierId && this.data.currentSupplierId !== '-1') {
          isSelected = this.data.currentSupplierId === item.nxJrdhSupplierId.toString();
        }
        
        return {
          ...item,
          isSelected: isSelected
        };
      });
      
      this.setData({
        supplierArr: supplierArr,
      })
      
      // 更新选择状态
      this._updateSelectionState();
    } else {
      this.setData({
        supplierArr: []
      })
    }
  },

  // 更新选择状态
  _updateSelectionState() {
    // 更新采购员选择状态
    if (this.data.purUserList) {
      const updatedPurUserList = this.data.purUserList.map(item => {
        let isSelected = false;
        if (this.data.currentPurUserId && this.data.currentPurUserId !== '-1') {
          isSelected = this.data.currentPurUserId === item.gbDepartmentUserId.toString();
        }
        return { ...item, isSelected };
      });
      
      this.setData({ purUserList: updatedPurUserList });
      
      // 更新采购员选择状态
      const hasPurUserSelected = updatedPurUserList.some(item => item.isSelected);
      this.setData({ hasPurUserSelected });
    }
    
    // 更新供货商选择状态
    if (this.data.supplierArr) {
      const updatedSupplierArr = this.data.supplierArr.map(item => {
        let isSelected = false;
        if (this.data.currentSupplierId && this.data.currentSupplierId !== '-1') {
          isSelected = this.data.currentSupplierId === item.nxJrdhSupplierId.toString();
        }
        return { ...item, isSelected };
      });
      
      this.setData({ supplierArr: updatedSupplierArr });
      
      // 更新供货商选择状态
      const hasSupplierSelected = updatedSupplierArr.some(item => item.isSelected);
      this.setData({ hasSupplierSelected });
    }
  },



  // 选择采购员
  selectPurUser(e) {
    const index = e.currentTarget.dataset.index;
    const purUser = this.data.purUserList[index];
    
    // 清空所有筛选缓存
    wx.removeStorageSync('selectedSupplier');
    wx.removeStorageSync('selectedPurUser');
    
    // 存储新的采购员选择
    wx.setStorageSync('selectedPurUser', {
      purUserId: purUser.gbDepartmentUserId,
      purUserName: purUser.gbDuWxNickName
    });
    
    // 直接返回上一页
    wx.navigateBack();
  },

  // 选择供货商
  selectSupplier(e) {
    const index = e.currentTarget.dataset.index;
    const supplier = this.data.supplierArr[index];
    
    // 清空所有筛选缓存
    wx.removeStorageSync('selectedSupplier');
    wx.removeStorageSync('selectedPurUser');
    
    // 存储新的供货商选择
    wx.setStorageSync('selectedSupplier', {
      supplierId: supplier.nxJrdhSupplierId,
      supplierName: supplier.nxJrdhsSupplierName
    });
    
    // 直接返回上一页
    wx.navigateBack();
  },

  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

})