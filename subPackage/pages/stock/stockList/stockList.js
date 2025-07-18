var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import apiUrl from '../../../../config.js'
var dateUtils = require('../../../../utils/dateUtil');


import {
  getGoodsStockListAll,
  depGetGoodsStockListAll
} from '../../../../lib/apiDistributerGb.js'


Page({

  /**
   * 页面的初始数据
   */
  data: {
    nowTime: "",
    goodsName: ""

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var disInfo = wx.getStorageSync('disInfo');
    if(disInfo){
      this.setData({
        disInfo: disInfo
      })
    }
    var dateDate = new Date();
    var year = dateDate.getFullYear()
    var month = dateDate.getMonth() + 1
    if (month < 10) {
      month = "0" + month;
    }
    var day = dateDate.getDate(); // 日
    var hour = dateDate.getHours(); // 时
    var minutes = dateDate.getMinutes(); // 分
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    var seconds = dateDate.getSeconds();
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    var nowTime = year + "-" + month + '-' + day + " " + hour + ":" + minutes + ":" + seconds
    this.setData({
      windowWidth: globalData.windowWidth * globalData.rpxR,
      windowHeight: globalData.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      url: apiUrl.server,
      disGoodsId: options.disGoodsId,
      goodsName: options.name,
      dateDuring: options.dateDuring,
      days: options.days,
      searchDepIds: options.searchDepIds,
      nowTime: dateUtils.getNowTime(),

    })
    var ids = this.data.searchDepIds.split(",");
    console.log(ids.length ,"idsslelel");
    var name = "";
    if(ids.length > 0){
      for(var i = 0; i < ids.length; i++){
        var id = ids[i];
        var depArr = wx.getStorageSync('selMendianDepList');
        for(var j = 0; j < depArr.length; j++){
          var depId = depArr[j].gbDepartmentId;
          if(id == depId){
            name = name +  depArr[j].gbDepartmentName ;
            if(i < ids.length - 2){
              name = name + ","
            }
          }
        }
      }
    }
    this.setData({
      searchDepName: name,
    })

     var disGoods = wx.getStorageSync('disGoods');
     if(disGoods){
       this.setData({
         disGoods: disGoods,
         standard: disGoods.gbDgGoodsStandardname,
       })
     }
    if(options.days == '今天'){
      this.setData({
        openin: true
      })
    }else if(options.days == '1天'){
      this.setData({
        openone: true
      })
    }else if(options.days == '2天'){

      this.setData({
        opentwo: true
      })
    }else if(options.days == '3天'){
      this.setData({
        openthree: true
      })
    }
    else if(options.days == '3天以上'){
      this.setData({
        openfour: true
      })
    }
    else if(options.days = '全部'){
      this.setData({
        openall: true
      })
    }
   

    this._getInitData();
   
  },

  open(e){
    var which  = e.currentTarget.dataset.type;
    console.log(which);
    console.log(this.data[which]);
     console.log('"'+ which + '"');
    if(this.data[which]){
      console.log("this.set==falese")
      this.setData({
        [which]: false
      })
    }else{
      console.log("this.set==truetrue")
      this.setData({
        [which]: true
      })
    }
  },

  // _getInitDataDeps() {
  //   var data = {      
  //     disGoodsId: this.data.disGoodsId,
  //     searchDepIds: this.data.searchDepIds,
  //     dateDuring: this.data.dateDuring,
  //     depType: this.data.depType
  //   }
  //   load.showLoading("获取数据中");
  //   depGetGoodsStockListAll(data)
  //     .then(res => {
  //       load.hideLoading();
  //       console.log(res.result.data)
  //       if (res.result.code == 0) {
  //         this.setData({
  //           in: res.result.data.in,
  //           one: res.result.data.one,
  //           two: res.result.data.two,
  //           three: res.result.data.three,
  //           exceedThree: res.result.data.exceedThree,
  //         })
  //       }
  //     })
  // },


  _getInitData() {
    var data = {      
      disGoodsId: this.data.disGoodsId,
      searchDepIds: this.data.searchDepIds,
      searchDepId: this.data.searchDepId,
      dateDuring: this.data.dateDuring,
    }
    load.showLoading("获取数据中aaa");
    depGetGoodsStockListAll(data)
      .then(res => {
        load.hideLoading();
        console.log(res.result.data)
        if (res.result.code == 0) {
          this.setData({
            in: res.result.data.in,
            one: res.result.data.one,
            two: res.result.data.two,
            three: res.result.data.three,
            exceedThree: res.result.data.exceedThree,
          })
        }
      })
  },
  
  delSearch(){
    wx.removeStorageSync('selDepList');;
    this.setData({
      searchDepIds: -1,
      searchDepName : ""
    })
    this._getInitData();

  },



  showStock(e){
    console.log(e.currentTarget.dataset.item);

    this.setData({
      showOperation: true,
      item: e.currentTarget.dataset.item,
    })
  },
  
  hideMask(){
    this.setData({
      showOperation: false,
      item: "",
    })
  },

  toBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

})