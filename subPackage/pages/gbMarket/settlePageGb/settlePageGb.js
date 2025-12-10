const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');
var dateUtils = require('../../../../utils/dateUtil');

import apiUrl from '../../../../config.js'
import {
  disGetGbSupplierBillsWithStatus,

} from '../../../../lib/apiDistributerGb'


import {
  finishPayPurchaseBatchGb
} from '../../../../lib/apiDepOrder'


Page({



  /**
   * 页面的初始数据
   */
  data: {
    selectArr: [],
    isAllSelected: false,  // 全选状态
    selectedCount: 0,      // 已选择数量
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      statusBarHeight: globalData.statusBarHeight * globalData.rpxR,
      url: apiUrl.server,
      status: options.type,
      supplierId: options.supplierId,
      gbDisId: options.gbDisId,
      startDate: dateUtils.getMonthFirstAndLastDay(options.month).firstDay,
      stopDate: dateUtils.getMonthFirstAndLastDay(options.month).lastDay,

    })

     // 获取用户信息
     var jrdhUserInfo = wx.getStorageSync('jrdhUserInfo');
     if (jrdhUserInfo) {
       this.setData({
         jrdhUserInfo: jrdhUserInfo
       });
     }
     
    this._initData();
  },

  _initData() {
    load.showLoading("获取账单")
    var data = {
      status: this.data.status,
      supplierId: this.data.supplierId,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      disId: this.data.gbDisId
    }
    disGetGbSupplierBillsWithStatus(data).then(res => {
      console.log(res.result.data)
      if (res.result.code == 0) {
        load.hideLoading();
        // 初始化每个订单的选中状态
        const arr = res.result.data.map(item => ({
          ...item,
          isSelect: false
        }));
        
        this.setData({
          arr: arr,
          selectArr: [],
          isAllSelected: false,
          selectedCount: 0
        })
      } else {
        load.hideLoading();
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })
        this.setData({
          applyArr: []
        })
      }
    })
  },




  selectBill(e) {
    var index = e.currentTarget.dataset.index;
    var isSelect = e.detail.value;
    var arr = this.data.arr;
    var item = arr[index];
    var selectArr = this.data.selectArr;

    // 更新订单的选中状态
    arr[index].isSelect = isSelect;

    if (isSelect) {
      selectArr.push(item);
    } else {
      var selectId = item.gbDistributerPurchaseBatchId;
      selectArr.splice(selectArr.findIndex(item => item.gbDistributerPurchaseBatchId === selectId), 1);
    }

    // 计算选中数量和全选状态
    const selectedCount = selectArr.length;
    const isAllSelected = selectedCount === arr.length;

    this.setData({
      arr: arr,
      selectArr: selectArr,
      selectedCount: selectedCount,
      isAllSelected: isAllSelected
    });
    
    this._countTotal();
  },

  _countTotal() {
    var selectArr = this.data.selectArr;
    var temp = 0;
    for (var i = 0; i < selectArr.length; i++) {
      var itemTotal = Number(selectArr[i].gbDpbSubtotal);
      
      // 如果是退货单（gbDpbPurchaseType == 9），则减去金额
      if (selectArr[i].gbDpbPurchaseType == 9) {
        temp = temp - itemTotal;
      } else {
        temp = temp + itemTotal;
      }
    }
    this.setData({
      total: temp.toFixed(1),
      selAmount: selectArr.length
    })
  },

  // 全选/取消全选
  selectAllBills(e) {
    const isAllSelected = e.detail.value;
    const arr = this.data.arr;
    const selectArr = [];

    // 更新所有订单的选中状态
    arr.forEach(item => {
      item.isSelect = isAllSelected;
      if (isAllSelected) {
        selectArr.push(item);
      }
    });

    // 更新数据
    this.setData({
      arr: arr,
      selectArr: selectArr,
      isAllSelected: isAllSelected,
      selectedCount: isAllSelected ? arr.length : 0
    });

    // 重新计算总金额
    this._countTotal();
  },

  // 清空所有选择
  clearAllSelection() {
    const arr = this.data.arr;

    // 清空所有选中状态
    arr.forEach(item => {
      item.isSelect = false;
    });

    // 更新数据
    this.setData({
      arr: arr,
      selectArr: [],
      isAllSelected: false,
      selectedCount: 0
    });

    // 重新计算总金额
    this._countTotal();
  },

  settleBills() {
    this.setData({
      isTishi: true,
    })
  },

  cancleSettle() {
    this.setData({
      isTishi: false,
      selAmount: 0,

    })
    this._initData();
  },
  

  settleAccount() {
    var that = this;
    load.showLoading("结算订单");
    
    // 准备接口参数
    const selectArr = this.data.selectArr;
    if (selectArr.length === 0) {
      wx.showToast({
        title: '请选择要结算的订单',
        icon: 'none'
      });
      return;
    }
    
    // 构建参数
    const params = {
      ids: selectArr.map(item => item.gbDistributerPurchaseBatchId).join(','), // 批次ID字符串，逗号分隔
      gbDisId: this.data.gbDisId || this.data.disInfo?.gbDistributerId, // 配送商ID
      total: this.data.total, // 总金额
      supplierId: this.data.supplierId, // 供应商ID
      userId: this.data.jrdhUserInfo.nxJrdhUserId// 用户ID
    };
    
    console.log('结算参数:', params);
    
    finishPayPurchaseBatchGb(params).then(res => {
      load.hideLoading();
      this.setData({
        isTishi: false,
        selAmount: 0,
        total: ""
      })
      if (res.result.code == 0) {
        wx.showToast({
          title: '结算成功',
          icon: 'success'
        });
        
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2]; //上一个页面
        //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
        prevPage.setData({
          skipRefresh: false
        })
        wx.navigateBack({delta: 1})
        
      } else {
        wx.showToast({
          title: res.result.msg || '结算失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      load.hideLoading();
      wx.showToast({
        title: '结算失败，请重试',
        icon: 'none'
      });
      console.error('结算失败:', err);
    });
  },
  



  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

  












})