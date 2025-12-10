var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import apiUrl from '../../../../config.js'
var dateUtils = require('../../../../utils/dateUtil');


import {
  disGetDayStockByGreatId,
  
} from '../../../../lib/apiDistributerGb.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nowTime: "",
    searchDepId: -1,
    currentOpen: false, // 统一的展开状态
    // 展开状态控制
    expandedRows: {}, // 控制展开状态的对象
    currentExpandedItem: null // 当前展开的商品标识

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var userInfo = wx.getStorageSync('userInfo');
    if(userInfo){
      this.setData({
        userInfo: userInfo
      })
    }

    var disInfo = wx.getStorageSync('disInfo');
    if(disInfo){
      this.setData({
        disInfo: disInfo
      })
    }
  
    // 现在只显示一天，默认展开
    const getCurrentOpenState = () => {
      return true; // 默认展开
    };


    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      url: apiUrl.server,
      greatId: options.greatId,
      whichDay: options.whichDay,
      nowTime: dateUtils.getNowTime(),
      disId: options.disId,
      fatherName: options.fatherName,
      fatherTotal: options.fatherTotal,
      type: options.type,
      dateString: options.dateString,
      currentOpen: getCurrentOpenState()
    })

    this._getInitData();
   
  },

  open(e){
    console.log('📅 === open 点击事件开始 ===');
    console.log('📱 事件对象:', e);
    console.log('📊 当前状态:', this.data.currentOpen);
    
    // 简单切换展开状态
    this.setData({
      currentOpen: !this.data.currentOpen
    });
    
    console.log('📈 切换后的状态:', this.data.currentOpen);
    console.log('🏁 === open 点击事件结束 ===');
  },


  _getInitData() {
    var data = {      
      disId: this.data.disId,
      searchDepId: this.data.searchDepId,
      greatId: this.data.greatId,
      whichDay: this.data.whichDay,
      type: this.data.type,
    }
    load.showLoading("获取数据中");
    disGetDayStockByGreatId(data)
      .then(res => {
        load.hideLoading();
        console.log("API返回数据:", res.result.data)
        if (res.result.code == 0) {
          // 为每个商品添加 showStockList 属性
          const oneDayData = res.result.data.oneDay;
          if (oneDayData && oneDayData.arr) {
            oneDayData.arr = oneDayData.arr.map(goods => ({
              ...goods,
              showStockList: false // 默认隐藏详细信息
            }));
          }
          
          // 现在只显示一天的数据，直接设置
          this.setData({
            oneDay: oneDayData,
            currentOpen: true // 默认展开
          });
        }
      })
  },
  
  // 展开/收起商品详细信息
  showList(e) {
    const { index } = e.currentTarget.dataset;
    console.log('showList 点击事件:', { index });
    
    if (index === undefined) {
      console.log('无效的商品索引:', index);
      return;
    }
    
    const newArr = [...this.data.oneDay.arr];
    if (newArr[index] && newArr[index].hasOwnProperty('showStockList')) {
      newArr[index].showStockList = !newArr[index].showStockList;
      this.setData({ 
        'oneDay.arr': newArr 
      });
      console.log(`商品 ${index} 展开状态切换为:`, newArr[index].showStockList);
    } else {
      console.log('商品数据无效或缺少 showStockList 属性');
    }
  },

  // 展开/收起库存批次详情
  showOne(e) {
    // 在微信小程序中，catchtap 本身就阻止了事件冒泡，不需要额外调用 stopPropagation
    
    console.log('🔍 === showOne 点击事件开始 ===');
    console.log('📱 事件对象:', e);
    console.log('📊 事件目标数据:', e.currentTarget.dataset);
    console.log('🎯 事件目标元素:', e.currentTarget);
    console.log('📝 事件类型:', e.type);
    
    // 适配新的数据结构
    const { index, itemIndex, batchIndex } = e.currentTarget.dataset;
    
    // 构建展开状态的唯一标识
    // 使用 itemIndex_batchIndex 作为key，因为现在只显示一天
    const currentKey = `${itemIndex}_${batchIndex}`;
    
    console.log('📋 解析后的参数:');
    console.log('  - index:', index);
    console.log('  - itemIndex:', itemIndex);
    console.log('  - batchIndex:', batchIndex);
    console.log('  - currentKey:', currentKey);
    
    console.log('📈 当前数据状态:');
    console.log('  - expandedRows:', this.data.expandedRows);
    console.log('  - currentExpandedItem:', this.data.currentExpandedItem);
    console.log('  - 当前点击项的展开状态:', this.data.expandedRows[currentKey]);
    
    // 如果点击的是当前已展开的项目，则收起
    if (this.data.expandedRows[currentKey]) {
      console.log('🔄 执行收起操作，目标:', currentKey);
      console.log('📉 收起前的状态:', JSON.stringify(this.data.expandedRows));
      
      this.setData({
        [`expandedRows.${currentKey}`]: false,
        currentExpandedItem: null
      });
      
      console.log('✅ 收起操作完成');
      console.log('📉 收起后的状态:', JSON.stringify(this.data.expandedRows));
      console.log('📉 收起后的 currentExpandedItem:', this.data.currentExpandedItem);
    } else {
      console.log('🔄 执行展开操作，目标:', currentKey);
      console.log('📈 展开前的状态:', JSON.stringify(this.data.expandedRows));
      
      // 保留其他已展开的项目，只展开当前点击的
      this.setData({
        [`expandedRows.${currentKey}`]: 'stock',
        currentExpandedItem: currentKey
      });
      
      console.log('✅ 展开操作完成');
      console.log('📈 展开后的状态:', JSON.stringify(this.data.expandedRows));
      console.log('📈 展开后的 currentExpandedItem:', this.data.currentExpandedItem);
    }
    
    console.log('🏁 === showOne 点击事件结束 ===');
  },


  // 单个天数库存批次点击事件
  showOneDayStock(e) {
    console.log('🔍 === showOneDayStock 点击事件开始 ===');
    console.log('📱 事件对象:', e);
    console.log('📊 事件目标数据:', e.currentTarget.dataset);
    
    // 获取点击的库存批次数据
    const { itemIndex, batchIndex } = e.currentTarget.dataset;
    
    // 构建展开状态的唯一标识
    const currentKey = `${itemIndex}_${batchIndex}`;
    
    console.log('📋 解析后的参数:');
    console.log('  - itemIndex:', itemIndex);
    console.log('  - batchIndex:', batchIndex);
    console.log('  - currentKey:', currentKey);
    
    // 如果点击的是当前已展开的项目，则收起
    if (this.data.expandedRows[currentKey]) {
      console.log('🔄 执行收起操作，目标:', currentKey);
      
      this.setData({
        [`expandedRows.${currentKey}`]: false,
        currentExpandedItem: null
      });
      
      console.log('✅ 收起操作完成');
    } else {
      console.log('🔄 执行展开操作，目标:', currentKey);
      
      // 展开当前点击的库存批次
      this.setData({
        [`expandedRows.${currentKey}`]: 'stock',
        currentExpandedItem: currentKey
      });
      
      console.log('✅ 展开操作完成');
    }
    
    console.log('🏁 === showOneDayStock 点击事件结束 ===');
  },

  toFenxi(e) {
    var item = e.currentTarget.dataset.item;
    var purId = e.currentTarget.dataset.purgoods.gbDistributerPurchaseGoodsId;
    var purchaseDate = e.currentTarget.dataset.purgoods.gbDpgPurchaseDate;
    wx.setStorageSync('disGoods', item);
    wx.navigateTo({
      url: '../../../../subPackage-goods/pages/goods/goodsFenxiPurchase/goodsFenxiPurchase?disGoodsId=' + item.gbDistributerGoodsId  + '&purGoodsId=' + purId + '&purchaseDate=' + purchaseDate
      , 

    })
    
  },
  
  toCost(e) {
    var item  = e.currentTarget.dataset.item;
    var stockId = e.currentTarget.dataset.id;
    wx.setStorageSync('disGoods', e.currentTarget.dataset.item);
   
    wx.navigateTo({
      url: '../../../../subPackage-goods/pages/goods/stockGoodsList/stockGoodsList?disGoodsId=' + item.gbDistributerGoodsId + '&stockId=' + stockId,
    })

  },


  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

})