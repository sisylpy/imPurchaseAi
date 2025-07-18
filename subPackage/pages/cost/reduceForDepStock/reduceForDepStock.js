var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;

import {
  depGetWhichDayReduce
} from '../../../../lib/apiDepOrder.js'


Page({

  onShow() {
     // 推荐直接用新API
     let windowInfo = wx.getWindowInfo();
     let globalData = getApp().globalData;
     this.setData({
       windowWidth: windowInfo.windowWidth * globalData.rpxR,
       windowHeight: windowInfo.windowHeight * globalData.rpxR,
       statusBarHeight: globalData.statusBarHeight * globalData.rpxR,
     });

     
      var myDate = wx.getStorageSync('myDate');
      if(myDate){
        this.setData({
          startDate: myDate.startDate,
          stopDate: myDate.stopDate,
          dateType: myDate.dateType,
        }) 
      }
    
      
   
    this._getInitData()

  },

  data: {
    

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      disId: options.disId,
      goodsId: options.goodsId,
      fenxiType: options.fenxiType,
      value: options.value,
      standardname: options.standardname,
      type: options.type,
      date: options.date,
      startDate: options.date,
      stopDate: options.date,
      dateType: "selfDate",
      searchDepIds: options.searchDepIds,
      searchDepName: options.searchDepName
    })
    var disGoods = wx.getStorageSync('disGoods');
    if(disGoods){
      this.setData({
        disGoods: disGoods
      })
    }
    this._getInitData();
  },


  _getInitData() {
    var type = "";
    if(this.data.type == 'sales'){
      type = 1;
    } else if(this.data.type == 'loss'){
      type = 3;
    } else if(this.data.type == 'waste'){
      type = 2;
    } else if(this.data.type == 'return'){
      type = 4;
    } else{
      type = 0;
    }
    var data = {
      disGoodsId: this.data.goodsId,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      depId: this.data.searchDepIds,
      type: type,
    }
    load.showLoading("获取数据中")
    console.log(data);
    depGetWhichDayReduce(data)
      .then(res => {
        load.hideLoading();
        console.log(res)
        console.log("abc")
        if (res.result.code == 0) {
          this.setData({
            arr: res.result.data.arr,
            total: res.result.data.total,
            totalWeight: res.result.data.totalWeight,
            produce: res.result.data.produce,
            produceWeight: res.result.data.produceWeight,
            waste: res.result.data.waste,
            wasteWeight: res.result.data.wasteWeight,
            loss: res.result.data.loss,
            lossWeight: res.result.data.lossWeight,

          })
         


        } else {
         
          

        }

      })
  },



  _getSearchDepIds(){
    var ids = "";
    var name = "";
    var selArr = [];
    var stockArr = this.data.stockDepartmentList;
    if(stockArr.length > 0){
      for(var i =0; i < stockArr.length; i++){
        selArr.push(stockArr[i]);
        ids = ids + stockArr[i].gbDepartmentId + ",";
        name = name +  stockArr[i].gbDepartmentName + ",";
      }
    }
    var kitchenArr = this.data.kitchenDepartmentList;
    if(kitchenArr.length > 0){
      for(var i =0; i < kitchenArr.length; i++){
        selArr.push(kitchenArr[i]);
        ids = ids + kitchenArr[i].gbDepartmentId + ",";
        name = name +  kitchenArr[i].gbDepartmentName + ",";
      }
    }

    this.setData({
      searchDepIds: ids,
      searchDepName: name,
    })
  },
  _getInitData00() {
    var type = "";
    if(this.data.type == 'sales'){
      type = 1;
    } else if(this.data.type == 'loss'){
      type = 3;
    } else if(this.data.type == 'waste'){
      type = 2;
    } else if(this.data.type == 'return'){
      type = 4;
    } else{
      type = 0;
    }
    var data = {
      disGoodsId: this.data.goodsId,
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      searchDepIds: this.data.searchDepIds,
      type: type,

    }
    load.showLoading("获取数据中")
    getWhichDayReduce(data)
      .then(res => {
        load.hideLoading();
        console.log(res)
        console.log("abc")
        if (res.result.code == 0) {
          this.setData({
            arr: res.result.data.arr,
            total: res.result.data.total,
            totalWeight: res.result.data.totalWeight,
            produce: res.result.data.produce,
            produceWeight: res.result.data.produceWeight,
            waste: res.result.data.waste,
            wasteWeight: res.result.data.wasteWeight,
            loss: res.result.data.loss,
            lossWeight: res.result.data.lossWeight,

          })
         


        } else {
         
          

        }

      })
  },

  showStock(e){
    this.setData({
      showOperation: true,
      item: e.currentTarget.dataset.item,
    })
  },


  toStatistics(e) {
    this.setData({
      goodsId: e.currentTarget.dataset.id,
      goodsName: e.currentTarget.dataset.name,
      standard: e.currentTarget.dataset.standard,
    })
   if(this.data.searchDepIds !== -1){
    wx.navigateTo({
      url: '../../../pages/mendian/statisticsReduce/statisticsReduce?goodsName=' + e.currentTarget.dataset.name + '&startDate=' 
      +this.data.startDate + '&stopDate=' + this.data.stopDate +'&dateType=' +this.data.dateType + '&disGoodsId=' 
       + this.data.goodsId + '&depName=' + this.data.searchDepName
       +'&depId=' + this.data.searchDepIds,
       
    })
   }else{
    wx.navigateTo({
      url: '../costGoods/costGoods?disGoodsId=' + this.data.goodsId + '&startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType + '&type=' + e.currentTarget.dataset.type + '&fenxiType=' + e.currentTarget.dataset.fenxi +  '&searchDepIds=' + this.data.searchDepIds  + '&searchDepName=' + this.data.searchDepName,
    })

   }
  },


//  toWeight(e){
//   this.setData({
//     goods: e.currentTarget.dataset.item,
//     searchDepName: "",
//     searchDepIds: -1
//   })
//   wx.setStorageSync('disGoods', this.data.goods);
  
//       wx.navigateTo({
//         url: '../../data/echartsPage/fenxiPage/fenxiPage?fatherId=' + e.currentTarget.dataset.id +
//           '&disId=' + this.data.disId + '&type=' + this.data.type + '&fatherName=' + e.currentTarget.dataset.name + '&startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType + '&fenxiType=weightEcharts&searchDepIds=' + this.data.searchDepIds +
//           '&searchDepName=' + this.data.searchDepName,
//       })

// },
 

  toFilter(){
    wx.navigateTo({
      url: '../../../pages/sel/filterDepartment/filterDepartment?type=1' ,
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

  toMyDate(){
    this.setData({
      updateMyDate: false,
      update: false
    })
    wx.navigateTo({
      url: '../../../pages/sel/myDate/myDate',
    })
  },

  toDatePage() {
    this.setData({
      updateMyDate: false,
      update: false
    })
    wx.navigateTo({
      url: '../../../pages/sel/date/date?startDate=' + this.data.startDate +
        '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },



  toDatePage(){
    console.log("todate")
     wx.navigateTo({
       url: '../../../../pages/sel/date/date?startDate=' + this.data.startDate
        + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
     })
   },



  toFilter(){
    wx.navigateTo({
      url: '../../../../pages/sel/filterDepartment/filterDepartment?type=1' ,
    })
  },

  toBack() {
   
    wx.navigateBack({
      delta: 1,
    })

  },


  onUnload(){
    wx.removeStorageSync('myDate');
    wx.removeStorageSync('selDepList');
  },

})