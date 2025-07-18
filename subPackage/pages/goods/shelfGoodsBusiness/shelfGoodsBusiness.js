const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');
var dateUtils = require('../../../../utils/dateUtil');

import {
  getDisGoodsOutEveryDay,
  getDisGoodsPurList,
  getDisGoodsBusinessTypeJj,
  getDisGoodsStock
} from '../../../../lib/apiDepOrder'

let windowWidth = 0;
let itemWidth = 0;

Page({

  onShow(){
    if(this.data.update || this.data.updateSearch){
      var myDate = wx.getStorageSync('myDate');
      if(myDate){
        this.setData({
          startDate: myDate.startDate,
          stopDate: myDate.stopDate,
          dateType: myDate.dateType,
        })
      }
      if(this.data.showType == 1){
        this._initData();
      }
      else if(this.data.showType == 2){
        this._initDataPur()
      }
      else if(this.data.showType == 3){
        this._initDataThree()
      }
      else if(this.data.showType == 4){
        this._initDataStock()
      }
    }

   
    


  },

  /**
   * 页面的初始数据
   */
  data: {

    items: [
      {
        name: '1',
        value: '出货',
      },
        {
        name: '2',
        value: '采购',
      }
      , {
        name: '3',
        value: '用量',
      },
      {
        name: '4',
        value: '库存',
      }
      
    ],
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
      nxDisId: options.nxDisId,
      name: options.name,
      showType: options.type,
      update: false,
      searchDepIds: -1,
      startDate: dateUtils.getFirstDateInMonth(),
      stopDate: dateUtils.getArriveDate(0),
      dateType: "month",
    })

    var disGoods = wx.getStorageSync('disGoods');
    if (disGoods){
        this.setData({
          disGoods: disGoods,
          standard: disGoods.gbDgGoodsStandardname,
          disId: disGoods.gbDgDistributerId,
        })
    }
   
    
    if(this.data.showType == 1){
      this._initData();
    }
    else if(this.data.showType == 2){
      this._initDataPur()
    }
    else if(this.data.showType == 3){
      this._initDataThree()
    }
    else if(this.data.showType == 4){
      this._initDataStock()
    }

  },

  _initData() {
   
    var data = {
      disGoodsId: this.data.disGoodsId,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      depId: -1,
      searchDepIds: this.data.searchDepIds
    }
    load.showLoading("获取数据中")
    getDisGoodsOutEveryDay(data)
      .then(res => {
        if (res.result.code == 0) {
          load.hideLoading();
          console.log(res.result.data);
          this.setData({
            businessArr: res.result.data,
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



  radioChange(e) {
    var type = e.detail.value;
    this.setData({
      showType: type,
    })
    if(this.data.showType == 1 ){
      this._initData();
    }
   else if(this.data.showType == 2) {
    this._initDataPur();

   }else if(this.data.showType == 3){
    this._initDataThree();
   }
   else if(this.data.showType == 4){
    this._initDataStock();
   }
  },

  _initDataPur(){
    var data ={
      disGoodsId : this.data.disGoodsId,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      depId: -1,
    }
    load.showLoading("获取数据中")
    getDisGoodsPurList(data)
     .then(res =>{
       if(res.result.code == 0){
         load.hideLoading()
         this.setData({
           item: res.result.data,
           businessArr: res.result.data.arr
         })
       } else{
         load.hideLoading();
         wx.showToast({
           title: res.result.msg,
           icon: 'none'
         })
       }
  
     })
  },
  _initDataThree(){
    console.log("this.atdad.sdearciid" + this.data.searchDepIds)
   var data ={
    disGoodsId : this.data.disGoodsId,
    startDate: this.data.startDate,
    stopDate: this.data.stopDate,
    disId: this.data.disId,
    searchDepIds: this.data.searchDepIds

  }
  load.showLoading("获取数据中")
   getDisGoodsBusinessTypeJj(data)
   .then(res =>{
     if(res.result.code == 0){
       load.hideLoading()
       this.setData({
        businessArr: res.result.data,
       })
     } else{
       load.hideLoading();
       wx.showToast({
         title: res.result.msg,
         icon: 'none'
       })
     }

   })
   },
 

   _initDataStock(){
     load.showLoading("获取数据中")

    getDisGoodsStock(this.data.disGoodsId).then(res => {
      if(res.result.code == 0){
        load.hideLoading();
        this.setData({
          businessArr: res.result.data
        })
      }else{
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })
      }
    })
   },


  
toFilter() {
  wx.navigateTo({
    url: '../../../../pages/sel/filterDepartment/filterDepartment?type=1',
  })
},

delSearch(){
  wx.removeStorageSync('selDepList');;
  this.setData({
    searchDepIds: -1,
    searchDepName : "",
    
  })
  if(this.data.showType == 1){
    this._initData();
  }
  else if(this.data.showType == 2){
    this._initDataPur()
  }
  else if(this.data.showType == 3){
    this._initDataThree()
  }
  else if(this.data.showType == 4){
    this._initDataStock()
  }
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




})