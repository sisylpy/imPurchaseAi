var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;

import {
  getWhichDayReduce
} from '../../../../lib/apiDepOrder.js'


Page({

  onShow() {
    
      // 推荐直接用新API
    let windowInfo = wx.getWindowInfo();
    let globalData = getApp().globalData;
    this.setData({
      windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
    });


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
      searchDepIds: options.searchDepIds,
      searchDepName: options.names,
      startDate: options.date,
      stopDate: options.date,
      dateType: "selfDate",
    })
    var disGoods = wx.getStorageSync('disGoods');
    if(disGoods){
      this.setData({
        disGoods: disGoods
      })
    }
    if(this.data.searchDepIds == -1){
      this._getSearchDepIds();
    }
    this._getInitData();
  },




//
_getSearchDepIds() {
  console.log("_getSearchDepIds_getSearchDepIds");
  var allArr = [];
  var name = "";
  var searchMendianDeps = wx.getStorageSync('selMendianDepList');
  if (searchMendianDeps) {
    for(var i = 0; i < searchMendianDeps.length; i++){
      console.log(searchMendianDeps[i].gbDepartmentName + "-----------------sisy");
      name = name +  searchMendianDeps[i].gbDepartmentName;
      if(i <  searchMendianDeps.length - 1){
        name = name + ",";
      }
    }
    this.setData({
      searchDepName: name
    })
    allArr = allArr.concat(searchMendianDeps);
    
  }
  var searchStockDeps = wx.getStorageSync('selStockDepList');
  if (searchStockDeps) {
    allArr = allArr.concat(searchStockDeps);
  }

  var selDepKitchenList = wx.getStorageSync('selKitchenDepList');
  if (selDepKitchenList) {
    allArr = allArr.concat(selDepKitchenList);
  }
  if (allArr.length > 0) {
    var ids = "";
    for (var j = 0; j < allArr.length; j++) {
      var id = allArr[j].gbDepartmentId;
      ids = id + "," + ids;
    }
    let trimmedStr = ids.slice(0, -1);
    let arr = trimmedStr.split(",");
    // 颠倒数组顺序
    arr.reverse();
    let reversedStr = arr.join(",");
    var oldSearchDepIds = this.data.searchDepIds;
    if (oldSearchDepIds == reversedStr) {
      this.setData({
        update: false
      })
    } else {
      this.setData({
        update: true,
       
      })
    }
    var tempArr = reversedStr.split(",");
    this.setData({
      searchDepIds: reversedStr,
      searchDepIdsArr: tempArr
    })
    
  } else {
    var oldSearchDepIds = this.data.searchDepIds;
    if(oldSearchDepIds !== -1){
      this.setData({
        update: true,
        itemIndex:0,
        tab1Index: 0,
        itemIndexDep:0,
        tab1IndexDep:0,
      })
    }else{
      this.setData({
      update: false
      })
    }
    this.setData({  
      searchDepIds: -1,
      searchDepIds: -1,
    })
  }
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

  onScroll(e) {
    // 检查滚动位置，添加或移除阴影效果
    if (e.detail.scrollLeft > 0) {
      this.setData({ shadowClass: 'shadow-effect' });
    } else {
      this.setData({ shadowClass: '' });
    }
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