var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import * as echarts from '../../../../ec-canvas/echarts';
var dateUtils = require('../../../../utils/dateUtil');

import {
  getDepGoodsCharts,
} from '../../../../lib/apiDistributer'
var monthlyData = [];
var costValue = [];
var costValueM = [];
var slaesValue = [];
var slaesValueM = [];
var lossValue = [];
var lossValueM = [];
var wasteValue = [];
var wasteValueM = [];
var depCostValue = [];
var depCostValueM = [];
var depSalesValue = [];;
var depSalesValueM = [];
let depLossValue  = [];
let depLossValueM = [];
let depWasteValue = [];
let depWasteValueM = [];

var finishTimeValue = [];
var showTimeValue = [];
var restValue = [];
let itemWidth = 0;
let windowWidth = 0;


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

      

    monthlyData = [];
    slaesValue = [];
    lossValue = [];
    wasteValue = [];
    if(this.data.updateSearch){
   

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
      this._initData();
    }
    

    if(this.data.update){
      this._initData();
    }
    if(this.data.updateMyDate){
      var myDate = wx.getStorageSync('myDate');
      if(myDate){
        this.setData({
          startDate: myDate.startDate,
          stopDate: myDate.stopDate,
          dateType: myDate.dateType,
        })
        this._initData();
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
  }
  },

  /**
   * 页面的初始数据
   */
  data: {
    ecc: {
      // onInit: initChart
      lazyLoad: true // 延迟加载

    },
    ecs: {
      // onInit: initChart
      lazyLoad: true // 延迟加载

    },
    ecl: {
      // onInit: initChart
      lazyLoad: true // 延迟加载

    },
    ecw: {
      // onInit: initChart
      lazyLoad: true // 延迟加载

    },

    eccm: {
      // onInit: initChart
      lazyLoad: true // 延迟加载

    },
    ecsm: {
      // onInit: initChart
      lazyLoad: true // 延迟加载

    },
    eclm: {
      // onInit: initChart
      lazyLoad: true // 延迟加载
    },

    ecwm: {
      // onInit: initChart
      lazyLoad: true // 延迟加载
    },


    ecr: {
      lazyLoad: true // 延迟加载
    },

    ecf: {
      // onInit: initChart
      lazyLoad: true // 延迟加载
    },

    tabs: ["1", "2", "3","4"],
    tab1Index: 0,
    itemIndex: 0,
    sliderOffsets: [],
    sliderOffset: 0,
    tabsm: ["1", "2", "3","4"],
    tab1Indexm: 0,
    itemIndexm: 0,
    sliderOffsetsm: [],
    sliderOffsetm: 0,

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      depGoodsId: options.depGoodsId,
      comDepId: options.depId,
      startDate: options.startDate,
      stopDate: options.stopDate,
      depName: options.depName,
      goodsName: options.goodsName,
      disGoodsId: options.disGoodsId,
      dateType: options.dateType,
      update: false,
      updateMyDate: false,
      filterShow: false
    })

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
    this._initData();
    this.clueOffset();
    this.clueOffsetm();

  },

  _initData() {

    var that = this;
    var depId = this.data.searchDepIds;
    if(depId == -1){
        depId = this.data.comDepId;
    }
    var data = {
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      depId: depId,
      disGoodsId: this.data.disGoodsId,
    }
    load.showLoading("获取数据中")
    getDepGoodsCharts(data)
      .then(res => {
        if (res.result.code == 0) {
          load.hideLoading();
          console.log(res.result.data)
          this.setData({
            disGoods: res.result.data.disGoods,
            costTotal: res.result.data.top.costTotal,
            costTotalM: res.result.data.top.costTotalM,
            salesTotal: res.result.data.top.salesTotal,
            salesTotalM: res.result.data.top.salesTotalM,
            lossTotal: res.result.data.top.lossTotal,
            lossTotalM: res.result.data.top.lossTotalM,
            wasteTotal: res.result.data.top.wasteTotal,
            wasteTotalM: res.result.data.top.wasteTotalM,
            depCostTotal: res.result.data.top.depCostTotal,
            depCostTotalM: res.result.data.top.depCostTotalM,
            depSalesTotal: res.result.data.top.depSalesTotal,
            depSalesTotalM: res.result.data.top.depSalesTotalM,
            depLossTotal: res.result.data.top.depLossTotal,
            depLossTotalM: res.result.data.top.depLossTotalM,
            depWasteTotal: res.result.data.top.depWasteTotal,
            depWasteTotalM: res.result.data.top.depWasteTotalM,
            
            costScale: res.result.data.top.costScale,
            salesScale: res.result.data.top.salesScale,
            lossScale: res.result.data.top.lossScale,
            wasteScale: res.result.data.top.wasteScale,
            // perPrice: res.result.data.top.depPerPrice,
            // maxPrice: res.result.data.top.depMaxPrice,
            // minPrice: res.result.data.top.depMinPrice,
            restSubtotal: res.result.data.top.depRestSubtotal,
            restWeight: res.result.data.top.depRestWeight,

            subtotal: res.result.data.top.depSubtotal,
            weight: res.result.data.top.depWeight,
            stockCount: res.result.data.top.depStockCount,
          })
          monthlyData = res.result.data.top.date;
          costValue = res.result.data.top.cost;
          costValueM = res.result.data.top.costM;
          slaesValue = res.result.data.top.sales;
          slaesValueM = res.result.data.top.salesM;
          lossValue = res.result.data.top.loss;
          lossValueM = res.result.data.top.lossM;
          wasteValue = res.result.data.top.waste;
          wasteValueM = res.result.data.top.wasteM;
          depCostValue = res.result.data.top.depCost;
          depCostValueM = res.result.data.top.depCostM;
          depSalesValue = res.result.data.top.depSales;
          depSalesValueM = res.result.data.top.depSalesM;
          depLossValue = res.result.data.top.depLoss;
          depLossValueM = res.result.data.top.depLossM;
          depWasteValue = res.result.data.top.depWaste;
          depWasteValueM = res.result.data.top.depWasteM;
          finishTimeValue = res.result.data.top.finishTime;
          restValue = res.result.data.top.restWeight;
          
          that._changeTime();
          that.init_cost_echarts(); //初始化图表
          that.init_sales_echarts(); //初始化图表
          that.init_loss_echarts(); //初始化图表
          that.init_waste_echarts(); //初始化图表

          that.init_cost_echarts_money(); //初始化图表
          that.init_sales_echarts_money(); //初始化图表
          that.init_loss_echarts_money(); //初始化图表
          that.init_waste_echarts_money(); //初始化图表
          
          that.init_finish_echarts();
          that.init_rest_echarts();

        }else{
          load.hideLoading();
          var disGoods= wx.getStorageSync('disGoods');
          if(disGoods){
            this.setData({
              disGoods: disGoods
            })
          }
          this.setData({
            costTotal: 0,
          })
          
        }
      })

  },
  _initDisData(){
    var that = this;
    var data = {
      startDate: this.data.startDate,
      stopDate: this.data.stopDate,
      depId: this.data.searchDepIds,
      disGoodsId: this.data.disGoodsId,
    }
    load.showLoading("获取数据中")
    getDepGoodsCharts(data)
      .then(res => {
        if (res.result.code == 0) {
          load.hideLoading();
          console.log(res.result.data)
          this.setData({
            disGoods: res.result.data.disGoods,
            costTotal: res.result.data.top.costTotal,
            costTotalM: res.result.data.top.costTotalM,
            salesTotal: res.result.data.top.salesTotal,
            salesTotalM: res.result.data.top.salesTotalM,
            lossTotal: res.result.data.top.lossTotal,
            lossTotalM: res.result.data.top.lossTotalM,
            wasteTotal: res.result.data.top.wasteTotal,
            wasteTotalM: res.result.data.top.wasteTotalM,
            depCostTotal: res.result.data.top.costTotal,
            depCostTotalM: res.result.data.top.costTotalM,
            depSalesTotal: res.result.data.top.salesTotal,
            depSalesTotalM: res.result.data.top.salesTotalM,
            depLossTotal: res.result.data.top.lossTotal,
            depLossTotalM: res.result.data.top.lossTotalM,
            depWasteTotal: res.result.data.top.wasteTotal,
            depWasteTotalM: res.result.data.top.wasteTotalM,
            
            costScale: res.result.data.top.costScale,
            salesScale: res.result.data.top.salesScale,
            lossScale: res.result.data.top.lossScale,
            wasteScale: res.result.data.top.wasteScale,
            perPrice: res.result.data.top.depPerPrice,
            maxPrice: res.result.data.top.depMaxPrice,
            minPrice: res.result.data.top.depMinPrice,
            restSubtotal: res.result.data.top.depRestSubtotal,
            restWeight: res.result.data.top.depRestWeight,

            subtotal: res.result.data.top.depSubtotal,
            weight: res.result.data.top.depWeight,
            stockCount: res.result.data.top.depStockCount,
          })
          monthlyData = res.result.data.top.date;
          costValue = res.result.data.top.cost;
          costValueM = res.result.data.top.costM;
          slaesValue = res.result.data.top.sales;
          slaesValueM = res.result.data.top.salesM;
          lossValue = res.result.data.top.loss;
          lossValueM = res.result.data.top.lossM;
          wasteValue = res.result.data.top.waste;
          wasteValueM = res.result.data.top.wasteM;
          depCostValue = [];
          depCostValueM = [];
          depSalesValue = [];
          depSalesValueM = [];
          depLossValue = [];
          depLossValueM = [];
          depWasteValue = [];
          depWasteValueM = [];
          finishTimeValue = res.result.data.top.finishTime;
          restValue = res.result.data.top.restWeight;
          
          that._changeTime();
          that.init_cost_echarts(); //初始化图表
          that.init_sales_echarts(); //初始化图表
          that.init_loss_echarts(); //初始化图表
          that.init_waste_echarts(); //初始化图表

          that.init_cost_echarts_money(); //初始化图表
          that.init_sales_echarts_money(); //初始化图表
          that.init_loss_echarts_money(); //初始化图表
          that.init_waste_echarts_money(); //初始化图表
          
          that.init_finish_echarts();
          that.init_rest_echarts();

        }else{
          load.hideLoading();
          var disGoods= wx.getStorageSync('disGoods');
          if(disGoods){
            this.setData({
              disGoods: disGoods
            })
          }
          this.setData({
            costTotal: 0,
          })
          
        }
      })
  },


    /**
     * 计算偏移量
     */
    clueOffset() {
      var that = this;

    wx.getSystemInfo({
      success: function (res) {
        itemWidth = Math.ceil(res.windowWidth / 4);
        let tempArr = [];
        for (let i in that.data.tabs) {
          tempArr.push((itemWidth-6) * i);
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

    clueOffsetm() {
      var that = this;

    wx.getSystemInfo({
      success: function (res) {
        itemWidth = Math.ceil(res.windowWidth / 4);
        let tempArr = [];
        for (let i in that.data.tabsm) {
          tempArr.push((itemWidth-6) * i);
        }
        // tab 样式初始化
        windowWidth = res.windowWidth;
        that.setData({
          sliderOffsetsm: tempArr,
          sliderOffsetm: tempArr[that.data.itemIndexm],
          // sliderLeft: globalData.windowWidth * globalData.rpxR / 12,
          windowWidth: globalData.windowWidth * globalData.rpxR,
          windowHeight: globalData.windowHeight * globalData.rpxR,
        });
      }
    });
    },
  
  /**
   * tabItme点击
   */
  onTab1Click(event) {
    let index = event.currentTarget.dataset.index;
    this.setData({
      sliderOffset: this.data.sliderOffsets[index],
      tab1Index: index,
      itemIndex: index,
      type: event.currentTarget.dataset.type,
    })
    monthlyData = [];
  },

  onTab1ClickM(event){
    let index = event.currentTarget.dataset.index;
    this.setData({
      sliderOffsetm: this.data.sliderOffsetsm[index],
      tab1Indexm: index,
      itemIndexm: index,
      type: event.currentTarget.dataset.type,
    })
    monthlyData = [];
  },

  animationfinish(event) {
    this.setData({
      sliderOffset: this.data.sliderOffsets[event.detail.current],
      tab1Index: event.detail.current,
      itemIndex: event.detail.current,
    })
  },

  animationfinishM(event) {
    this.setData({
      sliderOffsetm: this.data.sliderOffsets[event.detail.current],
      tab1Indexm: event.detail.current,
      itemIndexm: event.detail.current,
    })
    
  },

  //初始化图表
  init_cost_echarts: function () {
    var that = this;
    that.echartsComponneta = that.selectComponent('#mychartCost');

    that.echartsComponneta.init((canvas, width, height) => {
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR

      });
      Chart.setOption(this.getOptionaCost());
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },
  //初始化图表
  init_sales_echarts: function () {
    var that = this;
    that.echartsComponneta = that.selectComponent('#mychartSales');

    that.echartsComponneta.init((canvas, width, height) => {
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR

      });
      Chart.setOption(this.getOptionaSales());
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },

  init_loss_echarts: function () {
    var that = this;
    that.echartsComponneta = that.selectComponent('#mychartLoss');

    that.echartsComponneta.init((canvas, width, height) => {
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR

      });
      Chart.setOption(this.getOptionaLoss());
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },
  init_waste_echarts: function () {
    var that = this;
    that.echartsComponneta = that.selectComponent('#mychartWaste');

    that.echartsComponneta.init((canvas, width, height) => {
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR

      });
      Chart.setOption(this.getOptionaWaste());
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等  depWasteValue
      return Chart;
    });
  },

  //初始化图表
  init_cost_echarts_money: function () {
    var that = this;
    that.echartsComponneta = that.selectComponent('#mychartCostMoney');

    that.echartsComponneta.init((canvas, width, height) => {
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR

      });
      Chart.setOption(this.getOptionaCostMoney());
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },

  //初始化图表
  init_sales_echarts_money: function () {
    var that = this;
    that.echartsComponneta = that.selectComponent('#mychartSalesMoney');

    that.echartsComponneta.init((canvas, width, height) => {
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR

      });
      Chart.setOption(this.getOptionaSalesMoney());
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },

  init_loss_echarts_money: function () {
    var that = this;
    that.echartsComponneta = that.selectComponent('#mychartLossMoney');

    that.echartsComponneta.init((canvas, width, height) => {
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR

      });
      Chart.setOption(this.getOptionaLossMoney());
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },

  init_waste_echarts_money: function () {
    var that = this;
    that.echartsComponneta = that.selectComponent('#mychartWasteMoney');

    that.echartsComponneta.init((canvas, width, height) => {
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR

      });
      Chart.setOption(this.getOptionaWasteMoney());
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },




  getOptionaCost() {

    // 指定图表的配置项和数据
    var option = {
      // title: {
      //   text: this.data.depName
      // },
     
      // legend: {
      //   data: ['销售量', '损耗量', '废弃量']
      // },
      // color: ['#3ba272', '#9a60b4'],
      grid: {
        top: '10%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },

      xAxis: {
        axisLine: {
          // lineStyle: {
          //   color: '#999'
          // }
        },
        // axisLabel: {
        //   color: '#666'
        // },
        type: 'category',
        data: monthlyData,
      },
      yAxis: {
        type: 'value',
        position: 'right',
      },
      series: [
        
        {
          // name: '总销售量',
          type: 'line',
          color: '#626363',
          lineStyle: {
            color: '#626363'
          },
          label: {
            normal: {
              show: true,
            },
          },
          type: 'line',
          data: costValue,
        },
        {
          // name: this.data.depName + '销售量',
          type: 'line',
          color: '#187e6e',
          lineStyle: {
            color: '#187e6e'
          },
          label: {
            normal: {
              show: true,
            },
          },
          type: 'line',
          data: depCostValue,
        }
      ],
    }
    return option;

  },
  getOptionaSales() {

    // 指定图表的配置项和数据
    var option = {
      // title: {
      //   text: this.data.depName
      // },
     
      // legend: {
      //   data: ['销售量', '损耗量', '废弃量']
      // },
      // color: ['#3ba272', '#9a60b4', '#fac858'],
      grid: {
        top: '10%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },

      xAxis: {
        // axisLine: {
        //   lineStyle: {
        //     color: '#999'
        //   }
        // },
        // axisLabel: {
        //   color: '#666'
        // },
        type: 'category',
        data: monthlyData,
      },
      yAxis: {
        type: 'value',
        position: 'right',
      },
      series: [
        
        {
          name: '总销售量',
          type: 'line',
          color: '#626363',
          lineStyle: {
            color: '#626363'
          },
          label: {
            normal: {
              show: true,
            },
          },
          type: 'line',
          data: slaesValue,
        },
        {
          name: this.data.depName + '销售量',
          type: 'line',
          color: '#187e6e',
          lineStyle: {
            color: '#187e6e'
          },
          label: {
            normal: {
              show: true,
            },
          },
          type: 'line',
          data: depSalesValue,
        }
      ],




    }
    return option;

  },
  getOptionaLoss() {

    // 指定图表的配置项和数据
    var option = {
      // title: {
      //   text: this.data.depName
      // },
     
      // legend: {
      //   data: ['销售量', '损耗量', '废弃量']
      // },
      // color: ['#3ba272', '#9a60b4', '#fac858'],
      grid: {
        top: '10%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },

      xAxis: {
        // axisLine: {
        //   lineStyle: {
        //     color: '#999'
        //   }
        // },
        // axisLabel: {
        //   color: '#666'
        // },
        type: 'category',
        data: monthlyData,
      },
      yAxis: {
        type: 'value',
        position: 'right',
      },
      series: [
       
        {
          // name: '损耗量',
          type: 'line',
          color: '#626363',
          lineStyle: {
           
            color: '#626363'
          },
          label: {
            normal: {
              show: true,
            },
          },
          type: 'line',
          data: lossValue,
        }, {
          name: '损耗量',
          type: 'line',
          color: '#187e6e',
          lineStyle: {
           
            color: '#187e6e'
          },
          label: {
            normal: {
              show: true,
            },
          },
          type: 'line',
          data: depLossValue,
        }
        
      ],




    }
    return option;

  },
  getOptionaWaste() {

    // 指定图表的配置项和数据
    var option = {
      // title: {
      //   text: this.data.depName
      // },
     
      // legend: {
      //   data: ['销售量', '损耗量', '废弃量']
      // },
      // color: ['#3ba272', '#9a60b4', '#fac858'],
      grid: {
        top: '10%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },

      xAxis: {
        // axisLine: {
        //   lineStyle: {
        //     color: '#999'
        //   }
        // },
        // axisLabel: {
        //   color: '#666'
        // },
        type: 'category',
        data: monthlyData,
      },
      yAxis: {
        type: 'value',
        position: 'right',
      },
      series: [
       
        {
          name: '损耗量',
          type: 'line',
          color: '#187e6e',
          lineStyle: {
           
            color: '#187e6e'
          },
          label: {
            normal: {
              show: true,
            },
          },
          type: 'line',
          data: depWasteValue,
        },
        {
          type: 'line',
          color: '#626363',
          lineStyle: {
            color: '#626363'
          },
          label: {
            normal: {
              show: true,
            },
          },
          type: 'line',
          data: wasteValue,
        }
      ],

    }
    return option;

  },


  //money
  
  getOptionaCostMoney() {

    // 指定图表的配置项和数据
    var option = {
     
      grid: {
        top: '10%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },

      xAxis: {
        // axisLine: {
        //   lineStyle: {
        //     color: '#999'
        //   }
        // },
        // axisLabel: {
        //   color: '#666'
        // },
        type: 'category',
        data: monthlyData,
      },
      yAxis: {
        type: 'value',
        position: 'right',
      },
      series: [
        
        {
          name: '总成本',
          type: 'line',
          color: '#626363',
          lineStyle: {
            color: '#626363'
          },
          label: {
            normal: {
              show: true,
            },
          },
          type: 'line',
          data: costValueM,
        },
        {
          name: this.data.depName + '销售量',
          type: 'line',
          color: '#187e6e',
          lineStyle: {
            color: '#187e6e'
          },
          label: {
            normal: {
              show: true,
            },
          },
          type: 'line',
          data: depCostValueM,
        }
      ],
    }
    return option;

  },
  getOptionaSalesMoney() {

    // 指定图表的配置项和数据
    var option = {
      
      grid: {
        top: '10%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },

      xAxis: {
       
        type: 'category',
        data: monthlyData,
      },
      yAxis: {
        type: 'value',
        position: 'right',
      },
      series: [
        
        {
          name: '总销售量',
          type: 'line',
          color: '#626363',
          lineStyle: {
            color: '#626363'
          },
          label: {
            normal: {
              show: true,
            },
          },
          type: 'line',
          data: slaesValueM,
        },
        {
          name: this.data.depName + '销售量',
          type: 'line',
          color: '#187e6e',
          lineStyle: {
            color: '#187e6e'
          },
          label: {
            normal: {
              show: true,
            },
          },
          type: 'line',
          data: depSalesValueM,
        }
      ],
    }
    return option;

  },
  getOptionaLossMoney() {

    // 指定图表的配置项和数据
    var option = {
      
      grid: {
        top: '10%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },

      xAxis: {
       
        type: 'category',
        data: monthlyData,
      },
      yAxis: {
        type: 'value',
        position: 'right',
      },
      series: [
       
        {
          // name: '损耗量',
          type: 'line',
          color: '#626363',
          lineStyle: {
           
            color: '#626363'
          },
          label: {
            normal: {
              show: true,
            },
          },
          type: 'line',
          data: lossValueM,
        },
        {
          // name: '损耗量',
          type: 'line',
          color: '#187e6e',
          lineStyle: {
            color: '#187e6e'
          },
          label: {
            normal: {
              show: true,
            },
          },
          type: 'line',
          data: depLossValueM,
        }
        
      ],




    }
    return option;

  },
  getOptionaWasteMoney() {

    // 指定图表的配置项和数据
    var option = {
      // title: {
      //   text: this.data.depName
      // },
      tooltip: {
        trigger: 'axis'
      },
      // legend: {
      //   data: ['销售量', '损耗量', '废弃量']
      // },
      // color: ['#3ba272', '#9a60b4', '#fac858'],
      grid: {
        top: '10%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },

      xAxis: {
       
        type: 'category',
        data: monthlyData,
      },
      yAxis: {
        type: 'value',
        position: 'right',
      },
      series: [
        {
          name: '损耗量',
          type: 'line',
          color: '#626363',
          lineStyle: {
            color: '#626363'
          },
          label: {
            normal: {
              show: true,
            },
          },
          type: 'line',
          data: wasteValueM,
        },
        {
          // name: '损耗量',
          type: 'line',
          color: '#187e6e',
          lineStyle: {
            color: '#187e6e'        
            },
          label: {
            normal: {
              show: true,
            },
          },
          type: 'line',
          data: depWasteValueM,
        }
      ],
    }
    return option;
  },



  //初始化图表
  init_finish_echarts: function () {
    var that = this;
    that.echartsComponneta = that.selectComponent('#mychartFinish');

    that.echartsComponneta.init((canvas, width, height) => {
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: globalData.rpxR

      });
      Chart.setOption(this.getOptionaFinish());
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },

  getOptionaFinish() {

    var that = this;

    // 指定图表的配置项和数据
    var option = {
      title: {
        text: "沽清时间"
      },
      tooltip: {
        trigger: 'axis'
      },
     
      grid: {
        top: '10%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },

      xAxis: {
        axisLine: {
          lineStyle: {
            color: '#ff0000'
          },
        },
        axisLabel: {
          color: '#808080'
        },
        type: 'category',
        data: monthlyData,
      },

      yAxis: {
        position: 'right',
        type: "value",
        
        axisLabel: {
          formatter:function (value, index) {
              return that.fomartTime(value)
          }
      },
      },
      series: [{
          name: '沽清时间',
          type: 'line',
          lineStyle: {
            color: '#808080'
          },
          label: {
            normal: {
              show: true,
              
            },
           
          },
          type: 'line',
          data:  showTimeValue,
        
        }
      ],
    }
    return option;

  },

   fomartTime (value) {
   
    var hour = parseInt(Number(value) / Number(60));

    var min = Number(value) % Number(60)
     return hour +":"+ min
},


_changeTime(){
  var arr = finishTimeValue;
  var that = this;
  if(arr.length > 0){
    var list= [];
    for(var i = 0; i < arr.length; i++){
      var hour = parseInt(Number(arr[i]) / Number(60))
      var min =  Number(arr[i]) % Number(60);
      if(min < 10){
        min = "0" + min;
      }
      var time = hour + ":" + min;
      var data = {
        name: that.fomartTime(arr[i]),
        value: arr[i],
       
      label: {
        formatter: time,
        color: "#ff0000"

    },

      }
      list.push(data);
    }
    showTimeValue = list;

  }

},

 //初始化图表
 init_rest_echarts: function () {
  var that = this;
  that.echartsComponneta = that.selectComponent('#mychartRest');

  that.echartsComponneta.init((canvas, width, height) => {
    // 初始化图表
    const Chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: globalData.rpxR

    });
    Chart.setOption(this.getOptionaRest());
    // 注意这里一定要返回 chart 实例，否则会影响事件处理等
    return Chart;
  });
},

getOptionaRest() {

  var that = this;

  // 指定图表的配置项和数据
  var option = {
    title: {
      text: "剩余数量"
    },
    tooltip: {
      trigger: 'axis'
    },
   
    grid: {
      top: '10%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },

    xAxis: {
      axisLine: {
        lineStyle: {
          color: '#ff0000'
        },
      },
      axisLabel: {
        color: '#808080'
      },
      type: 'category',
      data: monthlyData,
    },

    yAxis: {
      position: 'right',
      type: "value",
      
    },
    series: [{
        name: '剩余量',
        type: 'line',
        lineStyle: {
          color: '#808080'
        },
        label: {
          normal: {
            show: true,
            
          },
         
        },
        type: 'line',
        data:  restValue,
      
      }
    ],
  }
  return option;

},



  toBack() {
    monthlyData = [];
    slaesValue = [];
    lossValue = [];
    wasteValue = [];

    wx.navigateBack({
      delta: 1
    })

  },


  toMyDate(){
    this.setData({
      updateMyDate: false,
      update: false
    })
    wx.navigateTo({
      url: '../../sel/myDate/myDate',
    })
  },

  toDatePage() {
    this.setData({
      updateMyDate: false,
      update: false
    })
    wx.navigateTo({
      url: '../../sel/date/date?startDate=' + this.data.startDate +
        '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },

  toDetail(e) {
    wx.navigateTo({
      url: '../../mendian/reduceDaily/reduceDaily?depGoodsId=' + e.currentTarget.dataset.id + '&goodsName=' + e.currentTarget.dataset.name + "&salesTotal=" + e.currentTarget.dataset.salesTotal,
    })
  },




  toFilter(){
    wx.navigateTo({
      url: '../../sel/filterDepartment/filterDepartment?type=1' ,
    })
  },

  delSearch(){
    wx.removeStorageSync('selDepList');;
    this.setData({
      searchDepIds: -1,
      searchDepName : "",
      comDepId: "",
      depName: ""
    })
    this._initDisData();


  },




  onHide() {
    monthlyData = [];
    slaesValue = [];
    lossValue = [];
    wasteValue = [];
  }


})