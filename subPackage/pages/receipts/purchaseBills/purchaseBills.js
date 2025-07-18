const globalData = getApp().globalData;

import apiUrl from '../../../../config.js'
var load = require('../../../../lib/load.js');
var dateUtils = require('../../../../utils/dateUtil')

let windowWidth = 0;
let itemWidth = 0;

import {
  getDepartmentAccountBills,
  getDepPurchaserDateBill

} from '../../../../lib/apiDepOrder'
//
Page({

  onShow(){

    if(this.data.update){
      var myDate = wx.getStorageSync('myDate');
      if(myDate){
        this.setData({
          startDate: myDate.startDate,
          stopDate: myDate.stopDate,
          dateType: myDate.dateType,
        })
      }
      this._initListData();
    }
    if(this.data.updateSearch){
      this._initListData();

    }
   
  },
  /**
   * 页面的初始数据
   */
  data: {
    sliderOffset: 0,
    sliderOffsets: [],
    sliderLeft: 0,
    tab1Index: 0,
    itemIndex: 0,
    type: 0,
    tabs: ["1", "2", "3"],

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


    var value = wx.getStorageSync('userInfo');
    if (value) {
      this.setData({
        disId: value.gbDistributerEntity.gbDistributerId,
        userInfo: value,

      })
      var depInfoValue = wx.getStorageSync('depItem');
      this.setData({
        depInfo: depInfoValue,
        depFatherId: depInfoValue.gbDepartmentId,
        depId: depInfoValue.gbDepartmentId,
      })
    }
    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      statusBarHeight: globalData.statusBarHeight * globalData.rpxR,
      url: apiUrl.server,
      depId: options.depId,
      dateType: "day",
      updateMyDate: false,
      update: false,
      searchDepIds: -1,

    })
    var myDate = wx.getStorageSync('myDate');
    if(myDate){
      this.setData({
        filterShow: true,
        startDate: myDate.startDate,
        stopDate: myDate.stopDate,
        dateType: myDate.dateType,
      })
    }else{
      this.setData({
        filterShow: false,
        startDate: dateUtils.getFirstDateInMonth(),
        stopDate: dateUtils.getArriveDate(0),
        dateType: 'month',
      })
      
    }
    
    this._initListData();
    this.clueOffset();

  },


  // 1 swiper 

  _initListData() {
    load.showLoading("获取数据中")
    var data = {
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      depId: this.data.depId,
      type: this.data.type,
    }
    getDepPurchaserDateBill(data)
      .then(res => {
        load.hideLoading();
        console.log(res.result.data);
        this.setData({
          maileTotal: res.result.data.maileTotal,
          batchBillTotal: res.result.data.batchBillTotal,
          batchCashTotal: res.result.data.batchCashTotal,
          arr: res.result.data.arr,
         
          billTotal: res.result.data.billTotal,
        })
      
      })
  },
  /**
   * tabItme点击
   */
  onTab1Click(event) {
    console.log(event)
    let index = event.currentTarget.dataset.index;
    this.setData({
      sliderOffset: this.data.sliderOffsets[index],
      tab1Index: index,
      itemIndex: index,
    })

  },


  /**
   * 动画结束时会触发 animationfinish 事件
   */
  animationfinish(event) {
    console.log("findiis")
    this.setData({
      sliderOffset: this.data.sliderOffsets[event.detail.current],
      tab1Index: event.detail.current,
      itemIndex: event.detail.current,

    })

     
    this.setData({
      type: this.data.tab1Index
    })

    this._initListData();
    this.clueOffset();
  },



/**
     * 计算偏移量
     */
    clueOffset() {
      var that = this;

      wx.getSystemInfo({
        success: function (res) {
          itemWidth = Math.ceil(res.windowWidth / that.data.tabs.length);
          let tempArr = [];
          for (let i in that.data.tabs) {
            tempArr.push(itemWidth * i);
          }
          // tab 样式初始化
          windowWidth = res.windowWidth;
          that.setData({
            sliderOffsets: tempArr,
            sliderOffset: tempArr[that.data.itemIndex],
            // sliderLeft: globalData.windowWidth * globalData.rpxR / 12,
            windowWidth: globalData.windowWidth * globalData.rpxR,
            windowHeight: globalData.windowHeight * globalData.rpxR,
          });
        }
      });
    },

  toDatePage(){
    
    wx.navigateTo({
      url: '../../../../pages/sel/date/date?startDate=' + this.data.startDate
       + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },


  showCalender(e) {
    this.setData({
      showOperation: true,
    })
  },


  toDetailPage(e){
    console.log(e);
    var day  = e.currentTarget.dataset.date;
    var value = e.currentTarget.dataset.value;
    wx.navigateTo({
      url: '../purchaseBillDeatil/purchaseBillDeatil?day=' + day  + '&value=' + value + '&type=' + this.data.type ,
    })
  },









  toMyDate() {
    this.setData({
      updateMyDate: false,
      update: false
    })
    wx.navigateTo({
      url: '../../sel/myDate/myDate?startDate=' + this.data.startDate
      + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },


  
  toFilter() {
    wx.navigateTo({
      url: '../../sel/filterDepartment/filterDepartment?type=1',
    })
  },



  delSearch(){
    this.setData({
      searchDepIds: -1,
      searchDepName : "",
     
    })
    this._initListData();


  },


  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

  onUnload(){
    wx.removeStorageSync('selDepList');
    wx.removeStorageSync('myDate');
  }




})