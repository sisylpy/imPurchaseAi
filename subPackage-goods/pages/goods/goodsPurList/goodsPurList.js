const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');
var dateUtils = require('../../../../utils/dateUtil');

import {
  
  getDisGoodsPurListJingjing,


} from '../../../../lib/apiDepOrder'

Page({

  onShow(){
    
     // 检查是否有日期更新
     if(this.data.update){
      var myDate = wx.getStorageSync('myDate');
      if(myDate){
         // 如果是自定义日期，传递具体的开始和结束日期
         var dateRange;
         if (myDate.name === 'custom' ) {
           dateRange = dateUtils.getDateRange(myDate.name, myDate.startDate, myDate.stopDate);
         } else {
           dateRange = dateUtils.getDateRange(myDate.name);
         }
         this.setData({
           startDate: dateRange.startDate,
           stopDate: dateRange.stopDate,
           dateType: myDate.dateType,
           hanzi: myDate.hanzi || dateRange.name,
           update: false
         })
      }
      this.setData({
        update: false
      })
       this._initDataPur()
     
 
     // 统一从缓存获取筛选数据
     this._loadFilterDataFromCache();
     }
     
 

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      disGoodsId: options.disGoodsId,
      purGoodsId: options.purGoodsId,
     
      update: false,
    
      // 初始化筛选字段
      supplierId: -1,
      selectedSupplierName: "",
      purUserId: -1,
      selectedPurUserName: "",
      
    })

    var myDate = wx.getStorageSync('myDate');
    if(myDate){
      // 如果是自定义日期，传递具体的开始和结束日期
      var dateRange;
      if (myDate.name === 'custom' ) {
        dateRange = dateUtils.getDateRange(myDate.name, myDate.startDate, myDate.stopDate);
      } else {
        dateRange = dateUtils.getDateRange(myDate.name);
      }
    
      this.setData({
        startDate: dateRange.startDate,
        stopDate: dateRange.stopDate,
        dateType: myDate.dateType,
        hanzi: myDate.hanzi || dateRange.name,
      })
    }else{
      this.setData({
        dateType: 'month',
        startDate: dateUtils.getFirstDateInMonth(),
        stopDate: dateUtils.getArriveDate(0),
        hanzi:  "本月",
      })
    }

    var disGoods = wx.getStorageSync('disGoods');
    if (disGoods){
        this.setData({
          disGoods: disGoods,
          standard: disGoods.gbDgGoodsStandardname,
          disId: disGoods.gbDgDistributerId,
        })
    }
   
    this._initDataPur()

  },



  /**
   * 从缓存加载筛选数据
   */
  _loadFilterDataFromCache() {
    // 从缓存获取供货商信息
    var supplierItem = wx.getStorageSync('selectedSupplier');
    if (supplierItem) {
      this.setData({
        supplierId: supplierItem.supplierId,
        selectedSupplierName: supplierItem.supplierName,
        purUserId: -1,
        selectedPurUserName: ""
      });
    }
    
    // 从缓存获取采购员信息
    var purUserItem = wx.getStorageSync('selectedPurUser');
    if (purUserItem) {
      this.setData({
        purUserId: purUserItem.purUserId,
        selectedPurUserName: purUserItem.purUserName,
        supplierId: -1,
        selectedSupplierName: ""

      });
    }
    this._initDataPur();

  },
  _initDataPur(){
    var data ={
      disGoodsId : this.data.disGoodsId,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,// 添加供货商ID参数
    }
    load.showLoading("获取数据中")
    getDisGoodsPurListJingjing(data)
     .then(res =>{
       if(res.result.code == 0){
         load.hideLoading()
         console.log("reespurlr", res.result.data);
         this.setData({
           item: res.result.data,
           businessArr: res.result.data.arr,
           supplierList: res.result.data.supplierList,
         })
       } else{
         load.hideLoading();
         this.setData({
          businessArr: []
        })
       }
  
     })
  },

  

  
toFilter() {
  wx.setStorageSync('supplierList', this.data.supplierList);
  wx.navigateTo({
    url: '../../sel/filterData/filterData',
  })
},




  // 删除采购员选择
  delSearch() {
    this.setData({
      purUserId: -1,
      selectedPurUserName: "",
      supplierId: -1,
      selectedSupplierName: ""
    });
    // 直接更新图表，不需要重新请求接口
    // this._updateChartsWithFilter();
    wx.removeStorageSync('selectedSupplier');
    wx.removeStorageSync('selectedPurUser');
    
  },



toDatePage() {
  this.setData({
    update: true
  })
  wx.navigateTo({
    url: '../../sel/date/date?startDate=' + this.data.startDate +
      '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
  })
},


  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

  onUnload() {
      // 清除缓存
    
     wx.removeStorageSync('disGoods');
     wx.removeStorageSync('selectedSupplier');
     wx.removeStorageSync('selectedPurUser');
  }


})