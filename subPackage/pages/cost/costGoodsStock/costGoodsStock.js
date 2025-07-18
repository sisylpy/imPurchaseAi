
var load = require('../../../../lib/load.js');
const globalData = getApp().globalData;
import * as echarts from '../../../../ec-canvas/echarts';
let itemWidth = 0;
let windowWidth = 0;
var dateUtils = require('../../../../utils/dateUtil');

import {
  getGoodsCharts,
} from '../../../../lib/apiDistributer'

var monthlyData=[];
var monthlyValue = []

Page({

  onShow(){

    // 推荐直接用新API
    let windowInfo = wx.getWindowInfo();
    let globalData = getApp().globalData;
    this.setData({
      windowWidth: windowInfo.windowWidth * globalData.rpxR,
      windowHeight: windowInfo.windowHeight * globalData.rpxR,
      navBarHeight: globalData.navBarHeight * globalData.rpxR,
      statusBarHeight: globalData.statusBarHeight * globalData.rpxR,

    });

    
    monthlyData = [];
    if(this.data.update){
      this._initData();
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
   


    // var searchStockDeps = wx.getStorageSync('selStockDepList');
    // if (searchStockDeps) {
    //   this.setData({
    //     stockDepartmentList: searchStockDeps
    //   })
    // }else{
    //   this.setData({
    //     stockDepartmentList: []
    //   })
    // }  

    // var searchKitchenDeps = wx.getStorageSync('selKitchenDepList');
    // if (searchKitchenDeps) {
    //   this.setData({
    //     kitchenDepartmentList: searchKitchenDeps
    //   })
    // }else{
    //   this.setData({
    //     kitchenDepartmentList: []
    //   })
    // } 
    // this._getSearchDepIds();
  
    


    this._initData()
  },

  /**
   * 页面的初始数据
   */
  data: {
    eca: {
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
      // onInit: initChartsubPackage/pages/data/echartsPage/fenxiPage/fenxiPage
      lazyLoad: true // 延迟加载

    },
    tabs: ["1","日采", "周采", "月采"],
    update: false,
    updateMyDate: false
   
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
    
      disGoodsId: options.disGoodsId,
      startDate: options.startDate,
      stopDate: options.stopDate,
      name: options.name,
      detail : options.detail,
      dateType: options.dateType,
      type: options.type,
      fenxiType: options.fenxiType,
      searchDepName: options.searchDepName,
       sliderOffsets: [],
       disGoodsId: options.disGoodsId,
       nxDisId: options.nxDisId,
       name: options.name,
       startDate: options.startDate,
       stopDate: options.stopDate,
       updateMyDate: false,
       update: false,
       today: dateUtils.getArriveDate(0),
       searchDepIds: Number(options.searchDepIds),
    })

    if(this.data.fenxiType == 'weightEcharts'){
      if(this.data.type =='cost'){
        this.setData({
          tab1Index: 0,
          itemIndex: 0,
        })
      }
      if(this.data.type =='sales'){
        this.setData({
          tab1Index: 1,
          itemIndex: 1,
        })
      }
      if(this.data.type =='loss'){
        this.setData({
          tab1Index: 2,
          itemIndex: 2,
        })
      }
      if(this.data.type =='waste'){
        this.setData({
          tab1Index: 3,
          itemIndex: 3,
        })
      }
    }

    if(this.data.fenxiType == 'profitEcharts'){
      if(this.data.type =='profit'){
        this.setData({
          tab1Index: 0,
          itemIndex: 0,
        })
      }
      if(this.data.type =='sales'){
        this.setData({
          tab1Index: 1,
          itemIndex: 1,
        })
      }
      if(this.data.type =='loss'){
        this.setData({
          tab1Index: 2,
          itemIndex: 2,
        })
      }
      if(this.data.type =='waste'){
        this.setData({
          tab1Index: 3,
          itemIndex: 3,
        })
      }
    }

    if(this.data.fenxiType == 'costEcharts'){
      if(this.data.type =='total'){
        this.setData({
          tab1Index: 0,
          itemIndex: 0,
        })
      }
      if(this.data.type =='sales'){
        this.setData({
          tab1Index: 1,
          itemIndex: 1,
        })
      }
      if(this.data.type =='loss'){
        this.setData({
          tab1Index: 2,
          itemIndex: 2,
        })
      }
      if(this.data.type =='waste'){
        this.setData({
          tab1Index: 3,
          itemIndex: 3,
        })
      }
    }
    
    this.clueOffset();

    this._initData();


  },

  _initData(){
    var that = this;
    var data = {
      startDate : this.data.startDate,
      stopDate: this.data.stopDate,
      disGoodsId: this.data.disGoodsId,
      type : this.data.type,
      fenxiType : this.data.fenxiType,
      searchDepIds: this.data.searchDepIds,
    }
    load.showLoading("获取数据中")
    getGoodsCharts(data)
    .then(res => {
      if(res.result.code == 0){
        load.hideLoading();
        console.log(res.result.data)
        console.log("fenxiprororoor")
        this.setData({
          oneTotal : res.result.data.oneTotal,
          salesTotal: res.result.data.salesTotal,
          lossTotal: res.result.data.lossTotal,
          wasteTotal: res.result.data.wasteTotal,
          oneTotalWeight : res.result.data.oneTotalWeight,
          salesTotalWeight: res.result.data.salesTotalWeight,
          lossTotalWeight: res.result.data.lossTotalWeight,
          wasteTotalWeight: res.result.data.wasteTotalWeight,
          stArr: res.result.data.list,
          disGoods: res.result.data.disGoods,
          itemList: res.result.data.itemList,
        })

        monthlyValue = res.result.data.list;
        monthlyData = res.result.data.date;

        if(this.data.itemIndex == 0 && this.data.oneTotal > 0){
          that.init_top_echarts(); //初始化图表
        }
        if(this.data.itemIndex == 1 &&  this.data.salesTotal > 0){
          that.init_sales_echarts(); //初始化图表
        }
        if(this.data.itemIndex == 2 &&  this.data.lossTotal > 0){
          that.init_loss_echarts(); //初始化图表
        }
        if(this.data.itemIndex ==  3 &&  this.data.wasteTotal > 0){
          that.init_waste_echarts(); //初始化图表
        }
        
      }else{
        load.hideLoading;
        wx.showToast({
          title: res.result.msg,
          icon: 'none'
        })
        this.setData({
          oneTotal : 0,
          salesTotal: 0,
          lossTotal: 0,
          wasteTotal: 0,
          stArr: [],
          depArr: "",
        })
      }
      
    })

  },


  // _getSearchDepIds(){
  //   var ids = "";
  //   var name = "";
  //   var selArr = [];
  //   var stockArr = this.data.stockDepartmentList;
  //   if(stockArr.length > 0){
  //     for(var i =0; i < stockArr.length; i++){
  //       selArr.push(stockArr[i]);
  //       ids = ids + stockArr[i].gbDepartmentId + ",";
  //       name = name +  stockArr[i].gbDepartmentName + ",";
  //     }
  //   }
  //   var kitchenArr = this.data.kitchenDepartmentList;
  //   if(kitchenArr.length > 0){
  //     for(var i =0; i < kitchenArr.length; i++){
  //       selArr.push(kitchenArr[i]);
  //       ids = ids + kitchenArr[i].gbDepartmentId + ",";
  //       name = name +  kitchenArr[i].gbDepartmentName + ",";
  //     }
  //   }

  //   this.setData({
  //     searchDepIds: ids,
  //     searchDepName: name,
  //   })
  // },


    /**
     * 计算偏移量
     */
    clueOffset() {
      var that = this;

    wx.getSystemInfo({
      success: function (res) {
        itemWidth = Math.ceil(res.windowWidth / that.data.tabs.length);
        console.log(itemWidth)
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
   
    if (this.data.tab1Index == 0 && this.data.fenxiType == 'weightEcharts') {
      this.setData({
        type: "cost"
      })
    }
    if (this.data.tab1Index == 0 && this.data.fenxiType == 'profitEcharts') {
      this.setData({
        type: "profit"
      })
    }
    if (this.data.tab1Index == 0 && this.data.fenxiType == 'costEcharts') {
      this.setData({
        type: "total"
      })
    }
    if (this.data.tab1Index == 1) {
      this.setData({
        type: "sales"
      })
    }

    if (this.data.tab1Index == 2) {
      this.setData({
        type: "loss"
      })
    }
    if (this.data.tab1Index == 3) {
      this.setData({
        type: "waste"
      })
    }
    monthlyData = [];

    this._initData();

  },

//初始化图表
init_top_echarts: function () {
  var that  = this;
  that.echartsComponnet = that.selectComponent('#mychartTop');

  that.echartsComponnet.init((canvas, width, height) => {
    // 初始化图表
    const Chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: globalData.rpxR 


    });
    Chart.setOption(this.getOption());
    // 注意这里一定要返回 chart 实例，否则会影响事件处理等
    return Chart;
  });
},
//初始化图表
init_sales_echarts: function () {
  var that  = this;
  that.echartsComponnet = that.selectComponent('#mychartSales');

  that.echartsComponnet.init((canvas, width, height) => {
    // 初始化图表
    const Chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: globalData.rpxR 


    });
    Chart.setOption(this.getOption());
    // 注意这里一定要返回 chart 实例，否则会影响事件处理等
    return Chart;
  });
},
//初始化图表
init_loss_echarts: function () {
  var that  = this;
  that.echartsComponnet = that.selectComponent('#mychartLoss');

  that.echartsComponnet.init((canvas, width, height) => {
    // 初始化图表
    const Chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: globalData.rpxR 


    });
    Chart.setOption(this.getOption());
    // 注意这里一定要返回 chart 实例，否则会影响事件处理等
    return Chart;
  });
},
//初始化图表
init_waste_echarts: function () {
  var that  = this;
  that.echartsComponnet = that.selectComponent('#mychartWaste');

  that.echartsComponnet.init((canvas, width, height) => {
    // 初始化图表
    const Chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: globalData.rpxR 
    });
    Chart.setOption(this.getOption());
    // 注意这里一定要返回 chart 实例，否则会影响事件处理等
    return Chart;
  });
},

  getOption(){
    
    // 指定图表的配置项和数据
    var option = {
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
	        data: monthlyValue,
      }
    ]
    }
    return option;

  },


  toBack(){
    monthlyData = [];
    
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
      url: '../../../../../pages/sel/myDate/myDate',
    })
  },

  toDatePage(){
   console.log("todate")
    wx.navigateTo({
      url: '../../../../pages/sel/date/date?startDate=' + this.data.startDate
       + '&stopDate=' + this.data.stopDate + '&dateType=' + this.data.dateType,
    })
  },

  
  toFilter() {
    wx.navigateTo({
      url: '../../../../pages/sel/filterStockDepartment/filterStockDepartment',
    })
  },

  delSearch(){
    wx.removeStorageSync('selDepList');
    this.setData({
      searchDepIds: -1,
      searchDepName : ""
    })
    this._initData();

  },
  
  toDetail(e){
    // var data = {
    //   depId: e.currentTarget.dataset.depid,
    //   depName: e.currentTarget.dataset.depname,
    // }
    // wx.setStorageSync('searchDep', data)
      wx.navigateTo({
        url: '../../../../../pages/mendian/statisticsReduce/statisticsReduce?depGoodsId=' + e.currentTarget.dataset.id + '&goodsName=' + e.currentTarget.dataset.name + '&startDate=' 
        +this.data.startDate + '&stopDate=' + this.data.stopDate +'&dateType=' +this.data.dateType + '&disGoodsId=' 
         + this.data.disGoodsId + '&depName=' + e.currentTarget.dataset.depname
         +'&depId=' + e.currentTarget.dataset.depid ,
         
      })
  },



  toDepReduce(e){
    console.log(e);
    var value = e.currentTarget.dataset.value;
    if(value !== "0.0"){
      wx.setStorageSync('disGoods', this.data.disGoods)
      wx.navigateTo({
        url: '../reduceForDepStock/reduceForDepStock?goodsId=' + this.data.disGoodsId + '&date=' + e.currentTarget.dataset.date + '&fenxiType=' + this.data.fenxiType  + '&type='
         + this.data.type +'&value=' + e.currentTarget.dataset.value + '&standardname=' + this.data.disGoods.gbDgGoodsStandardname + '&searchDepIds=' + this.data.searchDepIds
         +'&searchDepName=' + this.data.searchDepName
         
      })
    }else{
      wx.showToast({
        title: '无数据',
        icon: 'none'
      })
    }
  
  },
//

  onHide(){
    monthlyData = [];
  }


})