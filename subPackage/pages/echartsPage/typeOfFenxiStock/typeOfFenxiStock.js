const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');
var dateUtils = require('../../../../utils/dateUtil');
import * as echarts from '../../../../ec-canvas/echarts'

import apiUrl from '../../../../config.js'

var monthlyData = [];
var listValue = "";
import {
  disGetDepGoodsDailyTotal,

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
      if (myDate) {
        this.setData({
          startDate: myDate.startDate,
          stopDate: myDate.stopDate,
          dateType: myDate.dateType,
        })
      }
     

      var searchStockDeps = wx.getStorageSync('selStockDepList');
      if (searchStockDeps) {
        this.setData({
          stockDepartmentList: searchStockDeps
        })
      }else{
        this.setData({
          stockDepartmentList: []
        })
      }  
  
      var searchKitchenDeps = wx.getStorageSync('selKitchenDepList');
      if (searchKitchenDeps) {
        this.setData({
          kitchenDepartmentList: searchKitchenDeps
        })
      }else{
        this.setData({
          kitchenDepartmentList: []
        })
      } 
      this._getSearchDepIds();


    this._initCostCataData();

  },

  data: {

    ec: {
      lazyLoad: true // 延迟加载
    },
  },


  onLoad: function (options) {

    this.setData({
      url: apiUrl.server,
      type: options.type,
      fenxiType: options.fenxiType,
      startDate: options.startDate,
      stopDate: options.stopDate,
      dateType: options.dateType,
      searchDepIds: options.searchDepIds,

      update: false,
      updateMyDate: false
    })


    var uservalue = wx.getStorageSync('userInfo');
    if (uservalue) {
      this.setData({
        userInfo: uservalue,
        disId: uservalue.gbDiuDistributerId,

      })
    }

  },



  _initCostCataData() {

    var that = this;
    var data = {
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      disId: this.data.disId,
      type: this.data.type,
      fenxiType: this.data.fenxiType,
      searchDepIds: this.data.searchDepIds,
    }
    disGetDepGoodsDailyTotal(data).then(res => {
      if (res.result.code == 0) {
        console.log(res.result.data)
        this.setData({
          outArr: res.result.data.arr,
          total: res.result.data.total,
          salesTotal: res.result.data.salesTotal,
          lossTotal: res.result.data.lossTotal,
          wasteTotal: res.result.data.wasteTotal,
        })
        monthlyData = res.result.data.date;
        listValue = res.result.data.list;
        console.log("datellele", monthlyData);
        console.log("datellele", listValue);
        if (res.result.data.arr.length > 0) {
          that.init_echarts_total()
        }
      } else {
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })

        this.setData({
          outArr: [],
          total: 0,
          salesTotal: 0,
          lossTotal: 0,
          wasteTotal: 0,
        })
        monthlyData = [];
        listValue = []
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
  //初始化图表
  init_echarts_total: function () {
    console.log("init_echarts_totalinit_echarts_totalinit_echarts_total")
    this.echartsComponnet = this.selectComponent('#mychartProfitIndex');
    this.echartsComponnet.init((canvas, width, height) => {
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR
      });
      Chart.setOption(this.getOptionTotal());
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },

  _getAllData(arr) {
    var temp = [];
    for (var j = 0; j < arr.length; j++) {
      var value = arr[j].fatherStockTotalString;
      if(this.data.fenxiType == "costEcharts"){
        var value = arr[j].fatherStockTotalString;
        var percent =  arr[j].fatherStockTotalPercent;
        var name = arr[j].gbDfgFatherGoodsName;
      
        var kucun = {
          value: value,
          name: name + '\n' +
            +value + "元 "+ percent + '%',
        };
        temp.push(kucun);
      }else if (this.data.fenxiType == "weightEcharts"){
       
        if(this.data.type == "sales"){
          value = arr[j].fatherSellingSubtotalString;
        }else if(this.data.type == "loss"){
          value = arr[j].fatherLossTotalString;
        }else if(this.data.type == "waste"){
          value = arr[j].fatherWasteTotalString;
        }
        var name = arr[j].gbDfgFatherGoodsName;
      
        var kucun = {
          value: value,
          name: name + '\n' +
            +value ,
        };
        temp.push(kucun);
      }
     
    
     
    }
    

    this.setData({
      temp: temp
    })
    return temp;
  },

  getOptionTotal() {
    console.log("getOptionTotalgetOptionTotal")
    var option = {
      legend: {
        type: 'scroll',
        show: true,
        orient: 'vertical',
        right: 'right',
        top: '10%',
        textStyle: {
          fontWeight: 500,
          fontSize: 14 //文字的字体大小
        },
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        color: this._getAllDataColor(this.data.outArr),
        top: '10%',
        right: '50%',
        clickable: false,
        avoidLabelOverlap: true,
        data: this._getAllData(this.data.outArr),

        label: {
          show: false,
          position: 'outline',
          alignTo: 'labelLine',
          bleedMargin: '10%'
        },
        // emphasis: {
        //   itemStyle: {
        //     shadowBlur: 10,
        //     shadowOffsetX: 0,
        //     shadowColor: 'rgba(0, 0, 0, 0.5)'
        //   }
        // },
      }]
    };
    return option;

  },

  _getAllDataColor(arr) {
    var temp = [];
    for (var j = 0; j < arr.length; j++) {
      var value = arr[j].gbDfgFatherGoodsColor;
      temp.push(value);
    }
    return temp;
  },


  toSalesPage(e) {
    console.log(e);
    wx.navigateTo({
      url: '../fenxiPageStock/fenxiPageStock?fatherId=' + e.currentTarget.dataset.id +
        '&disId=' + this.data.disId + '&type=' + this.data.type + '&fatherName=' + e.currentTarget.dataset.name + '&startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType + '&fenxiType=' + this.data.fenxiType + '&type=' + this.data.type,
    })
  },


  toDatePage() {
    this.setData({
      updateMyDate: false,
      update: false
    })
    console.log("djfafdla;fa")
    wx.navigateTo({
      url: '../../../../pages/sel/date/date?startDate=' + this.data.startDate +
        '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },


  toFilter() {
    wx.navigateTo({
      url: '../../../../pages/sel/filterStockDepartment/filterStockDepartment',
    })
  },

  delSearch() {
    wx.removeStorageSync('selDepList');;
    this.setData({
      searchDepIds: -1,
      searchDepName: ""
    })
    this._initCostCataData();

  },


  toBack() {
    wx.navigateBack({
      delta: 1
    })
  }














})