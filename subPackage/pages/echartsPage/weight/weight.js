const globalData = getApp().globalData;
var load = require('../../../../lib/load.js');
var dateUtils = require('../../../../utils/dateUtil');
import * as echarts from '../../../../ec-canvas/echarts'

import apiUrl from '../../../../config.js'

let windowWidth = 0;
let itemWidth = 0;
var monthlyData=[];
var listValue  = "";

import {
  disGetDepGoodsDailyTotal
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


    if(this.data.update || this.data.updateSearch){
      this._initCostCataData();
    }
    if(this.data.updateMyDate){
      console.log("updateeekekekdafaafafafaeke")
      var myDate = wx.getStorageSync('myDate');
      if(myDate){
        this.setData({
          startDate: myDate.startDate,
          stopDate: myDate.stopDate,
          dateType: myDate.dateType,
        })
        this._initCostCataData();
      }
    }
    var fil = wx.getStorageSync('myDate');
    if(fil){
      this.setData({
        filterShow: true
      })
    }else{
      this.setData({
        filterShow: false
      })
    }
    var searchDeps = wx.getStorageSync('selDepList');
    if (searchDeps) {
      this.setData({
        selDepList: searchDeps
      })
      if (searchDeps.length > 0) {
        var ids = "";
        var names = "";
        var selDepList = this.data.selDepList;
        for (var i = 0; i < selDepList.length; i++) {
          ids = ids + selDepList[i].gbDepartmentId + ","
          names = names + selDepList[i].gbDepartmentName + ",";
        }
        this.setData({
          searchDepIds: ids,
          searchDepName: names,
        })
        
      }
    }
    
  },

  data: {
    ec: {
      lazyLoad: true // 延迟加载
    },
    update: false,
  },

  onLoad(options) {


    this.setData({
      type: options.type,
      fenxiType: options.fenxiType,
      searchDepIds: -1,
      update: false,
      updateMyDate: false,
      filterShow:false,

    })


    var myDate  = wx.getStorageSync('myDate');
    console.log(this.data.update)
    if(myDate && !this.data.update){
      this.setData({
        startDate: myDate.startDate,
        stopDate: myDate.stopDate,
        dateType: myDate.dateType,
        filterShow: true,
      })
    }else{
      if(this.data.update){
       this._initCostCataData();
      }else{
       this.setData({
         dateType:  'month',
         startDate: dateUtils.getFirstDateInMonth(),
         stopDate: dateUtils.getArriveDate(0),
         filterShow: false
       })
      }
    
    }


    var disInfo = wx.getStorageSync('disInfo');
    if (disInfo) {
      this.setData({
        disInfo: disInfo,
        disId: disInfo.gbDistributerId,
        mendianArr: disInfo.mendianDepartmentList,
      })
    }
    var uservalue = wx.getStorageSync('userInfo');
    if (uservalue) {
      this.setData({
        userInfo: uservalue,
        disId: uservalue.gbDiuDistributerId,
      })
    }
      
    this._initCostCataData();
  },


  _initCostCataData() {
    var that = this;
    var data = {
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      disId: this.data.disId,
      type: this.data.type,
      fenxiType: this.data.fenxiType,
      searchDepIds: this.data.searchDepIds
    }
    load.showLoading("获取数据")
    disGetDepGoodsDailyTotal(data).then(res => {
      if (res.result.code == 0) {
        load.hideLoading();
        console.log(res.result.data)
        this.setData({
          outArr: res.result.data.arr,
          total: res.result.data.total,
          salesTotal: res.result.data.salesTotal,
          lossTotal: res.result.data.lossTotal,
          wasteTotal: res.result.data.wasteTotal,
          salesRate: res.result.data.salesRate,
          lossRate: res.result.data.lossRate,
          wasteRate: res.result.data.wasteRate,
        })
        monthlyData = res.result.data.date;
        listValue = res.result.data.list;

         if(res.result.data.arr.length > 0){
          that.init_echarts_total()
         }
      } else {
        load.hideLoading();
        wx.showToast({
          title: res.result.msg,
          icon:'none',
        })
        this.setData({
          outArr: []
        })
      }
    })
  },






  //初始化图表
  init_echarts_total: function () {
    this.echartsComponnet = this.selectComponent('#mychartProfitIndex');
    this.echartsComponnet.init((canvas, width, height) => {
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR
      });
      Chart.setOption(this.getOptiona());
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },


  getOptiona(){
    var that = this;
    // 指定图表的配置项和数据
    var option = {
      // title: {
      //   text: that._getTital()
      // },
      color: ['#187e6e'],
      grid: {
        left: 10,
        right: 10,
        bottom: 15,
        top: 40,
        containLabel: true
      },
    	xAxis: {
        axisLine: {
          lineStyle: {
            color: '#999'
          }
        },
        axisLabel: {
          color: '#666'
        },
	        type: 'category',
          data: monthlyData,
	    },
	    yAxis: {
          type: 'value',
          position: 'right',
          // splitArea : {show : true},
	    },
	    series: [{
        label: {
          normal: {
            show: true,
            // position: 'inside'
          }
        },
        type: 'line',
	        data: listValue,
      }
    ]
    }
    return option;

  },







  toThree(e) {
    console.log("herhereefexbxxuxuxuxiiiii")
    wx.navigateTo({
      url: '../typeOfFenxi/typeOfFenxi?type=' + e.currentTarget.dataset.type + '&startDate=' + this.data.startDate +
        '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType +
        '&fenxiType=' + this.data.fenxiType + "&depId=" + this.data.searchDepIds ,
    })
  },


  toSalesPage(e) {
    console.log(e);
    wx.navigateTo({
      url: '../fenxiPage/fenxiPage?fatherId=' + e.currentTarget.dataset.id +
        '&disId=' + this.data.disId + '&type=' + this.data.type + '&fatherName=' + e.currentTarget.dataset.name + '&startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType + '&fenxiType=' + this.data.fenxiType,
    })
  },

  toProducePage(e) {
    console.log(e);
    wx.navigateTo({
      url: '../../profit/profitPage/profitPage?fatherId=' + e.currentTarget.dataset.id +
        '&disId=' + this.data.disId + '&type=' + this.data.type + '&fatherName=' + e.currentTarget.dataset.name + '&startDate=' + this.data.startDate + '&stopDate=' + this.data.stopDate +'&dateType=' + this.data.dateType ,
    })
  },
  


  toMyDate() {
    this.setData({
      updateMyDate: false,
      update: false
    })
    wx.navigateTo({
      url: '../../../../pages/sel/myDate/myDate',
    })
  },



  toFilter(){
    wx.navigateTo({
      url: '../../../../pages/sel/filterDepartment/filterDepartment?type=1' ,
    })
  },

  delSearch(){
    wx.removeStorageSync('selDepList');;
    this.setData({
      searchDepIds: -1,
      searchDepName : ""
    })
    this._initCostCataData();

  },

  toDatePage() {
    this.setData({
      updateMyDate: false,
      update: false
    })
    console.log("thiikddkdk" + this.data.startDate)
    wx.navigateTo({
      url: '../../../../pages/sel/date/date?startDate=' + this.data.startDate +
        '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
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
  }






})