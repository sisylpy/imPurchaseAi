var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;

import {
  disCheckUnPayBillsGb,
  finishPayPurchaseBatchGb
} from '../../../../lib/apiDepOrder'


Page({


  onShow: function () {

    // 推荐直接用新API
    let windowInfo = wx.getWindowInfo();
    let globalData = getApp().globalData;
    this.setData({
      windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      statusBarHeight: globalData.statusBarHeight * globalData.rpxR,

    });


  },
  

  /**
   * 页面的初始数据
   */
  data: {
    selectArr: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
       disId: options.disId,
       supplierId: options.supplierId,
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
    var data = {
      supplierId: this.data.supplierId,
      disId: this.data.disId
    }
    load.showLoading("获取数据")
    disCheckUnPayBillsGb(data)
      .then(res => {
        load.hideLoading();
        if (res.result.code == 0) {
          this.setData({
            arr: res.result.data.arr,
            total: 0,
            selectArr: [],
          })
        
        }
      })
  },


  openBatchDetail(e) {
    wx.navigateTo({
      url: '../disOrderBatchDetail/disOrderBatchDetail?batchId=' + e.currentTarget.dataset.item.gbDistributerPurchaseBatchId,
    })
  },

  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },


  selectBill(e) {
    var index = e.currentTarget.dataset.index;
    var isSelect = e.detail.value;
    var item = this.data.arr[index];
    var selectArr = this.data.selectArr;

    if (isSelect) {
      selectArr.push(item);
      this.setData({
        selectArr: selectArr
      })
    } else {
      var selectId = this.data.arr[index].gbDistributerPurchaseBatchId;
      selectArr.splice(selectArr.findIndex(item => item.gbDistributerPurchaseBatchId === selectId), 1);
      this.setData({
        selectArr: selectArr
      })
    }
    this._countTotal();
  },

  _countTotal() {
    var selectArr = this.data.selectArr;
    var temp = 0;
    for (var i = 0; i < selectArr.length; i++) {
      var itemTotal = Number(selectArr[i].gbDpbSubtotal);
      temp = temp + itemTotal;
    }
    this.setData({
      total: temp.toFixed(1),
      selAmount: selectArr.length
    })
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
      gbDisId: this.data.disId || this.data.disInfo?.gbDistributerId, // 配送商ID
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
  

})